<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\DefaultRolePermissions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_role_has_meetings_permissions_after_sync(): void
    {
        $this->seed();

        DefaultRolePermissions::assignAllRoles();

        $manager = User::where('email', 'manager@larte.com')->first();
        $this->assertNotNull($manager);

        $permissionNames = $manager->role->permissions()->pluck('name')->all();

        $this->assertContains('meetings.view', $permissionNames);
        $this->assertContains('meetings.create', $permissionNames);
    }
}
