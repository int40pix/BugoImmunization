<?php

namespace App\Services;

use App\Models\User;
use App\Models\VaccineInventory;
use App\Models\VaccineInventoryTransaction;
use App\Notifications\BatchArchivedNotification;
use Carbon\Carbon;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class VaccineInventoryService
{
    public function __construct(
        protected VaccineSchedulingPriorityService $schedulingService
    ) {}

    /**
     * Archive a vaccine batch (manual or automatic).
     *
     * @param VaccineInventory $batch
     * @param string $reason ('expired', 'out_of_stock', 'damaged', 'recalled', 'manual', etc.)
     * @param int|null $userId (null for System, user ID for staff)
     * @param string|null $remarks
     * @return bool
     */
    public function archiveBatch(
        VaccineInventory $batch,
        string $reason,
        ?int $userId = null,
        ?string $remarks = null
    ): bool {
        // Prevent duplicate archiving of already archived batches
        if ($batch->is_archived) {
            return false;
        }

        $reasonLabel = $this->getReasonLabel($reason);
        $transactionType = match ($reason) {
            'expired' => 'expired',
            'damaged', 'wastage' => 'wastage',
            default => 'archived',
        };

        $remainingQuantity = (int) $batch->quantity;

        DB::transaction(function () use ($batch, $reason, $reasonLabel, $transactionType, $remainingQuantity, $userId, $remarks) {
            // 1. Mark batch as archived
            $batch->update([
                'is_archived' => true,
                'archived_at' => now(),
                'archive_reason' => $reason,
            ]);

            // 2. Record ledger transaction (userId = null displays as 'System')
            VaccineInventoryTransaction::create([
                'vaccine_id' => $batch->vaccine_id,
                'vaccine_inventory_id' => $batch->id,
                'user_id' => $userId,
                'patient_id' => null,
                'immunization_record_id' => null,
                'transaction_type' => $transactionType,
                'quantity_change' => -$remainingQuantity,
                'balance_after' => 0,
                'batch_number' => $batch->batch_number,
                'remarks' => $remarks ?: ($userId ? "Batch archived manually: {$reasonLabel}" : "Batch automatically archived by System: {$reasonLabel}"),
            ]);

            // 3. Reconcile patient immunization schedules
            $this->schedulingService->generateSchedules();

            // 4. Send interactive notification (both manual and automated archiving)
            $this->notifyStaffOfBatchArchived($batch, $reason, $reasonLabel, $userId);
        });

        return true;
    }

    /**
     * Automatically detect and archive batches that are expired or fully depleted.
     *
     * @return int Number of batches archived
     */
    public function autoArchiveExpiredAndDepletedBatches(): int
    {
        $today = Carbon::today();

        $batches = VaccineInventory::query()
            ->with('vaccine')
            ->where('is_archived', false)
            ->where(function ($query) use ($today) {
                $query->whereDate('expiration_date', '<', $today)
                    ->orWhere('quantity', '<=', 0);
            })
            ->get();

        $archivedCount = 0;

        foreach ($batches as $batch) {
            $isExpired = $batch->expiration_date && Carbon::parse($batch->expiration_date)->isPast();
            $reason = $isExpired ? 'expired' : 'out_of_stock';

            $archived = $this->archiveBatch(
                batch: $batch,
                reason: $reason,
                userId: null, // Attributed to System
                remarks: "Batch automatically archived: " . ($isExpired ? 'Expiration date reached' : 'Stock depleted')
            );

            if ($archived) {
                $archivedCount++;
            }
        }

        return $archivedCount;
    }

    /**
     * Dispatch interactive notification to all active staff/admin users.
     */
    protected function notifyStaffOfBatchArchived(
        VaccineInventory $batch,
        string $reason,
        string $reasonLabel,
        ?int $userId = null
    ): void {
        $staffName = null;
        if ($userId !== null) {
            $staff = User::find($userId);
            $staffName = $staff?->name;
        }

        $isManual = $userId !== null;

        // Guard against duplicate notification for automated archives
        if (! $isManual) {
            $alreadyNotified = DatabaseNotification::where('data->batch_id', $batch->id)
                ->where('data->archive_reason', $reason)
                ->exists();

            if ($alreadyNotified) {
                return;
            }
        }

        $staffUsers = User::query()
            ->whereIn('role', ['admin', 'nurse', 'midwife', 'bhw'])
            ->where('status', 'active')
            ->get();

        if ($staffUsers->isNotEmpty()) {
            Notification::send(
                $staffUsers,
                new BatchArchivedNotification(
                    batch: $batch,
                    reason: $reason,
                    reasonLabel: $reasonLabel,
                    isManual: $isManual,
                    staffName: $staffName
                )
            );
        }
    }

    /**
     * Format a human-readable reason label.
     */
    public function getReasonLabel(string $reason): string
    {
        return match ($reason) {
            'expired' => 'Expired',
            'out_of_stock' => 'Out of Stock / Depleted',
            'damaged' => 'Damaged / Cold Chain Compromised',
            'recalled' => 'Manufacturer / Health Authority Recall',
            'manual' => 'Manual Administrative Archive',
            default => ucwords(str_replace('_', ' ', $reason)),
        };
    }
}

