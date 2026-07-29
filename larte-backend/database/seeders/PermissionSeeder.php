<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Support\DefaultRolePermissions;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            'dashboard' => ['view'],
            'orders' => ['view', 'create', 'update', 'delete'],
            'customers' => ['view', 'create', 'update', 'delete'],
            'products' => ['view', 'create', 'update', 'delete'],
            'categories' => ['view', 'create', 'update', 'delete'],
            'inventory' => ['view', 'create', 'update', 'delete'],
            'finance' => ['view', 'create', 'update', 'delete'],
            'payments' => ['view', 'create', 'update', 'delete'],
            'expenses' => ['view', 'create', 'update', 'delete'],
            'suppliers' => ['view', 'create', 'update', 'delete'],
            'warehouses' => ['view', 'create', 'update', 'delete'],
            'deliveries' => ['view', 'create', 'update', 'delete'],
            'productions' => ['view', 'create', 'update', 'delete'],
            'notifications' => ['view', 'create', 'update', 'delete'],
            'reports' => ['view'],
            'users' => ['view', 'create', 'update', 'delete'],
            'roles' => ['view', 'create', 'update', 'delete'],
            'permissions' => ['view', 'create', 'update', 'delete'],
            'settings' => ['view', 'update'],
        ];

        $permissionIdsByName = [];

        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                $name = "{$module}.{$action}";
                $permission = Permission::updateOrCreate(
                    ['name' => $name],
                    [
                        'display_name' => ucfirst($action) . ' ' . ucfirst($module),
                        'module' => $module,
                        'status' => 'active',
                    ]
                );
                $permissionIdsByName[$name] = $permission->id;
            }
        }

        Role::query()->each(function (Role $role) use ($permissionIdsByName) {
            DefaultRolePermissions::syncRole($role, $permissionIdsByName);
        });
    }
}
