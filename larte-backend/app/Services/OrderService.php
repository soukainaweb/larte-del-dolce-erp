<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Customer;
use App\Support\OrderApprovalStage;
use App\Support\SalesScope;
use App\Support\OrderWorkflow;
use App\Support\StatusMapper;
use App\Support\NumberGenerator;
use App\Support\UserStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private OrderWorkflowService $workflowService,
        private EntityCreatedNotificationService $entityNotifications,
        private OrderApprovalService $approvalService,
        private FactoryOrderService $factoryService,
    ) {
    }

    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Order::with(['customer', 'user', 'items.product']);

        if (!empty($filters['search'])) {
            $query->where('order_number', 'LIKE', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', StatusMapper::orderToDb($filters['status']));
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', StatusMapper::paymentToDb($filters['payment_status']));
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        SalesScope::applyOrderScope($query);

        return StatusMapper::transformOrderCollection(
            $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 10)
        );
    }

    public function formOptions(User $actor): array
    {
        $customersQuery = Customer::query()
            ->where('status', 'active')
            ->orderBy('name');
        SalesScope::applyCustomerScope($customersQuery, $actor);

        $productsQuery = Product::query()
            ->where('status', 'active')
            ->orderBy('name');

        $salesRepsQuery = User::query()
            ->with('role:id,name')
            ->whereHas('role', fn ($q) => $q->where('name', 'sales'))
            ->whereNotIn('status', UserStatus::blockedForLogin())
            ->orderBy('first_name')
            ->orderBy('last_name');

        return [
            'customers' => $customersQuery
                ->limit(200)
                ->get(['id', 'name', 'email', 'phone', 'address', 'city'])
                ->map(fn (Customer $c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'email' => $c->email,
                    'phone' => $c->phone,
                    'address' => $c->address,
                    'city' => $c->city,
                ])
                ->values()
                ->all(),
            'products' => $productsQuery
                ->limit(200)
                ->get(['id', 'name', 'sku', 'price'])
                ->map(fn (Product $p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'price' => (float) $p->price,
                ])
                ->values()
                ->all(),
            'sales_reps' => $salesRepsQuery
                ->limit(100)
                ->get(['id', 'first_name', 'last_name', 'email', 'role_id'])
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'first_name' => $u->first_name,
                    'last_name' => $u->last_name,
                    'email' => $u->email,
                    'full_name' => trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? '')),
                    'role' => $u->role?->name,
                ])
                ->values()
                ->all(),
        ];
    }

    public function create(array $data, int $userId): array
    {
        return DB::transaction(function () use ($data, $userId) {
            $actor = User::findOrFail($userId);
            $salesRepId = $this->resolveSalesRepId($data['sales_rep_id'] ?? null, $actor);
            unset($data['sales_rep_id']);

            $orderNumber = NumberGenerator::next('ORD', Order::class, 'order_number');
            $initialStatus = OrderWorkflow::PENDING_MANAGER;

            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $data['customer_id'],
                'user_id' => $salesRepId,
                'status' => $initialStatus,
                'payment_status' => 'unpaid',
                'priority' => $data['priority'] ?? 'medium',
                'delivery_date' => $data['delivery_date'] ?? null,
                'delivery_time' => $data['delivery_time'] ?? null,
                'payment_method' => $data['payment_method'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            $total = $this->syncItems($order, $data['items']);
            $order->update(['total_amount' => $total]);

            $this->workflowService->recordInitialStatus(
                $order->fresh(),
                $actor,
                'Order submitted'
            );

            $this->approvalService->recordSubmitted($order->fresh(), $actor);

            ActivityLogger::log(
                module: 'orders',
                action: 'created',
                description: sprintf('Commande %s créée', $order->order_number),
                userId: $userId,
            );

            $order = $order->fresh()->load(['customer', 'user', 'items.product']);
            $this->entityNotifications->notify('order', $order, $actor);

            return StatusMapper::transformOrder($order);
        });
    }

    protected function resolveSalesRepId(?int $salesRepId, User $actor): int
    {
        if ($salesRepId) {
            $rep = User::query()
                ->where('id', $salesRepId)
                ->whereHas('role', fn ($q) => $q->where('name', 'sales'))
                ->whereNotIn('status', UserStatus::blockedForLogin())
                ->first();

            if ($rep) {
                return (int) $rep->id;
            }
        }

        return (int) $actor->id;
    }

    public function update(Order $order, array $data): array
    {
        $order->update($data);

        ActivityLogger::log(
            module: 'orders',
            action: 'updated',
            description: sprintf('Commande %s mise à jour', $order->order_number),
        );

        return StatusMapper::transformOrder($order->fresh()->load(['customer', 'items.product']));
    }

    public function show(Order $order, ?User $viewer = null): array
    {
        $viewer ??= auth()->user();
        $order->load(['customer', 'user', 'items.product', 'approvals.user']);
        $data = StatusMapper::transformOrder($order);
        $data['approval_history'] = $this->approvalService->approvalHistory($order);
        $data['approval_progress'] = $this->approvalService->approvalProgress($order);
        $data['can_approve'] = $viewer ? $this->approvalService->canUserApprove($viewer, $order) : false;
        $data['can_reject'] = $data['can_approve'];
        $data['rejection'] = $this->approvalService->latestRejection($order);
        $data['can_factory_accept'] = $viewer && $this->canPerformFactoryAction($viewer, $order, 'orders.factory.accept');
        $data['can_factory_postpone'] = $viewer && $this->canPerformFactoryAction($viewer, $order, 'orders.factory.postpone');
        $data['can_factory_ready'] = $viewer && $this->canPerformFactoryAction($viewer, $order, 'orders.factory.ready');
        $data['can_factory_assign_rep'] = $viewer && $this->canPerformFactoryAction($viewer, $order, 'orders.factory.assign_rep');
        $data['can_confirm_pickup'] = $viewer && $this->canConfirmPickup($viewer, $order);
        $data['can_confirm_delivery'] = $viewer && $this->canConfirmDelivery($viewer, $order);

        return $data;
    }

    protected function canPerformFactoryAction(User $user, Order $order, string $permission): bool
    {
        if (! $user->hasPermission($permission)) {
            return false;
        }

        $status = OrderWorkflow::canonical($order->status);

        return match ($permission) {
            'orders.factory.accept' => in_array($status, [OrderWorkflow::PENDING_FACTORY, OrderWorkflow::POSTPONED], true),
            'orders.factory.postpone' => in_array($status, [OrderWorkflow::PENDING_FACTORY, OrderWorkflow::PREPARING], true),
            'orders.factory.ready' => $status === OrderWorkflow::PREPARING,
            'orders.factory.assign_rep' => $status === OrderWorkflow::READY && ! $order->assigned_rep_id,
            default => false,
        };
    }

    protected function canConfirmPickup(User $user, Order $order): bool
    {
        return $user->hasPermission('orders.pickup')
            && OrderWorkflow::canonical($order->status) === OrderWorkflow::READY
            && $order->assigned_rep_id
            && ! $order->pickup_photo
            && SalesScope::isAssignedRep($order, $user);
    }

    protected function canConfirmDelivery(User $user, Order $order): bool
    {
        return $user->hasPermission('orders.deliver')
            && OrderWorkflow::canonical($order->status) === OrderWorkflow::ASSIGNED
            && $order->pickup_photo
            && ! $order->delivery_photo
            && SalesScope::isAssignedRep($order, $user);
    }

    public function factoryAccept(Order $order, ?User $user = null): array
    {
        return $this->factoryService->accept($order, $user);
    }

    public function factoryPostpone(Order $order, string $reason, ?string $until = null, ?User $user = null): array
    {
        return $this->factoryService->postpone($order, $reason, $until, $user);
    }

    public function factoryMarkReady(Order $order, ?User $user = null): array
    {
        return $this->factoryService->markReadyForPickup($order, $user);
    }

    public function factoryAssignRepresentative(Order $order, int $repId, ?User $user = null): array
    {
        return $this->factoryService->assignRepresentative($order, $repId, $user);
    }

    public function confirmPickup(Order $order, mixed $photo, ?User $user = null): array
    {
        return $this->factoryService->confirmPickup($order, $photo, $user);
    }

    public function confirmDelivery(Order $order, mixed $photo, ?User $user = null): array
    {
        return $this->factoryService->confirmDelivery($order, $photo, $user);
    }

    public function availableRepresentatives()
    {
        return $this->factoryService->availableRepresentatives()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'first_name' => $u->first_name,
                'last_name' => $u->last_name,
                'email' => $u->email,
                'full_name' => trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? '')),
                'availability_status' => $u->availability_status,
            ])
            ->values()
            ->all();
    }

    public function approve(Order $order, ?User $user = null): array
    {
        return $this->approvalService->approve($order, $user);
    }

    public function reject(Order $order, string $reason, ?User $user = null): array
    {
        return $this->approvalService->reject($order, $reason, $user);
    }

    public function validate(Order $order, ?User $user = null): array
    {
        return $this->approvalService->approve($order, $user);
    }

    public function cancel(Order $order, ?string $reason = null, ?User $user = null): array
    {
        if (in_array($order->status, [OrderWorkflow::DELIVERED, OrderWorkflow::CANCELLED, OrderWorkflow::ARCHIVED], true)) {
            throw new \RuntimeException('This order cannot be cancelled.');
        }

        if ($reason) {
            $order->update([
                'notes' => trim(($order->notes ?? '') . "\nCancel reason: {$reason}"),
            ]);
        }

        return $this->workflowService->transition(
            $order->fresh(),
            OrderWorkflow::CANCELLED,
            $reason ?? 'Commande annulée',
            $user
        );
    }

    public function updateStatus(Order $order, string $status, ?string $comment = null, ?User $user = null): array
    {
        return $this->workflowService->transition($order, $status, $comment, $user);
    }

    public function updatePayment(Order $order, array $data): array
    {
        $order->update([
            'payment_status' => StatusMapper::paymentToDb($data['payment_status'] ?? $order->payment_status),
        ]);

        ActivityLogger::log(
            module: 'orders',
            action: 'payment_updated',
            description: sprintf('Paiement commande %s mis à jour', $order->order_number),
        );

        return StatusMapper::transformOrder($order->fresh());
    }

    public function startProduction(Order $order, ?User $user = null): array
    {
        return $this->workflowService->transition(
            $order,
            OrderWorkflow::PREPARING,
            'Production démarrée',
            $user
        );
    }

    public function delete(Order $order): void
    {
        if ($order->status === OrderWorkflow::DELIVERED) {
            throw new \RuntimeException('Cannot delete a delivered order.');
        }

        $orderNumber = $order->order_number;
        $order->delete();

        ActivityLogger::log(
            module: 'orders',
            action: 'deleted',
            description: sprintf('Commande %s supprimée', $orderNumber),
        );
    }

    public function getProducts(Order $order)
    {
        return $order->items()->with('product')->get();
    }

    public function addProduct(Order $order, array $item): OrderItem
    {
        $product = Product::findOrFail($item['product_id']);
        $quantity = $item['quantity'];
        $subtotal = $product->price * $quantity;

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => $quantity,
            'price' => $product->price,
            'subtotal' => $subtotal,
        ]);

        $this->recalculateTotal($order);

        ActivityLogger::log(
            module: 'orders',
            action: 'product_added',
            description: sprintf('Produit ajouté à la commande %s', $order->order_number),
        );

        return $orderItem->load('product');
    }

    public function updateProductQuantity(Order $order, OrderItem $item, int $quantity): OrderItem
    {
        if ($item->order_id !== $order->id) {
            throw new \RuntimeException('Order item does not belong to this order.');
        }

        $item->update([
            'quantity' => $quantity,
            'subtotal' => $item->price * $quantity,
        ]);

        $this->recalculateTotal($order);

        return $item->fresh()->load('product');
    }

    public function removeProduct(Order $order, OrderItem $item): void
    {
        if ($item->order_id !== $order->id) {
            throw new \RuntimeException('Order item does not belong to this order.');
        }

        $item->delete();
        $this->recalculateTotal($order);
    }

    public function statistics(): array
    {
        $query = SalesScope::applyOrderScope(Order::query());

        return [
            'total' => (clone $query)->count(),
            'draft' => (clone $query)->where('status', OrderWorkflow::DRAFT)->count(),
            'pending' => (clone $query)->whereIn('status', [
                OrderWorkflow::PENDING_MANAGER,
                OrderWorkflow::PENDING_ACCOUNTANT,
                OrderWorkflow::PENDING_RESPONSIBLE,
            ])->count(),
            'validated' => (clone $query)->whereIn('status', [
                OrderWorkflow::APPROVED,
                OrderWorkflow::PENDING_FACTORY,
            ])->count(),
            'in_production' => (clone $query)->whereIn('status', [
                OrderWorkflow::PREPARING,
                OrderWorkflow::POSTPONED,
            ])->count(),
            'ready' => (clone $query)->where('status', OrderWorkflow::READY)->count(),
            'in_delivery' => (clone $query)->where('status', OrderWorkflow::ASSIGNED)->count(),
            'delivered' => (clone $query)->where('status', OrderWorkflow::DELIVERED)->count(),
            'cancelled' => (clone $query)->where('status', OrderWorkflow::CANCELLED)->count(),
            'total_revenue' => (clone $query)->where('payment_status', 'paid')->sum('total_amount'),
        ];
    }

    public function export()
    {
        $query = SalesScope::applyOrderScope(Order::with(['customer', 'user']));

        return $query->get()->map(fn ($order) => [
            'N° Commande' => $order->order_number,
            'Client' => $order->customer->name ?? '—',
            'Total' => $order->total_amount,
            'Statut' => StatusMapper::orderFromDb($order->status),
            'Paiement' => $order->payment_status,
            'Date' => $order->created_at->format('Y-m-d H:i'),
        ]);
    }

    public function history(array $filters = [])
    {
        $query = SalesScope::applyOrderScope(Order::with(['customer'])->orderByDesc('created_at'));

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        return StatusMapper::transformOrderCollection(
            $query->paginate($filters['per_page'] ?? 20)
        );
    }

    public function statusHistory(Order $order)
    {
        return $this->workflowService->statusHistory($order);
    }

    public function allowedTransitions(Order $order): array
    {
        return $this->workflowService->allowedTransitions($order);
    }

    private function syncItems(Order $order, array $items): float
    {
        $total = 0;

        foreach ($items as $item) {
            $product = Product::findOrFail($item['product_id']);
            $quantity = max(1, (int) $item['quantity']);
            $price = isset($item['price']) ? max(0, (float) $item['price']) : (float) $product->price;
            $discount = min(100, max(0, (float) ($item['discount'] ?? 0)));
            $lineSubtotal = $price * $quantity;
            $lineDiscount = $lineSubtotal * ($discount / 100);
            $lineTotal = $lineSubtotal - $lineDiscount;

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'price' => $price,
                'discount' => $discount,
                'subtotal' => round($lineTotal, 2),
            ]);

            $total += $lineTotal;
        }

        return round($total, 2);
    }

    private function recalculateTotal(Order $order): void
    {
        $order->update([
            'total_amount' => $order->items()->sum('subtotal'),
        ]);
    }

    public function statuses(): array
    {
        return StatusMapper::orderStatuses();
    }

    public function paymentStatuses(): array
    {
        return StatusMapper::paymentStatuses();
    }
}
