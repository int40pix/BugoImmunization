<?php

namespace App\Notifications;

use App\Models\VaccineInventory;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BatchArchivedNotification extends Notification
{
    use Queueable;

    public string $reasonLabel;

    public function __construct(
        public VaccineInventory $batch,
        public string $reason,
        ?string $reasonLabel = null,
        public bool $isManual = false,
        public ?string $staffName = null
    ) {
        $this->reasonLabel = $reasonLabel ?? match ($reason) {
            'expired' => 'Expired',
            'out_of_stock' => 'Out of Stock (Depleted)',
            'damaged' => 'Damaged / Compromised',
            'recalled' => 'Manufacturer Recall',
            default => 'Manual Archive',
        };
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $vaccineName = $this->batch->vaccine?->name ?? 'Vaccine';
        $batchNumber = $this->batch->batch_number;

        $title = $this->isManual
            ? "Batch Archived: {$batchNumber}"
            : "Batch Automatically Archived: {$batchNumber}";

        $description = $this->isManual
            ? ($this->staffName
                ? "Batch {$batchNumber} ({$vaccineName}) was archived by {$this->staffName} ({$this->reasonLabel})."
                : "Batch {$batchNumber} ({$vaccineName}) was manually archived ({$this->reasonLabel}).")
            : "Batch {$batchNumber} ({$vaccineName}) was automatically archived because it is {$this->reasonLabel}.";

        $priority = match ($this->reason) {
            'expired' => 'warning',
            'damaged', 'recalled' => 'critical',
            default => 'info',
        };

        $url = app()->bound('url')
            ? route('vaccine-inventory.archived', [
                'search' => $batchNumber,
                'highlighted_batch_id' => $this->batch->id,
            ])
            : '/vaccine-inventory/archived?search=' . urlencode($batchNumber) . '&highlighted_batch_id=' . $this->batch->id;

        return [
            'type' => 'inventory',
            'title' => $title,
            'description' => $description,
            'url' => $url,
            'priority' => $priority,
            'batch_id' => $this->batch->id,
            'batch_number' => $batchNumber,
            'vaccine_name' => $vaccineName,
            'archive_reason' => $this->reason,
            'reason_label' => $this->reasonLabel,
            'is_manual' => $this->isManual,
            'archived_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Database representation of notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }
}

