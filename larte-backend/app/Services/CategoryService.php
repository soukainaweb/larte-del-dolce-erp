<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class CategoryService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Category::query();

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['visible'])) {
            $query->where('visible', filter_var($filters['visible'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('display_order')->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Category
    {
        $data['slug'] = Str::slug($data['name']) . '-' . Str::random(4);
        $data['created_by'] = auth()->id();

        return Category::create($data);
    }

    public function update(Category $category, array $data): Category
    {
        $data['updated_by'] = auth()->id();
        $category->update($data);

        return $category->fresh();
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }

    public function forceDelete(Category $category): void
    {
        $category->forceDelete();
    }

    public function restore(Category $category): Category
    {
        $category->restore();

        return $category->fresh();
    }

    public function updateStatus(Category $category, string $status): Category
    {
        $category->update(['status' => $status]);

        return $category->fresh();
    }

    public function statistics(): array
    {
        return [
            'total' => Category::count(),
            'active' => Category::where('status', 'active')->count(),
            'inactive' => Category::where('status', 'inactive')->count(),
            'archived' => Category::where('status', 'archived')->count(),
        ];
    }

    public function export()
    {
        return Category::orderBy('display_order')->get();
    }

    public function tree(array $filters = [])
    {
        $query = Category::with('children')->whereNull('parent_id');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('display_order')->get();
    }

    public function parents(array $filters = [])
    {
        $query = Category::whereNull('parent_id');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('display_order')->get();
    }

    public function statuses(): array
    {
        return ['active', 'inactive', 'archived'];
    }
}
