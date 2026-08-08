<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class RoleService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Role::withCount('users');

        if (!empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('name', 'LIKE', "%{$term}%")
                    ->orWhere('display_name', 'LIKE', "%{$term}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Role
    {
        $role = Role::create($data);

        ActivityLogger::logModelEvent($role, 'created', sprintf('Rôle %s créé', $role->display_name ?? $role->name));
        app(EntityCreatedNotificationService::class)->notify('role', $role);

        return $role;
    }

    public function update(Role $role, array $data): Role
    {
        $role->update($data);

        ActivityLogger::logModelEvent($role, 'updated', sprintf('Rôle %s mis à jour', $role->display_name ?? $role->name));

        return $role->fresh();
    }

    public function delete(Role $role): void
    {
        if ($role->users()->count() > 0) {
            throw new \RuntimeException('Impossible de supprimer un rôle assigné à des utilisateurs');
        }

        $name = $role->display_name ?? $role->name;
        $role->delete();

        ActivityLogger::log(
            module: 'roles',
            action: 'deleted',
            description: sprintf('Rôle %s supprimé', $name),
        );
    }

    public function toggleStatus(Role $role, string $status): Role
    {
        $role->update(['status' => $status]);

        ActivityLogger::log(
            module: 'roles',
            action: 'status_changed',
            description: sprintf('Statut rôle %s changé en %s', $role->display_name ?? $role->name, $status),
        );

        return $role->fresh();
    }

    public function duplicate(Role $role): Role
    {
        $newRole = $role->replicate();
        $newRole->name = $role->name . '_copy_' . time();
        $newRole->display_name = $role->display_name . ' (copie)';
        $newRole->save();
        $newRole->permissions()->sync($role->permissions()->pluck('id'));

        ActivityLogger::log(
            module: 'roles',
            action: 'duplicated',
            description: sprintf('Rôle %s dupliqué', $role->display_name ?? $role->name),
        );

        return $newRole->load('permissions');
    }

    public function statistics(): array
    {
        return [
            'total' => Role::count(),
            'active' => Role::where('status', 'active')->count(),
            'inactive' => Role::where('status', 'inactive')->count(),
            'total_roles' => Role::count(),
            'total_permissions' => Permission::count(),
            'total_users' => User::count(),
            'active_permissions' => Permission::where('status', 'active')->count(),
            'pending_requests' => 0,
        ];
    }

    public function export()
    {
        return Role::withCount('users')->get();
    }

    public function statuses(): array
    {
        return ['active', 'inactive'];
    }

    public function getPermissions(Role $role)
    {
        return $role->permissions;
    }

    public function updatePermissions(Role $role, array $permissionIds): Role
    {
        $role->permissions()->sync($permissionIds);
        $role->update(['permissions_count' => count($permissionIds)]);

        ActivityLogger::log(
            module: 'roles',
            action: 'permissions_updated',
            description: sprintf('Permissions du rôle %s mises à jour', $role->display_name ?? $role->name),
        );

        return $role->fresh()->load('permissions');
    }

    public function getUsers(Role $role)
    {
        return $role->users()->paginate(10);
    }

    public function addUser(Role $role, int $userId): User
    {
        $user = User::findOrFail($userId);
        $user->update(['role_id' => $role->id]);

        return $user->fresh()->load('role');
    }

    public function removeUser(Role $role, int $userId): void
    {
        $user = User::where('id', $userId)->where('role_id', $role->id)->firstOrFail();
        $user->update(['role_id' => null]);
    }
}
