<?php

namespace App\Support;

use App\Models\Order;
use App\Models\OrderApproval;
use App\Models\OrderStatusHistory;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

/**
 * Safely remediates in-flight orders created under the pre-PR#60 workflow
 * (representative submit → pending_accountant) to the manager-first chain.
 */
final class LegacyOrderRemediation
{
    /** @var list<string> */
    private const BLOCKING_APPROVAL_ACTIONS = [
        OrderApprovalStage::ACTION_MANAGER_APPROVED,
        OrderApprovalStage::ACTION_MANAGER_REJECTED,
        OrderApprovalStage::ACTION_ACCOUNTANT_APPROVED,
        OrderApprovalStage::ACTION_ACCOUNTANT_REJECTED,
        OrderApprovalStage::ACTION_RESPONSIBLE_APPROVED,
        OrderApprovalStage::ACTION_RESPONSIBLE_REJECTED,
    ];

    /** @var list<string> */
    private const BLOCKING_STATUSES = [
        OrderWorkflow::PENDING_RESPONSIBLE,
        OrderWorkflow::PENDING_FACTORY,
        OrderWorkflow::APPROVED,
        OrderWorkflow::PREPARING,
        OrderWorkflow::POSTPONED,
        OrderWorkflow::READY,
        OrderWorkflow::ASSIGNED,
        OrderWorkflow::DELIVERED,
        OrderWorkflow::ARCHIVED,
        OrderWorkflow::CANCELLED,
        OrderWorkflow::REJECTED,
    ];

    /**
     * @return array{
     *     order: Order,
     *     eligible: bool,
     *     already_remediated: bool,
     *     message: string,
     *     from_status: string|null,
     *     to_status: string|null
     * }
     */
    public static function assess(string $identifier): array
    {
        $order = self::findOrder($identifier);
        $status = OrderWorkflow::canonical($order->status);

        if ($status === OrderWorkflow::PENDING_MANAGER) {
            $blocking = self::blockingReason($order, $status);

            if ($blocking !== null) {
                return self::result($order, false, false, $blocking, $status, null);
            }

            return self::result(
                $order,
                true,
                true,
                'Order is already pending_manager with only representative submission; no change needed.',
                $status,
                OrderWorkflow::PENDING_MANAGER,
            );
        }

        if ($status !== OrderWorkflow::PENDING_ACCOUNTANT) {
            return self::result(
                $order,
                false,
                false,
                sprintf(
                    'Order status must be pending_accountant (or already pending_manager). Current status: %s.',
                    $status ?? (string) $order->status
                ),
                $status,
                null,
            );
        }

        $blocking = self::blockingReason($order, $status);

        if ($blocking !== null) {
            return self::result($order, false, false, $blocking, $status, null);
        }

        return self::result(
            $order,
            true,
            false,
            'Eligible for legacy remediation: pending_accountant → pending_manager.',
            $status,
            OrderWorkflow::PENDING_MANAGER,
        );
    }

    /**
     * @return array{
     *     order: Order,
     *     applied: bool,
     *     already_remediated: bool,
     *     message: string,
     *     from_status: string|null,
     *     to_status: string|null
     * }
     */
    public static function apply(string $identifier): array
    {
        return DB::transaction(function () use ($identifier) {
            /** @var Order $order */
            $order = self::findOrder($identifier);
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);

            $assessment = self::assessFromModel($order);

            if (! $assessment['eligible']) {
                throw new RuntimeException($assessment['message']);
            }

            if ($assessment['already_remediated']) {
                return [
                    'order' => $order->fresh(['customer', 'user', 'approvals.user']),
                    'applied' => false,
                    'already_remediated' => true,
                    'message' => $assessment['message'],
                    'from_status' => $assessment['from_status'],
                    'to_status' => $assessment['to_status'],
                ];
            }

            $fromStatus = (string) $order->status;
            $toStatus = OrderWorkflow::PENDING_MANAGER;
            $comment = 'Legacy workflow remediation: repositioned from pending_accountant to pending_manager for PR #60 manager-first approval chain. Approval history preserved; no synthetic approvals created.';

            $order->update(['status' => $toStatus]);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'user_id' => null,
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
                'comment' => $comment,
                'ip_address' => null,
                'device' => 'artisan:erp:remediate-legacy-order',
            ]);

