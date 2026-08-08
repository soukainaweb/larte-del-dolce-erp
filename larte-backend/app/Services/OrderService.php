<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Customer;
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

        if (SalesScope::isSalesRep($actor)) {
            $salesRepsQuery->where('id', $actor->id);
        }

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
                ->get(['id', 'first_name', 'last_name', 'email'])
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'first_name' => $u->first_name,
                    'last_name' => $u->last_name,
                    'email' => $u->email,
                    'full_name' => trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? '')),
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
            $initialStatus = OrderWorkflow::canonical($data['status'] ?? OrderWorkflow::SUBMITTED);

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
                'Commande créée'
            );

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
        if (SalesScope::isSalesRep($actor)) {
            return (int) $actor->id;
        }

        if ($salesRepId) {
            $rep = User::query()
                ->where('id', $salesRepId)
                ->whereHas('role', fn ($q) => $q->where('name', 'sales'))
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

    public function validate(Order $order, ?User $user = null): array
    {
        return $this->workflowService->transition(
            $order,
            OrderWorkflow::APPROVED,
            'Commande validée',
            $user
        );
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
            'pending' => (clone $query)->where('status', OrderWorkflow::SUBMITTED)->count(),
            'validated' => (clone $query)->where('status', OrderWorkflow::APPROVED)->count(),
            'in_production' => (clone $query)->where('status', OrderWorkflow::PREPARING)->count(),
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
