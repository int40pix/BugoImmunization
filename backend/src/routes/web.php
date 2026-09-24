<?php

use App\Http\Controllers\AdminPasswordResetRequestController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FirstLoginPasswordController;
use App\Http\Controllers\GuardianAccessController;
use App\Http\Controllers\GuardianController;
use App\Http\Controllers\GuardianPortalController;
use App\Http\Controllers\ImmunizationController;
use App\Http\Controllers\ImmunizationRecordController;
use App\Http\Controllers\ImmunizationReminderController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientImmunizationCardRowController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\VaccineController;
use App\Http\Controllers\VaccineInventoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


/*
|--------------------------------------------------------------------------
| Home / Entrypoint
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    if (auth()->check()) {
        $user = auth()->user();

        if ($user->must_change_password) {
            return redirect()->route('password.first-change');
        }

        if ($user->accountRole?->name === 'guardian' || $user->role === 'guardian') {
            return redirect()->route('guardian.dashboard');
        }

        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');


/*
|--------------------------------------------------------------------------
| First Login / Temporary Password Change
|--------------------------------------------------------------------------
|
| Accounts activated by staff using a temporary password must create
| their own permanent password before accessing the rest of the system.
|
*/

Route::middleware('auth')->group(function () {

    Route::get(
        'change-temporary-password',
        [
            FirstLoginPasswordController::class,
            'edit',
        ]
    )->name('password.first-change');


    Route::post(
        'change-temporary-password',
        [
            FirstLoginPasswordController::class,
            'update',
        ]
    )->name('password.first-change.update');

});


/*
|--------------------------------------------------------------------------
| Guardian / Parent Portal
|--------------------------------------------------------------------------
|
| Parents and guardians now use the SAME Laravel web authentication
| system and the SAME /login page used by staff.
|
| Access is controlled using the guardian role.
|
*/

Route::middleware([
    'auth',
    'password.changed',
    'role:guardian',
])->group(function () {

    Route::get(
        'guardian/dashboard',
        [
            GuardianPortalController::class,
            'dashboard',
        ]
    )->name('guardian.dashboard');


    Route::get(
        'guardian/children',
        [
            GuardianPortalController::class,
            'childrenIndex',
        ]
    )->name('guardian.children.index');


    Route::get(
        'guardian/children/{patient}',
        [
            GuardianPortalController::class,
            'showChild',
        ]
    )->name('guardian.children.show');


    Route::get(
        'guardian/visits',
        [
            GuardianPortalController::class,
            'visitsIndex',
        ]
    )->name('guardian.visits.index');

});


/*
|--------------------------------------------------------------------------
| Authenticated Staff Area
|--------------------------------------------------------------------------
|
| Admin, Nurse, Midwife, and BHW users enter the system through the
| normal web authentication guard.
|
| Users with temporary passwords cannot access these routes until they
| create their permanent password.
|
*/

