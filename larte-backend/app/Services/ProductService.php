<?php

namespace App\Services;

use App\Models\Product;
use App\Services\ActivityLogger;
use App\Support\NumberGenerator;
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

        if (empty($data['sku'])) {
            $data['sku'] = NumberGenerator::next('PRD', Product::class, 'sku');
        }

        $product = Product::create($data)->load('category');

        ActivityLogger::logModelEvent($product, 'created', sprintf('Produit %s créé', $product->name));

        return $product;
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        ActivityLogger::logModelEvent($product, 'updated', sprintf('Produit %s mis à jour', $product->name));

        return $product->fresh()->load('category');
    }

    public function delete(Product $product): void
    {
        $name = $product->name;
        $product->delete();

        ActivityLogger::log(
            module: 'products',
            action: 'deleted',
            description: sprintf('Produit %s supprimé', $name),
        );
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

        ActivityLogger::log(
            module: 'products',
            action: 'stock_updated',
            description: sprintf('Stock produit %s mis à jour (%s %d)', $product->name, $type, $quantity),
        );

        return $product->fresh();
    }

    public function updateStatus(Product $product, string $status): Product
    {
        $product->update(['status' => $status]);

        ActivityLogger::log(
            module: 'products',
            action: 'status_changed',
            description: sprintf('Statut produit %s changé en %s', $product->name, $status),
        );

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
