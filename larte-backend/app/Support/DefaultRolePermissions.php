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
     * Canonical permission modules/actions for the ERP.
     *
     * @return array<string, list<string>>
     */
    public static function moduleDefinitions(): array
    {
        return [
            'dashboard' => ['view'],
            'orders' => ['view', 'create', 'update', 'delete', 'approve.accountant', 'approve.manager', 'approve.responsible'],
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
            'meetings' => ['view', 'create', 'update', 'delete'],
            'samples' => ['view', 'create', 'update', 'delete'],
            'waste_returns' => ['view', 'create', 'update', 'delete'],
            'purchases' => ['view', 'create', 'update', 'delete'],
        ];
    }

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
                'orders.view', 'orders.create', 'orders.update', 'orders.delete', 'orders.approve.manager',
                'customers.view', 'customers.create', 'customers.update', 'customers.delete',
                'products.view', 'products.create', 'products.update', 'products.delete',
                'categories.view', 'categories.create', 'categories.update', 'categories.delete',
                'inventory.view', 'inventory.create', 'inventory.update',
                'finance.view', 'payments.view', 'payments.create', 'expenses.view', 'expenses.create',
                'suppliers.view', 'suppliers.create', 'suppliers.update',
                'warehouses.view', 'warehouses.create', 'warehouses.update',
                'deliveries.view', 'deliveries.create', 'deliveries.update',
                'productions.view', 'productions.create', 'productions.update',
                'meetings.view', 'meetings.create', 'meetings.update', 'meetings.delete',
                'samples.view', 'samples.create', 'samples.update', 'samples.delete',
                'waste_returns.view', 'waste_returns.create', 'waste_returns.update',
                'purchases.view', 'purchases.create', 'purchases.update',
                'users.view', 'users.create', 'users.update',
            ]),
            'accountant' => array_merge(self::BASELINE, [
                'reports.view', 'finance.view',
                'payments.view', 'payments.create', 'payments.update',
            'expenses.view', 'expenses.create', 'expenses.update',
                'waste_returns.view', 'waste_returns.create', 'waste_returns.update',
                'purchases.view', 'purchases.create', 'purchases.update',
                'orders.view', 'orders.approve.accountant', 'customers.view',
            ]),
            'sales' => array_merge(self::BASELINE, [
                'orders.view', 'orders.create',
                'customers.view', 'customers.create', 'customers.update',
                'meetings.view', 'meetings.create', 'meetings.update',
                'samples.view', 'samples.create', 'samples.update',
            ]),
            'viewer' => self::viewerPermissions(),
            'delivery' => array_merge(self::BASELINE, [
                'deliveries.view', 'deliveries.update',
                'orders.view', 'customers.view',
            ]),
            'responsible' => array_merge(self::BASELINE, [
                'reports.view',
                'orders.view', 'orders.approve.responsible',
                'customers.view', 'productions.view',
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
            'meetings.view', 'samples.view', 'waste_returns.view', 'purchases.view',
            'users.view', 'roles.view', 'permissions.view', 'settings.view',
        ];
    }

    public static function isBaselinePermission(string $permission): bool
    {
        return in_array($permission, self::BASELINE, true);
    }

    public static function namesForRole(string $roleName): array
    {
        $slug = strtolower(trim($roleName));
        $map = self::map();

        return $map[$slug] ?? self::BASELINE;
    }

    /**
     * Create any missing permissions and return the full name => id map.
     *
     * @return array<string, int>
     */
    public static function ensurePermissionsExist(): array
    {
        $permissionIdsByName = Permission::pluck('id', 'name')->all();

        foreach (self::moduleDefinitions() as $module => $actions) {
            foreach ($actions as $action) {
                $name = "{$module}.{$action}";

                if (isset($permissionIdsByName[$name])) {
                    continue;
                }

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

        return $permissionIdsByName;
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
        if (!Schema::hasTable('permissions') || !Schema::hasTable('permission_role') || !Schema::hasTable('roles')) {
            return;
        }

        $permissionIdsByName = self::ensurePermissionsExist();

        Role::query()->each(function (Role $role) use ($permissionIdsByName) {
            self::syncRole($role, $permissionIdsByName);
        });
    }
}
