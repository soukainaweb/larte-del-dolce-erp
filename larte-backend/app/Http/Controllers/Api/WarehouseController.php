<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Warehouses\StoreWarehouseRequest;
use App\Http\Requests\Warehouses\UpdateWarehouseRequest;
use App\Models\Warehouse;
use App\Services\WarehouseService;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function __construct(private WarehouseService $warehouseService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Warehouse::class);

        return $this->success($this->warehouseService->list($request->all()));
    }

    public function store(StoreWarehouseRequest $request)
    {
        $this->authorize('create', Warehouse::class);

        return $this->success($this->warehouseService->create($request->validated()), 'Entrepôt créé avec succès', 201);
    }

    public function show(Warehouse $warehouse)
    {
        $this->authorize('view', $warehouse);

        return $this->success($warehouse->load('manager'));
    }

    public function update(UpdateWarehouseRequest $request, Warehouse $warehouse)
    {
        $this->authorize('update', $warehouse);

        return $this->success($this->warehouseService->update($warehouse, $request->validated()), 'Entrepôt mis à jour avec succès');
    }

    public function destroy(Warehouse $warehouse)
    {
        $this->authorize('delete', $warehouse);

        $this->warehouseService->delete($warehouse);

        return $this->success(null, 'Entrepôt supprimé avec succès');
    }

    public function restore(Warehouse $warehouse)
    {
        $this->authorize('update', $warehouse);

        return $this->success($this->warehouseService->restore($warehouse), 'Entrepôt restauré');
    }

    public function forceDestroy(Warehouse $warehouse)
    {
        $this->authorize('delete', $warehouse);

        $this->warehouseService->forceDelete($warehouse);

        return $this->success(null, 'Entrepôt supprimé définitivement');
    }

    public function transfer(Request $request)
    {
        $this->authorize('update', Warehouse::class);

        $request->validate([
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id' => 'required|exists:warehouses,id|different:from_warehouse_id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        try {
            return $this->success($this->warehouseService->transfer($request->all()), 'Transfert effectué');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), [], 422);
        }
    }

    public function statistics()
    {
        $this->authorize('viewAny', Warehouse::class);

        return $this->success($this->warehouseService->statistics());
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Warehouse::class);

        return $this->success($this->warehouseService->export());
    }

    public function types()
    {
        return $this->success($this->warehouseService->types());
    }

    public function statuses()
    {
        return $this->success($this->warehouseService->statuses());
    }
}
