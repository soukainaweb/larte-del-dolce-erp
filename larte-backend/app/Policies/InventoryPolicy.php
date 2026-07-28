<?php

namespace App\Policies;

use App\Models\Inventory;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class InventoryPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool
    {
        return $this->can('inventory.view');
    }

    public function view(User $user, Inventory $inventory): bool
    {
        return $this->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $this->can('inventory.create');
    }

    public function update(User $user, Inventory $inventory): bool
    {
        return $this->can('inventory.update');
    }

    public function delete(User $user, Inventory $inventory): bool
    {
        return $this->can('inventory.delete');
    }
}
