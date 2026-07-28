<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

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
            $query->where('role_id', $filters['role']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): User
    {
        $names = $this->userPayload($data);

        return User::create(array_merge($names, [
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role_id' => $data['role_id'],
            'phone' => $data['phone'] ?? null,
            'status' => $data['status'] ?? 'offline',
        ]))->load('role');
    }

    public function update(User $user, array $data): User
    {
        $payload = array_filter([
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'role_id' => $data['role_id'] ?? null,
            'status' => $data['status'] ?? null,
        ], fn ($v) => $v !== null);

        $payload = array_merge($payload, $this->userPayload($data));

        if (!empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $user->update($payload);

        return $user->fresh()->load('role');
    }

    public function updateStatus(User $user, string $status): User
    {
        $user->update(['status' => $status]);

        return $user->fresh()->load('role');
    }

    public function updateRole(User $user, int $roleId): User
    {
        $user->update(['role_id' => $roleId]);

        return $user->fresh()->load('role');
    }

    public function delete(User $user): void
    {
        $user->delete();
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
        return ['active', 'inactive', 'online', 'offline', 'away'];
    }

    public function sendPasswordReset(string $email): string
    {
        return Password::sendResetLink(['email' => $email]);
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
