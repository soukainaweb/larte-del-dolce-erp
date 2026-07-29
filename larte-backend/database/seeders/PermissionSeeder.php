<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Support\DefaultRolePermissions;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissionIdsByName = DefaultRolePermissions::ensurePermissionsExist();

        Role::query()->each(function (Role $role) use ($permissionIdsByName) {
            DefaultRolePermissions::syncRole($role, $permissionIdsByName);
        });
    }
}
