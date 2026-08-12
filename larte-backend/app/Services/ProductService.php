<?php

namespace App\Services;

use App\Models\Product;
use App\Services\ActivityLogger;
use App\Support\NumberGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;

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

        $sortColumn = match ($filters['sort_by'] ?? 'created_at') {
            'createdAt', 'created_at' => 'created_at',
            'name' => 'name',
            'price' => 'price',
            'stock', 'stock_quantity' => 'stock_quantity',
            default => 'created_at',
        };
        $sortDirection = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        $paginator = $query
            ->orderBy($sortColumn, $sortDirection)
            ->paginate($filters['per_page'] ?? 10);
        $paginator->getCollection()->transform(fn (Product $product) => $this->withPublicImageUrl($product));

        return $paginator;
    }

    public function create(array $data): Product
    {
        try {
            $data = $this->preparePersistedData($data);
            $product = Product::create($data)->load('category');
        } catch (\Throwable $e) {
            Log::error('ProductService::create failed', [
                'user_id' => auth()->id(),
                'name' => $data['name'] ?? null,
                'sku' => $data['sku'] ?? null,
                'exception' => $e->getMessage(),
                'exception_class' => $e::class,
            ]);

            throw $e;
        }

        ActivityLogger::logModelEvent($product, 'created', sprintf('Produit %s créé', $product->name));
        app(EntityCreatedNotificationService::class)->notify('product', $product);

        return $this->withPublicImageUrl($product);
    }

    public function update(Product $product, array $data): Product
    {
        if (array_key_exists('image', $data)) {
            $data['image'] = $this->persistImage($data['image'], $product->getRawOriginal('image'));
        }

        $product->update($data);

        ActivityLogger::logModelEvent($product, 'updated', sprintf('Produit %s mis à jour', $product->name));

        return $this->withPublicImageUrl($product->fresh()->load('category'));
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

    protected function preparePersistedData(array $data): array
    {
        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug((string) ($data['name'] ?? 'product'));
        }

        if (empty($data['sku'])) {
            $data['sku'] = NumberGenerator::next('PRD', Product::class, 'sku');
        }

        if (! array_key_exists('cost_price', $data) || $data['cost_price'] === null || $data['cost_price'] === '') {
            $data['cost_price'] = $data['price'] ?? 0;
        }

        if (array_key_exists('image', $data)) {
            $data['image'] = $this->persistImage($data['image']);
        }

        return $data;
    }

    protected function generateUniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        if ($base === '') {
            $base = 'product';
        }

        do {
            $slug = $base . '-' . Str::lower(Str::random(6));
        } while (Product::withTrashed()->where('slug', $slug)->exists());

        return $slug;
    }

    protected function persistImage(mixed $image, ?string $existingPath = null): ?string
    {
        if ($image === null || $image === '') {
            return null;
        }

        if (is_string($image) && str_starts_with($image, 'blob:')) {
            throw new InvalidArgumentException('Invalid image data.');
        }

        if (is_string($image) && str_starts_with($image, 'data:image/')) {
            if (! preg_match('#^data:image/(\\w+);base64,#', $image, $matches)) {
                throw new InvalidArgumentException('Invalid image data.');
            }

            $extension = strtolower($matches[1]) === 'jpeg' ? 'jpg' : strtolower($matches[1]);
            $binary = base64_decode(substr($image, strpos($image, ',') + 1), true);

            if ($binary === false) {
                throw new InvalidArgumentException('Invalid image data.');
            }

            if ($existingPath && ! str_starts_with($existingPath, 'data:')) {
                Storage::disk('public')->delete($existingPath);
            }

            $path = 'products/' . Str::uuid() . '.' . $extension;
            Storage::disk('public')->put($path, $binary);

            return $path;
        }

        if (is_string($image) && (str_starts_with($image, 'http://') || str_starts_with($image, 'https://'))) {
            return $existingPath;
        }

        if (is_string($image) && str_starts_with($image, 'products/')) {
            return $image;
        }

        throw new InvalidArgumentException('Invalid image data.');
    }

    public function withPublicImageUrl(Product $product): Product
    {
        $path = $product->getRawOriginal('image') ?? $product->image;

        if ($path && ! str_starts_with($path, 'http://') && ! str_starts_with($path, 'https://') && ! str_starts_with($path, 'data:')) {
            $product->setAttribute('image', Storage::disk('public')->url($path));
        }

        return $product;
    }
}
