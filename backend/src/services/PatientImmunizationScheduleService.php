<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Vaccine;
use App\Models\VaccineInventory;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PatientImmunizationScheduleService
{
    /**
     * Cache active routine and optional vaccines with their ordered schedules
     * in-memory for the current service lifecycle.
     */
    protected ?Collection $cachedVaccinesWithSchedules = null;

    /**
     * Cache usable stock amounts by vaccine_id in-memory for the current service lifecycle.
     */
    protected ?Collection $cachedStockByVaccine = null;

    /**
     * Clear in-memory caches if data is modified during a request.
     */
    public function clearCache(): void
    {
        $this->cachedVaccinesWithSchedules = null;
        $this->cachedStockByVaccine = null;
    }

    /**
     * Bulk-query and return usable stock for a vaccine from in-memory cache.
     */
    public function getAvailableStockForVaccine(int $vaccineId, Carbon $today): int
    {
        if ($this->cachedStockByVaccine === null) {
            $this->cachedStockByVaccine = VaccineInventory::query()
                ->where('is_archived', false)
                ->where('quantity', '>', 0)
                ->whereDate('expiration_date', '>=', $today)
                ->selectRaw('vaccine_id, SUM(quantity) as total_quantity')
                ->groupBy('vaccine_id')
                ->pluck('total_quantity', 'vaccine_id')
                ->map(fn ($qty) => (int) $qty);
        }

        return (int) ($this->cachedStockByVaccine->get($vaccineId, 0));
    }

    public function getSchedule(Patient $patient): array
    {
        $patient->loadMissing([
            'immunizationRecords',
            'optionalVaccines',
            'vaccineSchedules.inventoryBatch',
        ]);

        /*
         * Only vaccines that actually apply to this patient:
         *
         * 1. All Routine vaccines
         * 2. Optional vaccines explicitly assigned
         *    through patient_vaccines
         */
        $vaccines = $this->getApplicableVaccines($patient);

        $today = Carbon::today();
        $result = [];

        foreach ($vaccines as $vaccine) {
            $records = $patient->immunizationRecords
                ->where('vaccine_id', $vaccine->id);

            $completedDoses = $records
                ->pluck('dose_number')
                ->map(fn ($dose) => (int) $dose)
                ->all();

            $nextSchedule = $vaccine->schedules->first(
                fn ($schedule) => ! in_array(
                    (int) $schedule->dose_number,
                    $completedDoses,
                    true
                )
            );

            /*
             * Only usable inventory counts:
             *
             * - belongs to this vaccine
             * - not archived
             * - quantity greater than zero
             * - not expired
             */
            $availableStock = $this->getAvailableStockForVaccine((int) $vaccine->id, $today);

            $inventoryAvailable =
                $availableStock > 0;

            /*
             * Completed vaccine series.
             */
            if (! $nextSchedule) {
                $result[] = [
                    'vaccine_id' =>
                        $vaccine->id,

                    'vaccine_name' =>
                        $vaccine->name,

                    'category' =>
                        $vaccine->category,

                    'required_doses' =>
                        (int) $vaccine->required_doses,

                    'completed_doses' =>
                        count($completedDoses),

                    'doses_remaining' =>
                        0,

                    'next_dose' =>
                        null,

                    'recommended_age' =>
                        null,

                    'interval' =>
                        null,

                    'recommended_date' =>
                        null,

                    'interval_date' =>
                        null,

                    'eligible_date' =>
                        null,

                    'status' =>
                        'Completed',

                    'eligible' =>
                        false,

                    'available_stock' =>
                        (int) $availableStock,

                    'inventory_available' =>
                        $inventoryAvailable,

                    'can_administer' =>
                        false,

                    'completed' =>
                        true,

                    /*
                     * Scheduling / reservation information.
                     */
                    'is_scheduled' =>
                        false,

                    'scheduled_date' =>
                        null,

                    'reserved_batch_id' =>
                        null,

                    'reserved_batch_number' =>
                        null,

                    'reserved_batch_expiration_date' =>
                        null,

                    'reserved_batch_quantity' =>
                        null,

                    'reserved_batch_usable' =>
                        false,

                    'priority_reason' =>
                        null,

                    'is_series_completion_candidate' =>
                        false,

                    'allocation_rank' =>
                        null,

                    'schedule_label' =>
                        null,

                    'days_due' =>
                        0,

                    'days_overdue' =>
                        0,

                    'target_wednesday' =>
                        null,
                ];

                continue;
            }

            $doseNumber =
                (int) $nextSchedule->dose_number;

            /*
             * Find the currently committed appointment
             * for this exact next dose.
             */
            $scheduledDose =
                $patient
                    ->vaccineSchedules
                    ->first(
                        function ($schedule) use (
                            $vaccine,
                            $doseNumber
                        ) {
                            return
                                (int) $schedule->vaccine_id
                                    === (int) $vaccine->id
                                &&
                                (int) $schedule->dose_number
                                    === $doseNumber
                                &&
                                $schedule->status
                                    === 'scheduled';
                        }
                    );

            $reservedBatch =
                $scheduledDose
                    ?->inventoryBatch;

            /*
             * If not reserved on a prior appointment, resolve the
             * FEFO batch that will be deducted during walk-in administration.
             */
            $fefoBatch = null;
            if (! $reservedBatch && $inventoryAvailable) {
                $fefoBatch = VaccineInventory::query()
                    ->where('vaccine_id', $vaccine->id)
                    ->where('is_archived', false)
                    ->where('quantity', '>', 0)
                    ->whereDate('expiration_date', '>=', $today)
                    ->orderBy('expiration_date')
                    ->orderBy('date_received')
                    ->orderBy('id')
                    ->first();
            }

            $effectiveBatch = $reservedBatch ?: $fefoBatch;

            /*
             * Collect all usable physical batches for staff selection or audit.
             */
            $availableBatches = VaccineInventory::query()
                ->where('vaccine_id', $vaccine->id)
                ->where('is_archived', false)
                ->where('quantity', '>', 0)
                ->whereDate('expiration_date', '>=', $today)
                ->orderBy('expiration_date')
                ->orderBy('date_received')
                ->orderBy('id')
                ->get()
                ->map(fn ($b) => [
                    'id' => $b->id,
                    'batch_number' => $b->batch_number,
                    'quantity' => (int) $b->quantity,
                    'expiration_date' => $b->expiration_date?->toDateString(),
                ])
                ->values()
                ->all();

            /*
             * The reserved batch is usable only if
             * it still exists, is active, has stock,
             * belongs to this vaccine, and is not expired.
             */
            $reservedBatchUsable =
                $reservedBatch !== null
                &&
                (int) $reservedBatch->vaccine_id
                    === (int) $vaccine->id
                &&
                ! $reservedBatch->is_archived
                &&
                (int) $reservedBatch->quantity > 0
                &&
                $reservedBatch
                    ->expiration_date
                    ->greaterThanOrEqualTo($today);

            $recommendedDate =
                $this->getRecommendedDate(
                    $patient->date_of_birth,
                    $nextSchedule->recommended_age
                );

            $interval =
                $nextSchedule->interval !== null
                    ? (int) $nextSchedule->interval
                    : null;

            $intervalDate = null;

            $previousDoseCompleted =
                $doseNumber === 1;

            /*
             * Dose 2+ cannot become eligible until
             * the immediately previous dose exists.
             *
             * When an interval is configured, eligibility
             * must also respect that minimum interval.
             */
            if ($doseNumber > 1) {
                $previousRecord =
                    $records->first(
                        fn ($record) =>
                            (int) $record->dose_number
                                === $doseNumber - 1
                    );

                $previousDoseCompleted =
                    $previousRecord !== null;

                if (
                    $previousRecord?->date_administered
                    &&
                    $interval !== null
                ) {
                    $intervalDate =
                        $previousRecord
                            ->date_administered
                            ->copy()
                            ->addDays(
                                $interval
                            );
                }
            }

            /*
             * The dose becomes eligible on whichever
             * requirement occurs later:
             *
             * - recommended age date
             * - minimum interval date
             */
            $eligibleDate =
                $this->laterDate(
                    $recommendedDate,
                    $intervalDate
                );

            $eligible =
                $previousDoseCompleted
                &&
                $eligibleDate !== null
                &&
                $today->greaterThanOrEqualTo(
                    $eligibleDate
                );

            $completedCount =
                count($completedDoses);

            $requiredDoses =
                (int) $vaccine->required_doses;

            $dosesRemaining =
                max(
                    0,
                    $requiredDoses -
                        $completedCount
                );

            $nearCompletion =
                $requiredDoses > 1
                &&
                $completedCount > 0
                &&
                $dosesRemaining === 1;

            $eligibleWednesday = $eligibleDate ? $this->getTargetWednesday($eligibleDate) : null;
            $daysDue = ($eligibleDate && $today->greaterThan($eligibleDate))
                ? (int) abs($today->diffInDays($eligibleDate))
                : 0;

            $targetWednesday = $eligibleWednesday;
            $scheduleLabel = 'Current Age';
            $daysOverdue = 0;

            if ($eligibleWednesday) {
                if ($eligibleDate && $today->lessThan($eligibleDate)) {
                    $scheduleLabel = 'Upcoming';
                    $daysOverdue = 0;
                } elseif ($today->lessThanOrEqualTo($eligibleWednesday)) {
                    $scheduleLabel = 'Current Age';
                    $daysOverdue = 0;
                } else {
                    $daysPastEligibleWed = (int) abs($today->diffInDays($eligibleWednesday));
                    $daysOverdue = $daysPastEligibleWed;

                    if ($daysPastEligibleWed <= 14) {
                        $scheduleLabel = 'Recent Due';
                    } else {
                        $scheduleLabel = 'Overdue';
                    }
                }
            }

            if ($scheduledDose && $scheduledDose->scheduled_date) {
                $appointmentDate = Carbon::parse($scheduledDose->scheduled_date)->startOfDay();
                $targetWednesday = $appointmentDate;

                if ($today->greaterThan($appointmentDate)) {
                    $daysPastAppointment = (int) abs($today->diffInDays($appointmentDate));
                    $daysOverdue = $daysPastAppointment;

                    if ($daysPastAppointment <= 14) {
                        $scheduleLabel = 'Recent Due';
                    } else {
                        $scheduleLabel = 'Overdue';
                    }
                } elseif ($scheduleLabel !== 'Overdue') {
                    if ($eligibleDate && $today->lessThan($eligibleDate)) {
                        $scheduleLabel = 'Upcoming';
                    } else {
                        $scheduleLabel = 'Current Age';
                    }
                    $daysOverdue = 0;
                }
            }

            $result[] = [
                'vaccine_id' =>
                    $vaccine->id,

                'vaccine_name' =>
                    $vaccine->name,

                'category' =>
                    $vaccine->category,

                'required_doses' =>
                    $requiredDoses,

                'completed_doses' =>
                    $completedCount,

                'doses_remaining' =>
                    $dosesRemaining,

                /*
                 * Series completion candidate.
                 *
                 * Example:
                 * 2/3 completed -> final dose candidate.
                 */
                'near_completion' =>
                    $nearCompletion,

                'next_dose' =>
                    $doseNumber,

                'recommended_age' =>
                    $nextSchedule->recommended_age,

                'interval' =>
                    $interval,

                'recommended_date' =>
                    $recommendedDate
                        ?->toDateString(),

                'interval_date' =>
                    $intervalDate
                        ?->toDateString(),

                'eligible_date' =>
                    $eligibleDate
                        ?->toDateString(),

                'target_wednesday' =>
                    $targetWednesday
                        ?->toDateString(),

                'days_due' =>
                    $daysDue,

                'days_overdue' =>
                    $daysOverdue,

                'schedule_label' =>
                    $scheduleLabel,

                'status' =>
                    $this->determineStatus(
                        $today,
                        $recommendedDate
                    ),

                'eligible' =>
                    $eligible,

                /*
                 * Generic physical vaccine stock.
                 */
                'available_stock' =>
                    (int) $availableStock,

                'inventory_available' =>
                    $inventoryAvailable,

                /*
                 * Readiness flag.
                 *
                 * Final administration validation
                 * remains inside the administration
                 * service.
                 */
                'can_administer' =>
                    $eligible
                    &&
                    (
                        $scheduledDose
                            ? $reservedBatchUsable
                            : $inventoryAvailable
                    ),

                'completed' =>
                    false,

                /*
                 * ========================================================
                 * APPOINTMENT / BATCH RESERVATION
                 * ========================================================
                 */

                'is_scheduled' =>
                    $scheduledDose !== null,

                'scheduled_date' =>
                    $scheduledDose
                        ?->scheduled_date
                        ?->toDateString(),

                'reserved_batch_id' =>
                    $effectiveBatch
                        ?->id,

                'reserved_batch_number' =>
                    $effectiveBatch
                        ?->batch_number,

                'reserved_batch_expiration_date' =>
                    $effectiveBatch
                        ?->expiration_date
                        ?->toDateString(),

                'reserved_batch_quantity' =>
                    $effectiveBatch !== null
                        ? (int) $effectiveBatch->quantity
                        : null,

                'reserved_batch_usable' =>
                    $reservedBatch ? $reservedBatchUsable : ($fefoBatch !== null),

                'available_batches' =>
                    $availableBatches,

                /*
                 * Frozen allocation / priority information
                 * stored on the actual appointment.
                 */
                'priority_reason' =>
                    $scheduledDose
                        ?->priority_reason,

                'is_series_completion_candidate' =>
                    (bool) (
                        $scheduledDose
                            ?->is_series_completion_candidate
                        ?? false
                    ),

                'allocation_rank' =>
                    $scheduledDose
                        ?->allocation_rank,

                'previous_dose_completed' =>
                    $previousDoseCompleted,

                'is_manually_adjusted' =>
                    (bool) ($scheduledDose?->is_manually_adjusted ?? false),

                'adjustment_reason' =>
                    $scheduledDose?->adjustment_reason,

                'adjusted_at' =>
                    $scheduledDose?->adjusted_at?->toDateString(),
            ];
        }

        return $result;
    }

    /**
     * First Wednesday on or after the given date.
     */
    public function getTargetWednesday(Carbon $date): Carbon
    {
        if ($date->isWednesday()) {
            return $date->copy();
        }

        return $date->copy()->next(Carbon::WEDNESDAY);
    }

    public function getSchedulingOptions(
        Patient $patient
    ): array {
        /*
         * Inactive patients retain their immunization
         * history and calculated schedule, but they
         * cannot participate in actionable scheduling.
         */
        if ($patient->status !== 'Active') {
            return [];
        }

        $schedule = collect(
            $this->getSchedule($patient)
        );

        /*
         * Only uncompleted doses whose immediately previous dose
         * has already been completed are eligible to be scheduled.
         */
        $candidates = $schedule->filter(
            fn ($item) => ! $item['completed'] && ($item['previous_dose_completed'] ?? false)
        );

        if ($candidates->isEmpty()) {
            return [];
        }

        /*
         * 1. If any candidate doses are already eligible (due today or overdue),
         * return ONLY the currently eligible doses for this immediate visit.
         */
        $eligible = $candidates->filter(fn ($item) => $item['eligible']);
        if ($eligible->isNotEmpty()) {
            return $eligible
                ->sortBy('recommended_date')
                ->values()
                ->all();
        }

        /*
         * 2. Otherwise, no doses are due today. Suggest the NEXT VISIT ONLY.
         * Find the earliest upcoming clinic target date (Wednesday or eligible date)
         * and return ONLY the doses matching that earliest upcoming visit date.
         */
        $earliestTargetWednesday = $candidates
            ->pluck('target_wednesday')
            ->filter()
            ->sort()
            ->first();

        if ($earliestTargetWednesday) {
            return $candidates
                ->filter(fn ($item) => ($item['target_wednesday'] ?? null) === $earliestTargetWednesday)
                ->sortBy('recommended_date')
                ->values()
                ->all();
        }

        $earliestEligibleDate = $candidates
            ->pluck('eligible_date')
            ->filter()
            ->sort()
            ->first();

        if ($earliestEligibleDate) {
            return $candidates
                ->filter(fn ($item) => ($item['eligible_date'] ?? null) === $earliestEligibleDate)
                ->sortBy('recommended_date')
                ->values()
                ->all();
        }

        return $candidates
            ->sortBy('recommended_date')
            ->values()
            ->all();
    }

    /**
     * Return only vaccines that participate in this
     * patient's structured immunization schedule.
     *
     * Routine:
     * Automatically applies to every patient.
     *
     * Optional:
     * Only applies when explicitly linked through
     * the patient_vaccines table.
     */
    private function getApplicableVaccines(
        Patient $patient
    ): Collection {
        $patient->loadMissing(
            'optionalVaccines'
        );

        $optionalVaccineIds =
            $patient
                ->optionalVaccines
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();

        if ($this->cachedVaccinesWithSchedules === null) {
            $this->cachedVaccinesWithSchedules = Vaccine::query()
                ->with([
                    'schedules' =>
                        fn ($query) =>
                            $query->orderBy(
                                'dose_number'
                            ),
                ])
                ->whereIn('category', ['routine', 'optional'])
                ->get();
        }

        return $this->cachedVaccinesWithSchedules
            ->filter(function (Vaccine $vaccine) use ($optionalVaccineIds) {
                if ($vaccine->category === 'routine') {
                    return true;
                }

                if ($vaccine->category === 'optional' && in_array((int) $vaccine->id, $optionalVaccineIds, true)) {
                    return true;
                }

                return false;
            })
            ->values();
    }

    /**
     * Get the patient's reached master schedule points.
     *
     * Importantly, this uses only vaccines applicable
     * to this patient so an unassigned Optional vaccine
     * cannot influence schedule labels.
     */
    private function getMasterScheduleDates(
        Patient $patient
    ): Collection {
        return $this
            ->getApplicableVaccines(
                $patient
            )
            ->flatMap(
                function (
                    $vaccine
                ) use (
                    $patient
                ) {
                    return $vaccine
                        ->schedules
                        ->map(
                            fn ($schedule) =>
                                $this
                                    ->getRecommendedDate(
                                        $patient
                                            ->date_of_birth,
                                        $schedule
                                            ->recommended_age
                                    )
                        );
                }
            )
            ->filter()
            ->unique(
                fn ($date) =>
                    $date->toDateString()
            );
    }

    private function getRecommendedDate(
        Carbon $birthDate,
        ?string $recommendedAge
    ): ?Carbon {
        if (! $recommendedAge) {
            return null;
        }

        $normalized = trim(strtolower($recommendedAge));
        if (in_array($normalized, ['birth', 'at birth', 'at-birth'], true)) {
            return $birthDate->copy();
        }

        $parts =
            preg_split(
                '/\s+/',
                $normalized
            );

        if (
            ! $parts
            ||
            count($parts) < 2
        ) {
            return null;
        }

        $value =
            (float) $parts[0];

        $unit =
            $parts[1];

        $date =
            $birthDate->copy();

        return match ($unit) {
            'day', 'days' =>
                $date->addDays(
                    (int) round(
                        $value
                    )
                ),

            'week', 'weeks' =>
                $date->addDays(
                    (int) round(
                        $value * 7
                    )
                ),

            'month', 'months' =>
                $this->addMonths(
                    $date,
                    $value
                ),

            'year', 'years' =>
                $this->addYears(
                    $date,
                    $value
                ),

            default =>
                null,
        };
    }

    private function addMonths(
        Carbon $date,
        float $months
    ): Carbon {
        $whole =
            (int) floor(
                $months
            );

        $fraction =
            $months -
            $whole;

        $date->addMonthsNoOverflow(
            $whole
        );

        if ($fraction > 0) {
            $date->addDays(
                (int) round(
                    $fraction * 30
                )
            );
        }

        return $date;
    }

    private function addYears(
        Carbon $date,
        float $years
    ): Carbon {
        $whole =
            (int) floor(
                $years
            );

        $fraction =
            $years -
            $whole;

        $date->addYears(
            $whole
        );

        if ($fraction > 0) {
            $date->addMonthsNoOverflow(
                (int) round(
                    $fraction * 12
                )
            );
        }

        return $date;
    }

    private function laterDate(
        ?Carbon $recommendedDate,
        ?Carbon $intervalDate
    ): ?Carbon {
        if (! $recommendedDate) {
            return $intervalDate
                ?->copy();
        }

        if (! $intervalDate) {
            return $recommendedDate
                ->copy();
        }

        return $recommendedDate
            ->greaterThan(
                $intervalDate
            )
                ? $recommendedDate
                    ->copy()
                : $intervalDate
                    ->copy();
    }

    private function determineStatus(
        Carbon $today,
        ?Carbon $recommendedDate
    ): string {
        if (! $recommendedDate) {
            return 'Upcoming';
        }

        if (
            $today->lessThan(
                $recommendedDate
            )
        ) {
            return 'Upcoming';
        }

        if (
            $today->isSameDay(
                $recommendedDate
            )
        ) {
            return 'Due';
        }

        return 'Catch-up';
    }
}