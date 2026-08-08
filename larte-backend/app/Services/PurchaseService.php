<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Purchase;
use App\Support\NumberGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Purchase::with(['product', 'supplier', 'creator']);

        if (! empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('material_name', 'LIKE', "%{$term}%")
                    ->orWhere('purchase_number', 'LIKE', "%{$term}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        return $query->orderByDesc('purchase_date')->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Purchase
    {
        return DB::transaction(function () use ($data) {
            $data['purchase_number'] = $data['purchase_number']
                ?? NumberGenerator::next('PUR', Purchase::class, 'purchase_number');
            $data['created_by'] = auth()->id();
            $data['total_price'] = ($data['quantity'] ?? 0) * ($data['unit_price'] ?? 0);

            $purchase = Purchase::create($data);

            if (($data['status'] ?? 'pending') === 'received' && ! empty($data['product_id'])) {
                Product::whereKey($data['product_id'])->increment('stock_quantity', (int) $data['quantity']);
            }

            $purchase = $purchase->load(['product', 'supplier', 'creator']);
            app(EntityCreatedNotificationService::class)->notify('purchase', $purchase);

            return $purchase;
        });
    }

    public function update(Purchase $purchase, array $data): Purchase
    {
        unset($data['purchase_number']);

        $previousStatus = $purchase->status;
        $previousQty = $purchase->quantity;

        if (isset($data['quantity'], $data['unit_price'])) {
            $data['total_price'] = $data['quantity'] * $data['unit_price'];
        }

        $purchase->update($data);
        $purchase->refresh();

        if ($purchase->product_id) {
            if ($previousStatus === 'received' && $purchase->status === 'cancelled') {
                Product::whereKey($purchase->product_id)->decrement('stock_quantity', $previousQty);
            } elseif ($previousStatus !== 'received' && $purchase->status === 'received') {
                Product::whereKey($purchase->product_id)->increment('stock_quantity', $purchase->quantity);
            }
        }

        return $purchase->fresh()->load(['product', 'supplier', 'creator']);
    }

    public function delete(Purchase $purchase): void
    {
        if ($purchase->status === 'received' && $purchase->product_id) {
            Product::whereKey($purchase->product_id)->decrement('stock_quantity', $purchase->quantity);
        }

        $purchase->delete();
    }

    public function statistics(): array
    {
        return [
            'total' => Purchase::count(),
            'pending' => Purchase::where('status', 'pending')->count(),
            'received' => Purchase::where('status', 'received')->count(),
            'total_amount' => Purchase::sum('total_price'),
        ];
    }

    public function statuses(): array
    {
        return [
            ['value' => 'pending', 'label' => 'Pending'],
            ['value' => 'received', 'label' => 'Received'],
            ['value' => 'cancelled', 'label' => 'Cancelled'],
        ];
    }
}
