<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Permissions\StorePermissionRequest;
use App\Http\Requests\Permissions\UpdatePermissionRequest;
use App\Models\Permission;
use App\Services\PermissionService;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function __construct(private PermissionService $permissionService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Permission::class);

        return $this->success($this->permissionService->list($request->all()));
    }

    public function store(StorePermissionRequest $request)
    {
        $this->authorize('create', Permission::class);

        return $this->success($this->permissionService->create($request->validated()), 'Permission créée', 201);
    }

    public function show(Permission $permission)
    {
        $this->authorize('view', $permission);

        return $this->success($permission->load('roles'));
    }

    public function update(UpdatePermissionRequest $request, Permission $permission)
    {
        $this->authorize('update', $permission);

        return $this->success($this->permissionService->update($permission, $request->validated()), 'Permission mise à jour');
    }

    public function destroy(Permission $permission)
    {
        $this->authorize('delete', $permission);

        $this->permissionService->delete($permission);

        return $this->success(null, 'Permission supprimée');
    }

    public function toggleStatus(Request $request, Permission $permission)
    {
        $this->authorize('update', $permission);

        $request->validate(['status' => 'required|in:active,inactive']);

        return $this->success($this->permissionService->toggleStatus($permission, $request->status), 'Statut mis à jour');
    }

    public function modules()
    {
        $this->authorize('viewAny', Permission::class);

        return $this->success($this->permissionService->modules());
    }

    public function grouped()
    {
        $this->authorize('viewAny', Permission::class);

        return $this->success($this->permissionService->grouped());
    }

    public function statuses()
    {
        return $this->success($this->permissionService->statuses());
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Permission::class);

        return $this->success($this->permissionService->export());
    }
}
