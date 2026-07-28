<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreInventoryRequest;
use App\Http\Requests\Inventory\UpdateInventoryRequest;
use App\Models\Inventory;
use App\Services\InventoryService;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(private InventoryService $inventoryService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Inventory::class);

        return $this->success($this->inventoryService->list($request->all()));
    }

    public function store(StoreInventoryRequest $request)
    {
        $this->authorize('create', Inventory::class);

        return $this->success($this->inventoryService->create($request->validated()), 'Stock créé avec succès', 201);
    }

    public function show(Inventory $inventory)
    {
        $this->authorize('view', $inventory);

        return $this->success($inventory->load(['product', 'warehouse']));
    }

    public function update(UpdateInventoryRequest $request, Inventory $inventory)
    {
        $this->authorize('update', $inventory);

        return $this->success($this->inventoryService->update($inventory, $request->validated()), 'Stock mis à jour avec succès');
    }

    public function destroy(Inventory $inventory)
    {
        $this->authorize('delete', $inventory);

        $this->inventoryService->delete($inventory);

        return $this->success(null, 'Stock supprimé avec succès');
    }

    public function restore(Inventory $inventory)
    {
        $this->authorize('update', $inventory);

        return $this->success($this->inventoryService->restore($inventory), 'Stock restauré');
    }

    public function forceDestroy(Inventory $inventory)
    {
        $this->authorize('delete', $inventory);

        $this->inventoryService->forceDelete($inventory);

        return $this->success(null, 'Stock supprimé définitivement');
    }

    public function createMovement(Request $request)
    {
        $this->authorize('create', Inventory::class);

        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'type' => 'required|in:in,out,adjustment',
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        return $this->success($this->inventoryService->createMovement($data), 'Mouvement enregistré', 201);
    }

    public function movements(Inventory $inventory, Request $request)
    {
        $this->authorize('view', $inventory);

        return $this->success($this->inventoryService->getMovements($inventory, $request->all()));
    }

    public function statistics()
    {
        $this->authorize('viewAny', Inventory::class);

        return $this->success($this->inventoryService->statistics());
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Inventory::class);

        return $this->success($this->inventoryService->export());
    }

    public function categories()
    {
        $this->authorize('viewAny', Inventory::class);

        return $this->success($this->inventoryService->categories());
    }

    public function types()
    {
        return $this->success($this->inventoryService->types());
    }

    public function statuses()
    {
        return $this->success($this->inventoryService->statuses());
    }
}
