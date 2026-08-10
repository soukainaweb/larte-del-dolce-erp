<?php

namespace App\Support;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

/**
 * Idempotent setup for the Responsible role and default responsible user.
 * Safe to run on production — creates only missing records and never wipes data.
 */
final class EnsureResponsibleSetup
{
    public const ROLE_NAME = 'responsible';

    public const USER_EMAIL = 'responsible@larte.com';

    /** Used only when creating a new user (existing passwords are never changed). */
    public const DEFAULT_PASSWORD = '123456';

    /**
     * Ensure the responsible role, its permissions, and the default user exist.
     *
     * @return array{role: Role, user: User, role_created: bool, user_created: bool}
     */
    public static function run(?string $password = null): array
    {
        $password ??= (string) env('RESPONSIBLE_USER_PASSWORD', self::DEFAULT_PASSWORD);

        $role = Role::updateOrCreate(
            ['name' => self::ROLE_NAME],
            [
                'display_name' => 'Responsible',
                'description' => 'Final order approval authority',
                'status' => 'active',
                'is_system' => false,
            ]
        );

        $permissionIdsByName = DefaultRolePermissions::ensurePermissionsExist();
        DefaultRolePermissions::syncRole($role->fresh(), $permissionIdsByName);

        $userCreated = false;
        $user = User::withTrashed()->where('email', self::USER_EMAIL)->first();

        if (! $user) {
            $user = User::create([
                'email' => self::USER_EMAIL,
                'first_name' => 'Responsible',
                'last_name' => 'User',
                'password' => Hash::make($password),
                'role_id' => $role->id,
                'status' => 'online',
            ]);
            $userCreated = true;
        } else {
            if ($user->trashed()) {
                $user->restore();
            }

            $updates = [];
            if ((int) $user->role_id !== (int) $role->id) {
                $updates['role_id'] = $role->id;
            }
            if ($user->status !== 'online') {
                $updates['status'] = 'online';
            }
            if ($updates !== []) {
                $user->update($updates);
            }
        }

        return [
            'role' => $role->fresh(),
            'user' => $user->fresh(['role']),
            'role_created' => $role->wasRecentlyCreated,
            'user_created' => $userCreated,
        ];
    }
}
