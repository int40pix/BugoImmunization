<?php

namespace Tests\Feature;

use App\Models\Guardian;
use App\Models\ImmunizationRecord;
use App\Models\Patient;
use App\Models\Role;
use App\Models\User;
use App\Models\Vaccine;
use App\Models\VaccineSchedule;
use Carbon\Carbon;
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
        $response->assertSee('patient\/show', false);
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

        $response = $this->from(route('patients.index'))->put('/patients/'.$patient->id.'/status');

        $response->assertRedirect(route('patients.index'));
        $response->assertSessionHas('success', 'Patient record status updated to Inactive.');

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

    public function test_editing_patient_date_of_birth_updates_birth_records_and_reschedules_doses(): void
    {
        $user = User::factory()->create(['must_change_password' => false]);
        $this->actingAs($user);

        $guardian = Guardian::create([
            'guardian_no' => 'GRD-2026-0099',
            'name' => 'Elena Santos',
            'status' => 'active',
        ]);

        $oldDob = Carbon::today()->subWeeks(3)->toDateString();
        $patient = Patient::create([
            'guardian_id' => $guardian->id,
            'patient_id' => 'PT-000099',
            'first_name' => 'Carlos',
            'last_name' => 'Santos',
            'date_of_birth' => $oldDob,
            'sex' => 'Male',
            'address' => 'Bugo, CDO',
            'guardian_relationship' => 'Mother',
            'status' => 'Active',
        ]);

        $bcg = Vaccine::create([
            'name' => 'BCG',
            'required_doses' => 1,
            'category' => 'routine',
        ]);
        VaccineSchedule::create([
            'vaccine_id' => $bcg->id,
            'dose_number' => 1,
            'recommended_age' => 'at birth',
        ]);

        $birthRecord = ImmunizationRecord::create([
            'patient_id' => $patient->id,
            'vaccine_id' => $bcg->id,
            'dose_number' => 1,
            'date_administered' => $oldDob,
            'source' => 'Hospital / Birth Facility',
            'remarks' => 'Received at birth',
        ]);

        $newDob = Carbon::today()->subWeeks(2)->toDateString();

        $response = $this->put('/patients/'.$patient->id, [
            'first_name' => 'Carlos',
            'last_name' => 'Santos',
            'date_of_birth' => $newDob,
            'sex' => 'Male',
            'address' => 'Bugo, CDO',
            'guardian_relationship' => 'Mother',
        ]);

        $response->assertRedirect(route('patients.index'));

        $this->assertEquals($newDob, $patient->fresh()->date_of_birth->toDateString());

        $this->assertEquals($newDob, $birthRecord->fresh()->date_administered->toDateString());
    }

    public function test_immunization_card_marks_unadministered_birth_doses_as_due_without_recommended_date(): void
    {
        $user = User::factory()->create(['must_change_password' => false]);
        $this->actingAs($user);

        $guardian = Guardian::create([
            'guardian_no' => 'GRD-2026-0098',
            'name' => 'Elena Cruz',
            'status' => 'active',
        ]);

        $patient = Patient::create([
            'guardian_id' => $guardian->id,
            'patient_id' => 'PT-000098',
            'first_name' => 'Daniel',
            'last_name' => 'Cruz',
            'date_of_birth' => Carbon::today()->subWeeks(1)->toDateString(),
            'sex' => 'Male',
            'address' => 'Bugo, CDO',
            'guardian_relationship' => 'Mother',
            'status' => 'Active',
        ]);

        $bcg = Vaccine::create([
            'name' => 'BCG',
            'required_doses' => 1,
            'category' => 'routine',
        ]);
        VaccineSchedule::create([
            'vaccine_id' => $bcg->id,
            'dose_number' => 1,
            'recommended_age' => 'at birth',
        ]);

        $response = $this->get('/patients/'.$patient->id);
        $response->assertOk();

        $pageProps = $response->viewData('page')['props'];
        $card = collect($pageProps['immunizationCard'])->firstWhere('vaccine_id', $bcg->id);
        $this->assertNotNull($card);
        $this->assertTrue($card['doses'][0]['is_due']);
        $this->assertNull($card['doses'][0]['recommended_date']);
    }

    public function test_birth_dose_date_cannot_precede_dob_and_is_clamped_on_create(): void
    {
        $user = User::factory()->create(['must_change_password' => false]);
        $this->actingAs($user);

        $guardian = Guardian::create([
            'guardian_no' => 'GRD-2026-0097',
            'name' => 'Clara Reyes',
            'status' => 'active',
        ]);

        $bcg = Vaccine::create([
            'name' => 'BCG',
            'required_doses' => 1,
            'category' => 'routine',
        ]);

        $dob = '2026-09-01';
        $invalidPreBirthDate = '2026-08-30';

        // Attempting to register patient with birth dose prior to DoB fails validation
        $response = $this->post('/guardians/'.$guardian->id.'/patients', [
            'first_name' => 'Lucas',
            'last_name' => 'Reyes',
            'date_of_birth' => $dob,
            'sex' => 'Male',
            'address' => 'Bugo, CDO',
            'guardian_relationship' => 'Mother',
            'bcg_received_at_birth' => true,
            'bcg_date_administered' => $invalidPreBirthDate,
        ]);

        $response->assertSessionHasErrors(['bcg_date_administered']);
    }

    public function test_one_and_half_month_vaccine_schedules_at_six_weeks_on_wednesday(): void
    {
        $user = User::factory()->create(['must_change_password' => false]);
        $this->actingAs($user);

        $guardian = Guardian::create([
            'guardian_no' => 'GRD-2026-0096',
            'name' => 'Johnny Cañeda Sr.',
            'status' => 'active',
        ]);

        // Child born on September 1, 2026 (Tuesday)
        $patient = Patient::create([
            'guardian_id' => $guardian->id,
            'patient_id' => 'PT-000096',
            'first_name' => 'Johnny',
            'last_name' => 'Cañeda',
            'date_of_birth' => '2026-09-01',
            'sex' => 'Male',
            'address' => 'Bugo, CDO',
            'guardian_relationship' => 'Father',
            'status' => 'Active',
        ]);

        $penta = Vaccine::create([
            'name' => 'Pentavalent',
            'required_doses' => 3,
            'category' => 'routine',
        ]);
        VaccineSchedule::create([
            'vaccine_id' => $penta->id,
            'dose_number' => 1,
            'recommended_age' => '1.5 months',
        ]);

        // In show method, dose 1 recommended date should be October 14, 2026 (Wednesday, 6 weeks + 1 day)
        $response = $this->get('/patients/'.$patient->id);
        $response->assertOk();

        $pageProps = $response->viewData('page')['props'];
        $card = collect($pageProps['immunizationCard'])->firstWhere('vaccine_id', $penta->id);
        $this->assertNotNull($card);

        // 2026-09-01 + 42 days (6 weeks) = 2026-10-13 (Tuesday) -> next Wednesday is 2026-10-14
        $this->assertEquals('2026-10-14', $card['doses'][0]['recommended_date']);
    }
}
