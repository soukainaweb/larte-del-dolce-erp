<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MustChangePasswordTest extends TestCase
{
    use RefreshDatabase;

    protected function adminUser(): User
    {
        return User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
    }

    protected function managerUser(): User
    {
        return User::where('email', 'manager@larte.com')->firstOrFail();
    }

    protected function createSalesUser(string $email = 'must.change@example.com'): array
    {
        $admin = $this->adminUser();
        $salesRole = Role::where('name', 'sales')->firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/users', [
            'first_name' => 'Must',
            'last_name' => 'Change',
            'email' => $email,
            'role_id' => $salesRole->id,
            'status' => 'active',
        ]);

        $response->assertCreated();

        return [
            'temporary_password' => $response->json('data.temporary_password'),
            'user_id' => $response->json('data.id'),
        ];
    }

    public function test_new_user_has_must_change_password_true(): void
    {
        $this->seed();

        $created = $this->createSalesUser();

        $this->assertDatabaseHas('users', [
            'email' => 'must.change@example.com',
            'must_change_password' => true,
        ]);

        $this->assertNotEmpty($created['temporary_password']);
    }

    public function test_login_response_includes_must_change_password(): void
    {
        $this->seed();

        $created = $this->createSalesUser('login.flag@example.com');

        $response = $this->postJson('/api/login', [
            'email' => 'login.flag@example.com',
            'password' => $created['temporary_password'],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.user.must_change_password', true);
    }

    public function test_existing_admin_and_manager_do_not_require_password_change(): void
    {
        $this->seed();

        $admin = $this->adminUser();
        $manager = $this->managerUser();

        $this->assertFalse($admin->must_change_password);
        $this->assertFalse($manager->must_change_password);

        $adminLogin = $this->postJson('/api/login', [
            'email' => 'madina7ali7@gmail.com',
            'password' => '123456',
        ]);
        $adminLogin->assertOk()
            ->assertJsonPath('data.user.must_change_password', false);

        $managerLogin = $this->postJson('/api/login', [
            'email' => 'manager@larte.com',
            'password' => '123456',
        ]);
        $managerLogin->assertOk()
            ->assertJsonPath('data.user.must_change_password', false);
    }

    protected function loginAs(string $email, string $password): User
    {
        $response = $this->postJson('/api/login', [
            'email' => $email,
            'password' => $password,
        ]);

        $response->assertOk();

        return User::whereRaw('LOWER(email) = ?', [mb_strtolower($email)])->firstOrFail();
    }

    public function test_protected_api_blocked_until_password_changed(): void
    {
        $this->seed();

        $created = $this->createSalesUser('blocked.until@example.com');
        $user = $this->loginAs('blocked.until@example.com', $created['temporary_password']);

        $this->assertTrue($user->must_change_password);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/orders')
            ->assertForbidden();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/user')
            ->assertOk();
    }

    public function test_change_password_with_temporary_password_succeeds(): void
    {
        $this->seed();

        $created = $this->createSalesUser('change.flow@example.com');
        $temporaryPassword = $created['temporary_password'];
        $user = $this->loginAs('change.flow@example.com', $temporaryPassword);
        $newPassword = 'MySecurePass1';

        $change = $this->actingAs($user, 'sanctum')
            ->putJson('/api/profile/password', [
                'current_password' => $temporaryPassword,
                'password' => $newPassword,
                'password_confirmation' => $newPassword,
            ]);

        $change->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.must_change_password', false);

        $user = User::where('email', 'change.flow@example.com')->firstOrFail();
        $this->assertFalse($user->must_change_password);
        $this->assertTrue(Hash::check($newPassword, $user->password));
    }

    public function test_old_temporary_password_no_longer_works_after_change(): void
    {
        $this->seed();

        $created = $this->createSalesUser('old.temp@example.com');
        $temporaryPassword = $created['temporary_password'];
        $newPassword = 'AnotherSecure1';
        $user = $this->loginAs('old.temp@example.com', $temporaryPassword);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/profile/password', [
                'current_password' => $temporaryPassword,
                'password' => $newPassword,
                'password_confirmation' => $newPassword,
            ])
            ->assertOk();

        $this->postJson('/api/login', [
            'email' => 'old.temp@example.com',
            'password' => $temporaryPassword,
        ])->assertStatus(422);

        $this->postJson('/api/login', [
            'email' => 'old.temp@example.com',
            'password' => $newPassword,
        ])->assertOk();
    }

    public function test_wrong_current_password_is_rejected(): void
    {
        $this->seed();

        $created = $this->createSalesUser('wrong.current@example.com');
        $user = $this->loginAs('wrong.current@example.com', $created['temporary_password']);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/profile/password', [
                'current_password' => 'WrongPassword1',
                'password' => 'NewSecurePass1',
                'password_confirmation' => 'NewSecurePass1',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_weak_password_is_rejected(): void
    {
        $this->seed();

        $created = $this->createSalesUser('weak.pass@example.com');
        $user = $this->loginAs('weak.pass@example.com', $created['temporary_password']);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/profile/password', [
                'current_password' => $created['temporary_password'],
                'password' => 'short',
                'password_confirmation' => 'short',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_password_confirmation_mismatch_is_rejected(): void
    {
        $this->seed();

        $created = $this->createSalesUser('mismatch@example.com');
        $user = $this->loginAs('mismatch@example.com', $created['temporary_password']);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/profile/password', [
                'current_password' => $created['temporary_password'],
                'password' => 'ValidPass123',
                'password_confirmation' => 'ValidPass124',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_new_password_must_differ_from_temporary_password(): void
    {
        $this->seed();

        $created = $this->createSalesUser('same.pass@example.com');
        $temporaryPassword = $created['temporary_password'];
        $user = $this->loginAs('same.pass@example.com', $temporaryPassword);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/profile/password', [
                'current_password' => $temporaryPassword,
                'password' => $temporaryPassword,
                'password_confirmation' => $temporaryPassword,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_admin_can_reset_user_password_and_user_must_change_on_next_login(): void
    {
        $this->seed();

        $admin = $this->adminUser();
        $created = $this->createSalesUser('admin.reset@example.com');
        $userId = $created['user_id'];

        $change = $this->actingAs($admin, 'sanctum')
            ->putJson('/api/profile/password', [
                'current_password' => '123456',
                'password' => 'AdminOwnPass1',
                'password_confirmation' => 'AdminOwnPass1',
            ]);

        if ($change->status() !== 200) {
            // Admin may not need to change; continue with reset test
        }

        $reset = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/users/{$userId}/reset-password");

        $reset->assertOk()
            ->assertJsonPath('success', true);

        $temporaryPassword = $reset->json('data.temporary_password');
        $this->assertNotEmpty($temporaryPassword);

        $user = User::findOrFail($userId);
        $this->assertTrue($user->must_change_password);

        $login = $this->postJson('/api/login', [
            'email' => 'admin.reset@example.com',
            'password' => $temporaryPassword,
        ]);

        $login->assertOk()
            ->assertJsonPath('data.user.must_change_password', true);
    }

    public function test_temporary_password_not_in_get_users_after_create(): void
    {
        $this->seed();

        $admin = $this->adminUser();
        $this->createSalesUser('hidden.pass@example.com');

        $list = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/users?search=hidden.pass');

        $list->assertOk();

        foreach ($list->json('data.data') as $user) {
            $this->assertArrayNotHasKey('temporary_password', $user);
        }
    }
}
