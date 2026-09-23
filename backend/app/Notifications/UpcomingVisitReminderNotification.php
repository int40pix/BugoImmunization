<?php

namespace App\Notifications;

use App\Models\Patient;
use App\Models\PatientVaccineSchedule;
use App\Models\Vaccine;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class UpcomingVisitReminderNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Patient $patient,
        public Vaccine|string $vaccine,
        public int $doseNumber = 1,
        public ?string $scheduledDate = null,
        public ?int $scheduleId = null,
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
        $vaccineName = $this->vaccine instanceof Vaccine ? $this->vaccine->name : $this->vaccine;
        $childName = trim($this->patient->first_name . ' ' . $this->patient->last_name);
        $firstName = $this->patient->first_name;

        $targetDate = $this->scheduledDate ? Carbon::parse($this->scheduledDate)->startOfDay() : Carbon::today();
        $today = Carbon::today();

        $relativeWhen = match (true) {
            $targetDate->equalTo($today) => 'today',
            $targetDate->equalTo($today->copy()->addDay()) => 'tomorrow',
            $targetDate->lt($today) => 'overdue since ' . $targetDate->format('M d, Y'),
            default => 'on ' . $targetDate->format('M d, Y') . ' (' . $targetDate->format('l') . ')',
        };

        $priority = $targetDate->lte($today) ? 'warning' : 'info';

        $title = "Upcoming Vaccination: {$firstName}";
        $description = "Reminder: {$firstName} is scheduled for {$vaccineName} (Dose {$this->doseNumber}) {$relativeWhen} at Barangay Bugo Health Center. Please bring your child's immunization card.";

        $url = '/guardian/visits';

        return [
            'type' => 'schedule',
            'title' => $title,
            'description' => $description,
            'url' => $url,
            'priority' => $priority,
            'patient_id' => $this->patient->id,
            'patient_name' => $childName,
            'vaccine_name' => $vaccineName,
            'dose_number' => $this->doseNumber,
            'schedule_id' => $this->scheduleId,
            'scheduled_date' => $this->scheduledDate,
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

