<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification as NotificationFacade;
use Illuminate\Auth\Notifications\ResetPassword;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_forgot_password_returns_success_for_existing_email(): void
    {
        NotificationFacade::fake();

        $response = $this->postJson('/api/password/email', [
            'email' => 'madina7ali7@gmail.com',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'madina7ali7@gmail.com',
        ]);

        NotificationFacade::assertSentTo(
            User::where('email', 'madina7ali7@gmail.com')->firstOrFail(),
            ResetPassword::class
        );
    }

    public function test_forgot_password_returns_success_for_unknown_email_without_enumeration(): void
    {
        NotificationFacade::fake();

        $response = $this->postJson('/api/password/email', [
            'email' => 'unknown-user@example.com',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'unknown-user@example.com',
        ]);

        NotificationFacade::assertNothingSent();
    }

    public function test_forgot_password_does_not_return_server_error(): void
    {
        NotificationFacade::fake();

        $response = $this->postJson('/api/password/email', [
            'email' => 'manager@larte.com',
        ]);

        $this->assertNotSame(500, $response->status());
        $response->assertOk();
    }

    public function test_reset_password_with_valid_token(): void
    {
        $user = User::where('email', 'manager@larte.com')->firstOrFail();
        $plainToken = 'test-reset-token-' . uniqid();

        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($plainToken),
            'created_at' => now(),
        ]);

        $user->forceFill(['must_change_password' => true])->save();

        $response = $this->postJson('/api/password/reset', [
            'email' => $user->email,
            'token' => $plainToken,
            'password' => 'NewSecurePass123',
            'password_confirmation' => 'NewSecurePass123',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $user->refresh();
        $this->assertFalse((bool) $user->must_change_password);
        $this->assertTrue(Hash::check('NewSecurePass123', $user->password));

        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => $user->email,
        ]);
    }

    public function test_reset_password_rejects_invalid_token(): void
    {
        $user = User::where('email', 'manager@larte.com')->firstOrFail();

        $response = $this->postJson('/api/password/reset', [
            'email' => $user->email,
            'token' => 'invalid-token',
            'password' => 'NewSecurePass123',
            'password_confirmation' => 'NewSecurePass123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }
}
