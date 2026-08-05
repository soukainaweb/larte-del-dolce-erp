<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WasteReturns\StoreWasteReturnRequest;
use App\Http\Requests\WasteReturns\UpdateWasteReturnRequest;
use App\Models\WasteReturn;
use App\Services\WasteReturnService;
use Illuminate\Http\Request;

class WasteReturnController extends Controller
{
    public function __construct(private WasteReturnService $wasteReturnService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', WasteReturn::class);

        return $this->success($this->wasteReturnService->list($request->all()));
    }

    public function store(StoreWasteReturnRequest $request)
    {
        $this->authorize('create', WasteReturn::class);

        return $this->success(
            $this->wasteReturnService->create($request->validated()),
            'Record created successfully',
            201
        );
    }

    public function show(WasteReturn $wasteReturn)
    {
        $this->authorize('view', $wasteReturn);

        return $this->success($wasteReturn->load(['product', 'creator']));
    }

    public function update(UpdateWasteReturnRequest $request, WasteReturn $wasteReturn)
    {
        $this->authorize('update', $wasteReturn);

        return $this->success(
            $this->wasteReturnService->update($wasteReturn, $request->validated()),
            'Record updated successfully'
        );
    }

    public function destroy(WasteReturn $wasteReturn)
    {
        $this->authorize('delete', $wasteReturn);

        $this->wasteReturnService->delete($wasteReturn);

        return $this->success(null, 'Record deleted successfully');
    }

    public function statistics()
    {
        $this->authorize('viewAny', WasteReturn::class);

        return $this->success($this->wasteReturnService->statistics());
    }

    public function types()
    {
        return $this->success($this->wasteReturnService->types());
    }
}
