<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Suppliers\StoreSupplierRequest;
use App\Http\Requests\Suppliers\UpdateSupplierRequest;
use App\Models\Supplier;
use App\Services\SupplierService;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function __construct(private SupplierService $supplierService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Supplier::class);

        return $this->success($this->supplierService->list($request->all()));
    }

    public function store(StoreSupplierRequest $request)
    {
        $this->authorize('create', Supplier::class);

        return $this->success($this->supplierService->create($request->validated()), 'Fournisseur créé avec succès', 201);
    }

    public function show(Supplier $supplier)
    {
        $this->authorize('view', $supplier);

        return $this->success($supplier);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $this->authorize('update', $supplier);

        return $this->success($this->supplierService->update($supplier, $request->validated()), 'Fournisseur mis à jour avec succès');
    }

    public function destroy(Supplier $supplier)
    {
        $this->authorize('delete', $supplier);

        $this->supplierService->delete($supplier);

        return $this->success(null, 'Fournisseur supprimé avec succès');
    }

    public function toggleStatus(Request $request, Supplier $supplier)
    {
        $this->authorize('update', $supplier);

        $request->validate(['status' => 'required|in:active,inactive']);

        return $this->success($this->supplierService->toggleStatus($supplier, $request->status), 'Statut mis à jour avec succès');
    }

    public function statistics()
    {
        $this->authorize('viewAny', Supplier::class);

        return $this->success($this->supplierService->statistics());
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Supplier::class);

        return $this->success($this->supplierService->export());
    }

    public function types()
    {
        $this->authorize('viewAny', Supplier::class);

        return $this->success($this->supplierService->types());
    }

    public function statuses()
    {
        return $this->success($this->supplierService->statuses());
    }
}
