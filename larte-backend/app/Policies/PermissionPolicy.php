<?php

namespace App\Policies;

use App\Models\Permission;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class PermissionPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('permissions.view'); }
    public function view(User $user, Permission $model): bool { return $this->can('permissions.view'); }
    public function create(User $user): bool { return $this->can('permissions.create'); }
    public function update(User $user, Permission $model): bool { return $this->can('permissions.update'); }
    public function delete(User $user, Permission $model): bool { return $this->can('permissions.delete'); }
}
