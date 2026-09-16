<?php

namespace Database\Seeders;

use App\Models\ImmunizationRecord;
use App\Models\VaccineInventory;
use App\Models\VaccineInventoryTransaction;
use Illuminate\Database\Seeder;

class InventoryTransactionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Backfill initial received transactions for all batches
        $batches = VaccineInventory::all();
        foreach ($batches as $batch) {
            $exists = VaccineInventoryTransaction::where('vaccine_inventory_id', $batch->id)
                ->where('transaction_type', 'received')
                ->exists();

            if (! $exists) {
                VaccineInventoryTransaction::create([
                    'vaccine_id' => $batch->vaccine_id,
                    'vaccine_inventory_id' => $batch->id,
                    'user_id' => 1,
                    'patient_id' => null,
                    'immunization_record_id' => null,
                    'transaction_type' => 'received',
                    'quantity_change' => (int) $batch->quantity,
                    'balance_after' => (int) $batch->quantity,
                    'batch_number' => $batch->batch_number,
                    'remarks' => $batch->remarks ?: 'Initial stock receipt',
                    'created_at' => $batch->date_received ? $batch->date_received->startOfDay() : $batch->created_at,
                    'updated_at' => $batch->date_received ? $batch->date_received->startOfDay() : $batch->updated_at,
                ]);
            }

            // If batch is archived, record archive event
            if ($batch->is_archived) {
                $archiveExists = VaccineInventoryTransaction::where('vaccine_inventory_id', $batch->id)
                    ->whereIn('transaction_type', ['archived', 'expired', 'wastage'])
                    ->exists();

                if (! $archiveExists) {
                    VaccineInventoryTransaction::create([
                        'vaccine_id' => $batch->vaccine_id,
                        'vaccine_inventory_id' => $batch->id,
                        'user_id' => 1,
                        'patient_id' => null,
                        'immunization_record_id' => null,
                        'transaction_type' => $batch->archive_reason === 'expired' ? 'expired' : 'archived',
                        'quantity_change' => 0,
                        'balance_after' => 0,
                        'batch_number' => $batch->batch_number,
                        'remarks' => 'Batch archived: ' . ($batch->archive_reason ?: 'depleted'),
                        'created_at' => $batch->archived_at ?: now(),
                        'updated_at' => $batch->archived_at ?: now(),
                    ]);
                }
            }
        }

        // 2. Backfill administered transactions for historical immunization records
        $records = ImmunizationRecord::with('patient', 'vaccine')->get();
        foreach ($records as $record) {
            $transExists = VaccineInventoryTransaction::where('immunization_record_id', $record->id)->exists();
            if (! $transExists && $record->patient) {
                // Find matching batch for vaccine
                $batch = VaccineInventory::where('vaccine_id', $record->vaccine_id)->first();
                $batchNumber = $batch ? $batch->batch_number : 'LOT-' . $record->vaccine_id . '-HIST';

                VaccineInventoryTransaction::create([
                    'vaccine_id' => $record->vaccine_id,
                    'vaccine_inventory_id' => $batch?->id,
                    'user_id' => $record->administered_by,
                    'patient_id' => $record->patient_id,
                    'immunization_record_id' => $record->id,
                    'transaction_type' => 'administered',
                    'quantity_change' => -1,
                    'balance_after' => $batch ? max(0, (int) $batch->quantity) : 0,
                    'batch_number' => $batchNumber,
                    'remarks' => "Dose {$record->dose_number} administered to {$record->patient->first_name} {$record->patient->last_name}",
                    'created_at' => $record->date_administered ?: $record->created_at,
                    'updated_at' => $record->date_administered ?: $record->updated_at,
                ]);
            }
        }
    }
}

