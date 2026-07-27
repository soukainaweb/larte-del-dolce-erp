<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    /**
     * Display a listing of the inventory.
     */
    public function index(Request $request)
    {
        $query = Inventory::with(['product', 'warehouse']);

        // Filter by product
        if ($request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        // Filter by warehouse
        if ($request->warehouse_id) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        // Filter low stock
        if ($request->low_stock) {
            $query->whereColumn('quantity', '<=', 'min_quantity');
        }

        // Filter by quantity range
        if ($request->min_quantity) {
            $query->where('quantity', '>=', $request->min_quantity);
        }

        if ($request->max_quantity) {
            $query->where('quantity', '<=', $request->max_quantity);
        }

        // Search by product name or SKU
        if ($request->search) {
            $query->whereHas('product', function ($q) use ($request) {
                $q->where('name', 'LIKE', "%{$request->search}%")
                    ->orWhere('sku', 'LIKE', "%{$request->search}%");
            });
        }

        $inventory = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $inventory
        ]);
    }

    /**
     * Store a newly created inventory record.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'quantity' => 'required|integer|min:0',
            'min_quantity' => 'nullable|integer|min:0',
            'max_quantity' => 'nullable|integer|min:0',
            'reorder_point' => 'nullable|integer|min:0',
        ]);

        // Check if inventory already exists for this product and warehouse
        $existing = Inventory::where('product_id', $request->product_id)
            ->where('warehouse_id', $request->warehouse_id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Cet inventaire existe déjà pour ce produit dans cet entrepôt'
            ], 400);
        }

        $inventory = Inventory::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Inventaire créé avec succès',
            'data' => $inventory->load(['product', 'warehouse'])
        ], 201);
    }

    /**
     * Display the specified inventory.
     */
    public function show(Inventory $inventory)
    {
        return response()->json([
            'success' => true,
            'data' => $inventory->load(['product', 'warehouse'])
        ]);
    }

    /**
     * Update the specified inventory.
     */
    public function update(Request $request, Inventory $inventory)
    {
        $request->validate([
            'quantity' => 'sometimes|integer|min:0',
            'reserved_quantity' => 'sometimes|integer|min:0',
            'min_quantity' => 'nullable|integer|min:0',
            'max_quantity' => 'nullable|integer|min:0',
            'reorder_point' => 'nullable|integer|min:0',
        ]);

        $inventory->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Inventaire mis à jour avec succès',
            'data' => $inventory->fresh()->load(['product', 'warehouse'])
        ]);
    }

    /**
     * Remove the specified inventory.
     */
    public function destroy(Inventory $inventory)
    {
        $inventory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Inventaire supprimé avec succès'
        ]);
    }

    /**
     * Update inventory quantity (add, subtract, set)
     */
    public function updateQuantity(Request $request, Inventory $inventory)
    {
        $request->validate([
            'quantity' => 'required|integer',
            'type' => 'required|in:add,subtract,set',
            'reason' => 'nullable|string|max:200',
        ]);

        $oldQuantity = $inventory->quantity;
        $newQuantity = $oldQuantity;

        switch ($request->type) {
            case 'add':
                $newQuantity = $oldQuantity + $request->quantity;
                break;
            case 'subtract':
                if ($oldQuantity < $request->quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Quantité insuffisante en stock'
                    ], 400);
                }
                $newQuantity = $oldQuantity - $request->quantity;
                break;
            case 'set':
                $newQuantity = $request->quantity;
                break;
        }

        $inventory->update(['quantity' => $newQuantity]);

        // Create stock movement
        \App\Models\StockMovement::create([
            'product_id' => $inventory->product_id,
            'warehouse_id' => $inventory->warehouse_id,
            'type' => $request->type === 'add' ? 'in' : ($request->type === 'subtract' ? 'out' : 'adjustment'),
            'quantity' => abs($request->quantity),
            'previous_quantity' => $oldQuantity,
            'new_quantity' => $newQuantity,
            'reason' => $request->reason,
            'user_id' => auth()->id(),
        ]);

        // Update product stock quantity
        $product = Product::find($inventory->product_id);
        $totalStock = Inventory::where('product_id', $product->id)->sum('quantity');
        $product->update(['stock_quantity' => $totalStock]);

        return response()->json([
            'success' => true,
            'message' => 'Quantité mise à jour avec succès',
            'data' => $inventory->fresh()->load(['product', 'warehouse'])
        ]);
    }

    /**
     * Transfer stock between warehouses
     */
    public function transfer(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'source_warehouse_id' => 'required|exists:warehouses,id',
            'destination_warehouse_id' => 'required|exists:warehouses,id|different:source_warehouse_id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:200',
        ]);

        // Get source inventory
        $sourceInventory = Inventory::where('product_id', $request->product_id)
            ->where('warehouse_id', $request->source_warehouse_id)
            ->first();

        if (!$sourceInventory) {
            return response()->json([
                'success' => false,
                'message' => 'Stock source non trouvé'
            ], 404);
        }

        if ($sourceInventory->quantity < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Quantité insuffisante dans l\'entrepôt source'
            ], 400);
        }

        // Get or create destination inventory
        $destInventory = Inventory::firstOrCreate(
            [
                'product_id' => $request->product_id,
                'warehouse_id' => $request->destination_warehouse_id,
            ],
            [
                'quantity' => 0,
                'min_quantity' => $sourceInventory->min_quantity,
                'max_quantity' => $sourceInventory->max_quantity,
                'reorder_point' => $sourceInventory->reorder_point,
            ]
        );

        // Transfer quantities
        $sourceOldQty = $sourceInventory->quantity;
        $destOldQty = $destInventory->quantity;

        $sourceInventory->decrement('quantity', $request->quantity);
        $destInventory->increment('quantity', $request->quantity);

        // Create stock movements
        \App\Models\StockMovement::create([
            'product_id' => $request->product_id,
            'warehouse_id' => $request->source_warehouse_id,
            'type' => 'out',
            'quantity' => $request->quantity,
            'previous_quantity' => $sourceOldQty,
            'new_quantity' => $sourceOldQty - $request->quantity,
            'reason' => $request->reason ?? 'Transfert vers entrepôt ' . $destInventory->warehouse->name,
            'user_id' => auth()->id(),
            'destination_warehouse_id' => $request->destination_warehouse_id,
        ]);

        \App\Models\StockMovement::create([
            'product_id' => $request->product_id,
            'warehouse_id' => $request->destination_warehouse_id,
            'type' => 'in',
            'quantity' => $request->quantity,
            'previous_quantity' => $destOldQty,
            'new_quantity' => $destOldQty + $request->quantity,
            'reason' => $request->reason ?? 'Transfert depuis entrepôt ' . $sourceInventory->warehouse->name,
            'user_id' => auth()->id(),
            'source_warehouse_id' => $request->source_warehouse_id,
        ]);

        // Update product stock quantity
        $product = Product::find($request->product_id);
        $totalStock = Inventory::where('product_id', $product->id)->sum('quantity');
        $product->update(['stock_quantity' => $totalStock]);

        return response()->json([
            'success' => true,
            'message' => 'Transfert de stock effectué avec succès',
            'data' => [
                'source_inventory' => $sourceInventory->fresh()->load('warehouse'),
                'destination_inventory' => $destInventory->fresh()->load('warehouse'),
            ]
        ]);
    }

    /**
     * Get inventory statistics
     */
    public function statistics(Request $request)
    {
        $totalItems = Inventory::count();
        $totalQuantity = Inventory::sum('quantity');
        $lowStockItems = Inventory::whereColumn('quantity', '<=', 'min_quantity')->count();

        // Stock by warehouse
        $byWarehouse = Inventory::selectRaw('warehouse_id, sum(quantity) as total')
            ->groupBy('warehouse_id')
            ->with('warehouse')
            ->get();

        // Stock by product category
        $byCategory = Inventory::selectRaw('products.category_id, sum(inventory.quantity) as total')
            ->join('products', 'inventory.product_id', '=', 'products.id')
            ->groupBy('products.category_id')
            ->with('product.category')
            ->get();

        // Top stocked products
        $topProducts = Inventory::selectRaw('product_id, sum(quantity) as total')
            ->groupBy('product_id')
            ->orderBy('total', 'desc')
            ->with('product')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_items' => $totalItems,
                'total_quantity' => $totalQuantity,
                'low_stock_items' => $lowStockItems,
                'by_warehouse' => $byWarehouse,
                'by_category' => $byCategory,
                'top_products' => $topProducts,
            ]
        ]);
    }

    /**
     * Check stock availability for multiple products
     */
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $results = [];

        foreach ($request->items as $item) {
            $totalStock = Inventory::where('product_id', $item['product_id'])->sum('quantity');
            $product = Product::find($item['product_id']);

            $results[] = [
                'product_id' => $item['product_id'],
                'product_name' => $product->name,
                'sku' => $product->sku,
                'requested' => $item['quantity'],
                'available' => $totalStock,
                'sufficient' => $totalStock >= $item['quantity'],
                'shortage' => $totalStock < $item['quantity'] ? $item['quantity'] - $totalStock : 0,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $results
        ]);
    }

    /**
     * Get product stock across all warehouses
     */
    public function productStock($productId)
    {
        $product = Product::find($productId);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Produit non trouvé'
            ], 404);
        }

        $stocks = Inventory::where('product_id', $productId)
            ->with('warehouse')
            ->get();

        $totalStock = $stocks->sum('quantity');

        return response()->json([
            'success' => true,
            'data' => [
                'product' => $product,
                'total_stock' => $totalStock,
                'stocks' => $stocks,
            ]
        ]);
    }

    /**
     * Get warehouse stock summary
     */
    public function warehouseStock($warehouseId)
    {
        $warehouse = Warehouse::find($warehouseId);

        if (!$warehouse) {
            return response()->json([
                'success' => false,
                'message' => 'Entrepôt non trouvé'
            ], 404);
        }

        $stocks = Inventory::where('warehouse_id', $warehouseId)
            ->with('product')
            ->get();

        $totalItems = $stocks->count();
        $totalQuantity = $stocks->sum('quantity');
        $lowStock = $stocks->filter(function ($item) {
            return $item->quantity <= $item->min_quantity;
        })->count();

        return response()->json([
            'success' => true,
            'data' => [
                'warehouse' => $warehouse,
                'total_items' => $totalItems,
                'total_quantity' => $totalQuantity,
                'low_stock_items' => $lowStock,
                'stocks' => $stocks,
            ]
        ]);
    }

    /**
     * Get low stock items
     */
    public function lowStock(Request $request)
    {
        $query = Inventory::whereColumn('quantity', '<=', 'min_quantity')
            ->with(['product', 'warehouse']);

        if ($request->warehouse_id) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        $items = $query->get();

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }
}