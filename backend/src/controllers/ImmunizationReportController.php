<?php

namespace App\Http\Controllers;

use App\Models\ImmunizationRecord;
use App\Models\Patient;
use App\Models\PatientVaccineSchedule;
use App\Models\Vaccine;
use App\Utils\DateHelper;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImmunizationReportController extends Controller
{
    /**
     * Build the dataset for Vaccine Coverage Report.
     */
    public function getCoverageReportData(Request $request): array
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $vaccineId = $request->input('vaccine_id');
        if ($vaccineId === 'all' || empty($vaccineId)) {
            $vaccineId = null;
        } else {
            $vaccineId = (int) $vaccineId;
        }

        $doseNumber = $request->input('dose_number');
        if ($doseNumber === 'all' || empty($doseNumber)) {
            $doseNumber = null;
        } else {
            $doseNumber = (int) $doseNumber;
        }

        // Active children registered in the health center
        $targetPopulation = Patient::query()
            ->where(function ($q) {
                $q->whereNull('status')->orWhere('status', 'Active');
            })
            ->count();
        if ($targetPopulation === 0) {
            $targetPopulation = Patient::count();
        }

        // 1. Comprehensive list of vaccines with coverage statistics
        $vaccinesQuery = Vaccine::query()->orderBy('name');
        if ($vaccineId) {
            $vaccinesQuery->where('id', $vaccineId);
        }
        $vaccines = $vaccinesQuery->get();

        $vaccineSummaries = [];
        $totalDosesAdministered = 0;

        foreach ($vaccines as $vaccine) {
            $recordQuery = ImmunizationRecord::query()->where('vaccine_id', $vaccine->id);

            if ($dateFrom) {
                $recordQuery->whereDate('date_administered', '>=', $dateFrom);
            }
            if ($dateTo) {
                $recordQuery->whereDate('date_administered', '<=', $dateTo);
            }
            if ($doseNumber) {
                $recordQuery->where('dose_number', $doseNumber);
            }

            $records = $recordQuery->get();
            $adminCount = $records->count();
            $totalDosesAdministered += $adminCount;

            $d1 = $records->where('dose_number', 1)->count();
            $d2 = $records->where('dose_number', 2)->count();
            $d3 = $records->where('dose_number', 3)->count();
            $booster = $records->where('dose_number', '>=', 4)->count();

            // Coverage percentage based on Dose 1 relative to target cohort
            $coveragePct = $targetPopulation > 0
                ? round(($d1 / $targetPopulation) * 100, 1)
                : 0.0;

            // Full series completion rate if vaccine requires multiple doses
            $completionPct = $targetPopulation > 0 && ($vaccine->required_doses ?? 1) > 0
                ? round(($records->where('dose_number', $vaccine->required_doses)->count() / $targetPopulation) * 100, 1)
                : $coveragePct;

            $vaccineSummaries[] = [
                'vaccine_id' => $vaccine->id,
                'name' => $vaccine->name,
                'category' => ucfirst($vaccine->category ?? 'Routine'),
                'required_doses' => (int) ($vaccine->required_doses ?? 1),
                'target_population' => $targetPopulation,
                'total_administered' => $adminCount,
                'dose_1' => $d1,
                'dose_2' => $d2,
                'dose_3' => $d3,
                'booster' => $booster,
                'coverage_pct' => min(100, $coveragePct),
                'completion_pct' => min(100, $completionPct),
            ];
        }

        // 2. Line Listing of Vaccinated Children
        $detailsQuery = ImmunizationRecord::query()
            ->with([
                'patient.guardian',
                'vaccine',
                'administeredBy',
            ])
            ->orderByDesc('date_administered')
            ->orderByDesc('id');

        if ($dateFrom) {
            $detailsQuery->whereDate('date_administered', '>=', $dateFrom);
        }
        if ($dateTo) {
            $detailsQuery->whereDate('date_administered', '<=', $dateTo);
        }
        if ($vaccineId) {
            $detailsQuery->where('vaccine_id', $vaccineId);
        }
        if ($doseNumber) {
            $detailsQuery->where('dose_number', $doseNumber);
        }

        $records = $detailsQuery->get();

        $vaccinatedChildren = $records->map(function ($record) {
            $patient = $record->patient;
            $guardian = $patient?->guardian;

            $fullName = trim(collect([
                $patient?->first_name,
                $patient?->middle_name,
                $patient?->last_name,
            ])->filter()->implode(' '));

            // Age at vaccination calculation
            $ageAtAdmin = '—';
            if ($patient?->date_of_birth && $record->date_administered) {
                $dob = Carbon::parse($patient->date_of_birth);
                $adminDate = Carbon::parse($record->date_administered);
                $diff = $dob->diff($adminDate);
                if ($diff->y > 0) {
                    $ageAtAdmin = $diff->y . ' yr' . ($diff->y > 1 ? 's' : '') . ($diff->m > 0 ? ' ' . $diff->m . ' mo' : '');
                } elseif ($diff->m > 0) {
                    $ageAtAdmin = $diff->m . ' month' . ($diff->m > 1 ? 's' : '') . ($diff->d > 0 ? ' ' . $diff->d . ' d' : '');
                } else {
                    $ageAtAdmin = max(0, $diff->d) . ' day' . ($diff->d !== 1 ? 's' : '');
                }
            } elseif ($patient?->date_of_birth) {
                $ageAtAdmin = DateHelper::formatAge($patient->date_of_birth);
            }

            return [
                'id' => $record->id,
                'date_administered' => $record->date_administered ? Carbon::parse($record->date_administered)->format('Y-m-d') : '—',
                'date_administered_formatted' => $record->date_administered ? Carbon::parse($record->date_administered)->format('M d, Y') : '—',
                'patient_id' => $patient?->patient_id ?? 'PT-UNKNOWN',
                'patient_name' => $fullName ?: 'Unknown Patient',
                'date_of_birth' => $patient?->date_of_birth ? Carbon::parse($patient->date_of_birth)->format('Y-m-d') : '—',
                'age_at_admin' => $ageAtAdmin,
                'sex' => ucfirst($patient?->sex ?? '—'),
                'guardian_name' => $guardian?->name ?? '—',
                'guardian_contact' => $guardian?->contact_number ?? '—',
                'address' => $patient?->address ?? 'Zone 2, Barangay Bugo',
                'vaccine_name' => $record->vaccine?->name ?? 'Vaccine',
                'dose_number' => (int) $record->dose_number,
                'dose_label' => 'Dose ' . $record->dose_number,
                'batch_number' => $record->batch_number ?: '—',
                'injection_site' => $record->injection_site ?: '—',
                'administered_by' => $record->administeredBy?->name ?? 'Clinic Staff',
                'remarks' => $record->remarks ?: 'Routine vaccination',
            ];
        })->values()->all();

        return [
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'vaccine_id' => $vaccineId ? (string) $vaccineId : 'all',
                'dose_number' => $doseNumber ? (string) $doseNumber : 'all',
            ],
            'target_population' => $targetPopulation,
            'total_doses_administered' => $totalDosesAdministered,
            'vaccine_summaries' => $vaccineSummaries,
            'vaccinated_children' => $vaccinatedChildren,
            'generated_at' => Carbon::now()->format('M d, Y h:i A'),
            'generated_by' => auth()->user()?->name ?? 'Clinic Staff',
        ];
    }

    /**
     * Build the dataset for Immunization Schedule Status Report.
     */
    public function getScheduleStatusReportData(Request $request): array
    {
        $statusFilter = strtolower($request->input('status', 'all'));
        $vaccineId = $request->input('vaccine_id');
        if ($vaccineId === 'all' || empty($vaccineId)) {
            $vaccineId = null;
        } else {
            $vaccineId = (int) $vaccineId;
        }

        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $search = trim($request->input('search', ''));

        $today = Carbon::today();

        $query = PatientVaccineSchedule::query()
            ->pending()
            ->whereNotNull('scheduled_date')
            ->with([
                'patient.guardian',
                'vaccine',
            ])
            ->orderBy('scheduled_date')
            ->orderBy('patient_id');

        if ($vaccineId) {
            $query->where('vaccine_id', $vaccineId);
        }
        if ($dateFrom) {
            $query->whereDate('scheduled_date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('scheduled_date', '<=', $dateTo);
        }
        if (! empty($search)) {
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('patient_id', 'like', "%{$search}%");
            });
        }

        $schedules = $query->get();

        $totalCount = 0;
        $upcomingCount = 0;
        $overdueCount = 0;

        $items = [];
        foreach ($schedules as $schedule) {
            $patient = $schedule->patient;
            $guardian = $patient?->guardian;

            $targetDate = Carbon::parse($schedule->scheduled_date)->startOfDay();
            $isOverdue = $targetDate->lt($today);
            $computedStatus = $isOverdue ? 'overdue' : 'upcoming';

            $totalCount++;
            if ($isOverdue) {
                $overdueCount++;
            } else {
                $upcomingCount++;
            }

            // Apply status filter if set
            if ($statusFilter === 'overdue' && ! $isOverdue) {
                continue;
            }
            if ($statusFilter === 'upcoming' && $isOverdue) {
                continue;
            }

            $diffDays = (int) $targetDate->diffInDays($today);
            if ($diffDays === 0) {
                $daysLabel = 'Scheduled today';
            } elseif ($isOverdue) {
                $daysLabel = $diffDays . ' day' . ($diffDays > 1 ? 's' : '') . ' overdue';
            } else {
                $daysLabel = 'Approaching in ' . $diffDays . ' day' . ($diffDays > 1 ? 's' : '');
            }

            $fullName = trim(collect([
                $patient?->first_name,
                $patient?->middle_name,
                $patient?->last_name,
            ])->filter()->implode(' '));

            $currentAge = $patient?->date_of_birth
                ? DateHelper::formatAge($patient->date_of_birth)
                : '—';

            $items[] = [
                'schedule_id' => $schedule->id,
                'patient_id' => $patient?->patient_id ?? 'PT-UNKNOWN',
                'patient_name' => $fullName ?: 'Unknown Child',
                'date_of_birth' => $patient?->date_of_birth ? Carbon::parse($patient->date_of_birth)->format('Y-m-d') : '—',
                'current_age' => $currentAge,
                'sex' => ucfirst($patient?->sex ?? '—'),
                'guardian_name' => $guardian?->name ?? '—',
                'guardian_contact' => $guardian?->contact_number ?? '—',
                'address' => $patient?->address ?? 'Zone 2, Barangay Bugo',
                'vaccine_id' => $schedule->vaccine_id,
                'vaccine_name' => $schedule->vaccine?->name ?? 'Vaccine',
                'dose_number' => (int) $schedule->dose_number,
                'dose_label' => 'Dose ' . $schedule->dose_number,
                'scheduled_date' => $targetDate->format('Y-m-d'),
                'scheduled_date_formatted' => $targetDate->format('M d, Y'),
                'scheduled_day' => $targetDate->format('l'),
                'status' => $computedStatus, // 'overdue' or 'upcoming'
                'stored_status' => $schedule->status,
                'is_overdue' => $isOverdue,
                'days_diff' => $diffDays,
                'days_label' => $daysLabel,
                'remarks' => $schedule->adjustment_reason ?: ($isOverdue ? 'Target date passed - requires follow-up' : 'Target date approaching - scheduled visit'),
            ];
        }

        $uniqueChildrenCount = collect($items)->pluck('patient_id')->unique()->count();

        return [
            'filters' => [
                'status' => $statusFilter,
                'vaccine_id' => $vaccineId ? (string) $vaccineId : 'all',
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'search' => $search,
            ],
            'summary' => [
                'total_scheduled' => $totalCount,
                'upcoming_count' => $upcomingCount,
                'overdue_count' => $overdueCount,
                'monitored_children' => $uniqueChildrenCount,
            ],
            'rows' => $items,
            'generated_at' => Carbon::now()->format('M d, Y h:i A'),
            'generated_by' => auth()->user()?->name ?? 'Clinic Staff',
        ];
    }

    /**
     * Synchronize and update all pending schedule statuses to 'overdue' or 'upcoming'
     * depending on whether their target date has passed or is approaching.
     */
    public function syncScheduleStatuses(Request $request): RedirectResponse
    {
        $today = Carbon::today();
        $schedules = PatientVaccineSchedule::query()
            ->pending()
            ->whereNotNull('scheduled_date')
            ->get();

        $overdueCount = 0;
        $upcomingCount = 0;

        foreach ($schedules as $schedule) {
            $target = Carbon::parse($schedule->scheduled_date)->startOfDay();
            if ($target->lt($today)) {
                $schedule->update([
                    'status' => PatientVaccineSchedule::STATUS_OVERDUE,
                ]);
                $overdueCount++;
            } else {
                $schedule->update([
                    'status' => PatientVaccineSchedule::STATUS_UPCOMING,
                ]);
                $upcomingCount++;
            }
        }

        return back()->with(
            'success',
            "Schedule statuses synchronized: {$overdueCount} marked as Overdue (target date passed), {$upcomingCount} marked as Upcoming (approaching)."
        );
    }

    /**
     * Manually update a specific child's schedule status to 'overdue' or 'upcoming'.
     */
    public function updateScheduleStatus(
        Request $request,
        PatientVaccineSchedule $schedule
    ): RedirectResponse {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:upcoming,overdue,scheduled'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $updateData = [
            'status' => $validated['status'],
        ];

        if (isset($validated['remarks'])) {
            $updateData['adjustment_reason'] = $validated['remarks'];
        }

        $schedule->update($updateData);

        $statusLabel = ucfirst($validated['status']);
        $childName = $schedule->patient ? $schedule->patient->first_name . ' ' . $schedule->patient->last_name : 'Patient';

        return back()->with(
            'success',
            "Schedule status for {$childName} ({$schedule->vaccine?->name} Dose {$schedule->dose_number}) updated to '{$statusLabel}'."
        );
    }

    /**
     * Export Vaccine Coverage Report to PDF.
     */
    public function exportCoveragePdf(Request $request)
    {
        $data = $this->getCoverageReportData($request);

        $pdf = Pdf::loadView('reports.vaccine-coverage-pdf', $data)
            ->setPaper('a4', 'landscape');

        $filename = 'vaccine-coverage-report-' . Carbon::now()->format('Y-m-d') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Export Vaccine Coverage Report to CSV.
     */
    public function exportCoverageCsv(Request $request): StreamedResponse
    {
        $data = $this->getCoverageReportData($request);
        $filename = 'vaccine-coverage-report-' . Carbon::now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($data) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Report Header
            fputcsv($handle, ['BARANGAY BUGO HEALTH CENTER - VACCINE COVERAGE REPORT']);
            fputcsv($handle, ['Generated At:', $data['generated_at'], 'Generated By:', $data['generated_by']]);
            fputcsv($handle, ['Target Population:', $data['target_population'], 'Total Doses Administered:', $data['total_doses_administered']]);
            fputcsv($handle, []);

            // Summary Section
            fputcsv($handle, ['--- VACCINE COVERAGE SUMMARY ---']);
            fputcsv($handle, [
                'Vaccine Name',
                'Category',
                'Required Doses',
                'Target Cohort',
                'Total Administered',
                'Dose 1',
                'Dose 2',
                'Dose 3',
                'Booster',
                'Dose 1 Coverage %',
                'Series Completion %',
            ]);

            foreach ($data['vaccine_summaries'] as $summary) {
                fputcsv($handle, [
                    $summary['name'],
                    $summary['category'],
                    $summary['required_doses'],
                    $summary['target_population'],
                    $summary['total_administered'],
                    $summary['dose_1'],
                    $summary['dose_2'],
                    $summary['dose_3'],
                    $summary['booster'],
                    $summary['coverage_pct'] . '%',
                    $summary['completion_pct'] . '%',
                ]);
            }

            fputcsv($handle, []);
            fputcsv($handle, ['--- DETAILS ABOUT VACCINATED CHILDREN ---']);
            fputcsv($handle, [
                'Date Administered',
                'Patient ID',
                'Child Full Name',
                'Sex',
                'Date of Birth',
                'Age at Admin',
                'Parent / Guardian',
                'Guardian Contact',
                'Address / Zone',
                'Vaccine',
                'Dose',
                'Batch / Lot Number',
                'Injection Site',
                'Administered By',
                'Remarks',
            ]);

            foreach ($data['vaccinated_children'] as $child) {
                fputcsv($handle, [
                    $child['date_administered'],
                    $child['patient_id'],
                    $child['patient_name'],
                    $child['sex'],
                    $child['date_of_birth'],
                    $child['age_at_admin'],
                    $child['guardian_name'],
                    $child['guardian_contact'],
                    $child['address'],
                    $child['vaccine_name'],
                    $child['dose_label'],
                    $child['batch_number'],
                    $child['injection_site'],
                    $child['administered_by'],
                    $child['remarks'],
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Export Immunization Schedule Status Report to PDF.
     */
    public function exportScheduleStatusPdf(Request $request)
    {
        $data = $this->getScheduleStatusReportData($request);

        $pdf = Pdf::loadView('reports.immunization-schedule-status-pdf', $data)
            ->setPaper('a4', 'landscape');

        $filename = 'immunization-schedule-status-report-' . Carbon::now()->format('Y-m-d') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Export Immunization Schedule Status Report to CSV.
     */
    public function exportScheduleStatusCsv(Request $request): StreamedResponse
    {
        $data = $this->getScheduleStatusReportData($request);
        $filename = 'immunization-schedule-status-report-' . Carbon::now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($data) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, ['BARANGAY BUGO HEALTH CENTER - IMMUNIZATION SCHEDULE STATUS REPORT']);
            fputcsv($handle, ['Generated At:', $data['generated_at'], 'Generated By:', $data['generated_by']]);
            fputcsv($handle, [
                'Total Scheduled:', $data['summary']['total_scheduled'],
                'Upcoming:', $data['summary']['upcoming_count'],
                'Overdue:', $data['summary']['overdue_count'],
                'Monitored Children:', $data['summary']['monitored_children'],
            ]);
            fputcsv($handle, []);

            fputcsv($handle, [
                'Patient ID',
                'Child Name',
                'Sex',
                'Date of Birth',
                'Current Age',
                'Parent / Guardian',
                'Contact Number',
                'Address / Zone',
                'Vaccine',
                'Dose',
                'Target Date',
                'Target Day',
                'Status',
                'Timeline / Days Info',
                'Remarks / Notes',
            ]);

            foreach ($data['rows'] as $row) {
                fputcsv($handle, [
                    $row['patient_id'],
                    $row['patient_name'],
                    $row['sex'],
                    $row['date_of_birth'],
                    $row['current_age'],
                    $row['guardian_name'],
                    $row['guardian_contact'],
                    $row['address'],
                    $row['vaccine_name'],
                    $row['dose_label'],
                    $row['scheduled_date'],
                    $row['scheduled_day'],
                    strtoupper($row['status']),
                    $row['days_label'],
                    $row['remarks'],
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
