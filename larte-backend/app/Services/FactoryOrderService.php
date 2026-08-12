<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use App\Support\OrderWorkflow;
use App\Support\SalesScope;
use App\Support\StatusMapper;
use App\Support\UserStatus;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class FactoryOrderService
{
    public function __construct(
        private OrderWorkflowNotificationService $notifications,
    ) {
    }

    public function accept(Order $order, ?User $user = null): array
    {
        return $this->transitionFactory($order, OrderWorkflow::PREPARING, 'Factory accepted order', $user);
    }

    public function postpone(Order $order, string $reason, ?string $until = null, ?User $user = null): array
    {
        $reason = trim($reason);
        if (strlen($reason) < 3) {
            throw new InvalidArgumentException('Postponement reason is required.');
        }

        $user ??= auth()->user();
        $this->assertFactoryActor($user);

        return DB::transaction(function () use ($order, $reason, $until, $user) {
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
            $fromStatus = $locked->status;

            if (! in_array(OrderWorkflow::canonical($fromStatus), [
                OrderWorkflow::PENDING_FACTORY,
                OrderWorkflow::PREPARING,
            ], true)) {
                throw new InvalidArgumentException('Order cannot be postponed at this stage.');
            }

            OrderWorkflow::assertTransitionAllowed($fromStatus, OrderWorkflow::POSTPONED);

            $locked->update([
                'status' => OrderWorkflow::POSTPONED,
                'factory_postponed_reason' => $reason,
                'factory_postponed_until' => $until,
            ]);

            $this->recordHistory($locked, $fromStatus, OrderWorkflow::POSTPONED, $reason, $user);

            return StatusMapper::transformOrder($locked->fresh()->load(['customer', 'user', 'assignedRep', 'items.product']));
        });
    }

    public function markReadyForPickup(Order $order, ?User $user = null): array
    {
        return $this->transitionFactory($order, OrderWorkflow::READY, 'Ready for pickup', $user);
    }

    public function assignRepresentative(Order $order, int $repId, ?User $user = null): array
    {
        $user ??= auth()->user();
        $this->assertFactoryActor($user);

        $rep = User::query()
            ->where('id', $repId)
            ->whereHas('role', fn ($q) => $q->where('name', 'sales'))
            ->whereNotIn('status', UserStatus::blockedForLogin())
            ->first();

        if (! $rep) {
            throw new InvalidArgumentException('Selected user is not a valid representative.');
        }

        return DB::transaction(function () use ($order, $rep, $user) {
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);

            if (OrderWorkflow::canonical($locked->status) !== OrderWorkflow::READY) {
                throw new InvalidArgumentException('Representative can only be assigned when order is ready for pickup.');
            }

            if (! $user->hasPermission('orders.factory.assign_rep')) {
                throw new \RuntimeException('Permission denied for representative assignment.');
            }

            $locked->update([
                'assigned_rep_id' => $rep->id,
            ]);

            ActivityLogger::log(
                module: 'orders',
                action: 'rep_assigned',
                description: sprintf('Representative assigned to order %s', $locked->order_number),
                userId: $user->id,
            );

            $fresh = $locked->fresh()->load(['customer', 'user', 'assignedRep', 'items.product']);
            $this->notifications->notifyRepresentativeReadyForPickup($fresh, $rep);

            return StatusMapper::transformOrder($fresh);
        });
    }

    public function confirmPickup(Order $order, mixed $photo, ?User $user = null): array
    {
        $user ??= auth()->user();

        if (! SalesScope::isAssignedRep($order, $user)) {
            throw new \RuntimeException('You are not authorized to confirm pickup for this order.');
        }

        if (! $user->hasPermission('orders.pickup')) {
            throw new \RuntimeException('Permission denied for pickup confirmation.');
        }

        if (OrderWorkflow::canonical($order->status) !== OrderWorkflow::READY) {
            throw new InvalidArgumentException('Pickup can only be confirmed when the order is ready for pickup.');
        }

        if (! $order->assigned_rep_id) {
            throw new InvalidArgumentException('A representative must be assigned before pickup.');
        }

        $path = $this->persistPhoto($photo, 'orders/pickup');

        return DB::transaction(function () use ($order, $path, $user) {
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
            $fromStatus = $locked->status;

            if ($locked->pickup_photo) {
                throw new InvalidArgumentException('Pickup has already been confirmed.');
            }

            OrderWorkflow::assertTransitionAllowed($fromStatus, OrderWorkflow::ASSIGNED);

            $locked->update([
                'status' => OrderWorkflow::ASSIGNED,
                'pickup_photo' => $path,
                'pickup_at' => now(),
            ]);

            $this->recordHistory($locked, $fromStatus, OrderWorkflow::ASSIGNED, 'Pickup confirmed', $user);

            return StatusMapper::transformOrder($locked->fresh()->load(['customer', 'user', 'assignedRep', 'items.product']));
        });
    }

    public function confirmDelivery(Order $order, mixed $photo, ?User $user = null): array
    {
        $user ??= auth()->user();

        if (! SalesScope::isAssignedRep($order, $user)) {
            throw new \RuntimeException('You are not authorized to confirm delivery for this order.');
        }

        if (! $user->hasPermission('orders.deliver')) {
            throw new \RuntimeException('Permission denied for delivery confirmation.');
        }

        if (OrderWorkflow::canonical($order->status) !== OrderWorkflow::ASSIGNED) {
            throw new InvalidArgumentException('Delivery can only be confirmed for assigned orders.');
        }

        if (! $order->pickup_photo) {
            throw new InvalidArgumentException('Pickup must be confirmed before delivery.');
        }

        $path = $this->persistPhoto($photo, 'orders/delivery');

        return DB::transaction(function () use ($order, $path, $user) {
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
            $fromStatus = $locked->status;

            OrderWorkflow::assertTransitionAllowed($fromStatus, OrderWorkflow::DELIVERED);

            $locked->update([
                'status' => OrderWorkflow::DELIVERED,
                'delivery_photo' => $path,
                'delivered_at' => now(),
            ]);

            $this->recordHistory($locked, $fromStatus, OrderWorkflow::DELIVERED, 'Delivery confirmed', $user);

            return StatusMapper::transformOrder($locked->fresh()->load(['customer', 'user', 'assignedRep', 'items.product']));
        });
    }

    /**
     * @return Collection<int, User>
     */
    public function availableRepresentatives(): Collection
    {
        return User::query()
            ->with('role:id,name')
            ->whereHas('role', fn ($q) => $q->where('name', 'sales'))
            ->where('availability_status', 'available')
            ->whereNotIn('status', UserStatus::blockedForLogin())
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'email', 'availability_status']);
    }

    protected function transitionFactory(Order $order, string $toStatus, string $comment, ?User $user = null): array
    {
        $user ??= auth()->user();
        $this->assertFactoryActor($user);

        return DB::transaction(function () use ($order, $toStatus, $comment, $user) {
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
            $fromStatus = $locked->status;

            OrderWorkflow::assertTransitionAllowed($fromStatus, $toStatus);

            $permission = OrderWorkflow::permissionForTransition($fromStatus, $toStatus);
            if (! $user->hasPermission($permission)) {
                throw new \RuntimeException('Permission denied for this factory action.');
            }

            $updates = ['status' => $toStatus];
            if ($toStatus === OrderWorkflow::PREPARING) {
                $updates['factory_postponed_reason'] = null;
                $updates['factory_postponed_until'] = null;
            }

            $locked->update($updates);
            $this->recordHistory($locked, $fromStatus, $toStatus, $comment, $user);

            $fresh = $locked->fresh()->load(['customer', 'user', 'assignedRep', 'items.product']);

            if ($toStatus === OrderWorkflow::READY) {
                // Representatives are notified when assigned, not when marked ready.
            }

            return StatusMapper::transformOrder($fresh);
        });
    }

    protected function assertFactoryActor(User $user): void
    {
        if (SalesScope::isFactoryUser($user) || $user->hasPermission('orders.factory.accept')) {
            return;
        }

        throw new \RuntimeException('Only factory users can perform this action.');
    }

    protected function recordHistory(Order $order, string $from, string $to, ?string $comment, ?User $user): void
    {
        OrderStatusHistory::create([
            'order_id' => $order->id,
            'user_id' => $user?->id,
            'from_status' => $from,
            'to_status' => $to,
            'comment' => $comment,
            'ip_address' => request()?->ip(),
            'device' => request()?->userAgent(),
        ]);

        ActivityLogger::log(
            module: 'orders',
            action: 'status_changed',
            description: sprintf(
                'Order %s: %s → %s',
                $order->order_number,
                OrderWorkflow::toFrontend($from),
                OrderWorkflow::toFrontend($to)
            ),
            userId: $user?->id,
        );
    }

    protected function persistPhoto(mixed $photo, string $directory): string
    {
        if (! is_string($photo) || ! str_starts_with($photo, 'data:image/')) {
            throw new InvalidArgumentException('A valid photo is required.');
        }

        if (! preg_match('#^data:image/(\w+);base64,#', $photo, $matches)) {
            throw new InvalidArgumentException('Invalid photo data.');
        }

        $extension = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
        $binary = base64_decode(substr($photo, strpos($photo, ',') + 1), true);

        if ($binary === false) {
            throw new InvalidArgumentException('Invalid photo data.');
        }

        $path = $directory . '/' . uniqid('photo_', true) . '.' . $extension;
        Storage::disk('public')->put($path, $binary);

        return $path;
    }
}
