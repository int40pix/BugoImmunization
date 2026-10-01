<?php

namespace App\Notifications;

use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class VaccineSessionAdministeredNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Patient $patient,
        public array $administeredDoses,
        public ?string $dateAdministered = null,
        public ?string $administeredByName = null,
        public ?string $nextVisitPrompt = null,
        public ?string $nextRecommendedDate = null
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
        $childName = trim($this->patient->first_name . ' ' . $this->patient->last_name);
        $firstName = $this->patient->first_name;

        $rawDate = $this->dateAdministered ?: Carbon::today()->toDateString();
        $dateFormatted = Carbon::parse($rawDate)->format('M d, Y');
        $staff = $this->administeredByName ?: 'Health Center Staff';

        $count = count($this->administeredDoses);
        $doseSummaries = collect($this->administeredDoses)
            ->map(fn ($d) => "{$d['vaccine_name']} (Dose {$d['dose_number']})")
            ->join(', ');

        $title = "Clinical Vaccination Session: {$firstName}";
        $description = "{$firstName} received {$count} vaccines ({$doseSummaries}) on {$dateFormatted} at Barangay Bugo Health Center. Administered by {$staff}.";
        if ($this->nextVisitPrompt) {
            $description .= " {$this->nextVisitPrompt}";
        }

        $url = "/guardian/children/{$this->patient->id}";

        return [
            'type' => 'vaccination',
            'title' => $title,
            'description' => $description,
            'url' => $url,
            'priority' => 'success',
            'patient_id' => $this->patient->id,
            'patient_name' => $childName,
            'administered_doses' => $this->administeredDoses,
            'count' => $count,
            'date_administered' => $rawDate,
            'administered_by' => $staff,
            'next_visit_prompt' => $this->nextVisitPrompt,
            'next_recommended_date' => $this->nextRecommendedDate,
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
