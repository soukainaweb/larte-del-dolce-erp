<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Roles\StoreRoleRequest;
use App\Http\Requests\Roles\UpdateRoleRequest;
use App\Models\Role;
use App\Models\User;
use App\Services\RoleService;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function __construct(private RoleService $roleService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Role::class);

        return $this->success($this->roleService->list($request->all()));
    }

    public function store(StoreRoleRequest $request)
    {
        $this->authorize('create', Role::class);

        return $this->success($this->roleService->create($request->validated()), 'Rôle créé avec succès', 201);
    }

    public function show(Role $role)
    {
        $this->authorize('view', $role);

        return $this->success($role);
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $this->authorize('update', $role);

        return $this->success($this->roleService->update($role, $request->validated()), 'Rôle mis à jour avec succès');
    }

    public function destroy(Role $role)
    {
        $this->authorize('delete', $role);

        try {
            $this->roleService->delete($role);

            return $this->success(null, 'Rôle supprimé avec succès');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), [], 403);
        }
    }

    public function getUsers(Role $role)
    {
        $this->authorize('view', $role);

        return $this->success($this->roleService->getUsers($role));
    }

    public function addUser(Request $request, Role $role)
    {
        $this->authorize('update', $role);

        $request->validate(['user_id' => 'required|exists:users,id']);

        $this->roleService->addUser($role, $request->user_id);

        return $this->success(null, 'Utilisateur ajouté au rôle avec succès');
    }

    public function removeUser(Role $role, $userId)
    {
        $this->authorize('update', $role);

        $this->roleService->removeUser($role, (int) $userId);

        return $this->success(null, 'Utilisateur retiré du rôle avec succès');
    }

    public function statistics()
    {
        $this->authorize('viewAny', Role::class);

        return $this->success($this->roleService->statistics());
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Role::class);

        return $this->success($this->roleService->export());
    }

    public function toggleStatus(Request $request, Role $role)
    {
        $this->authorize('update', $role);

        $request->validate(['status' => 'required|in:active,inactive']);

        return $this->success($this->roleService->toggleStatus($role, $request->status), 'Statut mis à jour');
    }

    public function duplicate(Request $request, Role $role)
    {
        $this->authorize('create', Role::class);

        $request->validate([
            'name' => 'required|string|unique:roles,name',
            'display_name' => 'required|string|max:100',
        ]);

        $newRole = $this->roleService->duplicate($role);
        $newRole->update($request->only(['name', 'display_name']));

        return $this->success($newRole->fresh()->load('permissions'), 'Rôle dupliqué', 201);
    }

    public function getPermissions(Role $role)
    {
        $this->authorize('view', $role);

        return $this->success($this->roleService->getPermissions($role));
    }

    public function updatePermissions(Request $request, Role $role)
    {
        $this->authorize('update', $role);

        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        return $this->success(
            $this->roleService->updatePermissions($role, $request->permissions),
            'Permissions mises à jour'
        );
    }

    public function statuses()
    {
        return $this->success($this->roleService->statuses());
    }
}
