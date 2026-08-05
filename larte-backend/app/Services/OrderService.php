<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Support\OrderWorkflow;
use App\Support\StatusMapper;
use App\Support\NumberGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(private OrderWorkflowService $workflowService)
    {
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

        return StatusMapper::transformOrderCollection(
            $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 10)
        );
    }

    public function create(array $data, int $userId): array
    {
        return DB::transaction(function () use ($data, $userId) {
            $orderNumber = NumberGenerator::next('ORD', Order::class, 'order_number');
            $initialStatus = OrderWorkflow::canonical($data['status'] ?? OrderWorkflow::SUBMITTED);

            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $data['customer_id'],
                'user_id' => $userId,
                'status' => $initialStatus,
                'payment_status' => 'unpaid',
                'notes' => $data['notes'] ?? null,
            ]);

            $subtotal = $this->syncItems($order, $data['items']);
            $order->update(['total_amount' => $subtotal]);

            $this->workflowService->recordInitialStatus(
                $order->fresh(),
                User::find($userId),
                'Commande créée'
            );

            ActivityLogger::log(
                module: 'orders',
                action: 'created',
                description: sprintf('Commande %s créée', $order->order_number),
                userId: $userId,
            );

            return StatusMapper::transformOrder($order->fresh()->load(['customer', 'items.product']));
        });
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
        return [
            'total' => Order::count(),
            'draft' => Order::where('status', OrderWorkflow::DRAFT)->count(),
            'pending' => Order::where('status', OrderWorkflow::SUBMITTED)->count(),
            'validated' => Order::where('status', OrderWorkflow::APPROVED)->count(),
            'in_production' => Order::where('status', OrderWorkflow::PREPARING)->count(),
            'ready' => Order::where('status', OrderWorkflow::READY)->count(),
            'in_delivery' => Order::where('status', OrderWorkflow::ASSIGNED)->count(),
            'delivered' => Order::where('status', OrderWorkflow::DELIVERED)->count(),
            'cancelled' => Order::where('status', OrderWorkflow::CANCELLED)->count(),
            'total_revenue' => Order::where('payment_status', 'paid')->sum('total_amount'),
        ];
    }

    public function export()
    {
        return Order::with(['customer', 'user'])->get()->map(fn ($order) => [
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
        $query = Order::with(['customer'])->orderByDesc('created_at');

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
        $subtotal = 0;

        foreach ($items as $item) {
            $product = Product::findOrFail($item['product_id']);
            $lineTotal = $product->price * $item['quantity'];

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'price' => $product->price,
                'subtotal' => $lineTotal,
            ]);

            $subtotal += $lineTotal;
        }

        return $subtotal;
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
