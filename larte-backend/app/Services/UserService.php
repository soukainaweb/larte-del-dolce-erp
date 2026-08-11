<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use App\Support\UserStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class UserService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = User::with('role');

        if (!empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('first_name', 'LIKE', "%{$term}%")
                    ->orWhere('last_name', 'LIKE', "%{$term}%")
                    ->orWhere('email', 'LIKE', "%{$term}%")
                    ->orWhere('phone', 'LIKE', "%{$term}%");
            });
        }

        if (!empty($filters['role'])) {
            if (is_numeric($filters['role'])) {
                $query->where('role_id', $filters['role']);
            } else {
                $query->whereHas('role', fn ($q) => $q->where('name', $filters['role']));
            }
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): array
    {
        $email = mb_strtolower(trim($data['email']));
        $trashedUser = User::onlyTrashed()->whereRaw('LOWER(email) = ?', [$email])->first();
        if ($trashedUser) {
            $trashedUser->forceDelete();
        }

        $names = $this->userPayload($data);
        $temporaryPassword = Str::password(16, symbols: true);

        $user = User::create(array_merge($names, [
            'email' => $email,
            'password' => $temporaryPassword,
            'role_id' => $data['role_id'],
            'phone' => $data['phone'] ?? null,
            'status' => UserStatus::normalize($data['status'] ?? null, UserStatus::ACTIVE),
            'must_change_password' => true,
        ]))->load('role');

        ActivityLogger::logModelEvent($user, 'created', sprintf('Utilisateur %s créé', $user->email));
        app(EntityCreatedNotificationService::class)->notify('user', $user);

        return [
            'user' => $user,
            'temporary_password' => $temporaryPassword,
        ];
    }

    public function update(User $user, array $data): User
    {
        $payload = array_filter([
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'role_id' => $data['role_id'] ?? null,
        ], fn ($v) => $v !== null);

        if (array_key_exists('status', $data) && $data['status'] !== null) {
            $payload['status'] = UserStatus::normalize($data['status']);
        }

        $payload = array_merge($payload, $this->userPayload($data));

        if (!empty($data['password'])) {
            $payload['password'] = $data['password'];
        }

        $user->update($payload);

        ActivityLogger::logModelEvent($user, 'updated', sprintf('Utilisateur %s mis à jour', $user->email));

        return $user->fresh()->load('role');
    }

    public function updateStatus(User $user, string $status): User
    {
        $user->update(['status' => UserStatus::normalize($status)]);

        ActivityLogger::log(
            module: 'users',
            action: 'status_changed',
            description: sprintf('Statut utilisateur %s changé en %s', $user->email, $status),
        );

        return $user->fresh()->load('role');
    }

    public function updateRole(User $user, int $roleId): User
    {
        $user->update(['role_id' => $roleId]);

        ActivityLogger::log(
            module: 'users',
            action: 'role_changed',
            description: sprintf('Rôle utilisateur %s mis à jour', $user->email),
        );

        return $user->fresh()->load('role');
    }

    public function delete(User $user): void
    {
        $email = $user->email;
        $user->delete();

        ActivityLogger::log(
            module: 'users',
            action: 'deleted',
            description: sprintf('Utilisateur %s supprimé', $email),
        );
    }

    public function statistics(): array
    {
        return [
            'total' => User::count(),
            'active' => User::where('status', 'online')->count(),
            'inactive' => User::where('status', 'offline')->count(),
            'by_role' => User::selectRaw('role_id, count(*) as count')
                ->groupBy('role_id')
                ->with('role')
                ->get(),
        ];
    }

    public function export()
    {
        return User::with('role')->get()->map(fn ($user) => [
            'Nom' => $user->name,
            'Email' => $user->email,
            'Téléphone' => $user->phone,
            'Rôle' => $user->role->display_name ?? $user->role->name ?? '—',
            'Statut' => $user->status,
            'Date création' => $user->created_at->format('Y-m-d H:i'),
        ]);
    }

    public function roles()
    {
        return Role::orderBy('display_name')->get(['id', 'name', 'display_name']);
    }

    public function statuses(): array
    {
        return UserStatus::all();
    }

    public function sendPasswordReset(string $email): string
    {
        return Password::sendResetLink(['email' => $email]);
    }

    public function resetPassword(User $user): array
    {
        $temporaryPassword = Str::password(16, symbols: true);

        $user->update([
            'password' => $temporaryPassword,
            'must_change_password' => true,
        ]);

        ActivityLogger::log(
            module: 'users',
            action: 'password_reset',
            description: sprintf('Mot de passe réinitialisé pour %s', $user->email),
        );

        return [
            'user' => $user->fresh()->load('role'),
            'temporary_password' => $temporaryPassword,
        ];
    }

    private function userPayload(array $data): array
    {
        if (!empty($data['first_name']) || !empty($data['last_name'])) {
            return [
                'first_name' => $data['first_name'] ?? '',
                'last_name' => $data['last_name'] ?? '',
            ];
        }

        if (!empty($data['name'])) {
            return $this->splitName($data['name']);
        }

        return [];
    }

    private function splitName(?string $name): array
    {
        $name = trim((string) $name);
        if ($name === '') {
            return ['first_name' => '', 'last_name' => ''];
        }

        $parts = preg_split('/\s+/', $name, 2);

        return [
            'first_name' => $parts[0],
            'last_name' => $parts[1] ?? '',
        ];
    }
}
