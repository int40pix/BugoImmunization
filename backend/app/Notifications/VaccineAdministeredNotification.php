<?php

namespace App\Notifications;

use App\Models\ImmunizationRecord;
use App\Models\Patient;
use App\Models\Vaccine;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class VaccineAdministeredNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Patient $patient,
        public ImmunizationRecord $record,
        public ?Vaccine $vaccine = null,
        public ?int $doseNumber = null,
        public ?string $dateAdministered = null,
        public ?string $administeredByName = null
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
        $vaccineName = $this->vaccine?->name ?? $this->record->vaccine?->name ?? 'Vaccine';
        $dose = $this->doseNumber ?? $this->record->dose_number ?? 1;
        $childName = trim($this->patient->first_name . ' ' . $this->patient->last_name);
        $firstName = $this->patient->first_name;

        $rawDate = $this->dateAdministered ?? $this->record->date_administered;
        $dateFormatted = $rawDate ? Carbon::parse($rawDate)->format('M d, Y') : Carbon::today()->format('M d, Y');
        $staff = $this->administeredByName ?? $this->record->administeredBy?->name ?? 'Health Center Staff';

        $title = "Vaccination Recorded: {$firstName}";
        $description = "{$firstName} received {$vaccineName} (Dose {$dose}) on {$dateFormatted} at Barangay Bugo Health Center. Administered by {$staff}.";

        $url = "/guardian/children/{$this->patient->id}";

        return [
            'type' => 'vaccination',
            'title' => $title,
            'description' => $description,
            'url' => $url,
            'priority' => 'success',
            'patient_id' => $this->patient->id,
            'patient_name' => $childName,
            'vaccine_id' => $this->vaccine?->id ?? $this->record->vaccine_id,
            'vaccine_name' => $vaccineName,
            'dose_number' => $dose,
            'batch_number' => $this->record->batch_number,
            'date_administered' => $rawDate,
            'administered_by' => $staff,
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

