<?php

namespace App\Support;

use App\Models\Order;
use App\Models\User;
use InvalidArgumentException;

final class OrderApprovalStage
{
    public const ACTION_SUBMITTED = 'SUBMITTED';
    public const ACTION_MANAGER_APPROVED = 'MANAGER_APPROVED';
    public const ACTION_MANAGER_REJECTED = 'MANAGER_REJECTED';
    public const ACTION_ACCOUNTANT_APPROVED = 'ACCOUNTANT_APPROVED';
    public const ACTION_ACCOUNTANT_REJECTED = 'ACCOUNTANT_REJECTED';
    public const ACTION_RESPONSIBLE_APPROVED = 'RESPONSIBLE_APPROVED';
    public const ACTION_RESPONSIBLE_REJECTED = 'RESPONSIBLE_REJECTED';

    /** @var array<string, array{role: string, permission: string, approve_action: string, reject_action: string, next_status: string, label: string}> */
    private const STAGES = [
        OrderWorkflow::PENDING_MANAGER => [
            'role' => 'manager',
            'permission' => 'orders.approve.manager',
            'approve_action' => self::ACTION_MANAGER_APPROVED,
            'reject_action' => self::ACTION_MANAGER_REJECTED,
            'next_status' => OrderWorkflow::PENDING_ACCOUNTANT,
            'label' => 'Manager Approval',
        ],
        OrderWorkflow::PENDING_ACCOUNTANT => [
            'role' => 'accountant',
            'permission' => 'orders.approve.accountant',
            'approve_action' => self::ACTION_ACCOUNTANT_APPROVED,
            'reject_action' => self::ACTION_ACCOUNTANT_REJECTED,
            'next_status' => OrderWorkflow::PENDING_RESPONSIBLE,
            'label' => 'Accountant Approval',
        ],
        OrderWorkflow::PENDING_RESPONSIBLE => [
            'role' => 'responsible',
            'permission' => 'orders.approve.responsible',
            'approve_action' => self::ACTION_RESPONSIBLE_APPROVED,
            'reject_action' => self::ACTION_RESPONSIBLE_REJECTED,
            'next_status' => OrderWorkflow::PENDING_FACTORY,
            'label' => 'Responsible Approval',
        ],
    ];

    public static function fromStatus(?string $status): ?array
    {
        $canonical = OrderWorkflow::canonical($status);

        return self::STAGES[$canonical] ?? null;
    }

    public static function statusForStage(?string $status): ?string
    {
        $canonical = OrderWorkflow::canonical($status);

        return isset(self::STAGES[$canonical]) ? $canonical : null;
    }

    public static function canUserActAtStatus(User $user, ?string $status): bool
    {
        $stage = self::fromStatus($status);

        if (! $stage) {
            return false;
        }

        if ($user->hasPermission('*') || $user->hasPermission($stage['permission'])) {
            return true;
        }

        $roleName = strtolower((string) ($user->role?->name ?? ''));

        return $roleName === $stage['role'];
    }

    public static function assertUserCanAct(User $user, Order $order): array
    {
        $stageStatus = self::statusForStage($order->status);

        if (! $stageStatus) {
            throw new InvalidArgumentException('This order is not awaiting approval at your stage.');
        }

        $stage = self::STAGES[$stageStatus];

        if (! self::canUserActAtStatus($user, $stageStatus)) {
            throw new \RuntimeException('You are not authorized to approve or reject this order at the current stage.');
        }

        return [$stageStatus, $stage];
    }

    public static function approvalChain(): array
    {
        return [
            OrderWorkflow::PENDING_MANAGER,
            OrderWorkflow::PENDING_ACCOUNTANT,
            OrderWorkflow::PENDING_RESPONSIBLE,
            OrderWorkflow::PENDING_FACTORY,
        ];
    }

    public static function stageLabel(?string $status): string
    {
        $stage = self::fromStatus($status);

        return $stage['label'] ?? OrderWorkflow::toFrontend($status) ?? (string) $status;
    }

    public static function roleForAction(string $action): ?string
    {
        foreach (self::STAGES as $stage) {
            if ($stage['approve_action'] === $action || $stage['reject_action'] === $action) {
                return $stage['role'];
            }
        }

        if ($action === self::ACTION_SUBMITTED) {
            return 'sales';
        }

        return null;
    }
}
