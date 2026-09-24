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

        // Anti-bloat / Overwrite: Remove previous visit reminders for this child to keep inbox clean
        DatabaseNotification::query()
            ->where('notifiable_type', $guardianUser::class)
            ->where('notifiable_id', $guardianUser->id)
            ->where('type', UpcomingVisitReminderNotification::class)
            ->whereJsonContains('data->patient_id', $patient->id)
            ->delete();

        $vaccineLabel = $schedule->vaccine
            ? "{$schedule->vaccine->name} (Dose {$schedule->dose_number})"
            : 'Vaccination Visit';

        Notification::send(
            $guardianUser,
            new UpcomingVisitReminderNotification(
                patient: $patient,
                vaccine: $vaccineLabel,
                doseNumber: (int) $schedule->dose_number,
                scheduledDate: $schedule->scheduled_date,
                scheduleId: $schedule->id,
                remarks: $schedule->remarks
            )
        );

        return back()->with(
            'success',
            "Reminders sent: Visit reminder sent to guardian of {$patient->first_name}."
        );
    }

    /**
     * Send reminder to a guardian for the next scheduled visit of a patient.
     * Consolidates all vaccines for that visit into a single reminder and overwrites previous notifications.
     */
    public function sendPatientReminder(
        Request $request,
        Patient $patient
    ): RedirectResponse {
        $today = Carbon::today();

        $patient->loadMissing([
            'guardian.user',
            'vaccineSchedules' => function ($query) {
                $query->whereIn('status', ['scheduled', 'upcoming', 'overdue'])
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

        // Find upcoming visits (>= today), or fall back to earliest scheduled
        $upcomingSchedules = $schedules->filter(function ($s) use ($today) {
            return Carbon::parse($s->scheduled_date)->startOfDay()->gte($today);
        });

        $targetSchedules = $upcomingSchedules->isNotEmpty() ? $upcomingSchedules : $schedules;
        $nextVisitDate = Carbon::parse($targetSchedules->first()->scheduled_date)->startOfDay();

        // Consolidate all vaccines scheduled on this exact visit date
        $visitSchedules = $targetSchedules->filter(function ($s) use ($nextVisitDate) {
            return Carbon::parse($s->scheduled_date)->startOfDay()->equalTo($nextVisitDate);
        });

        $vaccineDescriptions = $visitSchedules->map(function ($s) {
            $name = $s->vaccine?->name ?? 'Vaccine';
            return "{$name} (Dose {$s->dose_number})";
        })->unique()->values()->all();

        $vaccinesSummary = implode(', ', $vaccineDescriptions);

        // Anti-bloat / Overwrite: Delete previous visit reminder notifications for this child
        DatabaseNotification::query()
            ->where('notifiable_type', $guardianUser::class)
            ->where('notifiable_id', $guardianUser->id)
            ->where('type', UpcomingVisitReminderNotification::class)
            ->whereJsonContains('data->patient_id', $patient->id)
            ->delete();

        // Dispatch exactly ONE reminder for this patient's next visit
        Notification::send(
            $guardianUser,
            new UpcomingVisitReminderNotification(
                patient: $patient,
                vaccine: $vaccinesSummary,
                doseNumber: 1,
                scheduledDate: $nextVisitDate->toDateString(),
                scheduleId: $visitSchedules->first()?->id,
                remarks: $visitSchedules->first()?->remarks
            )
        );

        $dateFormatted = $nextVisitDate->format('M d, Y');
        return back()->with(
            'success',
            "Reminders sent: Next visit reminder for {$patient->first_name} ({$dateFormatted} for {$vaccinesSummary}) sent to guardian."
        );
    }

    /**
     * Bulk send reminders to all guardians whose children are scheduled.
     * Consolidates each child's upcoming visit into a single reminder and overwrites previous notifications.
     */
    public function sendBulkReminders(Request $request): RedirectResponse
    {
        $today = Carbon::today();
        $targetDate = $request->input('date')
            ? Carbon::parse($request->input('date'))->startOfDay()
            : null;

        // Query all patients who have scheduled vaccinations
        $patientsQuery = Patient::query()
            ->whereHas('vaccineSchedules', function ($query) use ($today, $targetDate) {
                $query->whereIn('status', ['scheduled', 'upcoming', 'overdue'])
                    ->whereNotNull('scheduled_date');
                if ($targetDate) {
                    $query->whereDate('scheduled_date', $targetDate);
                } else {
                    $query->whereDate('scheduled_date', '>=', $today);
                }
            })
            ->with([
                'guardian.user',
                'vaccineSchedules' => function ($query) use ($today, $targetDate) {
                    $query->whereIn('status', ['scheduled', 'upcoming', 'overdue'])
                        ->whereNotNull('scheduled_date');
                    if ($targetDate) {
                        $query->whereDate('scheduled_date', $targetDate);
                    } else {
                        $query->whereDate('scheduled_date', '>=', $today);
                    }
                    $query->with('vaccine')->orderBy('scheduled_date');
                },
            ]);

        $patients = $patientsQuery->get();

        // If no future-dated appointments found, include all active scheduled appointments
        if ($patients->isEmpty() && ! $targetDate) {
            $patients = Patient::query()
                ->whereHas('vaccineSchedules', function ($query) {
                    $query->whereIn('status', ['scheduled', 'upcoming', 'overdue'])
                        ->whereNotNull('scheduled_date');
                })
                ->with([
                    'guardian.user',
                    'vaccineSchedules' => function ($query) {
                        $query->whereIn('status', ['scheduled', 'upcoming', 'overdue'])
                            ->whereNotNull('scheduled_date')
                            ->with('vaccine')
                            ->orderBy('scheduled_date');
                    },
                ])
                ->get();
        }

        if ($patients->isEmpty()) {
            return back()->with('info', 'No scheduled appointments found to remind.');
        }

        $sentCount = 0;
        $skippedCount = 0;

        foreach ($patients as $patient) {
            $guardianUser = $patient->guardian?->user;
            if (! $guardianUser) {
                $skippedCount++;
                continue;
            }

            $schedules = $patient->vaccineSchedules;
            if ($schedules->isEmpty()) {
                continue;
            }

            // Next upcoming visit date for this patient
            $firstScheduleDate = Carbon::parse($schedules->first()->scheduled_date)->startOfDay();
            $visitSchedules = $schedules->filter(function ($s) use ($firstScheduleDate) {
                return Carbon::parse($s->scheduled_date)->startOfDay()->equalTo($firstScheduleDate);
            });

            $vaccineDescriptions = $visitSchedules->map(function ($s) {
                $name = $s->vaccine?->name ?? 'Vaccine';
                return "{$name} (Dose {$s->dose_number})";
            })->unique()->values()->all();

            $vaccinesSummary = implode(', ', $vaccineDescriptions);

            // Anti-bloat / Overwrite: Delete previous visit reminder notifications for this child
            DatabaseNotification::query()
                ->where('notifiable_type', $guardianUser::class)
                ->where('notifiable_id', $guardianUser->id)
                ->where('type', UpcomingVisitReminderNotification::class)
                ->whereJsonContains('data->patient_id', $patient->id)
                ->delete();

            Notification::send(
                $guardianUser,
                new UpcomingVisitReminderNotification(
                    patient: $patient,
                    vaccine: $vaccinesSummary,
                    doseNumber: 1,
                    scheduledDate: $firstScheduleDate->toDateString(),
                    scheduleId: $visitSchedules->first()?->id,
                    remarks: $visitSchedules->first()?->remarks
                )
            );

            $sentCount++;
        }

        $msg = "Reminders sent: Dispatched next-visit reminder(s) for {$sentCount} child(ren).";
        if ($skippedCount > 0) {
            $msg .= " ({$skippedCount} skipped due to missing portal accounts).";
        }

        return back()->with('success', $msg);
    }
}