            ActivityLogger::log(
                module: 'orders',
                action: 'legacy_remediation',
                description: sprintf(
                    'Order %s legacy remediation: %s → %s (PR #60 manager-first workflow).',
                    $order->order_number,
                    OrderWorkflow::toFrontend($fromStatus) ?? $fromStatus,
                    OrderWorkflow::toFrontend($toStatus) ?? $toStatus,
                ),
                level: 'info',
                status: 'success',
                userId: null,
                ip: null,
            );

            return [
                'order' => $order->fresh(['customer', 'user', 'approvals.user']),
                'applied' => true,
                'already_remediated' => false,
                'message' => 'Legacy remediation applied successfully.',
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
            ];
        });
    }

    public static function findOrder(string $identifier): Order
    {
        $identifier = trim($identifier);

        if ($identifier === '') {
            throw new InvalidArgumentException('Order identifier is required.');
        }

        $query = Order::query()->with(['approvals', 'customer', 'user']);

        $order = ctype_digit($identifier)
            ? $query->find((int) $identifier)
            : $query->where('order_number', $identifier)->first();

        if (! $order) {
            throw new InvalidArgumentException(sprintf('Order not found: %s', $identifier));
        }

        return $order;
    }

    /**
     * @return array{
     *     order: Order,
     *     eligible: bool,
     *     already_remediated: bool,
     *     message: string,
     *     from_status: string|null,
     *     to_status: string|null
     * }
     */
    private static function assessFromModel(Order $order): array
    {
        $status = OrderWorkflow::canonical($order->status);

        if ($status === OrderWorkflow::PENDING_MANAGER) {
            $blocking = self::blockingReason($order, $status);

            if ($blocking !== null) {
                return self::result($order, false, false, $blocking, $status, null);
            }

            return self::result(
                $order,
                true,
                true,
                'Order is already pending_manager with only representative submission; no change needed.',
                $status,
                OrderWorkflow::PENDING_MANAGER,
            );
        }

        if ($status !== OrderWorkflow::PENDING_ACCOUNTANT) {
            return self::result(
                $order,
                false,
                false,
                sprintf(
                    'Order status must be pending_accountant (or already pending_manager). Current status: %s.',
                    $status ?? (string) $order->status
                ),
                $status,
                null,
            );
        }

        $blocking = self::blockingReason($order, $status);

        if ($blocking !== null) {
            return self::result($order, false, false, $blocking, $status, null);
        }

        return self::result(
            $order,
            true,
            false,
            'Eligible for legacy remediation: pending_accountant → pending_manager.',
            $status,
            OrderWorkflow::PENDING_MANAGER,
        );
    }

    private static function blockingReason(Order $order, ?string $status): ?string
    {
        if ($status !== null && in_array($status, self::BLOCKING_STATUSES, true)) {
            return sprintf('Order has progressed beyond remediation scope (status: %s).', $status);
        }

        if (! self::hasSubmittedApproval($order)) {
            return 'Order is missing the representative SUBMITTED approval record.';
        }

        $blockingAction = $order->approvals
            ->first(fn (OrderApproval $approval) => in_array($approval->action, self::BLOCKING_APPROVAL_ACTIONS, true));

        if ($blockingAction) {
            return sprintf('Downstream approval action exists: %s.', $blockingAction->action);
        }

        if (self::hasPickupOrDeliveryEvidence($order)) {
            return 'Pickup or delivery evidence exists on the order.';
        }

        if (self::hasFactoryEvidence($order)) {
            return 'Factory processing evidence exists on the order.';
        }

        return null;
    }

    private static function hasSubmittedApproval(Order $order): bool
    {
        return $order->approvals->contains(
            fn (OrderApproval $approval) => $approval->action === OrderApprovalStage::ACTION_SUBMITTED
        );
    }

    private static function hasPickupOrDeliveryEvidence(Order $order): bool
    {
        return $order->pickup_at !== null
            || filled($order->pickup_photo)
            || $order->delivered_at !== null
            || filled($order->delivery_photo)
            || $order->assigned_rep_id !== null;
    }

    private static function hasFactoryEvidence(Order $order): bool
    {
        return filled($order->factory_postponed_reason)
            || $order->factory_postponed_until !== null;
    }

    /**
     * @return array{
     *     order: Order,
     *     eligible: bool,
     *     already_remediated: bool,
     *     message: string,
     *     from_status: string|null,
     *     to_status: string|null
     * }
     */
    private static function result(
        Order $order,
        bool $eligible,
        bool $alreadyRemediated,
        string $message,
        ?string $fromStatus,
        ?string $toStatus,
    ): array {
        return [
            'order' => $order,
            'eligible' => $eligible,
            'already_remediated' => $alreadyRemediated,
            'message' => $message,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
        ];
    }
}
