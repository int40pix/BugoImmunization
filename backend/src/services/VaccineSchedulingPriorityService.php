<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\PatientVaccineSchedule;
use App\Models\VaccineInventory;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class VaccineSchedulingPriorityService
{
    public function __construct(
        private PatientImmunizationScheduleService $scheduleService
    ) {
    }

    /**
     * In-memory cache for candidate pool during the request lifecycle.
     */
    protected ?Collection $cachedCandidatePool = null;

    /**
     * Clear candidate pool cache.
     */
    public function clearCandidatePoolCache(): void
    {
        $this->cachedCandidatePool = null;
    }

    /**
     * Build the current scheduling candidate pool
     * across all Active patients.
     */
    public function getCandidatePool(bool $fresh = false): Collection
    {
        if (! $fresh && $this->cachedCandidatePool !== null) {
            return $this->cachedCandidatePool;
        }

        $patients = Patient::query()
            ->where('status', 'Active')
            ->with([
                'vaccineSchedules' => function ($query) {
                    $query->whereIn('status', ['scheduled', 'upcoming', 'overdue']);
                },
                'immunizationRecords',
                'optionalVaccines',
                'vaccineSchedules.inventoryBatch',
            ])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $this->cachedCandidatePool = $patients
            ->flatMap(function (Patient $patient) {
                $options = $this->scheduleService
                    ->getSchedulingOptions($patient);

                return collect($options)->map(
                    function (array $option) use ($patient) {
                        $existingSchedule = $patient
                            ->vaccineSchedules
                            ->first(
                                function ($schedule) use ($option) {
                                    return
                                        (int) $schedule->vaccine_id
                                            === (int) $option['vaccine_id']
                                        &&
                                        (int) $schedule->dose_number
                                            === (int) $option['next_dose'];
                                }
                            );

                        return [
                            'patient_id' =>
                                $patient->id,

                            'patient_code' =>
                                $patient->patient_id,

                            'patient_name' =>
                                $this->getPatientName(
                                    $patient
                                ),

                            'vaccine_id' =>
                                $option['vaccine_id'],

                            'vaccine_name' =>
                                $option['vaccine_name'],

                            'category' =>
                                $option['category'],

                            'next_dose' =>
                                $option['next_dose'],

                            'required_doses' =>
                                $option['required_doses'],

                            'completed_doses' =>
                                $option['completed_doses'],

                            'doses_remaining' =>
                                $option['doses_remaining'],

                            'near_completion' =>
                                $option['near_completion'],

                            'recommended_date' =>
                                $option['recommended_date'],

                            'eligible_date' =>
                                $option['eligible_date'],

                            'schedule_label' =>
                                $option['schedule_label'],

                            'days_due' =>
                                $option['days_due'] ?? 0,

                            'days_overdue' =>
                                $option['days_overdue'] ?? 0,

                            'target_wednesday' =>
                                $option['target_wednesday'] ?? null,

                            'available_stock' =>
                                $option['available_stock'],

                            'inventory_available' =>
                                $option['inventory_available'],

                            'can_administer' =>
                                $option['can_administer'],

                            'is_already_scheduled' =>
                                $existingSchedule !== null,

                            'scheduled_date' =>
                                $existingSchedule
                                    ?->scheduled_date
                                    ?->toDateString(),

                            'vaccine_inventory_id' =>
                                $existingSchedule
                                    ?->vaccine_inventory_id,
                        ];
                    }
                );
            })
            ->values();

        return $this->cachedCandidatePool;
    }

    /**
     * Return unscheduled candidates that can
     * currently receive stock allocation.
     */
    public function getSchedulingSuggestions(): Collection
    {
        $candidatePool =
            $this->getCandidatePool();

        /*
         * Every outstanding scheduled appointment
         * represents one reserved physical dose.
         */
        $reservedStockByVaccine =
            $this->getReservedStockByVaccine();

        $unscheduledCandidates =
            $candidatePool
                ->filter(
                    fn (array $item) =>
                        $item['is_already_scheduled'] === false
                        &&
                        $item['inventory_available'] === true
                )
                ->groupBy('vaccine_id');

        return $unscheduledCandidates
            ->flatMap(
                function (
                    Collection $group,
                    int|string $vaccineId
                ) use ($reservedStockByVaccine) {
                    $first =
                        $group->first();

                    if (! $first) {
                        return collect();
                    }

                    $availableStock =
                        (int) $first['available_stock'];

                    $reservedStock =
                        (int) $reservedStockByVaccine
                            ->get(
                                (int) $vaccineId,
                                0
                            );

                    $allocatableStock =
                        max(
                            0,
                            $availableStock -
                                $reservedStock
                        );

                    if ($allocatableStock <= 0) {
                        return collect();
                    }

                    $ranked =
                        $group
                            ->sort(
                                fn (
                                    array $a,
                                    array $b
                                ) =>
                                    $this
                                        ->compareCandidates(
                                            $a,
                                            $b
                                        )
                            )
                            ->values();

                    return $ranked
                        ->take(
                            $allocatableStock
                        )
                        ->values()
                        ->map(
                            function (
                                array $item,
                                int $index
                            ) use (
                                $reservedStock,
                                $allocatableStock
                            ) {
                                $item['reserved_stock'] =
                                    $reservedStock;

                                $item['allocatable_stock'] =
                                    $allocatableStock;

                                $item['allocation_rank'] =
                                    $index + 1;

                                $item['priority_reason'] =
                                    $this->getPriorityReason(
                                        $item
                                    );

                                $item['proposed_scheduled_date'] =
                                    $this
                                        ->getProposedScheduledDate(
                                            $item['eligible_date']
                                        );

                                return $item;
                            }
                        );
                }
            )
            ->sort(
                fn (
                    array $a,
                    array $b
                ) =>
                    $this->compareCandidates(
                        $a,
                        $b
                    )
            )
            ->values();
    }

    /**
     * Generate real appointments.
     *
     * Before creating new appointments, existing
     * scheduled appointments are reconciled with
     * usable inventory batches.
     */
    public function generateSchedules(): Collection
    {
        $this->clearCandidatePoolCache();

        return DB::transaction(
            function () {
                /*
                 * Existing appointments always get
                 * first claim on usable stock.
                 *
                 * This also repairs:
                 *
                 * - old schedules with no batch
                 * - schedules pointing to expired batches
                 * - schedules pointing to archived batches
                 * - over-reserved batches
                 */
                $this
                    ->reconcileScheduledBatchReservationsWithinTransaction();

                $suggestions =
                    $this->getSchedulingSuggestions();

                if ($suggestions->isEmpty()) {
                    return collect();
                }

                return $suggestions
                    ->map(
                        function (
                            array $suggestion
                        ) {
                            $scheduledDate =
                                $suggestion[
                                    'proposed_scheduled_date'
                                ];

                            if (! $scheduledDate) {
                                return null;
                            }

                            /*
                             * Never silently resurrect or
                             * overwrite an existing schedule row.
                             */
                            $existingSchedule =
                                PatientVaccineSchedule::query()
                                    ->where(
                                        'patient_id',
                                        $suggestion[
                                            'patient_id'
                                        ]
                                    )
                                    ->where(
                                        'vaccine_id',
                                        $suggestion[
                                            'vaccine_id'
                                        ]
                                    )
                                    ->where(
                                        'dose_number',
                                        $suggestion[
                                            'next_dose'
                                        ]
                                    )
                                    ->lockForUpdate()
                                    ->first();

                            if ($existingSchedule) {
                                return null;
                            }

                            /*
                             * Reserve the exact usable batch.
                             *
                             * FEFO:
                             * earliest expiration first.
                             */
                            $batch =
                                $this
                                    ->findAvailableBatchForVaccine(
                                        (int) $suggestion[
                                            'vaccine_id'
                                        ]
                                    );

                            if (! $batch) {
                                return null;
                            }

                            $priorityReason =
                                $this->getPriorityReason(
                                    $suggestion
                                );

                            $allocationSnapshot =
                                $this
                                    ->buildAllocationSnapshot(
                                        $suggestion,
                                        $batch,
                                        $priorityReason
                                    );

                            $schedule =
                                PatientVaccineSchedule::create([
                                    'patient_id' =>
                                        $suggestion[
                                            'patient_id'
                                        ],

                                    'vaccine_id' =>
                                        $suggestion[
                                            'vaccine_id'
                                        ],

                                    'vaccine_inventory_id' =>
                                        $batch->id,

                                    'dose_number' =>
                                        $suggestion[
                                            'next_dose'
                                        ],

                                    'scheduled_date' =>
                                        $scheduledDate,

                                    'status' =>
                                        'scheduled',

                                    'is_manually_adjusted' =>
                                        false,

                                    /*
                                     * Explicit priority flag.
                                     */
                                    'is_series_completion_candidate' =>
                                        (bool) $suggestion[
                                            'near_completion'
                                        ],

                                    'priority_reason' =>
                                        $priorityReason,

                                    'allocation_rank' =>
                                        $suggestion[
                                            'allocation_rank'
                                        ],

                                    'allocation_snapshot' =>
                                        $allocationSnapshot,

                                    'allocated_at' =>
                                        now(),

                                    'adjusted_by' =>
                                        null,

                                    'adjusted_at' =>
                                        null,

                                    'adjustment_reason' =>
                                        null,
                                ]);

                            return [
                                'schedule_id' =>
                                    $schedule->id,

                                'patient_id' =>
                                    $suggestion[
                                        'patient_id'
                                    ],

                                'patient_code' =>
                                    $suggestion[
                                        'patient_code'
                                    ],

                                'patient_name' =>
                                    $suggestion[
                                        'patient_name'
                                    ],

                                'vaccine_id' =>
                                    $suggestion[
                                        'vaccine_id'
                                    ],

                                'vaccine_name' =>
                                    $suggestion[
                                        'vaccine_name'
                                    ],

                                'dose_number' =>
                                    $suggestion[
                                        'next_dose'
                                    ],

                                'vaccine_inventory_id' =>
                                    $batch->id,

                                'batch_number' =>
                                    $batch->batch_number,

                                'scheduled_date' =>
                                    $schedule
                                        ->scheduled_date
                                        ?->toDateString(),

                                'status' =>
                                    $schedule->status,

                                'priority_reason' =>
                                    $priorityReason,

                                'is_series_completion_candidate' =>
                                    $schedule
                                        ->is_series_completion_candidate,

                                'allocation_rank' =>
                                    $schedule
                                        ->allocation_rank,
                            ];
                        }
                    )
                    ->filter()
                    ->values();
            }
        );
    }

    /**
     * Existing appointment commitments are stable.
     *
     * Their patient, vaccine, dose, scheduled date, priority, and rank
     * are not changed here.
     *
     * Their reserved inventory batch is dynamically rebuilt by FEFO.
     */
    public function reconcileScheduledBatchReservations(): void
    {
        $this->clearCandidatePoolCache();

        DB::transaction(
            function () {
                $this
                    ->reconcileScheduledBatchReservationsWithinTransaction();
            }
        );
    }

    private function reconcileScheduledBatchReservationsWithinTransaction(): void
    {
        /*
         * Appointment commitments stay stable.
         *
         * Batch reservations do NOT stay sticky.
         *
         * Every reconciliation rebuilds the batch assignment of every
         * outstanding scheduled dose using FEFO:
         *
         * 1. earliest expiration date
         * 2. earliest date received
         * 3. lowest inventory row id
         *
         * This means that if an earlier-expiring usable batch is added later,
         * existing appointments may move to that batch while keeping their
         * patient, vaccine, dose, date, priority, and allocation rank intact.
         */
        $schedules =
            PatientVaccineSchedule::query()
                ->where(
                    'status',
                    'scheduled'
                )
                ->orderBy(
                    'scheduled_date'
                )
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

        if ($schedules->isEmpty()) {
            return;
        }

        $vaccineIds =
            $schedules
                ->pluck('vaccine_id')
                ->unique()
                ->map(
                    fn ($id) => (int) $id
                )
                ->values();

        /*
         * Only usable physical stock can back appointments.
         *
         * The ordering below is the FEFO ordering used for all
         * reservation rebuilding.
         */
        $usableBatches =
            VaccineInventory::query()
                ->whereIn(
                    'vaccine_id',
                    $vaccineIds
                )
                ->where(
                    'is_archived',
                    false
                )
                ->where(
                    'quantity',
                    '>',
                    0
                )
                ->whereDate(
                    'expiration_date',
                    '>=',
                    Carbon::today()
                )
                ->orderBy(
                    'expiration_date'
                )
                ->orderBy(
                    'date_received'
                )
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

        $batchesByVaccine =
            $usableBatches
                ->groupBy('vaccine_id');

        /*
         * Physical quantity is NOT deducted here.
         *
         * This array represents reservation capacity only. One scheduled
         * appointment consumes one reservation slot from a batch.
         */
        $remainingCapacity = [];

        foreach ($usableBatches as $batch) {
            $remainingCapacity[
                (int) $batch->id
            ] = (int) $batch->quantity;
        }

        foreach ($schedules as $schedule) {
            $vaccineId =
                (int) $schedule->vaccine_id;

            $vaccineBatches =
                $batchesByVaccine
                    ->get(
                        $vaccineId,
                        collect()
                    );

            /*
             * Always select the earliest-expiring usable batch that still
             * has free reservation capacity.
             *
             * We intentionally do NOT prefer the schedule's current batch.
             * This is what makes FEFO dynamic when inventory changes.
             */
            $fefoBatch =
                $vaccineBatches->first(
                    function (
                        $batch
                    ) use (
                        $remainingCapacity
                    ) {
                        return (
                            $remainingCapacity[
                                (int) $batch->id
                            ] ?? 0
                        ) > 0;
                    }
                );

            if ($fefoBatch) {
                /*
                 * Only the reserved inventory batch is allowed to change.
                 *
                 * Appointment date, patient, vaccine, dose, clinical
                 * priority, and allocation rank remain untouched.
                 */
                if (
                    (int) (
                        $schedule->vaccine_inventory_id
                            ?? 0
                    )
                    !==
                    (int) $fefoBatch->id
                ) {
                    $schedule->update([
                        'vaccine_inventory_id' =>
                            $fefoBatch->id,
                    ]);
                }

                $remainingCapacity[
                    (int) $fefoBatch->id
                ]--;

                continue;
            }

            /*
             * No usable reservation capacity remains for this vaccine.
             *
             * A committed appointment must always be backed by an exact
             * physical batch. If stock can no longer support this schedule,
             * remove the appointment so the patient returns to the live
             * candidate pool. A future stock arrival can allocate the patient
             * again through the normal priority scheduler.
             */
            $schedule->delete();
        }
    }

    /**
     * Find the next batch with free reservation
     * capacity using FEFO.
     */
    public function findAvailableBatchForVaccine(
        int $vaccineId
    ): ?VaccineInventory {
        $batches =
            VaccineInventory::query()
                ->where(
                    'vaccine_id',
                    $vaccineId
                )
                ->where(
                    'is_archived',
                    false
                )
                ->where(
                    'quantity',
                    '>',
                    0
                )
                ->whereDate(
                    'expiration_date',
                    '>=',
                    Carbon::today()
                )
                ->orderBy(
                    'expiration_date'
                )
                ->orderBy(
                    'date_received'
                )
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

        foreach ($batches as $batch) {
            $reservedCount =
                PatientVaccineSchedule::query()
                    ->where(
                        'status',
                        'scheduled'
                    )
                    ->where(
                        'vaccine_inventory_id',
                        $batch->id
                    )
                    ->count();

            if (
                $reservedCount
                    < (int) $batch->quantity
            ) {
                return $batch;
            }
        }

        return null;
    }

    /**
     * Build a frozen explanation of why this
     * appointment received allocation.
     */
    private function buildAllocationSnapshot(
        array $suggestion,
        VaccineInventory $batch,
        string $priorityReason
    ): array {
        return [
            'priority_reason' =>
                $priorityReason,

            'is_series_completion_candidate' =>
                (bool) $suggestion[
                    'near_completion'
                ],

            'schedule_label' =>
                $suggestion[
                    'schedule_label'
                ],

            'recommended_date' =>
                $suggestion[
                    'recommended_date'
                ],

            'eligible_date' =>
                $suggestion[
                    'eligible_date'
                ],

            'completed_doses' =>
                $suggestion[
                    'completed_doses'
                ],

            'required_doses' =>
                $suggestion[
                    'required_doses'
                ],

            'doses_remaining' =>
                $suggestion[
                    'doses_remaining'
                ],

            'days_due' =>
                (int) ($suggestion['days_due'] ?? 0),

            'days_overdue' =>
                (int) ($suggestion['days_overdue'] ?? 0),

            'target_wednesday' =>
                $suggestion['target_wednesday'] ?? null,

            'allocation_rank' =>
                $suggestion[
                    'allocation_rank'
                ],

            /*
             * Deterministic ranking order used
             * when this appointment was allocated.
             */
            'tie_break_order' => [
                'series_completion',
                'schedule_label',
                'days_due',
                'eligible_date',
                'patient_name',
            ],

            'patient_name' =>
                $suggestion[
                    'patient_name'
                ],

            /*
             * Original batch selected at the
             * moment of allocation.
             *
             * If the batch later expires and the
             * reservation is repaired, this snapshot
             * still records the original decision.
             */
            'original_batch' => [
                'id' =>
                    $batch->id,

                'batch_number' =>
                    $batch->batch_number,

                'expiration_date' =>
                    $batch
                        ->expiration_date
                        ?->toDateString(),
            ],
        ];
    }

    /**
     * Explicit readable priority reason.
     */
    private function getPriorityReason(
        array $candidate
    ): string {
        $daysDue = (int) ($candidate['days_due'] ?? 0);

        if (
            (bool) $candidate[
                'near_completion'
            ]
        ) {
            return $daysDue > 0
                ? "Series Completion ({$daysDue}d due)"
                : 'Series Completion Candidate';
        }

        return match (
            $candidate['schedule_label']
        ) {
            'Overdue' =>
                $daysDue > 0
                    ? "Overdue ({$daysDue} days due)"
                    : 'Overdue',

            'Recent Due' =>
                $daysDue > 0
                    ? "Recent Due ({$daysDue} days due)"
                    : 'Recent Due',

            'Current Age' =>
                'Current Age',

            'Upcoming' =>
                'Upcoming Visit',

            default =>
                'Priority Candidate',
        };
    }

    /**
     * Group the current candidate pool
     * by vaccine and dose.
     */
    public function getDemandByVaccineDose(): Collection
    {
        $reservedStockByVaccine =
            $this->getReservedStockByVaccine();

        return $this
            ->getCandidatePool()
            ->groupBy(
                function (
                    array $item
                ) {
                    return
                        $item['vaccine_id']
                        . '-'
                        . $item['next_dose'];
                }
            )
            ->map(
                function (
                    Collection $group
                ) use (
                    $reservedStockByVaccine
                ) {
                    $first =
                        $group->first();

                    $scheduledPatients =
                        $group
                            ->where(
                                'is_already_scheduled',
                                true
                            )
                            ->count();

                    $unscheduledPatients =
                        $group
                            ->where(
                                'is_already_scheduled',
                                false
                            )
                            ->count();

                    $availableStock =
                        (int) $first[
                            'available_stock'
                        ];

                    $reservedStock =
                        (int)
                        $reservedStockByVaccine
                            ->get(
                                (int) $first[
                                    'vaccine_id'
                                ],
                                0
                            );

                    $allocatableStock =
                        max(
                            0,
                            $availableStock
                                - $reservedStock
                        );

                    return [
                        'vaccine_id' =>
                            $first[
                                'vaccine_id'
                            ],

                        'vaccine_name' =>
                            $first[
                                'vaccine_name'
                            ],

                        'category' =>
                            $first[
                                'category'
                            ],

                        'dose_number' =>
                            $first[
                                'next_dose'
                            ],

                        'eligible_patients' =>
                            $group->count(),

                        'scheduled_patients' =>
                            $scheduledPatients,

                        'unscheduled_patients' =>
                            $unscheduledPatients,

                        'near_completion_patients' =>
                            $group
                                ->where(
                                    'near_completion',
                                    true
                                )
                                ->count(),

                        'available_stock' =>
                            $availableStock,

                        'reserved_stock' =>
                            $reservedStock,

                        'allocatable_stock' =>
                            $allocatableStock,

                        'inventory_available' =>
                            $allocatableStock > 0,

                        'patients' =>
                            $group
                                ->sort(
                                    fn (
                                        array $a,
                                        array $b
                                    ) =>
                                        $this
                                            ->compareDemandPatients(
                                                $a,
                                                $b
                                            )
                                )
                                ->values()
                                ->all(),
                    ];
                }
            )
            ->sortBy(
                'vaccine_name'
            )
            ->values();
    }

    /**
     * Every outstanding appointment reserves
     * one physical dose.
     */
    private function getReservedStockByVaccine(): Collection
    {
        return PatientVaccineSchedule::query()
            ->where(
                'status',
                'scheduled'
            )
            ->selectRaw(
                'vaccine_id, COUNT(*) as reserved_count'
            )
            ->groupBy(
                'vaccine_id'
            )
            ->pluck(
                'reserved_count',
                'vaccine_id'
            )
            ->map(
                fn ($count) =>
                    (int) $count
            );
    }

    /**
     * Priority:
     *
     * 1. Series completion candidate
     * 2. Overdue
     * 3. Recent Due
     * 4. Current Age
     * 5. Earlier eligible date
     * 6. Patient name
     */
    private function compareCandidates(
        array $a,
        array $b
    ): int {
        $nearCompletionComparison =
            (int) $b['near_completion']
            <=>
            (int) $a['near_completion'];

        if (
            $nearCompletionComparison !== 0
        ) {
            return
                $nearCompletionComparison;
        }

        $labelComparison =
            $this
                ->getScheduleLabelPriority(
                    $a['schedule_label']
                )
            <=>
            $this
                ->getScheduleLabelPriority(
                    $b['schedule_label']
                );

        if (
            $labelComparison !== 0
        ) {
            return
                $labelComparison;
        }

        /*
         * Most overdue first: candidate with the highest days_due
         * is prioritized ahead of candidates with lower days_due.
         */
        $daysDueComparison =
            ((int) ($b['days_due'] ?? 0))
            <=>
            ((int) ($a['days_due'] ?? 0));

        if ($daysDueComparison !== 0) {
            return $daysDueComparison;
        }

        $dateComparison =
            strcmp(
                $a['eligible_date'] ?? '',
                $b['eligible_date'] ?? ''
            );

        if ($dateComparison !== 0) {
            return
                $dateComparison;
        }

        return strcmp(
            $a['patient_name'],
            $b['patient_name']
        );
    }

    /**
     * Compare patients inside demand/TCL view.
     */
    private function compareDemandPatients(
        array $a,
        array $b
    ): int {
        $scheduledComparison =
            (int)
                $a[
                    'is_already_scheduled'
                ]
            <=>
            (int)
                $b[
                    'is_already_scheduled'
                ];

        if (
            $scheduledComparison !== 0
        ) {
            return
                $scheduledComparison;
        }

        return $this
            ->compareCandidates(
                $a,
                $b
            );
    }

    /**
     * First Wednesday on or after the later
     * of today and the patient's eligible date.
     */
    private function getProposedScheduledDate(
        ?string $eligibleDate
    ): ?string {
        if (! $eligibleDate) {
            return null;
        }

        $today =
            Carbon::today();

        $eligible =
            Carbon::parse(
                $eligibleDate
            );

        $startingDate =
            $eligible->greaterThan(
                $today
            )
                ? $eligible->copy()
                : $today->copy();

        if (
            $startingDate->isWednesday()
        ) {
            return $startingDate
                ->toDateString();
        }

        return $startingDate
            ->next(
                Carbon::WEDNESDAY
            )
            ->toDateString();
    }

    /**
     * Smaller number means higher priority.
     */
    private function getScheduleLabelPriority(
        string $label
    ): int {
        return match ($label) {
            'Overdue' =>
                1,

            'Recent Due' =>
                2,

            'Current Age' =>
                3,

            'Upcoming' =>
                4,

            default =>
                5,
        };
    }

    /**
     * Build readable patient name.
     */
    private function getPatientName(
        Patient $patient
    ): string {
        return trim(
            collect([
                $patient->first_name,
                $patient->middle_name,
                $patient->last_name,
            ])
                ->filter()
                ->implode(' ')
        );
    }

    /**
     * Reschedule the planned visit date for a patient's scheduled doses.
     *
     * Enables clinic staff to adjust the suggested visit date (e.g., choosing
     * a specific Wednesday or guardian-requested appointment date).
     */
    public function reschedulePatientVisit(
        Patient $patient,
        string $newDate,
        ?string $reason = null,
        ?array $scheduleIds = null,
        ?int $userId = null
    ): int {
        return DB::transaction(function () use ($patient, $newDate, $reason, $scheduleIds, $userId) {
            $query = PatientVaccineSchedule::query()
                ->where('patient_id', $patient->id)
                ->whereIn('status', ['scheduled', 'upcoming', 'overdue']);

            if (! empty($scheduleIds)) {
                $query->whereIn('id', $scheduleIds);
            }

            $schedules = $query->lockForUpdate()->get();

            if ($schedules->isEmpty()) {
                $this->generateSchedules();
                $schedules = $query->lockForUpdate()->get();
            }

            if ($schedules->isEmpty()) {
                $options = $this->scheduleService->getSchedulingOptions($patient);
                foreach ($options as $option) {
                    $batch = $this->findAvailableBatchForVaccine((int) $option['vaccine_id']);
                    PatientVaccineSchedule::create([
                        'patient_id' => $patient->id,
                        'vaccine_id' => $option['vaccine_id'],
                        'vaccine_inventory_id' => $batch?->id,
                        'dose_number' => $option['next_dose'],
                        'scheduled_date' => $newDate,
                        'status' => 'scheduled',
                        'is_manually_adjusted' => true,
                        'adjusted_by' => $userId,
                        'adjusted_at' => Carbon::now(),
                        'adjustment_reason' => $reason ?? 'Manually scheduled by clinic staff',
                        'priority_reason' => 'Upcoming Visit',
                    ]);
                }

                $this->clearCandidatePoolCache();
                return count($options);
            }

            foreach ($schedules as $schedule) {
                $schedule->update([
                    'scheduled_date' => $newDate,
                    'is_manually_adjusted' => true,
                    'adjusted_by' => $userId,
                    'adjusted_at' => Carbon::now(),
                    'adjustment_reason' => $reason ?? 'Manually adjusted by clinic staff',
                ]);
            }

            $this->clearCandidatePoolCache();
            return $schedules->count();
        });
    }
}