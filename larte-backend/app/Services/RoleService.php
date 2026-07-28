<?php

namespace App\Services;

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
        return Role::create($data);
    }

    public function update(Role $role, array $data): Role
    {
        $role->update($data);

        return $role->fresh();
    }

    public function delete(Role $role): void
    {
        if ($role->users()->count() > 0) {
            throw new \RuntimeException('Impossible de supprimer un rôle assigné à des utilisateurs');
        }

        $role->delete();
    }

    public function toggleStatus(Role $role, string $status): Role
    {
        $role->update(['status' => $status]);

        return $role->fresh();
    }

    public function duplicate(Role $role): Role
    {
        $newRole = $role->replicate();
        $newRole->name = $role->name . '_copy_' . time();
        $newRole->display_name = $role->display_name . ' (copie)';
        $newRole->save();
        $newRole->permissions()->sync($role->permissions()->pluck('id'));

        return $newRole->load('permissions');
    }

    public function statistics(): array
    {
        return [
            'total' => Role::count(),
            'active' => Role::where('status', 'active')->count(),
            'inactive' => Role::where('status', 'inactive')->count(),
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
