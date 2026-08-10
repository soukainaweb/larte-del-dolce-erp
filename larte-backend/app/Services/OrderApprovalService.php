<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderApproval;
use App\Models\OrderStatusHistory;
use App\Models\User;
use App\Support\OrderApprovalStage;
use App\Support\OrderWorkflow;
use App\Support\SalesScope;
use App\Support\StatusMapper;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class OrderApprovalService
{
    public function __construct(
        private OrderWorkflowNotificationService $notifications,
    ) {
    }

    public function recordSubmitted(Order $order, User $actor): OrderApproval
    {
        return OrderApproval::create([
            'order_id' => $order->id,
            'user_id' => $actor->id,
            'role' => 'sales',
            'action' => OrderApprovalStage::ACTION_SUBMITTED,
            'reason' => null,
        ]);
    }

    public function approve(Order $order, ?User $user = null): array
    {
        $user ??= auth()->user();

        return DB::transaction(function () use ($order, $user) {
            /** @var Order $locked */
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
            [$stageStatus, $stage] = OrderApprovalStage::assertUserCanAct($user, $locked);

            $nextStatus = $stage['next_status'];
            $fromStatus = $locked->status;

            OrderApproval::create([
                'order_id' => $locked->id,
                'user_id' => $user->id,
                'role' => $stage['role'],
                'action' => $stage['approve_action'],
                'reason' => null,
            ]);

            $locked->update(['status' => $nextStatus]);

            OrderStatusHistory::create([
                'order_id' => $locked->id,
                'user_id' => $user->id,
                'from_status' => $fromStatus,
                'to_status' => $nextStatus,
                'comment' => sprintf('%s approved', ucfirst($stage['role'])),
                'ip_address' => request()?->ip(),
                'device' => request()?->userAgent(),
            ]);

            ActivityLogger::log(
                module: 'orders',
                action: 'approval',
                description: sprintf(
                    'Order %s approved by %s (%s)',
                    $locked->order_number,
                    $this->displayName($user),
                    $stage['role']
                ),
                level: 'info',
                status: 'success',
                userId: $user->id,
            );

            $fresh = $locked->fresh()->load(['customer', 'user', 'items.product', 'approvals.user']);

            $this->dispatchApprovalNotifications($fresh, $user, $stageStatus, $nextStatus);

            return StatusMapper::transformOrder($fresh);
        });
    }

    public function reject(Order $order, string $reason, ?User $user = null): array
    {
        $user ??= auth()->user();
        $reason = trim($reason);

        if (strlen($reason) < 3) {
            throw new InvalidArgumentException('Rejection reason is required.');
        }

        return DB::transaction(function () use ($order, $reason, $user) {
            /** @var Order $locked */
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
            [$stageStatus, $stage] = OrderApprovalStage::assertUserCanAct($user, $locked);

            $fromStatus = $locked->status;

            OrderApproval::create([
                'order_id' => $locked->id,
                'user_id' => $user->id,
                'role' => $stage['role'],
                'action' => $stage['reject_action'],
                'reason' => $reason,
            ]);

            $locked->update(['status' => OrderWorkflow::REJECTED]);

            OrderStatusHistory::create([
                'order_id' => $locked->id,
                'user_id' => $user->id,
                'from_status' => $fromStatus,
                'to_status' => OrderWorkflow::REJECTED,
                'comment' => $reason,
                'ip_address' => request()?->ip(),
                'device' => request()?->userAgent(),
            ]);

            ActivityLogger::log(
                module: 'orders',
                action: 'rejection',
                description: sprintf(
                    'Order %s rejected by %s (%s)',
                    $locked->order_number,
                    $this->displayName($user),
                    $stage['role']
                ),
                level: 'warning',
                status: 'success',
                userId: $user->id,
            );

            $fresh = $locked->fresh()->load(['customer', 'user', 'items.product', 'approvals.user']);

            $this->notifications->notifyOrderRejectedAtStage($fresh, $user, $stage['role'], $reason);

            return StatusMapper::transformOrder($fresh);
        });
    }

    public function approvalHistory(Order $order): array
    {
        return $order->approvals()
            ->with('user:id,first_name,last_name,email')
            ->orderBy('created_at')
            ->get()
            ->map(fn (OrderApproval $entry) => [
                'id' => $entry->id,
                'action' => $entry->action,
                'role' => $entry->role,
                'reason' => $entry->reason,
                'user' => $entry->user ? [
                    'id' => $entry->user->id,
                    'name' => trim($entry->user->first_name . ' ' . $entry->user->last_name),
                    'email' => $entry->user->email,
                ] : null,
                'created_at' => $entry->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();
    }

    public function canUserApprove(User $user, Order $order): bool
    {
        if (SalesScope::isSalesRep($user)) {
            return false;
        }

        return OrderApprovalStage::canUserActAtStatus($user, $order->status);
    }

    public function approvalProgress(Order $order): array
    {
        $order->loadMissing(['approvals.user']);
        $current = OrderWorkflow::canonical($order->status);
        $latestRejection = $this->latestRejection($order);

        $steps = [
            [
                'key' => 'representative',
                'role' => 'sales',
                'label' => 'Representative',
                'state' => 'completed',
            ],
            [
                'key' => 'manager',
                'role' => 'manager',
                'label' => 'Manager',
                'waiting_status' => OrderWorkflow::PENDING_MANAGER,
                'approve_action' => OrderApprovalStage::ACTION_MANAGER_APPROVED,
                'reject_action' => OrderApprovalStage::ACTION_MANAGER_REJECTED,
            ],
            [
                'key' => 'accountant',
                'role' => 'accountant',
                'label' => 'Accountant',
                'waiting_status' => OrderWorkflow::PENDING_ACCOUNTANT,
                'approve_action' => OrderApprovalStage::ACTION_ACCOUNTANT_APPROVED,
                'reject_action' => OrderApprovalStage::ACTION_ACCOUNTANT_REJECTED,
            ],
            [
                'key' => 'responsible',
                'role' => 'responsible',
                'label' => 'Responsible',
                'waiting_status' => OrderWorkflow::PENDING_RESPONSIBLE,
                'approve_action' => OrderApprovalStage::ACTION_RESPONSIBLE_APPROVED,
                'reject_action' => OrderApprovalStage::ACTION_RESPONSIBLE_REJECTED,
            ],
            [
                'key' => 'factory',
                'role' => 'factory',
                'label' => 'Factory',
                'waiting_status' => OrderWorkflow::PENDING_FACTORY,
            ],
        ];

        $approvalsByAction = $order->approvals->keyBy('action');
        $result = [];

        foreach ($steps as $index => $step) {
            if ($step['key'] === 'representative') {
                $submitted = $approvalsByAction->get(OrderApprovalStage::ACTION_SUBMITTED);
                $result[] = array_merge($step, [
                    'state' => 'completed',
                    'acted_at' => $submitted?->created_at?->toIso8601String(),
                    'actor' => $submitted?->user ? [
                        'name' => trim($submitted->user->first_name . ' ' . $submitted->user->last_name),
                    ] : null,
                ]);
                continue;
            }

            if ($step['key'] === 'factory') {
                $factoryState = 'pending';
                if (in_array($current, [
                    OrderWorkflow::PREPARING,
                    OrderWorkflow::POSTPONED,
                    OrderWorkflow::READY,
                    OrderWorkflow::ASSIGNED,
                    OrderWorkflow::DELIVERED,
                    OrderWorkflow::ARCHIVED,
                ], true)) {
                    $factoryState = 'completed';
                } elseif ($current === OrderWorkflow::PENDING_FACTORY) {
                    $factoryState = 'current';
                } elseif ($this->stepIsBeforeCurrent(OrderWorkflow::PENDING_FACTORY, $current)) {
                    $factoryState = 'pending';
                }

                $result[] = array_merge($step, ['state' => $factoryState]);
                continue;
            }

            $approved = $approvalsByAction->get($step['approve_action']);
            $rejected = $approvalsByAction->get($step['reject_action']);
            $state = 'pending';

            if ($rejected) {
                $state = 'rejected';
            } elseif ($approved) {
                $state = 'completed';
            } elseif ($current === $step['waiting_status']) {
                $state = 'current';
            } elseif ($this->stepIsBeforeCurrent($step['waiting_status'], $current)) {
                $state = 'pending';
            } elseif ($this->stepIsAfterCurrent($step['waiting_status'], $current)) {
                $state = in_array($current, [
                    OrderWorkflow::PENDING_FACTORY,
                    OrderWorkflow::PREPARING,
                    OrderWorkflow::POSTPONED,
                    OrderWorkflow::READY,
                    OrderWorkflow::ASSIGNED,
                    OrderWorkflow::DELIVERED,
                    OrderWorkflow::ARCHIVED,
                    OrderWorkflow::APPROVED,
                ], true)
                    ? 'completed'
                    : 'pending';
            }

            if (in_array($current, [OrderWorkflow::PENDING_FACTORY, OrderWorkflow::APPROVED], true) && $approved) {
                $state = 'completed';
            }

            $entry = array_merge($step, [
                'state' => $state,
                'acted_at' => ($approved ?? $rejected)?->created_at?->toIso8601String(),
                'reason' => $rejected?->reason,
                'actor' => ($approved ?? $rejected)?->user ? [
                    'name' => trim(($approved ?? $rejected)->user->first_name . ' ' . ($approved ?? $rejected)->user->last_name),
                ] : null,
            ]);

            unset($entry['waiting_status'], $entry['approve_action'], $entry['reject_action']);
            $result[] = $entry;
        }

        return $result;
    }

    public function latestRejection(Order $order): ?array
    {
        if (OrderWorkflow::canonical($order->status) !== OrderWorkflow::REJECTED) {
            return null;
        }

        $rejection = $order->approvals()
            ->whereIn('action', [
                OrderApprovalStage::ACTION_ACCOUNTANT_REJECTED,
                OrderApprovalStage::ACTION_MANAGER_REJECTED,
                OrderApprovalStage::ACTION_RESPONSIBLE_REJECTED,
            ])
            ->with('user:id,first_name,last_name,email')
            ->latest('created_at')
            ->first();

        if (! $rejection) {
            return null;
        }

        return [
            'role' => $rejection->role,
            'stage' => OrderApprovalStage::stageLabel(
                match ($rejection->role) {
                    'manager' => OrderWorkflow::PENDING_MANAGER,
                    'accountant' => OrderWorkflow::PENDING_ACCOUNTANT,
                    'responsible' => OrderWorkflow::PENDING_RESPONSIBLE,
                    default => $order->status,
                }
            ),
            'reason' => $rejection->reason,
            'rejected_by' => $rejection->user ? trim($rejection->user->first_name . ' ' . $rejection->user->last_name) : null,
            'rejected_at' => $rejection->created_at?->toIso8601String(),
        ];
    }

    protected function stepIsBeforeCurrent(string $stepStatus, string $current): bool
    {
        $order = [
            OrderWorkflow::PENDING_MANAGER => 1,
            OrderWorkflow::PENDING_ACCOUNTANT => 2,
            OrderWorkflow::PENDING_RESPONSIBLE => 3,
            OrderWorkflow::PENDING_FACTORY => 4,
            OrderWorkflow::APPROVED => 4,
        ];

        return ($order[$stepStatus] ?? 0) < ($order[$current] ?? 0);
    }

    protected function stepIsAfterCurrent(string $stepStatus, string $current): bool
    {
        $order = [
            OrderWorkflow::PENDING_MANAGER => 1,
            OrderWorkflow::PENDING_ACCOUNTANT => 2,
            OrderWorkflow::PENDING_RESPONSIBLE => 3,
            OrderWorkflow::PENDING_FACTORY => 4,
            OrderWorkflow::APPROVED => 4,
        ];

        return ($order[$stepStatus] ?? 0) > ($order[$current] ?? 0);
    }

    protected function dispatchApprovalNotifications(
        Order $order,
        User $approver,
        string $fromStageStatus,
        string $nextStatus,
    ): void {
        if ($nextStatus === OrderWorkflow::PENDING_ACCOUNTANT) {
            $this->notifications->notifyManagerApproved($order, $approver);
        } elseif ($nextStatus === OrderWorkflow::PENDING_RESPONSIBLE) {
            $this->notifications->notifyAccountantApproved($order, $approver);
        } elseif ($nextStatus === OrderWorkflow::PENDING_FACTORY) {
            $this->notifications->notifyResponsibleApproved($order, $approver);
        }
    }

    protected function displayName(User $user): string
    {
        return trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')) ?: ($user->email ?? 'User');
    }
}
