<?php

namespace Tests\Integration;

use App\Models\Guardian;
use App\Models\ImmunizationRecord;
use App\Models\Patient;
use App\Models\PatientVaccineSchedule;
use App\Models\Role;
use App\Models\User;
use App\Models\Vaccine;
use App\Models\VaccineInventory;
use App\Models\VaccineSchedule;
use App\Services\ImmunizationAdministrationService;
use App\Services\PatientImmunizationScheduleService;
use App\Services\VaccineSchedulingPriorityService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VaccineSchedulingNextVisitTest extends TestCase
{
    use RefreshDatabase;

    private User $staff;
    private Guardian $guardian;
    private Patient $baby;
    private Vaccine $bcg;
    private Vaccine $penta;
    private Vaccine $ipv;
    private Vaccine $measles;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::firstOrCreate(
            ['name' => 'staff'],
            ['display_name' => 'Staff']
        );

        $this->staff = User::factory()->create([
            'role_id' => $role->id,
            'role' => 'staff',
            'must_change_password' => false,
        ]);

        $this->guardian = Guardian::create([
            'guardian_no' => 'GRD-TEST-0001',
            'name' => 'Maria Santos',
            'contact_number' => '09171234567',
            'status' => 'active',
        ]);

        // Child born 2 weeks ago (14 days old)
        $this->baby = Patient::create([
            'patient_id' => 'BGH-TEST-0001',
            'first_name' => 'Lucas',
            'last_name' => 'Santos',
            'sex' => 'Male',
            'date_of_birth' => Carbon::today()->subWeeks(2)->toDateString(),
            'guardian_id' => $this->guardian->id,
            'address' => 'Zone 1, Bugo, CDO',
            'status' => 'Active',
        ]);

        // Setup Vaccines & Schedules
        // 1. BCG (At birth, 1 dose)
        $this->bcg = Vaccine::create([
            'name' => 'BCG',
            'required_doses' => 1,
            'category' => 'routine',
        ]);
        VaccineSchedule::create([
            'vaccine_id' => $this->bcg->id,
            'dose_number' => 1,
            'recommended_age' => 'at birth',
        ]);

        // 2. Pentavalent (3 doses: 6 weeks, 10 weeks, 14 weeks)
        $this->penta = Vaccine::create([
            'name' => 'Pentavalent',
            'required_doses' => 3,
            'category' => 'routine',
        ]);
        VaccineSchedule::create([
            'vaccine_id' => $this->penta->id,
            'dose_number' => 1,
            'recommended_age' => '6 weeks',
        ]);
        VaccineSchedule::create([
            'vaccine_id' => $this->penta->id,
            'dose_number' => 2,
            'recommended_age' => '10 weeks',
            'interval' => 28,
        ]);
        VaccineSchedule::create([
            'vaccine_id' => $this->penta->id,
            'dose_number' => 3,
            'recommended_age' => '14 weeks',
            'interval' => 28,
        ]);

        // 3. IPV (1 dose at 14 weeks)
        $this->ipv = Vaccine::create([
            'name' => 'IPV',
            'required_doses' => 1,
            'category' => 'routine',
        ]);
        VaccineSchedule::create([
            'vaccine_id' => $this->ipv->id,
            'dose_number' => 1,
            'recommended_age' => '14 weeks',
        ]);

        // 4. Measles (1 dose at 9 months)
        $this->measles = Vaccine::create([
            'name' => 'Measles',
            'required_doses' => 1,
            'category' => 'routine',
        ]);
        VaccineSchedule::create([
            'vaccine_id' => $this->measles->id,
            'dose_number' => 1,
            'recommended_age' => '9 months',
        ]);

        // Create stock for vaccines
        VaccineInventory::create([
            'vaccine_id' => $this->bcg->id,
            'batch_number' => 'BCG-001',
            'quantity' => 50,
            'date_received' => Carbon::today()->subDays(10)->toDateString(),
            'expiration_date' => Carbon::today()->addMonths(12)->toDateString(),
            'is_archived' => false,
        ]);

        VaccineInventory::create([
            'vaccine_id' => $this->penta->id,
            'batch_number' => 'PENTA-001',
            'quantity' => 50,
            'date_received' => Carbon::today()->subDays(10)->toDateString(),
            'expiration_date' => Carbon::today()->addMonths(12)->toDateString(),
            'is_archived' => false,
        ]);

        VaccineInventory::create([
            'vaccine_id' => $this->ipv->id,
            'batch_number' => 'IPV-001',
            'quantity' => 50,
            'date_received' => Carbon::today()->subDays(10)->toDateString(),
            'expiration_date' => Carbon::today()->addMonths(12)->toDateString(),
            'is_archived' => false,
        ]);

        VaccineInventory::create([
            'vaccine_id' => $this->measles->id,
            'batch_number' => 'MEAS-001',
            'quantity' => 50,
            'date_received' => Carbon::today()->subDays(10)->toDateString(),
            'expiration_date' => Carbon::today()->addMonths(12)->toDateString(),
            'is_archived' => false,
        ]);
    }

    public function test_suggests_birth_doses_when_not_yet_administered(): void
    {
        $scheduleService = app(PatientImmunizationScheduleService::class);
        $options = $scheduleService->getSchedulingOptions($this->baby);

        // Baby is 2 weeks old and has not received BCG yet (which was due at birth).
        // It must suggest BCG (due now/catch-up), not 6-week or 14-week vaccines yet.
        $this->assertNotEmpty($options);
        $vaccineIds = collect($options)->pluck('vaccine_id')->all();
        $this->assertContains($this->bcg->id, $vaccineIds);
        $this->assertNotContains($this->penta->id, $vaccineIds);
        $this->assertNotContains($this->ipv->id, $vaccineIds);
    }

    public function test_suggests_only_next_visit_doses_in_advance_when_child_is_younger_than_recommended_age(): void
    {
        // Record BCG as completed at birth
        ImmunizationRecord::create([
            'patient_id' => $this->baby->id,
            'vaccine_id' => $this->bcg->id,
            'dose_number' => 1,
            'batch_number' => 'BCG-001',
            'date_administered' => $this->baby->date_of_birth,
            'source' => 'Hospital / Birth Facility',
        ]);

        $scheduleService = app(PatientImmunizationScheduleService::class);
        $options = $scheduleService->getSchedulingOptions($this->baby);

        // Baby is 2 weeks old. Next milestone is 6 weeks (Pentavalent Dose 1).
        // It should ONLY suggest Pentavalent Dose 1 (next visit only).
        // It should NOT suggest IPV (14 weeks) or Measles (9 months) or Pentavalent Dose 2 (10 weeks).
        $this->assertNotEmpty($options);
        $this->assertCount(1, $options);

        $option = $options[0];
        $this->assertEquals($this->penta->id, $option['vaccine_id']);
        $this->assertEquals(1, $option['next_dose']);
        $this->assertEquals('Upcoming', $option['schedule_label']);
        $this->assertFalse($option['can_administer']); // Cannot give shot yet because baby is 2 weeks old

        // Proposed scheduled date must be a Wednesday on or after 6 weeks of age
        $sixWeeksDate = Carbon::parse($this->baby->date_of_birth)->addWeeks(6);
        $expectedWednesday = $scheduleService->getTargetWednesday($sixWeeksDate)->toDateString();
        $this->assertEquals($expectedWednesday, $option['target_wednesday']);
    }

    public function test_priority_service_generates_advance_schedule_for_next_visit(): void
    {
        // Record BCG at birth
        ImmunizationRecord::create([
            'patient_id' => $this->baby->id,
            'vaccine_id' => $this->bcg->id,
            'dose_number' => 1,
            'batch_number' => 'BCG-001',
            'date_administered' => $this->baby->date_of_birth,
            'source' => 'Hospital / Birth Facility',
        ]);

        $priorityService = app(VaccineSchedulingPriorityService::class);
        $schedules = $priorityService->generateSchedules();

        $this->assertNotEmpty($schedules);
        $babySchedule = PatientVaccineSchedule::where('patient_id', $this->baby->id)
            ->where('status', 'scheduled')
            ->first();

        $this->assertNotNull($babySchedule);
        $this->assertEquals($this->penta->id, $babySchedule->vaccine_id);
        $this->assertEquals(1, $babySchedule->dose_number);

        // Date is scheduled for the future 6-week clinic Wednesday
        $sixWeeksDate = Carbon::parse($this->baby->date_of_birth)->addWeeks(6);
        $expectedWednesday = app(PatientImmunizationScheduleService::class)->getTargetWednesday($sixWeeksDate)->toDateString();
        $this->assertEquals($expectedWednesday, $babySchedule->scheduled_date->toDateString());
    }

    public function test_staff_can_reschedule_suggested_visit_date(): void
    {
        // Record BCG at birth
        ImmunizationRecord::create([
            'patient_id' => $this->baby->id,
            'vaccine_id' => $this->bcg->id,
            'dose_number' => 1,
            'batch_number' => 'BCG-001',
            'date_administered' => $this->baby->date_of_birth,
            'source' => 'Hospital / Birth Facility',
        ]);

        // Generate schedule
        app(VaccineSchedulingPriorityService::class)->generateSchedules();

        $newSuggestedDate = Carbon::today()->addWeeks(5)->toDateString();

        $this->actingAs($this->staff);
        $response = $this->post(route('immunization.patients.reschedule', $this->baby), [
            'scheduled_date' => $newSuggestedDate,
            'adjustment_reason' => 'Guardian requested a different Wednesday',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $schedule = PatientVaccineSchedule::where('patient_id', $this->baby->id)
            ->where('status', 'scheduled')
            ->first();

        $this->assertNotNull($schedule);
        $this->assertEquals($newSuggestedDate, $schedule->scheduled_date->toDateString());
        $this->assertTrue($schedule->is_manually_adjusted);
        $this->assertEquals('Guardian requested a different Wednesday', $schedule->adjustment_reason);
        $this->assertEquals($this->staff->id, $schedule->adjusted_by);
    }
}
