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

        return SalesScope::ownsOrder($order, $user);
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
            $canonical = OrderWorkflow::canonical($toStatus);
            if ($canonical === OrderWorkflow::DELIVERED && SalesScope::isAssignedRep($order, $user)) {
                return $user->hasPermission('orders.deliver')
                    && $order->pickup_photo
                    && OrderWorkflow::canTransition($order->status, $toStatus);
            }

            return false;
        }

        if (SalesScope::isFactoryUser($user)) {
            if (! OrderWorkflow::isFactoryStatus($order->status)) {
                return false;
            }
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

        if (! $this->can('orders.update') && ! $this->canFactoryTransition($user, $order->status, $toStatus)) {
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

    public function factoryAction(User $user, Order $order): bool
    {
        if (! SalesScope::isFactoryUser($user) && ! $user->hasPermission('orders.factory.accept')) {
            return false;
        }

        return OrderWorkflow::isFactoryStatus($order->status);
    }

    public function pickup(User $user, Order $order): bool
    {
        return $user->hasPermission('orders.pickup')
            && SalesScope::isAssignedRep($order, $user)
            && OrderWorkflow::canonical($order->status) === OrderWorkflow::READY
            && $order->assigned_rep_id
            && ! $order->pickup_photo;
    }

    public function deliver(User $user, Order $order): bool
    {
        return $user->hasPermission('orders.deliver')
            && SalesScope::isAssignedRep($order, $user)
            && OrderWorkflow::canonical($order->status) === OrderWorkflow::ASSIGNED
            && $order->pickup_photo
            && ! $order->delivery_photo;
    }

    protected function canFactoryTransition(User $user, string $from, string $to): bool
    {
        try {
            $permission = OrderWorkflow::permissionForTransition($from, $to);

            return str_starts_with($permission, 'orders.factory.') && $user->hasPermission($permission);
        } catch (\InvalidArgumentException) {
            return false;
        }
    }
}
