<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Support\StatusMapper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrderService
{
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

    public function create(array $data, int $userId): Order
    {
        return DB::transaction(function () use ($data, $userId) {
            $orderNumber = 'ORD-' . date('Ymd') . '-' . str_pad(Order::count() + 1, 4, '0', STR_PAD_LEFT);

            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $data['customer_id'],
                'user_id' => $userId,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'notes' => $data['notes'] ?? null,
            ]);

            $subtotal = $this->syncItems($order, $data['items']);

            $order->update(['total_amount' => $subtotal]);

            return StatusMapper::transformOrder($order->load(['customer', 'items.product']));
        });
    }

    public function update(Order $order, array $data): Order
    {
        $order->update($data);

        return StatusMapper::transformOrder($order->fresh()->load(['customer', 'items.product']));
    }

    public function validate(Order $order): Order
    {
        if ($order->status !== 'pending') {
            throw new \RuntimeException('Only pending orders can be validated.');
        }

        $order->update(['status' => 'confirmed']);

        return StatusMapper::transformOrder($order->fresh()->load(['customer', 'items.product']));
    }

    public function cancel(Order $order, ?string $reason = null): Order
    {
        if (in_array($order->status, ['completed', 'cancelled'], true)) {
            throw new \RuntimeException('This order cannot be cancelled.');
        }

        $order->update([
            'status' => 'cancelled',
            'notes' => trim(($order->notes ?? '') . ($reason ? "\nCancel reason: {$reason}" : '')),
        ]);

        return $order->fresh();
    }

    public function updateStatus(Order $order, string $status): Order
    {
        $order->update(['status' => StatusMapper::orderToDb($status)]);

        return StatusMapper::transformOrder($order->fresh());
    }

    public function updatePayment(Order $order, array $data): Order
    {
        $order->update([
            'payment_status' => StatusMapper::paymentToDb($data['payment_status'] ?? $order->payment_status),
        ]);

        return StatusMapper::transformOrder($order->fresh());
    }

    public function startProduction(Order $order, array $data = []): Order
    {
        if (!in_array($order->status, ['confirmed', 'pending'], true)) {
            throw new \RuntimeException('Order must be confirmed before production.');
        }

        $order->update(['status' => 'processing']);

        return StatusMapper::transformOrder($order->fresh()->load(['customer', 'items.product']));
    }

    public function delete(Order $order): void
    {
        if ($order->status === 'completed') {
            throw new \RuntimeException('Cannot delete a completed order.');
        }

        $order->delete();
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
            'pending' => Order::where('status', 'pending')->count(),
            'confirmed' => Order::where('status', 'confirmed')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'completed' => Order::where('status', 'completed')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
            'total_revenue' => Order::where('payment_status', 'paid')->sum('total_amount'),
        ];
    }

    public function export()
    {
        return Order::with(['customer', 'user'])->get()->map(fn ($order) => [
            'N° Commande' => $order->order_number,
            'Client' => $order->customer->name ?? '—',
            'Total' => $order->total_amount,
            'Statut' => $order->status,
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

        return $query->paginate($filters['per_page'] ?? 20);
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