Route::middleware([
    'auth',
    'password.changed',
])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get(
        'dashboard',
        [
            DashboardController::class,
            'index',
        ]
    )->name('dashboard');


    /*
    |--------------------------------------------------------------------------
    | Staff Notifications
    |--------------------------------------------------------------------------
    */

    Route::patch(
        'notifications/{notification}/read',
        [
            NotificationController::class,
            'markAsRead',
        ]
    )->name('notifications.read');


    Route::patch(
        'notifications/read-all',
        [
            NotificationController::class,
            'markAllAsRead',
        ]
    )->name('notifications.read-all');


    Route::delete(
        'notifications/{notification}',
        [
            NotificationController::class,
            'destroy',
        ]
    )->name('notifications.destroy');


    Route::delete(
        'notifications',
        [
            NotificationController::class,
            'destroyAll',
        ]
    )->name('notifications.destroy-all');


    /*
    |--------------------------------------------------------------------------
    | Staff Management
    |--------------------------------------------------------------------------
    |
    | Only administrators can create, update, and manage staff accounts.
    |
    */

    Route::middleware(
        'role:admin'
    )->group(function () {

        Route::get(
            'staff',
            [
                StaffController::class,
                'index',
            ]
        )->name('staff.index');


        Route::get(
            'staff/create',
            function () {
                return Inertia::render(
                    'staff/create'
                );
            }
        )->name('staff.create');


        Route::post(
            'staff',
            [
                StaffController::class,
                'store',
            ]
        )->name('staff.store');


        Route::get(
            'staff/{user}',
            [
                StaffController::class,
                'show',
            ]
        )->name('staff.show');


        Route::get(
            'staff/{user}/edit',
            [
                StaffController::class,
                'edit',
            ]
        )->name('staff.edit');


        Route::put(
            'staff/{user}',
            [
                StaffController::class,
                'update',
            ]
        )->name('staff.update');


        Route::put(
            'staff/{user}/status',
            [
                StaffController::class,
                'toggleStatus',
            ]
        )->name('staff.toggle-status');


        Route::post(
            'staff/{user}/reset-password',
            [
                StaffController::class,
                'resetPassword',
            ]
        )->name('staff.reset-password');



        /*
        |--------------------------------------------------------------------------
        | Guardian Password Reset Requests
        |--------------------------------------------------------------------------
        |
        | Only administrators can review guardian password reset requests
        | and generate replacement temporary passwords.
        |
        */

        Route::get(
            'admin/password-reset-requests',
            [
                AdminPasswordResetRequestController::class,
                'index',
            ]
        )->name(
            'admin.password-reset-requests.index'
        );


        Route::post(
            'admin/password-reset-requests/{passwordResetRequest}/resolve',
            [
                AdminPasswordResetRequestController::class,
                'resolve',
            ]
        )->name(
            'admin.password-reset-requests.resolve'
        );

    });


    /*
    |--------------------------------------------------------------------------
    | Guardian / Family Management
    |--------------------------------------------------------------------------
    |
    | Guardian profile information remains in the guardians table.
    |
    | Login credentials now belong to the linked users record.
    |
    */

    Route::get(
        'guardians',
        [
            GuardianController::class,
            'index',
        ]
    )->name('guardians.index');


    Route::get(
        'guardians/create',
        [
            GuardianController::class,
            'create',
        ]
    )->name('guardians.create');


    Route::post(
        'guardians',
        [
            GuardianController::class,
            'store',
        ]
    )->name('guardians.store');


    Route::get(
        'guardians/{guardian}',
        [
            GuardianController::class,
            'show',
        ]
    )->name('guardians.show');


    Route::get(
        'guardians/{guardian}/edit',
        [
            GuardianController::class,
            'edit',
        ]
    )->name('guardians.edit');


    Route::put(
        'guardians/{guardian}',
        [
            GuardianController::class,
            'update',
        ]
    )->name('guardians.update');


    /*
    |--------------------------------------------------------------------------
    | Guardian Portal Account Management
    |--------------------------------------------------------------------------
    |
    | Staff can activate portal access for guardians who previously had
    | no device, generate/reset temporary passwords, or disable access.
    |
    */

    Route::middleware(
        'role:admin,nurse,midwife,bhw'
    )->group(function () {

        Route::post(
            'guardians/{guardian}/portal/activate',
            [
                GuardianAccessController::class,
                'activate',
            ]
        )->name(
            'guardians.portal.activate'
        );


        Route::post(
            'guardians/{guardian}/portal/reset-password',
            [
                GuardianAccessController::class,
                'resetTemporaryPassword',
            ]
        )->name(
            'guardians.portal.reset-password'
        );


        Route::patch(
            'guardians/{guardian}/portal/disable',
            [
                GuardianAccessController::class,
                'disable',
            ]
        )->name(
            'guardians.portal.disable'
        );

    });


    /*
    |--------------------------------------------------------------------------
    | Patient Management
    |--------------------------------------------------------------------------
    |
    | Patients are pediatric records.
    |
    | They do not have authentication accounts themselves.
    |
    */

    Route::get(
        'patients',
        [
            PatientController::class,
            'index',
        ]
    )->name('patients.index');


    /*
    |--------------------------------------------------------------------------
    | Add Child To Existing Family
    |--------------------------------------------------------------------------
    |
    | Patient creation remains guardian-scoped.
    |
    */

    Route::get(
        'guardians/{guardian}/patients/create',
        [
            PatientController::class,
            'createForGuardian',
        ]
    )->name(
        'guardians.patients.create'
    );


    Route::post(
        'guardians/{guardian}/patients',
        [
            PatientController::class,
            'storeForGuardian',
        ]
    )->name(
        'guardians.patients.store'
    );


    Route::get(
        'patients/{patient}',
        [
            PatientController::class,
            'show',
        ]
    )->name('patients.show');


    Route::get(
        'patients/{patient}/edit',
        [
            PatientController::class,
            'edit',
        ]
    )->name('patients.edit');


    Route::put(
        'patients/{patient}',
        [
            PatientController::class,
            'update',
        ]
    )->name('patients.update');


    Route::put(
        'patients/{patient}/status',
        [
            PatientController::class,
            'toggleStatus',
        ]
    )->name('patients.toggle-status');


    /*
    |--------------------------------------------------------------------------
    | Optional Vaccine Assignment
    |--------------------------------------------------------------------------
    */

    Route::post(
        'patients/{patient}/optional-vaccines',
        [
            PatientController::class,
            'assignOptionalVaccine',
        ]
    )->name(
        'patients.optional-vaccines.assign'
    );


    Route::delete(
        'patients/{patient}/optional-vaccines/{vaccine}',
        [
            PatientController::class,
            'removeOptionalVaccine',
        ]
    )->name(
        'patients.optional-vaccines.remove'
    );


    /*
    |--------------------------------------------------------------------------
    | Immunization Card Records
    |--------------------------------------------------------------------------
    */

    Route::post(
        'patients/{patient}/immunization-records',
        [
            ImmunizationRecordController::class,
            'store',
        ]
    )->name(
        'immunization-records.store'
    );


    Route::put(
        'patients/{patient}/immunization-records/{immunizationRecord}',
        [
            ImmunizationRecordController::class,
            'update',
        ]
    )->name(
        'immunization-records.update'
    );


    /*
    |--------------------------------------------------------------------------
    | Manual Immunization Card Rows
    |--------------------------------------------------------------------------
    */

    Route::post(
        'patients/{patient}/immunization-card-rows',
        [
            PatientImmunizationCardRowController::class,
            'store',
        ]
    )->name(
        'patients.immunization-card-rows.store'
    );


    Route::put(
        'patients/{patient}/immunization-card-rows/{cardRow}',
        [
            PatientImmunizationCardRowController::class,
            'update',
        ]
    )->name(
        'patients.immunization-card-rows.update'
    );


    Route::delete(
        'patients/{patient}/immunization-card-rows/{cardRow}',
        [
            PatientImmunizationCardRowController::class,
            'destroy',
        ]
    )->name(
        'patients.immunization-card-rows.destroy'
    );


    /*
    |--------------------------------------------------------------------------
    | Vaccine Inventory
    |--------------------------------------------------------------------------
    */

    Route::get(
        'vaccine-inventory',
        [
            VaccineInventoryController::class,
            'index',
        ]
    )->name(
        'vaccine-inventory.index'
    );


    /*
    |--------------------------------------------------------------------------
    | Archived Vaccine Batches
    |--------------------------------------------------------------------------
    */

    Route::get(
        'vaccine-inventory/archived',
        [
            VaccineInventoryController::class,
            'archived',
        ]
    )->name(
        'vaccine-inventory.archived'
    );

    /*
    |--------------------------------------------------------------------------
    | Inventory Transaction History
    |--------------------------------------------------------------------------
    */

    Route::get(
        'vaccine-inventory/transactions',
        [
            VaccineInventoryController::class,
            'transactions',
        ]
    )->name(
        'vaccine-inventory.transactions'
    );


    Route::get(
        'vaccine-inventory/create',
        [
            VaccineInventoryController::class,
            'create',
        ]
    )->name(
        'vaccine-inventory.create'
    );


    Route::post(
        'vaccine-inventory',
        [
            VaccineInventoryController::class,
            'store',
        ]
    )->name(
        'vaccine-inventory.store'
    );


    Route::get(
        'vaccine-inventory/{vaccineInventory}/edit',
        [
            VaccineInventoryController::class,
            'edit',
        ]
    )->name(
        'vaccine-inventory.edit'
    );


    Route::put(
        'vaccine-inventory/{vaccineInventory}',
        [
            VaccineInventoryController::class,
            'update',
        ]
    )->name(
        'vaccine-inventory.update'
    );


    /*
    |--------------------------------------------------------------------------
    | Archive Vaccine Batch
    |--------------------------------------------------------------------------
    */

    Route::put(
        'vaccine-inventory/{vaccineInventory}/archive',
        [
            VaccineInventoryController::class,
            'archive',
        ]
    )->name(
        'vaccine-inventory.archive'
    );

    Route::post(
        'vaccine-inventory/{vaccineInventory}/adjust-stock',
        [
            VaccineInventoryController::class,
            'adjustStock',
        ]
    )->name(
        'vaccine-inventory.adjust-stock'
    );


    /*
    |--------------------------------------------------------------------------
    | Delete Vaccine Batch
    |--------------------------------------------------------------------------
    */

    Route::delete(
        'vaccine-inventory/{vaccineInventory}',
        [
            VaccineInventoryController::class,
            'destroy',
        ]
    )->name(
        'vaccine-inventory.destroy'
    );


    /*
    |--------------------------------------------------------------------------
    | Vaccine Master List
    |--------------------------------------------------------------------------
    */

    Route::get(
        'vaccines',
        [
            VaccineController::class,
            'index',
        ]
    )->name('vaccine.index');


    Route::post(
        'vaccines',
        [
            VaccineController::class,
            'store',
        ]
    )->name('vaccine.store');


    Route::get(
        'vaccines/{vaccine}/edit',
        [
            VaccineController::class,
            'edit',
        ]
    )->name('vaccine.edit');


    Route::put(
        'vaccines/{vaccine}',
        [
            VaccineController::class,
            'update',
        ]
    )->name('vaccine.update');


    /*
    |--------------------------------------------------------------------------
    | Immunization Tracking
    |--------------------------------------------------------------------------
    */

    Route::get(
        'immunization',
        [
            ImmunizationController::class,
            'index',
        ]
    )->name(
        'immunization.index'
    );


    Route::post(
        'immunization/patients/{patient}/administer',
        [
            ImmunizationController::class,
            'administer',
        ]
    )->name(
        'immunization.administer'
    );


    Route::post(
        'immunization/patients/{patient}/reschedule',
        [
            ImmunizationController::class,
            'reschedule',
        ]
    )->name(
        'immunization.patients.reschedule'
    );


    Route::post(
        'immunization/schedules/{schedule}/send-reminder',
        [
            ImmunizationReminderController::class,
            'sendScheduleReminder',
        ]
    )->name(
        'immunization.schedules.send-reminder'
    );


    Route::post(
        'immunization/patients/{patient}/send-reminder',
        [
            ImmunizationReminderController::class,
            'sendPatientReminder',
        ]
    )->name(
        'immunization.patients.send-reminder'
    );


    Route::post(
        'immunization/reminders/send-bulk',
        [
            ImmunizationReminderController::class,
            'sendBulkReminders',
        ]
    )->name(
        'immunization.reminders.send-bulk'
    );


    Route::get(
        'immunization/modules',
        function () {
            return Inertia::render(
                'immunization/modules'
            );
        }
    )->name(
        'immunization.modules'
    );

});


/*
|--------------------------------------------------------------------------
| Laravel Authentication / Settings Routes
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';