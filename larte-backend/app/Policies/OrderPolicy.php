<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;
use App\Support\OrderApprovalStage;
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
        if (! $this->can('orders.view')) {
            return false;
        }

        if (SalesScope::isSalesRep($user)) {
            return SalesScope::ownsOrder($order, $user);
        }

        return true;
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

    public function approve(User $user, Order $order): bool
    {
        if (SalesScope::isSalesRep($user)) {
            return false;
        }

        return OrderApprovalStage::canUserActAtStatus($user, $order->status);
    }

    public function reject(User $user, Order $order): bool
    {
        return $this->approve($user, $order);
    }

    public function transition(User $user, Order $order, string $toStatus): bool
    {
        if (SalesScope::isSalesRep($user)) {
            return false;
        }

        if (OrderWorkflow::isApprovalStatus($order->status)) {
            if (OrderWorkflow::canonical($toStatus) === OrderWorkflow::CANCELLED && $this->can('orders.update')) {
                return OrderWorkflow::canTransition($order->status, $toStatus);
            }

            return false;
        }

        if (OrderWorkflow::isApprovalStatus($toStatus) || OrderWorkflow::canonical($toStatus) === OrderWorkflow::APPROVED) {
            return false;
        }

        if (! $this->can('orders.update')) {
            return false;
        }

        if (! OrderWorkflow::canTransition($order->status, $toStatus)) {
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
