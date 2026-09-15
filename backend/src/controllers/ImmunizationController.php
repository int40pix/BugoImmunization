<?php

namespace App\Http\Controllers;

use App\Models\ImmunizationRecord;
use App\Models\Patient;
use App\Models\PatientVaccineSchedule;
use App\Models\Vaccine;
use App\Services\ImmunizationAdministrationService;
use App\Services\VaccineSchedulingPriorityService;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ImmunizationController extends Controller
{
    public function index(
        VaccineSchedulingPriorityService $priorityService
    ): Response {
        $candidatePool = $priorityService->getCandidatePool();

        $scheduledRows = PatientVaccineSchedule::query()
            ->with([
                'patient',
                'vaccine',
            ])
            ->where('status', 'scheduled')
            ->orderBy('scheduled_date')
            ->orderBy('patient_id')
            ->get()
            ->map(function ($schedule) use ($candidatePool) {
                $candidate = $candidatePool->first(
                    function ($candidate) use ($schedule) {
                        return
                            (int) $candidate['patient_id']
                            === (int) $schedule->patient_id
                            &&
                            (int) $candidate['vaccine_id']
                            === (int) $schedule->vaccine_id
                            &&
                            (int) $candidate['next_dose']
                            === (int) $schedule->dose_number;
                    }
                );

                return [
                    'id' => $schedule->id,

                    'patient_id' => $schedule->patient_id,
                    'patient_code' => $schedule->patient?->patient_id,

                    'patient_name' => trim(
                        collect([
                            $schedule->patient?->first_name,
                            $schedule->patient?->middle_name,
                            $schedule->patient?->last_name,
                        ])
                            ->filter()
                            ->implode(' ')
                    ),

                    'vaccine_id' => $schedule->vaccine_id,
                    'vaccine_name' => $schedule->vaccine?->name,

                    'dose_number' => $schedule->dose_number,

                    'scheduled_date' =>
                        $schedule->scheduled_date?->toDateString(),

                    'status' => $schedule->status,

                    'schedule_label' =>
                        $candidate['schedule_label'] ?? null,
                ];
            })
            ->values();

        $tclRows = $candidatePool
            ->map(function (array $item) {
                return [
                    'patient_id' => $item['patient_id'],
                    'patient_code' => $item['patient_code'],
                    'patient_name' => $item['patient_name'],

                    'vaccine_id' => $item['vaccine_id'],
                    'vaccine_name' => $item['vaccine_name'],

                    'dose_number' => $item['next_dose'],

                    'schedule_label' =>
                        $item['schedule_label'],

                    'inventory_available' =>
                        $item['inventory_available'],

                    'available_stock' =>
                        $item['available_stock'],

                    'is_already_scheduled' =>
                        $item['is_already_scheduled'],

                    'scheduled_date' =>
                        $item['scheduled_date'],
                ];
            })
            ->values();

        $completedRows = ImmunizationRecord::query()
            ->with([
                'patient',
                'vaccine',
            ])
            ->orderByDesc('date_administered')
            ->get()
            ->map(function ($record) {
                return [
                    'id' => $record->id,

                    'patient_id' => $record->patient_id,
                    'patient_code' => $record->patient?->patient_id,

                    'patient_name' => trim(
                        collect([
                            $record->patient?->first_name,
                            $record->patient?->middle_name,
                            $record->patient?->last_name,
                        ])
                            ->filter()
                            ->implode(' ')
                    ),

                    'vaccine_id' => $record->vaccine_id,
                    'vaccine_name' => $record->vaccine?->name,

                    'dose_number' => $record->dose_number,

                    'date_administered' =>
                        $record->date_administered?->toDateString(),
                ];
            })
            ->values();

        $vaccines = Vaccine::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'category',
            ]);

        return Inertia::render('immunization/index', [
            'tclRows' => $tclRows,

            'scheduledRows' => $scheduledRows,

            'completedRows' => $completedRows,

            'vaccines' => $vaccines,
        ]);
    }

    public function administer(
        Request $request,
        Patient $patient,
        ImmunizationAdministrationService $administrationService
    ): RedirectResponse {
        $validated = $request->validate([
            'vaccine_id' => [
                'required',
                'integer',
                'exists:vaccines,id',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        try {
            $administrationService->administer(
                $patient,
                (int) $validated['vaccine_id'],
                $request->user()?->id,
                $validated['remarks'] ?? null
            );
        } catch (DomainException $exception) {
            return back()->withErrors([
                'administration' => $exception->getMessage(),
            ]);
        }

        return back()->with(
            'success',
            'Vaccination recorded successfully.'
        );
    }
}