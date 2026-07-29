<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use App\Support\OrderWorkflow;
use App\Support\StatusMapper;
use Illuminate\Support\Facades\DB;

class OrderWorkflowService
{
    public function recordInitialStatus(Order $order, ?User $user = null, ?string $comment = null): OrderStatusHistory
    {
        return OrderStatusHistory::create([
            'order_id' => $order->id,
            'user_id' => $user?->id ?? auth()->id(),
            'from_status' => null,
            'to_status' => $order->status,
            'comment' => $comment ?? 'Commande créée',
            'ip_address' => request()?->ip(),
            'device' => request()?->userAgent(),
        ]);
    }

    public function transition(
        Order $order,
        string $toStatus,
        ?string $comment = null,
        ?User $user = null,
    ): array {
        $user ??= auth()->user();
        $fromStatus = $order->status;
        $toCanonical = OrderWorkflow::canonical($toStatus);

        OrderWorkflow::assertTransitionAllowed($fromStatus, $toCanonical);

        $permission = OrderWorkflow::permissionForTransition($fromStatus, $toCanonical);

        if ($user && !$user->hasPermission($permission)) {
            throw new \RuntimeException('Permission refusée pour cette transition de statut.');
        }

        return DB::transaction(function () use ($order, $fromStatus, $toCanonical, $comment, $user) {
            $order->update(['status' => $toCanonical]);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'user_id' => $user?->id,
                'from_status' => $fromStatus,
                'to_status' => $toCanonical,
                'comment' => $comment,
                'ip_address' => request()?->ip(),
                'device' => request()?->userAgent(),
            ]);

            ActivityLogger::log(
                module: 'orders',
                action: 'status_changed',
                description: sprintf(
                    'Commande %s: %s → %s',
                    $order->order_number,
                    OrderWorkflow::toFrontend($fromStatus),
                    OrderWorkflow::toFrontend($toCanonical)
                ),
                level: 'info',
                status: 'success',
                userId: $user?->id,
            );

            return StatusMapper::transformOrder(
                $order->fresh()->load(['customer', 'user', 'items.product'])
            );
        });
    }

    public function statusHistory(Order $order)
    {
        return $order->statusHistories()
            ->with('user:id,first_name,last_name,email')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (OrderStatusHistory $entry) => [
                'id' => $entry->id,
                'from_status' => OrderWorkflow::toFrontend($entry->from_status) ?? $entry->from_status,
                'to_status' => OrderWorkflow::toFrontend($entry->to_status) ?? $entry->to_status,
                'comment' => $entry->comment,
                'user' => $entry->user ? [
                    'id' => $entry->user->id,
                    'name' => trim($entry->user->first_name . ' ' . $entry->user->last_name),
                    'email' => $entry->user->email,
                ] : null,
                'ip_address' => $entry->ip_address,
                'device' => $entry->device,
                'created_at' => $entry->created_at?->toIso8601String(),
            ]);
    }

    public function allowedTransitions(Order $order): array
    {
        return OrderWorkflow::allowedTargets($order->status);
    }
}
