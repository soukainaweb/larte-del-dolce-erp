<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category']);

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%")
                ->orWhere('sku', 'LIKE', "%{$request->search}%");
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $products = $query->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:200',
            'sku' => 'required|string|unique:products|max:50',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'image' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,out_of_stock,low_stock',
        ]);

        $product = Product::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Produit créé avec succès',
            'data' => $product->load('category')
        ], 201);
    }

    public function show(Product $product)
    {
        return response()->json([
            'success' => true,
            'data' => $product->load('category')
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'sometimes|string|max:200',
            'sku' => 'sometimes|string|unique:products,sku,' . $product->id . '|max:50',
            'category_id' => 'sometimes|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'cost_price' => 'sometimes|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'image' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,out_of_stock,low_stock',
        ]);

        $product->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Produit mis à jour avec succès',
            'data' => $product->fresh()->load('category')
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produit supprimé avec succès'
        ]);
    }

    public function updateStock(Request $request, Product $product)
    {
        $request->validate([
            'quantity' => 'required|integer',
            'type' => 'required|in:add,subtract,set'
        ]);

        switch ($request->type) {
            case 'add':
                $product->increment('stock_quantity', $request->quantity);
                break;
            case 'subtract':
                $product->decrement('stock_quantity', $request->quantity);
                break;
            case 'set':
                $product->update(['stock_quantity' => $request->quantity]);
                break;
        }

        return response()->json([
            'success' => true,
            'message' => 'Stock mis à jour avec succès',
            'data' => $product->fresh()
        ]);
    }

    public function statistics()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Product::count(),
                'active' => Product::where('status', 'active')->count(),
                'inactive' => Product::where('status', 'inactive')->count(),
                'out_of_stock' => Product::where('stock_quantity', 0)->count(),
                'low_stock' => Product::where('stock_quantity', '<', 10)->count(),
                'total_stock' => Product::sum('stock_quantity'),
            ]
        ]);
    }

    public function export(Request $request)
    {
        $products = Product::with('category')->get();
        
        $data = $products->map(function($product) {
            return [
                'Nom' => $product->name,
                'SKU' => $product->sku,
                'Catégorie' => $product->category->name ?? '—',
                'Prix' => $product->price,
                'Prix coût' => $product->cost_price,
                'Stock' => $product->stock_quantity,
                'Statut' => $product->status,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}