<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Support\DefaultRolePermissions;
use App\Support\EnsureResponsibleSetup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class EnsureResponsibleSetupTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_responsible_role_and_user(): void
    {
        $result = EnsureResponsibleSetup::run('SecurePass123!');

        $this->assertTrue($result['role_created']);
        $this->assertTrue($result['user_created']);

        $role = Role::where('name', 'responsible')->first();
        $this->assertNotNull($role);
        $this->assertSame('Responsible', $role->display_name);
        $this->assertSame('Final order approval authority', $role->description);
        $this->assertSame('active', $role->status);
        $this->assertFalse($role->is_system);

        $user = User::where('email', EnsureResponsibleSetup::USER_EMAIL)->first();
        $this->assertNotNull($user);
        $this->assertSame($role->id, $user->role_id);
        $this->assertSame('Responsible', $user->first_name);
        $this->assertSame('User', $user->last_name);
        $this->assertSame('online', $user->status);
        $this->assertTrue(Hash::check('SecurePass123!', $user->password));
    }

    public function test_is_idempotent_and_does_not_change_existing_password(): void
    {
        EnsureResponsibleSetup::run('FirstPassword123!');
        $user = User::where('email', EnsureResponsibleSetup::USER_EMAIL)->firstOrFail();
        $originalHash = $user->password;

        $result = EnsureResponsibleSetup::run('DifferentPassword999!');

        $this->assertFalse($result['role_created']);
        $this->assertFalse($result['user_created']);
        $this->assertSame($originalHash, $user->fresh()->password);
        $this->assertTrue(Hash::check('FirstPassword123!', $user->fresh()->password));
    }

    public function test_syncs_responsible_role_permissions(): void
    {
        EnsureResponsibleSetup::run();

        $role = Role::where('name', 'responsible')->with('permissions')->firstOrFail();
        $expected = DefaultRolePermissions::namesForRole('responsible');

        foreach ($expected as $permission) {
            $this->assertTrue(
                $role->permissions->contains('name', $permission),
                "Missing permission: {$permission}"
            );
        }
    }

    public function test_artisan_command_succeeds(): void
    {
        $this->artisan('erp:ensure-responsible', ['--password' => 'CmdPass123!'])
            ->assertSuccessful();

        $this->assertNotNull(Role::where('name', 'responsible')->first());
        $this->assertNotNull(User::where('email', EnsureResponsibleSetup::USER_EMAIL)->first());
    }
}
