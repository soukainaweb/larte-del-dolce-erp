<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Purchases\StorePurchaseRequest;
use App\Http\Requests\Purchases\UpdatePurchaseRequest;
use App\Models\Purchase;
use App\Services\PurchaseService;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function __construct(private PurchaseService $purchaseService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Purchase::class);

        return $this->success($this->purchaseService->list($request->all()));
    }

    public function store(StorePurchaseRequest $request)
    {
        $this->authorize('create', Purchase::class);

        return $this->success(
            $this->purchaseService->create($request->validated()),
            'Purchase created successfully',
            201
        );
    }

    public function show(Purchase $purchase)
    {
        $this->authorize('view', $purchase);

        return $this->success($purchase->load(['product', 'supplier', 'creator']));
    }

    public function update(UpdatePurchaseRequest $request, Purchase $purchase)
    {
        $this->authorize('update', $purchase);

        return $this->success(
            $this->purchaseService->update($purchase, $request->validated()),
            'Purchase updated successfully'
        );
    }

    public function destroy(Purchase $purchase)
    {
        $this->authorize('delete', $purchase);

        $this->purchaseService->delete($purchase);

        return $this->success(null, 'Purchase deleted successfully');
    }

    public function statistics()
    {
        $this->authorize('viewAny', Purchase::class);

        return $this->success($this->purchaseService->statistics());
    }

    public function statuses()
    {
        return $this->success($this->purchaseService->statuses());
    }
}
