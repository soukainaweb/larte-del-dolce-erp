<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class RolePolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('roles.view'); }
    public function view(User $user, Role $model): bool { return $this->can('roles.view'); }
    public function create(User $user): bool { return $this->can('roles.create'); }
    public function update(User $user, Role $model): bool { return $this->can('roles.update'); }
    public function delete(User $user, Role $model): bool { return $this->can('roles.delete'); }
}
