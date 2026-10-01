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
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VaccineSessionAdministrationTest extends TestCase
{
    use RefreshDatabase;

    private User $staff;
    private Guardian $guardian;
    private User $guardianUser;
    private Patient $baby;
    private Vaccine $penta;
    private Vaccine $opv;
    private Vaccine $pcv;
    private VaccineInventory $pentaInventory;
    private VaccineInventory $opvInventory;
    private VaccineInventory $pcvInventory;

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
            'guardian_no' => 'GRD-TEST-SESS',
            'name' => 'Maria Santos',
            'contact_number' => '09171234567',
            'status' => 'active',
        ]);

        $guardianRole = Role::firstOrCreate(
            ['name' => 'guardian'],
            ['display_name' => 'Guardian']
        );

        $this->guardianUser = User::factory()->create([
            'role_id' => $guardianRole->id,
            'role' => 'guardian',
            'must_change_password' => false,
        ]);
        $this->guardian->update(['user_id' => $this->guardianUser->id]);

        // Child born 6 weeks ago (42 days) - eligible for 1.5-month doses today
        $this->baby = Patient::create([
            'patient_id' => 'BGH-TEST-SESS',
            'first_name' => 'Johnny',
            'last_name' => 'Sweeney',
            'sex' => 'Male',
            'date_of_birth' => Carbon::today()->subDays(42)->toDateString(),
            'guardian_id' => $this->guardian->id,
            'address' => 'Zone 2, Bugo, CDO',
            'status' => 'Active',
        ]);

        // 1. Pentavalent (3 doses)
        $this->penta = Vaccine::create([
            'name' => 'Pentavalent',
            'required_doses' => 3,
            'category' => 'routine',
        ]);
        VaccineSchedule::create([
            'vaccine_id' => $this->penta->id,
            'dose_number' => 1,
            'recommended_age' => '1.5 months',
        ]);
        VaccineSchedule::create([
            'vaccine_id' => $this->penta->id,
            'dose_number' => 2,
            'recommended_age' => '2.5 months',
            'interval' => '4 weeks',
        ]);

        // 2. OPV (3 doses)
        $this->opv = Vaccine::create([
            'name' => 'OPV',
            'required_doses' => 3,
            'category' => 'routine',
        ]);
        VaccineSchedule::create([
            'vaccine_id' => $this->opv->id,
            'dose_number' => 1,
            'recommended_age' => '1.5 months',
        ]);

        // 3. PCV (3 doses)
        $this->pcv = Vaccine::create([
            'name' => 'PCV',
            'required_doses' => 3,
            'category' => 'routine',
        ]);
        VaccineSchedule::create([
            'vaccine_id' => $this->pcv->id,
            'dose_number' => 1,
            'recommended_age' => '1.5 months',
        ]);

        // Add Inventories with Stock
        $this->pentaInventory = VaccineInventory::create([
            'vaccine_id' => $this->penta->id,
            'batch_number' => 'PTV-2026-001',
            'quantity' => 10,
            'initial_quantity' => 10,
            'date_received' => Carbon::today()->subDays(10)->toDateString(),
            'expiration_date' => Carbon::today()->addYears(2)->toDateString(),
            'status' => 'Available',
            'is_archived' => false,
            'storage_temperature_celsius' => 4.0,
        ]);

        $this->opvInventory = VaccineInventory::create([
            'vaccine_id' => $this->opv->id,
            'batch_number' => 'OPV-2026-001',
            'quantity' => 15,
            'initial_quantity' => 15,
            'date_received' => Carbon::today()->subDays(10)->toDateString(),
            'expiration_date' => Carbon::today()->addYears(2)->toDateString(),
            'status' => 'Available',
            'is_archived' => false,
            'storage_temperature_celsius' => 4.0,
        ]);

        $this->pcvInventory = VaccineInventory::create([
            'vaccine_id' => $this->pcv->id,
            'batch_number' => 'PCV-2026-001',
            'quantity' => 20,
            'initial_quantity' => 20,
            'date_received' => Carbon::today()->subDays(10)->toDateString(),
            'expiration_date' => Carbon::today()->addYears(2)->toDateString(),
            'status' => 'Available',
            'is_archived' => false,
            'storage_temperature_celsius' => 4.0,
        ]);
    }

    public function test_administer_session_records_multiple_vaccines_with_single_guardian_notification(): void
    {
        $payload = [
            'consent_obtained' => true,
            'consent_given_by' => 'Maria Santos (Mother)',
            'administered_by' => $this->staff->id,
            'date_administered' => Carbon::today()->toDateString(),
            'session_remarks' => 'Session well-tolerated by infant.',
            'doses' => [
                [
                    'vaccine_id' => $this->penta->id,
                    'injection_site' => 'Anterolateral Left Thigh (IM)',
                    'vaccine_inventory_id' => $this->pentaInventory->id,
                    'remarks' => 'Dose 1 given smoothly.',
                ],
                [
                    'vaccine_id' => $this->opv->id,
                    'injection_site' => 'Oral Drops',
                    'vaccine_inventory_id' => $this->opvInventory->id,
                    'remarks' => '2 drops taken without spitting.',
                ],
                [
                    'vaccine_id' => $this->pcv->id,
                    'injection_site' => 'Anterolateral Right Thigh (IM)',
                    'vaccine_inventory_id' => $this->pcvInventory->id,
                    'remarks' => null,
                ],
            ],
        ];

        $response = $this->actingAs($this->staff)
            ->post("/immunization/patients/{$this->baby->id}/administer-session", $payload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify 3 Immunization Records were created
        $records = ImmunizationRecord::where('patient_id', $this->baby->id)->get();
        $this->assertCount(3, $records);

        $pentaRecord = $records->firstWhere('vaccine_id', $this->penta->id);
        $this->assertNotNull($pentaRecord);
        $this->assertEquals(1, $pentaRecord->dose_number);
        $this->assertEquals('Anterolateral Left Thigh (IM)', $pentaRecord->injection_site);
        $this->assertStringContainsString('Dose 1 given smoothly', $pentaRecord->remarks);
        $this->assertStringContainsString('Session well-tolerated', $pentaRecord->remarks);

        $opvRecord = $records->firstWhere('vaccine_id', $this->opv->id);
        $this->assertNotNull($opvRecord);
        $this->assertEquals('Oral Drops', $opvRecord->injection_site);

        $pcvRecord = $records->firstWhere('vaccine_id', $this->pcv->id);
        $this->assertNotNull($pcvRecord);
        $this->assertEquals('Anterolateral Right Thigh (IM)', $pcvRecord->injection_site);

        // Verify inventory quantities were deducted
        $this->assertEquals(9, $this->pentaInventory->fresh()->quantity);
        $this->assertEquals(14, $this->opvInventory->fresh()->quantity);
        $this->assertEquals(19, $this->pcvInventory->fresh()->quantity);

        // Verify EXACTLY 1 unified notification was dispatched to guardian user
        $notifications = $this->guardianUser->notifications()->get();
        $this->assertCount(1, $notifications);

        $notifData = $notifications->first()->data;
        $this->assertEquals('vaccination', $notifData['type']);
        $this->assertEquals(3, $notifData['count']);
        $this->assertStringContainsString('Clinical Vaccination Session', $notifData['title']);
        $this->assertStringContainsString('Johnny received 3 vaccines', $notifData['description']);
        $this->assertStringContainsString('Pentavalent (Dose 1)', $notifData['description']);
        $this->assertStringContainsString('OPV (Dose 1)', $notifData['description']);
        $this->assertStringContainsString('PCV (Dose 1)', $notifData['description']);
    }

    public function test_administer_session_rolls_back_if_any_dose_fails(): void
    {
        // Set penta inventory to 0 to cause an exception
        $this->pentaInventory->update(['quantity' => 0]);

        $payload = [
            'consent_obtained' => true,
            'consent_given_by' => 'Maria Santos (Mother)',
            'administered_by' => $this->staff->id,
            'date_administered' => Carbon::today()->toDateString(),
            'doses' => [
                [
                    'vaccine_id' => $this->opv->id,
                    'injection_site' => 'Oral Drops',
                    'vaccine_inventory_id' => $this->opvInventory->id,
                ],
                [
                    'vaccine_id' => $this->penta->id,
                    'injection_site' => 'Anterolateral Left Thigh (IM)',
                    'vaccine_inventory_id' => $this->pentaInventory->id,
                ],
            ],
        ];

        $response = $this->actingAs($this->staff)
            ->post("/immunization/patients/{$this->baby->id}/administer-session", $payload);

        $response->assertSessionHasErrors(['administration']);

        // Check that 0 records were inserted
        $this->assertEquals(0, ImmunizationRecord::where('patient_id', $this->baby->id)->count());

        // Check that OPV inventory was not deducted (rolled back)
        $this->assertEquals(15, $this->opvInventory->fresh()->quantity);

        // Check that no notifications were sent
        $this->assertEquals(0, $this->guardianUser->notifications()->count());
    }
}
