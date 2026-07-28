<?php

namespace App\Services;

use App\Models\Permission;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PermissionService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Permission::query();

        if (!empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('display_name', 'like', "%{$term}%");
            });
        }

        if (!empty($filters['module'])) {
            $query->where('module', $filters['module']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($filters['per_page'] ?? 50);
    }

    public function create(array $data): Permission
    {
        return Permission::create($data);
    }

    public function update(Permission $permission, array $data): Permission
    {
        $permission->update($data);

        return $permission->fresh();
    }

    public function delete(Permission $permission): void
    {
        $permission->delete();
    }

    public function toggleStatus(Permission $permission, string $status): Permission
    {
        $permission->update(['status' => $status]);

        return $permission->fresh();
    }

    public function modules()
    {
        return Permission::query()->distinct()->pluck('module');
    }

    public function grouped()
    {
        return Permission::active()->orderBy('module')->get()->groupBy('module');
    }

    public function statuses(): array
    {
        return ['active', 'inactive'];
    }

    public function export()
    {
        return Permission::orderBy('module')->get();
    }
}
