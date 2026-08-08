<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\StockMovement;
use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InventoryService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Inventory::with(['product', 'warehouse']);

        if (!empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (!empty($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        if (!empty($filters['search'])) {
            $query->whereHas('product', fn ($q) => $q->where('name', 'LIKE', '%' . $filters['search'] . '%'));
        }

        if (!empty($filters['low_stock'])) {
            $query->whereColumn('quantity', '<=', 'min_stock');
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Inventory
    {
        $inventory = Inventory::create($data)->load(['product', 'warehouse']);
        app(EntityCreatedNotificationService::class)->notify('inventory', $inventory);

        return $inventory;
    }

    public function update(Inventory $inventory, array $data): Inventory
    {
        $inventory->update($data);

        return $inventory->fresh()->load(['product', 'warehouse']);
    }

    public function delete(Inventory $inventory): void
    {
        $inventory->delete();
    }

    public function restore(Inventory $inventory): Inventory
    {
        $inventory->restore();

        return $inventory->fresh()->load(['product', 'warehouse']);
    }

    public function forceDelete(Inventory $inventory): void
    {
        $inventory->forceDelete();
    }

    public function createMovement(array $data): StockMovement
    {
        $typeMap = ['in' => 'IN', 'out' => 'OUT', 'adjustment' => 'ADJUSTMENT'];
        $type = $typeMap[strtolower($data['type'])] ?? strtoupper($data['type']);

        $inventory = Inventory::where('product_id', $data['product_id'])
            ->when(!empty($data['warehouse_id']), fn ($q) => $q->where('warehouse_id', $data['warehouse_id']))
            ->first();

        if ($inventory) {
            match (strtolower($data['type'])) {
                'in' => $inventory->increment('quantity', $data['quantity']),
                'out' => $inventory->decrement('quantity', $data['quantity']),
                'adjustment' => $inventory->update(['quantity' => $data['quantity']]),
                default => null,
            };
        }

        return StockMovement::create([
            'product_id' => $data['product_id'],
            'warehouse_id' => $data['warehouse_id'] ?? $inventory?->warehouse_id,
            'user_id' => auth()->id(),
            'type' => $type,
            'quantity' => $data['quantity'],
            'reason' => $data['reason'] ?? null,
        ]);
    }

    public function getMovements(Inventory $inventory, array $filters = [])
    {
        $query = StockMovement::where('product_id', $inventory->product_id)
            ->where('warehouse_id', $inventory->warehouse_id)
            ->latest();

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function export()
    {
        return Inventory::with(['product', 'warehouse'])->get()->map(fn ($i) => [
            'Produit' => $i->product->name ?? '—',
            'Entrepôt' => $i->warehouse->name ?? '—',
            'Quantité' => $i->quantity,
            'Stock min' => $i->min_stock,
        ]);
    }

    public function categories()
    {
        return Category::orderBy('name')->get(['id', 'name']);
    }

    public function types(): array
    {
        return [
            ['value' => 'finished', 'label' => 'Produit fini'],
            ['value' => 'raw', 'label' => 'Matière première'],
            ['value' => 'packaging', 'label' => 'Emballage'],
        ];
    }

    public function statuses(): array
    {
        return ['available', 'low_stock', 'out_of_stock', 'expired'];
    }

    public function statistics(): array
    {
        return [
            'total' => Inventory::count(),
            'total_quantity' => Inventory::sum('quantity'),
            'low_stock' => Inventory::whereColumn('quantity', '<=', 'min_stock')->count(),
        ];
    }
}
