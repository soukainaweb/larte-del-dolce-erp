<?php

namespace App\Support;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Support\Facades\Schema;

class DefaultRolePermissions
{
    public const BASELINE = [
        'dashboard.view',
        'notifications.view',
    ];

    /**
     * Default permission names per built-in role slug.
     * Admin uses '*' (all permissions).
     */
    public static function map(): array
    {
        return [
            'admin' => ['*'],
            'manager' => array_merge(self::BASELINE, [
                'reports.view',
                'orders.view', 'orders.create', 'orders.update', 'orders.delete',
                'customers.view', 'customers.create', 'customers.update', 'customers.delete',
                'products.view', 'products.create', 'products.update', 'products.delete',
                'categories.view', 'categories.create', 'categories.update', 'categories.delete',
                'inventory.view', 'inventory.create', 'inventory.update',
                'finance.view', 'payments.view', 'payments.create', 'expenses.view', 'expenses.create',
                'suppliers.view', 'suppliers.create', 'suppliers.update',
                'warehouses.view', 'warehouses.create', 'warehouses.update',
                'deliveries.view', 'deliveries.create', 'deliveries.update',
                'productions.view', 'productions.create', 'productions.update',
                'users.view',
            ]),
            'accountant' => array_merge(self::BASELINE, [
                'reports.view', 'finance.view',
                'payments.view', 'payments.create', 'payments.update',
                'expenses.view', 'expenses.create', 'expenses.update',
                'orders.view', 'customers.view',
            ]),
            'sales' => array_merge(self::BASELINE, [
                'orders.view', 'orders.create', 'orders.update',
                'customers.view', 'customers.create', 'customers.update',
                'products.view', 'deliveries.view',
            ]),
            'viewer' => self::viewerPermissions(),
            'delivery' => array_merge(self::BASELINE, [
                'deliveries.view', 'deliveries.update',
                'orders.view', 'customers.view',
            ]),
        ];
    }

    public static function viewerPermissions(): array
    {
        return [
            'dashboard.view', 'notifications.view', 'reports.view',
            'orders.view', 'customers.view', 'products.view', 'categories.view',
            'inventory.view', 'finance.view', 'payments.view', 'expenses.view',
            'suppliers.view', 'warehouses.view', 'deliveries.view', 'productions.view',
            'users.view', 'roles.view', 'permissions.view', 'settings.view',
        ];
    }

    public static function namesForRole(string $roleName): array
    {
        $slug = strtolower(trim($roleName));
        $map = self::map();

        return $map[$slug] ?? self::BASELINE;
    }

    /**
     * @param  array<string, int>  $permissionIdsByName
     */
    public static function syncRole(Role $role, array $permissionIdsByName): void
    {
        $names = self::namesForRole($role->name ?? '');

        if (in_array('*', $names, true)) {
            $ids = array_values($permissionIdsByName);
            $role->permissions()->sync($ids);
            if (Schema::hasColumn('roles', 'permissions_count')) {
                $role->update(['permissions_count' => count($ids)]);
            }

            return;
        }

        $ids = collect($names)
            ->map(fn (string $name) => $permissionIdsByName[$name] ?? null)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $role->permissions()->sync($ids);

        if (Schema::hasColumn('roles', 'permissions_count')) {
            $role->update(['permissions_count' => count($ids)]);
        }
    }

    public static function assignAllRoles(): void
    {
        $permissionIdsByName = Permission::pluck('id', 'name')->all();

        if ($permissionIdsByName === []) {
            return;
        }

        Role::query()->each(function (Role $role) use ($permissionIdsByName) {
            self::syncRole($role, $permissionIdsByName);
        });
    }
}
