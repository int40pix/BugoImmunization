<?php

use App\Services\VaccineInventoryService;
use App\Services\VaccineSchedulingPriorityService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;


/*
|--------------------------------------------------------------------------
| INSPIRE COMMAND
|--------------------------------------------------------------------------
*/

Artisan::command('inspire', function () {
    $this->comment(
        Inspiring::quote()
    );
})->purpose(
    'Display an inspiring quote'
);


/*
|--------------------------------------------------------------------------
| AUTO-ARCHIVE BATCHES COMMAND & SCHEDULE
|--------------------------------------------------------------------------
|
| - Detect and archive expired vaccine batches
| - Detect and archive depleted (0-stock) batches
| - Create audit ledger transactions attributed to System
| - Dispatch interactive notifications to staff
|
*/

Artisan::command('inventory:auto-archive', function (VaccineInventoryService $inventoryService) {
    $count = $inventoryService->autoArchiveExpiredAndDepletedBatches();
    $this->info("Auto-archive completed. {$count} batch(es) archived.");
})->purpose('Auto-archive expired and depleted vaccine batches and notify staff');

Schedule::command('inventory:auto-archive')
    ->dailyAt('05:55')
    ->withoutOverlapping();


/*
|--------------------------------------------------------------------------
| DAILY VACCINE SCHEDULE GENERATION
|--------------------------------------------------------------------------
|
| Araw-araw 6:00 AM:
| - Generate/reconcile vaccination schedules
| - Match available vaccine inventory
| - Update priority scheduling
|
*/

Schedule::call(function () {

    app(
        VaccineSchedulingPriorityService::class
    )->generateSchedules();

})
    ->dailyAt('06:00')
    ->name(
        'generate-vaccine-schedules'
    )
    ->withoutOverlapping();


/*
|--------------------------------------------------------------------------
| DAILY VACCINE INVENTORY ALERT CHECK
|--------------------------------------------------------------------------
|
| Araw-araw 6:10 AM:
| - Low Stock
| - Out of Stock
| - Near Expiry
| - Resolve outdated unread inventory alerts
|
| Pinatakbo natin pagkatapos ng schedule generation
| para mauna munang ma-reconcile ang vaccine inventory.
|
*/

Schedule::command(
    'inventory:check-alerts'
)
    ->dailyAt('06:10')
    ->name(
        'check-vaccine-inventory-alerts'
    )
    ->withoutOverlapping();


/*
|--------------------------------------------------------------------------
| DAILY UPCOMING VISIT REMINDERS FOR GUARDIANS
|--------------------------------------------------------------------------
|
| Daily at 07:00 AM:
| - Find scheduled appointments due today or in the next 3 days
| - Notify linked guardian user accounts with anti-duplicate guard
|
*/

Artisan::command('visits:send-reminders', function () {
    $today = \Carbon\Carbon::today();

    $patients = \App\Models\Patient::query()
        ->whereHas('vaccineSchedules', function ($query) use ($today) {
            $query->whereIn('status', ['scheduled', 'upcoming', 'overdue'])
                ->whereNotNull('scheduled_date')
                ->whereDate('scheduled_date', '>=', $today);
        })
        ->with([
            'guardian.user',
            'vaccineSchedules' => function ($query) use ($today) {
                $query->whereIn('status', ['scheduled', 'upcoming', 'overdue'])
                    ->whereNotNull('scheduled_date')
                    ->whereDate('scheduled_date', '>=', $today)
                    ->with('vaccine')
                    ->orderBy('scheduled_date');
            },
        ])
        ->get();

    $this->info("Scanning scheduled patients with upcoming visits from {$today->toDateString()}... Found {$patients->count()} patient(s).");

    $sent = 0;
    foreach ($patients as $patient) {
        $guardianUser = $patient->guardian?->user;
        if (! $guardianUser) {
            continue;
        }

        $schedules = $patient->vaccineSchedules;
        if ($schedules->isEmpty()) {
            continue;
        }

        // Determine next upcoming visit date
        $nextVisitDate = \Carbon\Carbon::parse($schedules->first()->scheduled_date)->startOfDay();
        $visitSchedules = $schedules->filter(function ($s) use ($nextVisitDate) {
            return \Carbon\Carbon::parse($s->scheduled_date)->startOfDay()->equalTo($nextVisitDate);
        });

        $vaccineDescriptions = $visitSchedules->map(function ($s) {
            $name = $s->vaccine?->name ?? 'Vaccine';
            return "{$name} (Dose {$s->dose_number})";
        })->unique()->values()->all();

        $vaccinesSummary = implode(', ', $vaccineDescriptions);

        // Anti-bloat / Overwrite: Delete previous visit reminder notifications for this child
        \Illuminate\Notifications\DatabaseNotification::query()
            ->where('notifiable_type', $guardianUser::class)
            ->where('notifiable_id', $guardianUser->id)
            ->where('type', \App\Notifications\UpcomingVisitReminderNotification::class)
            ->whereJsonContains('data->patient_id', $patient->id)
            ->delete();

        \Illuminate\Support\Facades\Notification::send(
            $guardianUser,
            new \App\Notifications\UpcomingVisitReminderNotification(
                patient: $patient,
                vaccine: $vaccinesSummary,
                doseNumber: 1,
                scheduledDate: $nextVisitDate->toDateString(),
                scheduleId: $visitSchedules->first()?->id,
                remarks: $visitSchedules->first()?->remarks
            )
        );
        $sent++;
    }

    $this->info("Completed. Sent {$sent} visit reminder notification(s) to guardians (overwriting previous notifications).");
})->purpose('Send next-visit reminder notifications to guardians for scheduled children');

Schedule::command('visits:send-reminders')
    ->weeklyOn(1, '08:00') // Every Monday at 8:00 AM
    ->name('send-guardian-visit-reminders-weekly')
    ->withoutOverlapping();