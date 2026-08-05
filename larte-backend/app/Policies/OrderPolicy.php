<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;
use App\Support\OrderWorkflow;
use App\Support\SalesScope;

class OrderPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool
    {
        return $this->can('orders.view');
    }

    public function view(User $user, Order $order): bool
    {
        return $this->can('orders.view') && SalesScope::ownsOrder($order, $user);
    }

    public function create(User $user): bool
    {
        return $this->can('orders.create');
    }

    public function update(User $user, Order $order): bool
    {
        return $this->can('orders.update') && SalesScope::ownsOrder($order, $user);
    }

    public function delete(User $user, Order $order): bool
    {
        return $this->can('orders.delete') && SalesScope::ownsOrder($order, $user);
    }

    public function transition(User $user, Order $order, string $toStatus): bool
    {
        if (!$this->can('orders.update')) {
            return false;
        }

        if (!OrderWorkflow::canTransition($order->status, $toStatus)) {
            return false;
        }

        try {
            $permission = OrderWorkflow::permissionForTransition($order->status, $toStatus);

            return $user->hasPermission($permission);
        } catch (\InvalidArgumentException) {
            return false;
        }
    }
}
