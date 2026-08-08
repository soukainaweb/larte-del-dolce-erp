<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\SendUserPasswordResetRequest;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Requests\Users\UpdateUserRoleRequest;
use App\Http\Requests\Users\UpdateUserStatusRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class UserController extends Controller
{
    public function __construct(private UserService $userService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        return $this->success($this->userService->list($request->all()));
    }

    public function store(StoreUserRequest $request)
    {
        $this->authorize('create', User::class);

        $result = $this->userService->create($request->validated());
        $user = $result['user'];

        return $this->success(
            array_merge($user->toArray(), [
                'role' => $user->role,
                'temporary_password' => $result['temporary_password'],
            ]),
            'Utilisateur créé avec succès',
            201
        );
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        return $this->success($user->load('role'));
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', $user);

        return $this->success(
            $this->userService->update($user, $request->validated()),
            'Utilisateur mis à jour avec succès'
        );
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $this->userService->delete($user);

        return $this->success(null, 'Utilisateur supprimé avec succès');
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user)
    {
        $this->authorize('update', $user);

        return $this->success(
            $this->userService->updateStatus($user, $request->validated('status')),
            'Statut mis à jour avec succès'
        );
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user)
    {
        $this->authorize('update', $user);

        return $this->success(
            $this->userService->updateRole($user, $request->validated('role_id')),
            'Rôle mis à jour avec succès'
        );
    }

    public function statistics()
    {
        $this->authorize('viewAny', User::class);

        return $this->success($this->userService->statistics());
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', User::class);

        return $this->success($this->userService->export());
    }

    public function roles()
    {
        $this->authorize('viewAny', User::class);

        return $this->success($this->userService->roles());
    }

    public function statuses()
    {
        return $this->success($this->userService->statuses());
    }

    public function passwordReset(SendUserPasswordResetRequest $request)
    {
        $this->authorize('viewAny', User::class);

        $status = $this->userService->sendPasswordReset($request->validated('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            return $this->error(__($status), [], 422);
        }

        return $this->success(null, 'Lien de réinitialisation envoyé');
    }
}
