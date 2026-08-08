<?php

namespace App\Services;

use App\Models\Warehouse;
use App\Models\Inventory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class WarehouseService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Warehouse::with('manager');

        if (!empty($filters['search'])) {
            $query->where('name', 'LIKE', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Warehouse
    {
        $warehouse = Warehouse::create($data)->load('manager');
        app(EntityCreatedNotificationService::class)->notify('warehouse', $warehouse);

        return $warehouse;
    }

    public function update(Warehouse $warehouse, array $data): Warehouse
    {
        $warehouse->update($data);

        return $warehouse->fresh()->load('manager');
    }

    public function delete(Warehouse $warehouse): void
    {
        $warehouse->delete();
    }

    public function restore(Warehouse $warehouse): Warehouse
    {
        $warehouse->restore();

        return $warehouse->fresh()->load('manager');
    }

    public function forceDelete(Warehouse $warehouse): void
    {
        $warehouse->forceDelete();
    }

    public function transfer(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $from = Inventory::where('warehouse_id', $data['from_warehouse_id'])
                ->where('product_id', $data['product_id'])
                ->firstOrFail();

            if ($from->quantity < $data['quantity']) {
                throw new \RuntimeException('Stock insuffisant dans l\'entrepôt source');
            }

            $from->decrement('quantity', $data['quantity']);

            $to = Inventory::firstOrCreate(
                ['warehouse_id' => $data['to_warehouse_id'], 'product_id' => $data['product_id']],
                ['quantity' => 0, 'min_stock' => $from->min_stock]
            );

            $to->increment('quantity', $data['quantity']);

            return ['from' => $from->fresh(), 'to' => $to->fresh()];
        });
    }

    public function statistics(): array
    {
        return [
            'total' => Warehouse::count(),
            'active' => Warehouse::where('status', 'active')->count(),
            'inactive' => Warehouse::where('status', 'inactive')->count(),
            'maintenance' => Warehouse::where('status', 'maintenance')->count(),
        ];
    }

    public function export()
    {
        return Warehouse::with('manager')->get()->map(fn ($w) => [
            'Nom' => $w->name,
            'Emplacement' => $w->location,
            'Responsable' => $w->manager->name ?? '—',
            'Statut' => $w->status,
        ]);
    }

    public function types(): array
    {
        return [
            ['value' => 'main', 'label' => 'Principal'],
            ['value' => 'secondary', 'label' => 'Secondaire'],
            ['value' => 'cold_storage', 'label' => 'Chambre froide'],
        ];
    }

    public function statuses(): array
    {
        return ['active', 'inactive', 'maintenance'];
    }
}
