<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Categories\StoreCategoryRequest;
use App\Http\Requests\Categories\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(private CategoryService $categoryService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Category::class);

        return $this->success($this->categoryService->list($request->all()));
    }

    public function store(StoreCategoryRequest $request)
    {
        $this->authorize('create', Category::class);

        return $this->success(
            $this->categoryService->create($request->validated()),
            'Catégorie créée avec succès',
            201
        );
    }

    public function show(Category $category)
    {
        $this->authorize('view', $category);

        return $this->success($category->load(['parent', 'children']));
    }

    public function showBySlug(string $slug)
    {
        $this->authorize('viewAny', Category::class);

        $category = Category::where('slug', $slug)->firstOrFail();

        return $this->success($category->load(['parent', 'children']));
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $this->authorize('update', $category);

        return $this->success(
            $this->categoryService->update($category, $request->validated()),
            'Catégorie mise à jour avec succès'
        );
    }

    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);

        $this->categoryService->delete($category);

        return $this->success(null, 'Catégorie supprimée avec succès');
    }

    public function forceDestroy(Category $category)
    {
        $this->authorize('delete', $category);

        $this->categoryService->forceDelete($category);

        return $this->success(null, 'Catégorie supprimée définitivement');
    }

    public function restore(Category $category)
    {
        $this->authorize('update', $category);

        return $this->success($this->categoryService->restore($category), 'Catégorie restaurée avec succès');
    }

    public function updateStatus(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $request->validate(['status' => 'required|in:active,inactive,archived']);

        return $this->success(
            $this->categoryService->updateStatus($category, $request->status),
            'Statut mis à jour'
        );
    }

    public function updateVisibility(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $request->validate(['visible' => 'required|boolean']);
        $category->update(['visible' => $request->visible]);

        return $this->success($category->fresh());
    }

    public function updateOrder(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $request->validate(['display_order' => 'required|integer']);
        $category->update(['display_order' => $request->display_order]);

        return $this->success($category->fresh());
    }

    public function statistics()
    {
        $this->authorize('viewAny', Category::class);

        return $this->success($this->categoryService->statistics());
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Category::class);

        return $this->success($this->categoryService->export());
    }

    public function tree(Request $request)
    {
        $this->authorize('viewAny', Category::class);

        return $this->success($this->categoryService->tree($request->all()));
    }

    public function parents(Request $request)
    {
        $this->authorize('viewAny', Category::class);

        return $this->success($this->categoryService->parents($request->all()));
    }

    public function statuses()
    {
        return $this->success($this->categoryService->statuses());
    }
}
