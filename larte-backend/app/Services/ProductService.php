<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class ProductService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Product::with(['category']);

        if (!empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('name', 'LIKE', "%{$term}%")
                    ->orWhere('sku', 'LIKE', "%{$term}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Product
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']) . '-' . Str::random(4);
        }

        return Product::create($data)->load('category');
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->fresh()->load('category');
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }

    public function forceDelete(Product $product): void
    {
        $product->forceDelete();
    }

    public function restore(Product $product): Product
    {
        $product->restore();

        return $product->fresh()->load('category');
    }

    public function updateStock(Product $product, int $quantity, string $type): Product
    {
        match ($type) {
            'add' => $product->increment('stock_quantity', $quantity),
            'subtract' => $product->decrement('stock_quantity', $quantity),
            'set' => $product->update(['stock_quantity' => $quantity]),
            default => throw new \InvalidArgumentException('Invalid stock update type.'),
        };

        return $product->fresh();
    }

    public function updateStatus(Product $product, string $status): Product
    {
        $product->update(['status' => $status]);

        return $product->fresh();
    }

    public function statistics(): array
    {
        return [
            'total' => Product::count(),
            'active' => Product::where('status', 'active')->count(),
            'inactive' => Product::where('status', 'inactive')->count(),
            'out_of_stock' => Product::where('stock_quantity', 0)->count(),
            'low_stock' => Product::where('stock_quantity', '<', 10)->count(),
            'total_stock' => Product::sum('stock_quantity'),
        ];
    }

    public function export()
    {
        return Product::with('category')->get()->map(fn ($product) => [
            'Nom' => $product->name,
            'SKU' => $product->sku,
            'Catégorie' => $product->category->name ?? '—',
            'Prix' => $product->price,
            'Prix coût' => $product->cost_price,
            'Stock' => $product->stock_quantity,
            'Statut' => $product->status,
        ]);
    }

    public function categories()
    {
        return Product::query()
            ->select('category_id')
            ->distinct()
            ->with('category')
            ->get()
            ->pluck('category')
            ->filter()
            ->values();
    }

    public function statuses(): array
    {
        return ['active', 'inactive', 'out_of_stock', 'low_stock'];
    }
}
