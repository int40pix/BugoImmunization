<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vaccine;
use App\Models\VaccineInventory;
use App\Models\VaccineInventoryTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryTransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_staff_can_view_transaction_history(): void
    {
        config(['inertia.testing.ensure_pages_exist' => false]);

        $user = User::factory()->create([
            'role' => 'admin',
            'must_change_password' => false,
        ]);
        $this->actingAs($user);

        $vaccine = Vaccine::create([
            'name' => 'BCG Test Vaccine',
            'category' => 'infant',
            'doses_required' => 1,
        ]);

        $batch = VaccineInventory::create([
            'vaccine_id' => $vaccine->id,
            'batch_number' => 'LOT-TEST-001',
            'quantity' => 50,
            'date_received' => now()->toDateString(),
            'expiration_date' => now()->addMonths(6)->toDateString(),
        ]);

        VaccineInventoryTransaction::create([
            'vaccine_id' => $vaccine->id,
            'vaccine_inventory_id' => $batch->id,
            'user_id' => $user->id,
            'transaction_type' => 'received',
            'quantity_change' => 50,
            'balance_after' => 50,
            'batch_number' => 'LOT-TEST-001',
            'remarks' => 'Initial stock intake',
        ]);

        $response = $this->get(route('vaccine-inventory.transactions'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('vaccine-inventory/transactions')
            ->has('transactions.data', 1)
            ->where('summary.total_received', 50)
            ->where('summary.total_transactions', 1)
        );
    }

    public function test_staff_can_adjust_inventory_stock_and_record_transaction(): void
    {
        $user = User::factory()->create([
            'role' => 'nurse',
            'must_change_password' => false,
        ]);
        $this->actingAs($user);

        $vaccine = Vaccine::create([
            'name' => 'Pentavalent Test',
            'category' => 'infant',
            'doses_required' => 3,
        ]);

        $batch = VaccineInventory::create([
            'vaccine_id' => $vaccine->id,
            'batch_number' => 'LOT-PENTA-001',
            'quantity' => 100,
            'date_received' => now()->toDateString(),
            'expiration_date' => now()->addYear()->toDateString(),
        ]);

        $response = $this->post(route('vaccine-inventory.adjust-stock', $batch->id), [
            'type' => 'adjustment',
            'quantity_change' => 10,
            'remarks' => 'Stock recount found 10 extra vials',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals(110, $batch->fresh()->quantity);

        $this->assertDatabaseHas('vaccine_inventory_transactions', [
            'vaccine_id' => $vaccine->id,
            'vaccine_inventory_id' => $batch->id,
            'transaction_type' => 'adjustment',
            'quantity_change' => 10,
            'balance_after' => 110,
            'batch_number' => 'LOT-PENTA-001',
        ]);
    }

    public function test_staff_can_log_wastage_and_decrease_stock(): void
    {
        $user = User::factory()->create([
            'role' => 'midwife',
            'must_change_password' => false,
        ]);
        $this->actingAs($user);

        $vaccine = Vaccine::create([
            'name' => 'Measles Test',
            'category' => 'infant',
            'doses_required' => 2,
        ]);

        $batch = VaccineInventory::create([
            'vaccine_id' => $vaccine->id,
            'batch_number' => 'LOT-MEASLES-001',
            'quantity' => 30,
            'date_received' => now()->toDateString(),
            'expiration_date' => now()->addMonths(3)->toDateString(),
        ]);

        $response = $this->post(route('vaccine-inventory.adjust-stock', $batch->id), [
            'type' => 'wastage',
            'quantity_change' => -5,
            'remarks' => 'Cold chain temperature excursion caused 5 spoiled doses',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals(25, $batch->fresh()->quantity);

        $this->assertDatabaseHas('vaccine_inventory_transactions', [
            'vaccine_id' => $vaccine->id,
            'vaccine_inventory_id' => $batch->id,
            'transaction_type' => 'wastage',
            'quantity_change' => -5,
            'balance_after' => 25,
            'batch_number' => 'LOT-MEASLES-001',
        ]);
    }

    public function test_adjustment_cannot_reduce_stock_below_zero(): void
    {
        $user = User::factory()->create([
            'role' => 'nurse',
            'must_change_password' => false,
        ]);
        $this->actingAs($user);

        $vaccine = Vaccine::create([
            'name' => 'Polio Test',
            'category' => 'infant',
            'doses_required' => 3,
        ]);

        $batch = VaccineInventory::create([
            'vaccine_id' => $vaccine->id,
            'batch_number' => 'LOT-OPV-001',
            'quantity' => 10,
            'date_received' => now()->toDateString(),
            'expiration_date' => now()->addMonths(4)->toDateString(),
        ]);

        $response = $this->post(route('vaccine-inventory.adjust-stock', $batch->id), [
            'type' => 'adjustment',
            'quantity_change' => -20,
            'remarks' => 'Attempting to deduct more than in stock',
        ]);

        $response->assertSessionHas('error');
        $this->assertEquals(10, $batch->fresh()->quantity);
    }
}

