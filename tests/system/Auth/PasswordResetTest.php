<?php

namespace Tests\Feature\Auth;

use App\Models\PasswordResetRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_screen_can_be_rendered()
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_guardian_can_submit_password_reset_request()
    {
        $guardianRole = Role::where('name', 'guardian')->first();

        $user = User::factory()->create([
            'role_id' => $guardianRole->id,
            'role' => 'guardian',
            'account_status' => 'active',
            'password' => bcrypt('ValidPassword123!'),
        ]);

        $response = $this->from('/forgot-password')->post('/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertRedirect('/forgot-password');
        $response->assertSessionHas('status', 'If the account is eligible for password recovery, your request has been submitted to the administrator.');

        $this->assertDatabaseHas('password_reset_requests', [
            'user_id' => $user->id,
            'status' => 'pending',
        ]);
    }

    public function test_unknown_email_does_not_create_password_reset_request()
    {
        $response = $this->from('/forgot-password')->post('/forgot-password', [
            'email' => 'unknown@example.com',
        ]);

        $response->assertRedirect('/forgot-password');
        $this->assertDatabaseCount('password_reset_requests', 0);
    }
}
