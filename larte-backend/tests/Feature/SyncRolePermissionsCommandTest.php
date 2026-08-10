<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Support\DefaultRolePermissions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SyncRolePermissionsCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_assigns_expected_workflow_permissions(): void
    {
        $this->seed();

        $this->artisan('erp:sync-role-permissions')
            ->assertSuccessful()
            ->expectsOutputToContain('Role permissions synchronized successfully');

        $expectations = [
            'manager' => ['orders.approve.manager'],
            'accountant' => ['orders.approve.accountant'],
            'sales' => ['orders.pickup', 'orders.deliver', 'profile.availability.update'],
            'responsible' => ['orders.approve.responsible'],
        ];

        foreach ($expectations as $roleName => $permissions) {
            $role = Role::where('name', $roleName)->with('permissions')->firstOrFail();

            foreach ($permissions as $permission) {
                $this->assertTrue(
                    $role->permissions->contains('name', $permission),
                    "Missing {$permission} on {$roleName}"
                );
            }
        }
    }

    public function test_responsible_has_business_permissions_without_admin_access(): void
    {
        $this->seed();

        $this->artisan('erp:sync-role-permissions')->assertSuccessful();

        $role = Role::where('name', 'responsible')->with('permissions')->firstOrFail();
        $names = $role->permissions->pluck('name')->all();
        $expected = DefaultRolePermissions::namesForRole('responsible');

        foreach ($expected as $permission) {
            $this->assertContains($permission, $names, "Missing responsible permission: {$permission}");
        }

        foreach (['users.view', 'roles.view', 'permissions.view', 'settings.view'] as $forbidden) {
            $this->assertNotContains($forbidden, $names, "Responsible must not have {$forbidden}");
        }
    }

    public function test_command_is_idempotent(): void
    {
        $this->seed();

        $this->artisan('erp:sync-role-permissions')->assertSuccessful();
        $manager = Role::where('name', 'manager')->with('permissions')->firstOrFail();
        $firstCount = $manager->permissions->count();

        $this->artisan('erp:sync-role-permissions')->assertSuccessful();

        $this->assertSame($firstCount, $manager->fresh(['permissions'])->permissions->count());
        $this->assertTrue(
            $manager->fresh(['permissions'])->permissions->contains('name', 'orders.approve.manager')
        );
    }
}
