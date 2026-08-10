<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Support\DefaultRolePermissions;
use App\Support\EnsureFactorySetup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class EnsureFactorySetupTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_factory_role_and_user_with_forced_password_change(): void
    {
        $result = EnsureFactorySetup::run('FactoryPass123!');

        $this->assertTrue($result['role_created']);
        $this->assertTrue($result['user_created']);

        $role = Role::where('name', EnsureFactorySetup::ROLE_NAME)->with('permissions')->firstOrFail();
        $this->assertSame('Factory', $role->display_name);
        $this->assertSame('active', $role->status);

        foreach (DefaultRolePermissions::namesForRole('factory') as $permission) {
            $this->assertTrue(
                $role->permissions->contains('name', $permission),
                "Missing factory permission: {$permission}"
            );
        }

        foreach (['users.view', 'roles.view', 'customers.create', 'orders.approve.manager'] as $forbidden) {
            $this->assertFalse(
                $role->permissions->contains('name', $forbidden),
                "Factory must not have {$forbidden}"
            );
        }

        $user = User::where('email', EnsureFactorySetup::USER_EMAIL)->firstOrFail();
        $this->assertSame($role->id, $user->role_id);
        $this->assertTrue($user->must_change_password);
        $this->assertTrue(Hash::check('FactoryPass123!', $user->password));
    }

    public function test_is_idempotent_and_does_not_change_existing_password(): void
    {
        EnsureFactorySetup::run('FirstFactoryPass123!');
        $user = User::where('email', EnsureFactorySetup::USER_EMAIL)->firstOrFail();
        $originalHash = $user->password;

        $result = EnsureFactorySetup::run('DifferentFactoryPass999!');

        $this->assertFalse($result['role_created']);
        $this->assertFalse($result['user_created']);
        $this->assertSame($originalHash, $user->fresh()->password);
        $this->assertTrue(Hash::check('FirstFactoryPass123!', $user->fresh()->password));
    }

    public function test_artisan_command_never_prints_password(): void
    {
        $this->artisan('erp:ensure-factory', ['--password' => 'CmdFactoryPass123!'])
            ->assertSuccessful()
            ->doesntExpectOutputToContain('CmdFactoryPass123!')
            ->doesntExpectOutputToContain('password:');

        $this->assertNotNull(User::where('email', EnsureFactorySetup::USER_EMAIL)->first());
    }

    public function test_generates_password_when_env_not_set_and_user_is_new(): void
    {
        $result = EnsureFactorySetup::run(null);

        $this->assertTrue($result['user_created']);
        $this->assertNotNull($result['temporary_password']);
        $this->assertNotSame('', $result['temporary_password']);

        $user = User::where('email', EnsureFactorySetup::USER_EMAIL)->firstOrFail();
        $this->assertTrue($user->must_change_password);
        $this->assertTrue(Hash::check($result['temporary_password'], $user->password));
    }
}
