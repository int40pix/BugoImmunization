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