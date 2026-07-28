<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class OrderPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool
    {
        return $this->can('orders.view');
    }

    public function view(User $user, Order $order): bool
    {
        return $this->can('orders.view');
    }

    public function create(User $user): bool
    {
        return $this->can('orders.create');
    }

    public function update(User $user, Order $order): bool
    {
        return $this->can('orders.update');
    }

    public function delete(User $user, Order $order): bool
    {
        return $this->can('orders.delete');
    }
}
