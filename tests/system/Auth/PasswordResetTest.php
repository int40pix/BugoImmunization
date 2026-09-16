<?php

namespace Tests\Feature\Auth;

use App\Models\PasswordResetRequest;
use App\Models\Role;
use App\Models\User;
use App\Notifications\AccountRecoveryRequestedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['id' => 1, 'name' => 'admin', 'display_name' => 'Administrator']);
        Role::firstOrCreate(['id' => 2, 'name' => 'nurse', 'display_name' => 'Nurse']);
        Role::firstOrCreate(['id' => 3, 'name' => 'midwife', 'display_name' => 'Midwife']);
        Role::firstOrCreate(['id' => 4, 'name' => 'bhw', 'display_name' => 'Barangay Health Worker']);
        Role::firstOrCreate(['id' => 5, 'name' => 'guardian', 'display_name' => 'Parent / Guardian']);
    }

    public function test_reset_password_link_screen_can_be_rendered()
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_guardian_can_submit_password_reset_request()
    {
        Notification::fake();

        $admin = User::factory()->create([
            'role_id' => 1,
            'role' => 'admin',
            'status' => 'active',
        ]);

        $guardian = User::factory()->create([
            'role_id' => 5,
            'role' => 'guardian',
            'account_status' => 'active',
            'password' => bcrypt('ValidPassword123!'),
        ]);

        $response = $this->from('/forgot-password')->post('/forgot-password', [
            'email' => $guardian->email,
        ]);

        $response->assertRedirect('/forgot-password');
        $response->assertSessionHas('status', 'If the account is eligible for password recovery, your request has been submitted to the administrator.');

        $this->assertDatabaseHas('password_reset_requests', [
            'user_id' => $guardian->id,
            'status' => 'pending',
        ]);

        Notification::assertSentTo($admin, AccountRecoveryRequestedNotification::class);
    }

    public function test_staff_can_submit_password_reset_request_and_admin_is_notified()
    {
        Notification::fake();

        $admin = User::factory()->create([
            'role_id' => 1,
            'role' => 'admin',
            'status' => 'active',
        ]);

        $nurse = User::factory()->create([
            'role_id' => 2,
            'role' => 'nurse',
            'account_status' => 'active',
            'status' => 'active',
            'password' => bcrypt('NurseSecret123!'),
        ]);

        $otherNurse = User::factory()->create([
            'role_id' => 2,
            'role' => 'nurse',
            'status' => 'active',
        ]);

        $response = $this->from('/forgot-password')->post('/forgot-password', [
            'email' => $nurse->email,
        ]);

        $response->assertRedirect('/forgot-password');
        $response->assertSessionHas('status');

        $this->assertDatabaseHas('password_reset_requests', [
            'user_id' => $nurse->id,
            'status' => 'pending',
        ]);

        // Only admin should receive the notification
        Notification::assertSentTo($admin, AccountRecoveryRequestedNotification::class);
        Notification::assertNotSentTo($otherNurse, AccountRecoveryRequestedNotification::class);
    }

    public function test_unknown_email_does_not_create_password_reset_request()
    {
        $response = $this->from('/forgot-password')->post('/forgot-password', [
            'email' => 'unknown@example.com',
        ]);

        $response->assertRedirect('/forgot-password');
        $this->assertDatabaseCount('password_reset_requests', 0);
    }

    public function test_admin_can_resolve_password_reset_request_for_staff()
    {
        $admin = User::factory()->create([
            'role_id' => 1,
            'role' => 'admin',
            'status' => 'active',
        ]);

        $nurse = User::factory()->create([
            'role_id' => 2,
            'role' => 'nurse',
            'account_status' => 'active',
            'status' => 'active',
        ]);

        $resetRequest = PasswordResetRequest::create([
            'user_id' => $nurse->id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($admin)->post("/admin/password-reset-requests/{$resetRequest->id}/resolve");

        $response->assertRedirect();
        $response->assertSessionHas('temporary_password');
        $response->assertSessionHas('temporary_password_request_id', $resetRequest->id);

        $this->assertDatabaseHas('password_reset_requests', [
            'id' => $resetRequest->id,
            'status' => 'resolved',
            'resolved_by' => $admin->id,
        ]);

        $nurse->refresh();
        $this->assertTrue($nurse->must_change_password);
        $this->assertEquals('temporary', $nurse->account_status);
    }

    public function test_admin_can_directly_reset_staff_password()
    {
        $admin = User::factory()->create([
            'role_id' => 1,
            'role' => 'admin',
            'status' => 'active',
        ]);

        $bhw = User::factory()->create([
            'role_id' => 4,
            'role' => 'bhw',
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin)->post("/staff/{$bhw->id}/reset-password");

        $response->assertRedirect();
        $response->assertSessionHas('temporary_password');

        $bhw->refresh();
        $this->assertTrue($bhw->must_change_password);
        $this->assertEquals('temporary', $bhw->account_status);
    }

    public function test_staff_with_temporary_password_can_change_password_and_redirects_to_dashboard()
    {
        $nurse = User::factory()->create([
            'role_id' => 2,
            'role' => 'nurse',
            'status' => 'active',
            'account_status' => 'temporary',
            'must_change_password' => true,
        ]);

        $response = $this->actingAs($nurse)->get('/dashboard');
        $response->assertRedirect('/change-temporary-password');

        $response = $this->actingAs($nurse)->post('/change-temporary-password', [
            'password' => 'NewPermanentPassword123!',
            'password_confirmation' => 'NewPermanentPassword123!',
        ]);

        $response->assertRedirect('/dashboard');

        $nurse->refresh();
        $this->assertFalse($nurse->must_change_password);
        $this->assertEquals('active', $nurse->account_status);
    }

    public function test_guardian_with_temporary_password_can_change_password_and_redirects_to_guardian_dashboard()
    {
        $guardian = User::factory()->create([
            'role_id' => 5,
            'role' => 'guardian',
            'status' => 'active',
            'account_status' => 'temporary',
            'must_change_password' => true,
        ]);

        $response = $this->actingAs($guardian)->post('/change-temporary-password', [
            'password' => 'NewGuardianPassword123!',
            'password_confirmation' => 'NewGuardianPassword123!',
        ]);

        $response->assertRedirect('/guardian/dashboard');

        $guardian->refresh();
        $this->assertFalse($guardian->must_change_password);
        $this->assertEquals('active', $guardian->account_status);
    }
}
