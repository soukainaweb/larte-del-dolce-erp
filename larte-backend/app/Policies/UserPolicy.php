<?php

namespace App\Policies;

use App\Models\User as UserModel;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class UserPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool
    {
        return $this->can('users.view');
    }

    public function view(User $user, UserModel $model): bool
    {
        return $this->can('users.view');
    }

    public function create(User $user): bool
    {
        return $this->can('users.create');
    }

    public function update(User $user, UserModel $model): bool
    {
        return $this->can('users.update');
    }

    public function delete(User $user, UserModel $model): bool
    {
        return $this->can('users.delete');
    }
}
