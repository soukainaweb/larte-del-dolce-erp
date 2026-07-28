<?php

namespace App\Policies;

use App\Models\Warehouse;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class WarehousePolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('warehouses.view'); }
    public function view(User $user, Warehouse $model): bool { return $this->can('warehouses.view'); }
    public function create(User $user): bool { return $this->can('warehouses.create'); }
    public function update(User $user, Warehouse $model): bool { return $this->can('warehouses.update'); }
    public function delete(User $user, Warehouse $model): bool { return $this->can('warehouses.delete'); }
}
