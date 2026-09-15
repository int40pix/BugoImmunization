<?php

use App\Models\Guardian;
use App\Models\Patient;
use App\Models\Vaccine;
use App\Models\VaccineInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| RESTful endpoints for frontend decoupled consumption.
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json($request->user());
});

Route::prefix('v1')->group(function () {
    Route::get('/patients', function () {
        return response()->json(
            Patient::with('guardian')->where('status', 'Active')->paginate(20)
        );
    });

    Route::get('/patients/{patient}', function (Patient $patient) {
        return response()->json(
            $patient->load(['guardian', 'immunizationRecords.vaccine', 'vaccineSchedules.vaccine'])
        );
    });

    Route::get('/vaccines', function () {
        return response()->json(
            Vaccine::with('schedules')->orderBy('name')->get()
        );
    });

    Route::get('/inventory', function () {
        return response()->json(
            VaccineInventory::with('vaccine')
                ->where('is_archived', false)
                ->orderBy('expiration_date', 'asc')
                ->get()
        );
    });

    Route::get('/guardians', function () {
        return response()->json(
            Guardian::with('patients')->where('status', 'active')->paginate(20)
        );
    });
});
