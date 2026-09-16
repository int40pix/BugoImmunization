<?php

namespace App\Services;

use App\Models\ImmunizationRecord;
use App\Models\Patient;
use App\Models\PatientVaccineSchedule;
use App\Models\VaccineInventory;
use App\Models\VaccineInventoryTransaction;
use Carbon\Carbon;
use DomainException;
use Illuminate\Support\Facades\DB;

class ImmunizationAdministrationService
{
    public function __construct(
        private PatientImmunizationScheduleService $scheduleService
    ) {
    }

    public function administer(
        Patient $patient,
        int $vaccineId,
        ?int $administeredBy = null,
        ?string $remarks = null
    ): ImmunizationRecord {
        return DB::transaction(function () use (
            $patient,
            $vaccineId,
            $administeredBy,
            $remarks
        ) {
            /*
             * Lock the patient so two requests cannot
             * administer the same next dose at once.
             */
            $lockedPatient = Patient::query()
                ->whereKey($patient->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedPatient->status !== 'Active') {
                throw new DomainException(
                    'Vaccines cannot be administered to an inactive patient.'
                );
            }

            $lockedPatient->unsetRelation('immunizationRecords');
            $lockedPatient->unsetRelation('optionalVaccines');

            $schedule = collect(
                $this->scheduleService
                    ->getSchedule($lockedPatient)
            );

            $vaccineSchedule = $schedule->first(
                fn (array $item) =>
                    (int) $item['vaccine_id']
                        === $vaccineId
            );

            if (! $vaccineSchedule) {
                throw new DomainException(
                    'This vaccine does not apply to the selected patient.'
                );
            }

            if ($vaccineSchedule['completed']) {
                throw new DomainException(
                    'The patient has already completed this vaccine series.'
                );
            }

            if (! $vaccineSchedule['eligible']) {
                throw new DomainException(
                    'The patient is not yet eligible for the next dose of this vaccine.'
                );
            }

            $doseNumber =
                (int) $vaccineSchedule['next_dose'];

            /*
             * Duplicate protection.
             */
            $existingRecord =
                ImmunizationRecord::query()
                    ->where(
                        'patient_id',
                        $lockedPatient->id
                    )
                    ->where(
                        'vaccine_id',
                        $vaccineId
                    )
                    ->where(
                        'dose_number',
                        $doseNumber
                    )
                    ->lockForUpdate()
                    ->first();

            if ($existingRecord) {
                throw new DomainException(
                    'This vaccine dose has already been recorded.'
                );
            }

            /*
             * Find the patient's scheduled appointment
             * for this exact dose, if one exists.
             */
            $matchingScheduledDose =
                PatientVaccineSchedule::query()
                    ->where(
                        'patient_id',
                        $lockedPatient->id
                    )
                    ->where(
                        'vaccine_id',
                        $vaccineId
                    )
                    ->where(
                        'dose_number',
                        $doseNumber
                    )
                    ->where(
                        'status',
                        'scheduled'
                    )
                    ->lockForUpdate()
                    ->first();

            $inventory = null;

            /*
             * ============================================================
             * SCHEDULED ADMINISTRATION
             * ============================================================
             *
             * A scheduled patient must consume the exact
             * batch reserved for their appointment.
             */
            if ($matchingScheduledDose) {
                $reservedBatchId =
                    $matchingScheduledDose
                        ->vaccine_inventory_id;

                if (! $reservedBatchId) {
                    throw new DomainException(
                        'This scheduled appointment does not currently have a usable vaccine batch reserved.'
                    );
                }

                $inventory =
                    VaccineInventory::query()
                        ->whereKey(
                            $reservedBatchId
                        )
                        ->where(
                            'vaccine_id',
                            $vaccineId
                        )
                        ->lockForUpdate()
                        ->first();

                if (! $inventory) {
                    throw new DomainException(
                        'The reserved vaccine batch could not be found.'
                    );
                }

                if ($inventory->is_archived) {
                    throw new DomainException(
                        'The reserved vaccine batch is archived and cannot be administered.'
                    );
                }

                if (
                    $inventory
                        ->expiration_date
                        ->lt(Carbon::today())
                ) {
                    throw new DomainException(
                        'The reserved vaccine batch has expired and cannot be administered.'
                    );
                }

                if ((int) $inventory->quantity <= 0) {
                    throw new DomainException(
                        'The reserved vaccine batch is out of stock.'
                    );
                }
            }

            /*
             * ============================================================
             * UNSCHEDULED / WALK-IN ADMINISTRATION
             * ============================================================
             *
             * Walk-ins may only consume genuinely unreserved
             * stock. They cannot take doses reserved for
             * scheduled appointments.
             */
            if (! $matchingScheduledDose) {
                $usableInventory =
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

                if ($usableInventory->isEmpty()) {
                    throw new DomainException(
                        'No usable vaccine inventory is currently available.'
                    );
                }

                /*
                 * Find the first FEFO batch that still has
                 * physical quantity beyond its current
                 * batch-specific reservations.
                 */
                foreach (
                    $usableInventory as $batch
                ) {
                    $reservedForBatch =
                        PatientVaccineSchedule::query()
                            ->where(
                                'status',
                                'scheduled'
                            )
                            ->where(
                                'vaccine_inventory_id',
                                $batch->id
                            )
                            ->lockForUpdate()
                            ->count();

                    $unreservedQuantity =
                        max(
                            0,
                            (int) $batch->quantity
                                - $reservedForBatch
                        );

                    if (
                        $unreservedQuantity > 0
                    ) {
                        $inventory = $batch;

                        break;
                    }
                }

                if (! $inventory) {
                    throw new DomainException(
                        'All available stock is currently reserved for scheduled patients.'
                    );
                }
            }

            /*
             * Final safety check.
             */
            if (! $inventory) {
                throw new DomainException(
                    'No usable vaccine inventory is currently available.'
                );
            }

            /*
             * Create the official immunization record.
             */
            $record =
                ImmunizationRecord::query()
                    ->create([
                        'patient_id' =>
                            $lockedPatient->id,

                        'vaccine_id' =>
                            $vaccineId,

                        'dose_number' =>
                            $doseNumber,

                        'date_administered' =>
                            Carbon::today(),

                        'administered_by' =>
                            $administeredBy,

                        'source' =>
                            'local',

                        'remarks' =>
                            $remarks,
                    ]);

            /*
             * Physical stock is deducted only
             * when administration actually happens.
             */
            $inventory->decrement(
                'quantity'
            );

            VaccineInventoryTransaction::create([
                'vaccine_id' => $vaccineId,
                'vaccine_inventory_id' => $inventory->id,
                'user_id' => $administeredBy,
                'patient_id' => $lockedPatient->id,
                'immunization_record_id' => $record->id,
                'transaction_type' => 'administered',
                'quantity_change' => -1,
                'balance_after' => (int) $inventory->fresh()->quantity,
                'batch_number' => $inventory->batch_number,
                'remarks' => "Dose {$doseNumber} administered to {$lockedPatient->first_name} {$lockedPatient->last_name}",
            ]);

            /*
             * Scheduled appointment is now fulfilled.
             */
            if ($matchingScheduledDose) {
                $matchingScheduledDose
                    ->update([
                        'status' =>
                            'completed',
                    ]);
            }

            // Automatically archive batch if it became depleted
            if ((int) $inventory->fresh()->quantity <= 0) {
                app(VaccineInventoryService::class)->autoArchiveExpiredAndDepletedBatches();
            }

            return $record->fresh([
                'patient',
                'vaccine',
                'administeredBy',
            ]);
        });
    }
}