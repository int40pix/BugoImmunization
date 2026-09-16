<?php

namespace Tests\Integration;

use App\Models\Guardian;
use App\Models\Patient;
use App\Models\PatientVaccineSchedule;
use App\Models\Role;
use App\Models\User;
use App\Models\Vaccine;
use App\Models\VaccineInventory;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GuardianPortalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('inertia.testing.page_paths', [
            base_path('../frontend/src/pages'),
        ]);
    }

    private function createGuardianWithChild(): array
    {
        $role = Role::firstOrCreate(
            ['name' => 'guardian'],
            ['display_name' => 'Guardian']
        );

        $user = User::factory()->create([
            'role_id' => $role->id,
            'role' => 'guardian',
            'must_change_password' => false,
        ]);

        $guardian = Guardian::create([
            'user_id' => $user->id,
            'guardian_no' => 'GRD-TEST-0001',
            'name' => 'Adriana Alvarez',
            'contact_number' => '09171234567',
            'email' => $user->email,
        ]);

        $child = Patient::create([
            'patient_id' => 'BGH-TEST-0001',
            'first_name' => 'Adri',
            'last_name' => 'Hemsworth',
            'nickname' => 'Baby Adri',
            'sex' => 'Female',
            'date_of_birth' => Carbon::today()->subMonths(2)->format('Y-m-d'),
            'address' => 'Zone 1, Bugo, CDO',
            'guardian_name' => 'Adriana Alvarez',
            'guardian_id' => $guardian->id,
            'status' => 'Active',
        ]);

        $vaccine = Vaccine::create([
            'name' => 'BCG',
            'description' => 'Bacillus Calmette-Guerin',
            'required_doses' => 1,
            'category' => 'Routine',
        ]);

        // Add usable inventory batch
        VaccineInventory::create([
            'vaccine_id' => $vaccine->id,
            'batch_number' => 'BCG-BATCH-01',
            'quantity' => 25,
            'date_received' => Carbon::today()->format('Y-m-d'),
            'expiration_date' => Carbon::today()->addMonths(6)->format('Y-m-d'),
            'is_archived' => false,
        ]);

        // Schedule upcoming dose
        $schedule = PatientVaccineSchedule::create([
            'patient_id' => $child->id,
            'vaccine_id' => $vaccine->id,
            'dose_number' => 1,
            'scheduled_date' => Carbon::today()->addDays(5)->format('Y-m-d'),
            'status' => 'scheduled',
        ]);

        return [$user, $guardian, $child, $vaccine, $schedule];
    }

    public function test_guest_is_redirected_from_guardian_dashboard()
    {
        $response = $this->get('/guardian/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_guardian_can_view_dashboard_with_realtime_stock()
    {
        [$user, $guardian, $child, $vaccine] = $this->createGuardianWithChild();

        $this->actingAs($user)
            ->get('/guardian/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('guardian/dashboard')
                ->has('children', 1)
                ->where('children.0.name', 'Adri Hemsworth')
                ->where('children.0.next_appointment.stock_vials', 25)
                ->where('children.0.next_appointment.stock_status', 'In Stock')
                ->has('appointments', 1)
                ->where('appointments.0.stock_vials', 25)
                ->where('appointments.0.stock_status', 'In Stock')
            );
    }

    public function test_guardian_can_view_children_index()
    {
        [$user, $guardian, $child] = $this->createGuardianWithChild();

        $this->actingAs($user)
            ->get('/guardian/children')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('guardian/children/index')
                ->has('children', 1)
                ->where('children.0.name', 'Adri Hemsworth')
                ->where('children.0.next_appointment.stock_vials', 25)
            );
    }

    public function test_guardian_can_view_visits_index()
    {
        [$user, $guardian, $child] = $this->createGuardianWithChild();

        $this->actingAs($user)
            ->get('/guardian/visits')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('guardian/visits/index')
                ->has('appointments', 1)
                ->where('appointments.0.stock_vials', 25)
                ->where('appointments.0.stock_status', 'In Stock')
            );
    }

    public function test_guardian_can_view_child_digital_bakuna_card()
    {
        [$user, $guardian, $child] = $this->createGuardianWithChild();

        $this->actingAs($user)
            ->get('/guardian/children/' . $child->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('guardian/child-show')
                ->has('patient')
                ->where('patient.id', $child->id)
                ->has('patient.immunization_card')
            );
    }
}
