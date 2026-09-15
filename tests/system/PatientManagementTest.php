<?php

namespace Tests\Feature;

use App\Models\Guardian;
use App\Models\Patient;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_users_can_register_a_patient_under_a_guardian(): void
    {
        $this->actingAs(User::factory()->create([
            'must_change_password' => false,
        ]));

        $guardian = Guardian::create([
            'guardian_no' => 'GRD-2026-0001',
            'name' => 'Maria Cruz',
            'email' => 'guardian@example.com',
            'contact_number' => '09123456789',
            'status' => 'active',
        ]);

        $response = $this->post("/guardians/{$guardian->id}/patients", [
            'guardian_relationship' => 'Mother',
            'first_name' => 'Juan',
            'middle_name' => 'Dela',
            'last_name' => 'Cruz',
            'date_of_birth' => '2024-01-01',
            'sex' => 'Male',
            'address' => '123 Sample Street',
            'medical_background' => 'No known allergies',
        ]);

        $patient = Patient::where('first_name', 'Juan')->first();
        $this->assertNotNull($patient);
        $response->assertRedirect(route('patients.show', $patient));

        $this->assertDatabaseHas('patients', [
            'first_name' => 'Juan',
            'last_name' => 'Cruz',
            'guardian_id' => $guardian->id,
        ]);
        $this->assertNotNull($patient->patient_id);
    }

    public function test_patient_details_page_displays_general_information(): void
    {
        $this->actingAs(User::factory()->create([
            'must_change_password' => false,
        ]));

        $guardian = Guardian::create([
            'guardian_no' => 'GRD-2026-0002',
            'name' => 'Rosa Lopez',
            'status' => 'active',
        ]);

        $patient = Patient::create([
            'guardian_id' => $guardian->id,
            'patient_id' => 'PT-000001',
            'first_name' => 'Ana',
            'middle_name' => 'R',
            'last_name' => 'Lopez',
            'date_of_birth' => '2022-04-05',
            'sex' => 'Female',
            'address' => 'Sample Address',
            'guardian_relationship' => 'Mother',
            'medical_background' => 'Asthma',
            'status' => 'Active',
        ]);

        $response = $this->get('/patients/'.$patient->id);

        $response->assertOk();
        $response->assertSee('patient/show');
        $response->assertSee('PT-000001');
        $response->assertSee('Ana');
        $response->assertSee('Rosa Lopez');
    }

    public function test_patient_details_can_be_updated(): void
    {
        $this->actingAs(User::factory()->create([
            'must_change_password' => false,
        ]));

        $guardian = Guardian::create([
            'guardian_no' => 'GRD-2026-0003',
            'name' => 'Rosa Lopez',
            'status' => 'active',
        ]);

        $patient = Patient::create([
            'guardian_id' => $guardian->id,
            'patient_id' => 'PT-000002',
            'first_name' => 'Ana',
            'last_name' => 'Lopez',
            'date_of_birth' => '2022-04-05',
            'sex' => 'Female',
            'address' => 'Sample Address',
            'guardian_relationship' => 'Mother',
            'status' => 'Active',
        ]);

        $response = $this->put('/patients/'.$patient->id, [
            'first_name' => 'Ana Marie',
            'middle_name' => 'R',
            'last_name' => 'Lopez',
            'date_of_birth' => '2022-04-05',
            'sex' => 'Female',
            'address' => 'Updated Address',
            'guardian_relationship' => 'Mother',
            'medical_background' => 'Asthma',
            'allergies' => 'Peanuts',
            'existing_conditions' => 'None',
        ]);

        $response->assertRedirect(route('patients.index'));
        $response->assertSessionHas('success', 'Patient record updated successfully.');

        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'first_name' => 'Ana Marie',
            'address' => 'Updated Address',
        ]);
    }

    public function test_patient_status_can_be_toggled(): void
    {
        $this->actingAs(User::factory()->create([
            'must_change_password' => false,
        ]));

        $patient = Patient::create([
            'patient_id' => 'PT-000003',
            'first_name' => 'Ben',
            'last_name' => 'Dover',
            'date_of_birth' => '2021-01-01',
            'sex' => 'Male',
            'address' => 'Sample Address',
            'guardian_relationship' => 'Father',
            'status' => 'Active',
        ]);

        $response = $this->put('/patients/'.$patient->id.'/status');

        $response->assertRedirect(route('patients.index'));
        $response->assertSessionHas('success', 'Patient status updated successfully.');

        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'status' => 'Inactive',
        ]);
    }

    public function test_guardian_dashboard_displays_their_children(): void
    {
        $guardianRole = \App\Models\Role::where('name', 'guardian')->first();

        $user = User::factory()->create([
            'role_id' => $guardianRole->id,
            'role' => 'guardian',
            'must_change_password' => false,
        ]);

        $guardian = \App\Models\Guardian::create([
            'user_id' => $user->id,
            'guardian_no' => 'GRD-2026-0004',
            'name' => 'Rosa Santos',
            'status' => 'active',
        ]);

        Patient::create([
            'guardian_id' => $guardian->id,
            'patient_id' => 'PT-000004',
            'first_name' => 'Lina',
            'last_name' => 'Santos',
            'date_of_birth' => '2023-05-06',
            'sex' => 'Female',
            'address' => 'Bugo, Cagayan de Oro',
            'guardian_relationship' => 'Mother',
            'status' => 'Active',
        ]);

        $this->actingAs($user);

        $response = $this->get('/guardian/dashboard');

        $response->assertOk();
        $response->assertSee('PT-000004');
        $response->assertSee('Lina');
    }
}
