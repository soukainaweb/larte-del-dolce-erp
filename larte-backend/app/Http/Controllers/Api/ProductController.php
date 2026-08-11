<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Http\Requests\Products\UpdateProductStatusRequest;
use App\Http\Requests\Products\UpdateProductStockRequest;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use Throwable;

class ProductController extends Controller
{
    public function __construct(private ProductService $productService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Product::class);

        return response()->json([
            'success' => true,
            'data' => $this->productService->list($request->all()),
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $this->authorize('create', Product::class);

        try {
            $product = $this->productService->create($request->validated());
        } catch (InvalidArgumentException $e) {
            Log::warning('Product creation rejected', [
                'user_id' => auth()->id(),
                'reason' => $e->getMessage(),
            ]);

            return $this->error($e->getMessage(), [], 422);
        } catch (Throwable $e) {
            Log::error('Product creation failed', [
                'user_id' => auth()->id(),
                'exception' => $e->getMessage(),
                'exception_class' => $e::class,
            ]);

            throw $e;
        }

        return response()->json([
            'success' => true,
            'message' => 'Produit créé avec succès',
            'data' => $product,
        ], 201);
    }

    public function show(Product $product)
    {
        $this->authorize('view', $product);

        $product->load('category');

        return response()->json([
            'success' => true,
            'data' => $this->productService->withPublicImageUrl($product),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $this->authorize('update', $product);

        return response()->json([
            'success' => true,
            'message' => 'Produit mis à jour avec succès',
            'data' => $this->productService->update($product, $request->validated()),
        ]);
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        $this->productService->delete($product);

        return response()->json([
            'success' => true,
            'message' => 'Produit supprimé avec succès',
        ]);
    }

    public function forceDestroy(Product $product)
    {
        $this->authorize('delete', $product);

        $this->productService->forceDelete($product);

        return response()->json([
            'success' => true,
            'message' => 'Produit supprimé définitivement',
        ]);
    }

    public function restore(Product $product)
    {
        $this->authorize('update', $product);

        return response()->json([
            'success' => true,
            'message' => 'Produit restauré',
            'data' => $this->productService->restore($product),
        ]);
    }

    public function updateStock(UpdateProductStockRequest $request, Product $product)
    {
        $this->authorize('update', $product);

        $validated = $request->validated();

        return response()->json([
            'success' => true,
            'message' => 'Stock mis à jour avec succès',
            'data' => $this->productService->updateStock($product, $validated['quantity'], $validated['type']),
        ]);
    }

    public function updateStatus(UpdateProductStatusRequest $request, Product $product)
    {
        $this->authorize('update', $product);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour',
            'data' => $this->productService->updateStatus($product, $request->validated('status')),
        ]);
    }

    public function statistics()
    {
        $this->authorize('viewAny', Product::class);

        return response()->json([
            'success' => true,
            'data' => $this->productService->statistics(),
        ]);
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Product::class);

        return response()->json([
            'success' => true,
            'data' => $this->productService->export(),
        ]);
    }

    public function categories()
    {
        $this->authorize('viewAny', Product::class);

        return response()->json([
            'success' => true,
            'data' => $this->productService->categories(),
        ]);
    }

    public function statuses()
    {
        return response()->json([
            'success' => true,
            'data' => $this->productService->statuses(),
        ]);
    }
}
