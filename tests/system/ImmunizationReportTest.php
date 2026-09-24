<?php

namespace Tests\Feature;

use App\Models\Guardian;
use App\Models\ImmunizationRecord;
use App\Models\Patient;
use App\Models\PatientVaccineSchedule;
use App\Models\User;
use App\Models\Vaccine;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImmunizationReportTest extends TestCase
{
    use RefreshDatabase;

    private User $staff;
    private Vaccine $bcg;
    private Vaccine $penta;
    private Patient $child;

    protected function setUp(): void
    {
        parent::setUp();
        config(['inertia.testing.ensure_pages_exist' => false]);

        $this->staff = User::factory()->create([
            'role' => 'nurse',
            'must_change_password' => false,
        ]);

        $guardianUser = User::factory()->create([
            'role' => 'guardian',
            'must_change_password' => false,
        ]);

        $guardian = Guardian::create([
            'user_id' => $guardianUser->id,
            'guardian_no' => 'GRD-9999',
            'name' => 'Maria Santos',
            'contact_number' => '09171234567',
        ]);

        $this->bcg = Vaccine::create([
            'name' => 'BCG',
            'category' => 'routine',
            'required_doses' => 1,
        ]);

        $this->penta = Vaccine::create([
            'name' => 'Pentavalent',
            'category' => 'routine',
            'required_doses' => 3,
        ]);

        $this->child = Patient::create([
            'guardian_id' => $guardian->id,
            'patient_id' => 'PT-2026-9001',
            'first_name' => 'Baby',
            'last_name' => 'Santos',
            'sex' => 'Male',
            'date_of_birth' => Carbon::now()->subMonths(3)->toDateString(),
            'address' => 'Zone 2, Barangay Bugo',
            'status' => 'Active',
        ]);
    }

    public function test_authenticated_staff_can_view_immunization_tracking_with_report_props(): void
    {
        $this->actingAs($this->staff);

        $response = $this->get(route('immunization.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('immunization/index')
            ->has('coverageReport')
            ->has('scheduleStatusReport')
            ->has('vaccines')
        );
    }

    public function test_vaccine_coverage_pdf_export_returns_valid_download(): void
    {
        $this->actingAs($this->staff);

        // Record a vaccination
        ImmunizationRecord::create([
            'patient_id' => $this->child->id,
            'vaccine_id' => $this->bcg->id,
            'dose_number' => 1,
            'date_administered' => Carbon::now()->subDays(5)->toDateString(),
            'administered_by' => $this->staff->id,
            'batch_number' => 'BCG-2026-001',
            'consent_given_by' => 'Maria Santos',
        ]);

        $response = $this->get(route('immunization.reports.coverage.pdf'));

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('content-type'));
        $this->assertStringContainsString('vaccine-coverage-report', $response->headers->get('content-disposition'));
    }

    public function test_vaccine_coverage_csv_export_streams_csv_with_correct_data(): void
    {
        $this->actingAs($this->staff);

        ImmunizationRecord::create([
            'patient_id' => $this->child->id,
            'vaccine_id' => $this->penta->id,
            'dose_number' => 1,
            'date_administered' => Carbon::now()->subDays(2)->toDateString(),
            'administered_by' => $this->staff->id,
            'batch_number' => 'PENTA-2026-001',
            'consent_given_by' => 'Maria Santos',
            'injection_site' => 'Left Thigh',
        ]);

        $response = $this->get(route('immunization.reports.coverage.csv'));

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('content-type'));

        $streamedContent = $response->streamedContent();
        $this->assertStringContainsString('BARANGAY BUGO HEALTH CENTER - VACCINE COVERAGE REPORT', $streamedContent);
        $this->assertStringContainsString('Pentavalent', $streamedContent);
        $this->assertStringContainsString('Baby Santos', $streamedContent);
        $this->assertStringContainsString('PT-2026-9001', $streamedContent);
    }

    public function test_coverage_report_filters_by_vaccine_and_dose(): void
    {
        $this->actingAs($this->staff);

        ImmunizationRecord::create([
            'patient_id' => $this->child->id,
            'vaccine_id' => $this->bcg->id,
            'dose_number' => 1,
            'date_administered' => Carbon::now()->subDays(10)->toDateString(),
            'administered_by' => $this->staff->id,
            'batch_number' => 'BCG-001',
            'consent_given_by' => 'Maria Santos',
        ]);

        ImmunizationRecord::create([
            'patient_id' => $this->child->id,
            'vaccine_id' => $this->penta->id,
            'dose_number' => 2,
            'date_administered' => Carbon::now()->subDays(3)->toDateString(),
            'administered_by' => $this->staff->id,
            'batch_number' => 'PENTA-002',
            'consent_given_by' => 'Maria Santos',
        ]);

        // Filter by BCG
        $responseBcg = $this->get(route('immunization.reports.coverage.csv', [
            'vaccine_id' => $this->bcg->id,
        ]));
        $bcgCsv = $responseBcg->streamedContent();
        $this->assertStringContainsString('BCG', $bcgCsv);

        // Filter by Dose 2
        $responseDose2 = $this->get(route('immunization.reports.coverage.csv', [
            'dose_number' => 2,
        ]));
        $dose2Csv = $responseDose2->streamedContent();
        $this->assertStringContainsString('PENTA-002', $dose2Csv);
        $this->assertStringNotContainsString('BCG-001', $dose2Csv);
    }

    public function test_schedule_status_pdf_and_csv_exports_function_properly(): void
    {
        $this->actingAs($this->staff);

        PatientVaccineSchedule::create([
            'patient_id' => $this->child->id,
            'vaccine_id' => $this->penta->id,
            'dose_number' => 1,
            'scheduled_date' => Carbon::now()->addDays(7)->toDateString(),
            'status' => 'upcoming',
        ]);

        $pdfResponse = $this->get(route('immunization.reports.schedule-status.pdf'));
        $pdfResponse->assertOk();
        $this->assertStringContainsString('application/pdf', $pdfResponse->headers->get('content-type'));

        $csvResponse = $this->get(route('immunization.reports.schedule-status.csv'));
        $csvResponse->assertOk();
        $this->assertStringContainsString('text/csv', $csvResponse->headers->get('content-type'));
        $csvContent = $csvResponse->streamedContent();
        $this->assertStringContainsString('IMMUNIZATION SCHEDULE STATUS REPORT', $csvContent);
        $this->assertStringContainsString('Baby Santos', $csvContent);
    }

    public function test_sync_schedule_statuses_updates_overdue_and_upcoming_schedules(): void
    {
        $this->actingAs($this->staff);

        // Overdue schedule (target date in the past)
        $pastSchedule = PatientVaccineSchedule::create([
            'patient_id' => $this->child->id,
            'vaccine_id' => $this->bcg->id,
            'dose_number' => 1,
            'scheduled_date' => Carbon::yesterday()->toDateString(),
            'status' => 'scheduled',
        ]);

        // Upcoming schedule (target date in the future)
        $futureSchedule = PatientVaccineSchedule::create([
            'patient_id' => $this->child->id,
            'vaccine_id' => $this->penta->id,
            'dose_number' => 1,
            'scheduled_date' => Carbon::now()->addDays(6)->toDateString(),
            'status' => 'scheduled',
        ]);

        $response = $this->post(route('immunization.reports.schedule-status.sync'));
        $response->assertSessionHas('success');

        $this->assertEquals('overdue', $pastSchedule->fresh()->status);
        $this->assertEquals('upcoming', $futureSchedule->fresh()->status);
    }

    public function test_staff_can_update_individual_schedule_status(): void
    {
        $this->actingAs($this->staff);

        $schedule = PatientVaccineSchedule::create([
            'patient_id' => $this->child->id,
            'vaccine_id' => $this->penta->id,
            'dose_number' => 1,
            'scheduled_date' => Carbon::now()->addDays(6)->toDateString(),
            'status' => 'upcoming',
        ]);

        $response = $this->post(route('immunization.reports.schedule-status.update', $schedule), [
            'status' => 'overdue',
            'remarks' => 'Parent informed child had mild fever, deferred',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('overdue', $schedule->fresh()->status);
        $this->assertEquals('Parent informed child had mild fever, deferred', $schedule->fresh()->adjustment_reason);
    }
}
