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

Artisan::command('visits:send-reminders {--days=3 : Days window to look ahead}', function () {
    $today = \Carbon\Carbon::today();
    $days = (int) $this->option('days');
    $endDate = $today->copy()->addDays($days);

    $schedules = \App\Models\PatientVaccineSchedule::query()
        ->where('status', 'scheduled')
        ->whereNotNull('scheduled_date')
        ->whereDate('scheduled_date', '>=', $today)
        ->whereDate('scheduled_date', '<=', $endDate)
        ->with(['patient.guardian.user', 'vaccine'])
        ->get();

    $this->info("Scanning scheduled appointments from {$today->toDateString()} to {$endDate->toDateString()}... Found {$schedules->count()}.");

    $sent = 0;
    foreach ($schedules as $schedule) {
        $guardianUser = $schedule->patient?->guardian?->user;
        if (! $guardianUser) {
            continue;
        }

        $alreadySentToday = \Illuminate\Notifications\DatabaseNotification::query()
            ->where('notifiable_type', $guardianUser::class)
            ->where('notifiable_id', $guardianUser->id)
            ->where('type', \App\Notifications\UpcomingVisitReminderNotification::class)
            ->whereJsonContains('data->schedule_id', $schedule->id)
            ->whereDate('created_at', $today)
            ->exists();

        if (! $alreadySentToday) {
            \Illuminate\Support\Facades\Notification::send(
                $guardianUser,
                new \App\Notifications\UpcomingVisitReminderNotification(
                    patient: $schedule->patient,
                    vaccine: $schedule->vaccine ?? 'Vaccination',
                    doseNumber: (int) $schedule->dose_number,
                    scheduledDate: $schedule->scheduled_date,
                    scheduleId: $schedule->id,
                    remarks: $schedule->remarks
                )
            );
            $sent++;
        }
    }

    $this->info("Completed. Sent {$sent} visit reminder notification(s) to guardians.");
})->purpose('Send reminder notifications to guardians for upcoming child vaccination visits');

Schedule::command('visits:send-reminders')
    ->dailyAt('07:00')
    ->name('send-guardian-visit-reminders')
    ->withoutOverlapping();