<?php

namespace App\Http\Controllers;

use App\Models\ImmunizationRecord;
use App\Models\Patient;
use App\Models\PatientVaccineSchedule;
use App\Models\Vaccine;
use App\Services\ImmunizationAdministrationService;
use App\Services\VaccineSchedulingPriorityService;
use App\Http\Controllers\ImmunizationReportController;
use Carbon\Carbon;
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
            ->pending()
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

                    'days_due' =>
                        (int) ($candidate['days_due'] ?? 0),

                    'days_overdue' =>
                        (int) ($candidate['days_overdue'] ?? 0),

                    'target_wednesday' =>
                        $candidate['target_wednesday'] ?? null,
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

                    'days_due' =>
                        (int) ($item['days_due'] ?? 0),

                    'days_overdue' =>
                        (int) ($item['days_overdue'] ?? 0),

                    'target_wednesday' =>
                        $item['target_wednesday'] ?? null,

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
                'administeredBy',
                'inventoryTransaction',
            ])
            ->orderByDesc('date_administered')
            ->orderByDesc('id')
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
                    'batch_number' => $record->batch_number ?: $record->inventoryTransaction?->batch_number ?: '—',

                    'date_administered' =>
                        $record->date_administered?->toDateString(),

                    'administered_by_id' => $record->administered_by,
                    'administered_by_name' => $record->administeredBy?->name ?? 'Clinic Staff',

                    'consent_given_by' => $record->consent_given_by,
                    'injection_site' => $record->injection_site,
                    'source' => $record->source,
                    'remarks' => $record->remarks,
                ];
            })
            ->values();

        $vaccines = Vaccine::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'category',
                'required_doses',
            ]);

        $reportController = app(ImmunizationReportController::class);
        $coverageReport = $reportController->getCoverageReportData(request());
        $scheduleStatusReport = $reportController->getScheduleStatusReportData(request());

        return Inertia::render('immunization/index', [
            'tclRows' => $tclRows,
            'scheduledRows' => $scheduledRows,
            'completedRows' => $completedRows,
            'vaccines' => $vaccines,
            'coverageReport' => $coverageReport,
            'scheduleStatusReport' => $scheduleStatusReport,
            'initialView' => request()->query('view', 'tcl'),
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

            'consent_obtained' => [
                'required',
                'boolean',
                'accepted',
            ],

            'consent_given_by' => [
                'required',
                'string',
                'max:255',
            ],

            'injection_site' => [
                'nullable',
                'string',
                'max:100',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'administered_by' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'date_administered' => [
                'nullable',
                'date',
                'before_or_equal:today',
            ],

            'vaccine_inventory_id' => [
                'nullable',
                'integer',
                'exists:vaccine_inventories,id',
            ],
        ]);

        try {
            $administrationService->administer(
                patient: $patient,
                vaccineId: (int) $validated['vaccine_id'],
                administeredBy: ! empty($validated['administered_by'])
                    ? (int) $validated['administered_by']
                    : $request->user()?->id,
                remarks: $validated['remarks'] ?? null,
                consentGivenBy: $validated['consent_given_by'] ?? null,
                injectionSite: $validated['injection_site'] ?? null,
                dateAdministered: $validated['date_administered'] ?? null,
                vaccineInventoryId: ! empty($validated['vaccine_inventory_id'])
                    ? (int) $validated['vaccine_inventory_id']
                    : null,
            );

            // Automatically schedule the patient's next visit after administration
            app(VaccineSchedulingPriorityService::class)->generateSchedules();
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

    /**
     * Reschedule or adjust the planned visit date for a patient.
     */
    public function reschedule(
        Request $request,
        Patient $patient,
        VaccineSchedulingPriorityService $schedulingPriorityService
    ): RedirectResponse {
        $validated = $request->validate([
            'scheduled_date' => [
                'required',
                'date',
                'after_or_equal:today',
                function ($attribute, $value, $fail) {
                    if (! Carbon::parse($value)->isWednesday()) {
                        $fail('Routine pediatric immunization clinic at Barangay Bugo Health Center is held only on Wednesdays.');
                    }
                },
            ],
            'adjustment_reason' => [
                'nullable',
                'string',
                'max:255',
            ],
            'schedule_ids' => [
                'nullable',
                'array',
            ],
            'schedule_ids.*' => [
                'integer',
                'exists:patient_vaccine_schedules,id',
            ],
        ]);

        $count = $schedulingPriorityService->reschedulePatientVisit(
            patient: $patient,
            newDate: $validated['scheduled_date'],
            reason: $validated['adjustment_reason'] ?? null,
            scheduleIds: $validated['schedule_ids'] ?? null,
            userId: $request->user()?->id,
        );

        return back()->with(
            'success',
            "Visit date updated successfully ({$count} " . ($count === 1 ? 'dose' : 'doses') . ' scheduled).'
        );
    }
}