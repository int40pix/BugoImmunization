<?php

namespace App\Notifications;

use App\Models\VaccineInventory;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StockAdjustedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public VaccineInventory $batch,
        public string $type,
        public int $quantityChange,
        public int $newQuantity,
        public string $staffName,
        public ?string $remarks = null
    ) {}

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
        $absChange = abs($this->quantityChange);
        $isDeduct = $this->quantityChange < 0;

        $typeLabel = match ($this->type) {
            'wastage' => 'Wastage / Spoilage',
            default => 'Stock Adjustment',
        };

        $title = $this->type === 'wastage'
            ? "Vaccine Wastage Logged: {$batchNumber}"
            : "Stock Adjusted: {$batchNumber}";

        $changeText = $isDeduct ? "deducted {$absChange} dose(s)" : "added {$absChange} dose(s)";
        $description = "{$this->staffName} {$changeText} ({$typeLabel}) for batch {$batchNumber} ({$vaccineName}). Balance: {$this->newQuantity} doses.";

        $priority = $this->type === 'wastage' ? 'warning' : 'info';

        $url = app()->bound('url')
            ? route('vaccine-inventory.transactions', ['search' => $batchNumber])
            : '/vaccine-inventory/transactions?search=' . urlencode($batchNumber);

        return [
            'type' => 'inventory',
            'title' => $title,
            'description' => $description,
            'url' => $url,
            'priority' => $priority,
            'batch_id' => $this->batch->id,
            'batch_number' => $batchNumber,
            'vaccine_name' => $vaccineName,
            'action_type' => $this->type,
            'quantity_change' => $this->quantityChange,
            'new_quantity' => $this->newQuantity,
            'performed_by' => $this->staffName,
            'remarks' => $this->remarks,
            'created_at' => now()->toIso8601String(),
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

