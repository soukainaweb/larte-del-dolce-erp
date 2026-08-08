<?php

namespace App\Services;

use App\Models\Product;
use App\Models\WasteReturn;
use App\Support\NumberGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class WasteReturnService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = WasteReturn::with(['product', 'creator']);

        if (! empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('reference', 'LIKE', "%{$term}%")
                    ->orWhere('reason', 'LIKE', "%{$term}%");
            });
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        return $query->orderByDesc('recorded_date')->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): WasteReturn
    {
        return DB::transaction(function () use ($data) {
            $data['reference'] = $data['reference']
                ?? NumberGenerator::next('WRN', WasteReturn::class, 'reference');
            $data['created_by'] = auth()->id();
            $data['inventory_adjusted'] = $data['inventory_adjusted'] ?? true;

            $record = WasteReturn::create($data);

            if ($data['inventory_adjusted']) {
                $product = Product::findOrFail($data['product_id']);
                $product->decrement('stock_quantity', (int) $data['quantity']);
            }

            $record = $record->load(['product', 'creator']);
            app(EntityCreatedNotificationService::class)->notify('waste_return', $record);

            return $record;
        });
    }

    public function update(WasteReturn $wasteReturn, array $data): WasteReturn
    {
        unset($data['reference']);
        $wasteReturn->update($data);

        return $wasteReturn->fresh()->load(['product', 'creator']);
    }

    public function delete(WasteReturn $wasteReturn): void
    {
        $wasteReturn->delete();
    }

    public function statistics(): array
    {
        return [
            'total' => WasteReturn::count(),
            'waste' => WasteReturn::where('type', 'waste')->count(),
            'returns' => WasteReturn::where('type', 'return')->count(),
            'total_quantity' => WasteReturn::sum('quantity'),
        ];
    }

    public function types(): array
    {
        return [
            ['value' => 'waste', 'label' => 'Waste'],
            ['value' => 'return', 'label' => 'Return'],
        ];
    }
}
