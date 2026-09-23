<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PatientVaccineSchedule;
use App\Notifications\UpcomingVisitReminderNotification;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Notification;

class ImmunizationReminderController extends Controller
{
    /**
     * Send reminder to a guardian for a specific scheduled vaccine appointment.
     */
    public function sendScheduleReminder(
        Request $request,
        PatientVaccineSchedule $schedule
    ): RedirectResponse {
        $schedule->loadMissing(['patient.guardian.user', 'vaccine']);

        $patient = $schedule->patient;
        if (! $patient) {
            return back()->with('error', 'Patient not found for this schedule.');
        }

        $guardianUser = $patient->guardian?->user;
        if (! $guardianUser) {
            return back()->with('warning', "Guardian of {$patient->first_name} does not have an active portal account.");
        }

        // Anti-duplicate check: don't spam if sent today
        $alreadySentToday = DatabaseNotification::query()
            ->where('notifiable_type', $guardianUser::class)
            ->where('notifiable_id', $guardianUser->id)
            ->where('type', UpcomingVisitReminderNotification::class)
            ->whereJsonContains('data->schedule_id', $schedule->id)
            ->whereDate('created_at', Carbon::today())
            ->exists();

        if ($alreadySentToday) {
            return back()->with('info', "A visit reminder for {$patient->first_name} ({$schedule->vaccine?->name}) was already sent today.");
        }

        Notification::send(
            $guardianUser,
            new UpcomingVisitReminderNotification(
                patient: $patient,
                vaccine: $schedule->vaccine ?? 'Vaccination',
                doseNumber: (int) $schedule->dose_number,
                scheduledDate: $schedule->scheduled_date,
                scheduleId: $schedule->id,
                remarks: $schedule->remarks
            )
        );

        return back()->with(
            'success',
            "Visit reminder sent to guardian of {$patient->first_name}."
        );
    }

    /**
     * Send reminder to a guardian for all active scheduled vaccinations of a patient.
     */
    public function sendPatientReminder(
        Request $request,
        Patient $patient
    ): RedirectResponse {
        $patient->loadMissing([
            'guardian.user',
            'vaccineSchedules' => function ($query) {
                $query->where('status', 'scheduled')
                    ->whereNotNull('scheduled_date')
                    ->with('vaccine')
                    ->orderBy('scheduled_date');
            },
        ]);

        $guardianUser = $patient->guardian?->user;
        if (! $guardianUser) {
            return back()->with('warning', "Guardian of {$patient->first_name} does not have an active portal account.");
        }

        $schedules = $patient->vaccineSchedules;
        if ($schedules->isEmpty()) {
            return back()->with('info', "No active upcoming scheduled visits found for {$patient->first_name}.");
        }

        $sentCount = 0;
        foreach ($schedules as $schedule) {
            // Anti-duplicate check per schedule
            $alreadySentToday = DatabaseNotification::query()
                ->where('notifiable_type', $guardianUser::class)
                ->where('notifiable_id', $guardianUser->id)
                ->where('type', UpcomingVisitReminderNotification::class)
                ->whereJsonContains('data->schedule_id', $schedule->id)
                ->whereDate('created_at', Carbon::today())
                ->exists();

            if (! $alreadySentToday) {
                Notification::send(
                    $guardianUser,
                    new UpcomingVisitReminderNotification(
                        patient: $patient,
                        vaccine: $schedule->vaccine ?? 'Vaccination',
                        doseNumber: (int) $schedule->dose_number,
                        scheduledDate: $schedule->scheduled_date,
                        scheduleId: $schedule->id,
                        remarks: $schedule->remarks
                    )
                );
                $sentCount++;
            }
        }

        if ($sentCount === 0) {
            return back()->with('info', "Visit reminders were already sent to {$patient->first_name}'s guardian today.");
        }

        return back()->with('success', "Sent {$sentCount} visit reminder(s) to {$patient->first_name}'s guardian.");
    }

    /**
     * Bulk send reminders to all guardians whose children are scheduled for a specific date or period.
     */
    public function sendBulkReminders(Request $request): RedirectResponse
    {
        $today = Carbon::today();
        $targetDate = $request->input('date')
            ? Carbon::parse($request->input('date'))->startOfDay()
            : null;

        $query = PatientVaccineSchedule::query()
            ->where('status', 'scheduled')
            ->whereNotNull('scheduled_date')
            ->with(['patient.guardian.user', 'vaccine']);

        if ($targetDate) {
            $query->whereDate('scheduled_date', $targetDate);
        } else {
            // Default: today through next 3 days
            $query->whereDate('scheduled_date', '>=', $today)
                ->whereDate('scheduled_date', '<=', $today->copy()->addDays(3));
        }

        $schedules = $query->get();

        if ($schedules->isEmpty()) {
            return back()->with('info', 'No scheduled appointments found in the selected timeframe.');
        }

        $sentCount = 0;
        $skippedCount = 0;

        foreach ($schedules as $schedule) {
            $guardianUser = $schedule->patient?->guardian?->user;
            if (! $guardianUser) {
                $skippedCount++;
                continue;
            }

            $alreadySentToday = DatabaseNotification::query()
                ->where('notifiable_type', $guardianUser::class)
                ->where('notifiable_id', $guardianUser->id)
                ->where('type', UpcomingVisitReminderNotification::class)
                ->whereJsonContains('data->schedule_id', $schedule->id)
                ->whereDate('created_at', Carbon::today())
                ->exists();

            if (! $alreadySentToday) {
                Notification::send(
                    $guardianUser,
                    new UpcomingVisitReminderNotification(
                        patient: $schedule->patient,
                        vaccine: $schedule->vaccine ?? 'Vaccination',
                        doseNumber: (int) $schedule->dose_number,
                        scheduledDate: $schedule->scheduled_date,
                        scheduleId: $schedule->id,
                        remarks: $schedule->remarks
                    )
                );
                $sentCount++;
            }
        }

        $msg = "Bulk reminders processed: {$sentCount} sent.";
        if ($skippedCount > 0) {
            $msg .= " ({$skippedCount} skipped due to missing portal accounts).";
        }

        return back()->with('success', $msg);
    }
}

