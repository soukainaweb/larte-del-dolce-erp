<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $query = Role::query();

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%");
        }

        $roles = $query->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles|max:100',
            'description' => 'nullable|string',
        ]);

        $role = Role::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Rôle créé avec succès',
            'data' => $role
        ], 201);
    }

    public function show(Role $role)
    {
        return response()->json([
            'success' => true,
            'data' => $role
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'sometimes|string|unique:roles,name,' . $role->id . '|max:100',
            'description' => 'nullable|string',
        ]);

        $role->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Rôle mis à jour avec succès',
            'data' => $role->fresh()
        ]);
    }

    public function destroy(Role $role)
    {
        // Check if role has users
        if ($role->users()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer un rôle qui a des utilisateurs'
            ], 403);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rôle supprimé avec succès'
        ]);
    }

    public function getUsers($roleId)
    {
        $role = Role::findOrFail($roleId);
        $users = $role->users()->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function addUser(Request $request, $roleId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $role = Role::findOrFail($roleId);
        $user = User::findOrFail($request->user_id);

        $user->update(['role_id' => $role->id]);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur ajouté au rôle avec succès'
        ]);
    }

    public function removeUser($roleId, $userId)
    {
        $user = User::findOrFail($userId);
        $user->update(['role_id' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur retiré du rôle avec succès'
        ]);
    }
}