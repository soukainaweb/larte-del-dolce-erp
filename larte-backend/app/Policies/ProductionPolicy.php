<?php

namespace App\Policies;

use App\Models\Production;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class ProductionPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('productions.view'); }
    public function view(User $user, Production $model): bool { return $this->can('productions.view'); }
    public function create(User $user): bool { return $this->can('productions.create'); }
    public function update(User $user, Production $model): bool { return $this->can('productions.update'); }
    public function delete(User $user, Production $model): bool { return $this->can('productions.delete'); }
}
