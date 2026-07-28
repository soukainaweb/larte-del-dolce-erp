<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Productions\StoreProductionRequest;
use App\Http\Requests\Productions\UpdateProductionRequest;
use App\Models\Production;
use App\Services\ProductionService;
use Illuminate\Http\Request;

class ProductionController extends Controller
{
    public function __construct(private ProductionService $productionService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Production::class);

        return $this->success($this->productionService->list($request->all()));
    }

    public function store(StoreProductionRequest $request)
    {
        $this->authorize('create', Production::class);

        return $this->success($this->productionService->create($request->validated()), 'Production créée avec succès', 201);
    }

    public function show(Production $production)
    {
        $this->authorize('view', $production);

        return $this->success($production->load(['order', 'assignedTo', 'items.product']));
    }

    public function update(UpdateProductionRequest $request, Production $production)
    {
        $this->authorize('update', $production);

        return $this->success($this->productionService->update($production, $request->validated()), 'Production mise à jour avec succès');
    }

    public function destroy(Production $production)
    {
        $this->authorize('delete', $production);

        try {
            $this->productionService->delete($production);

            return $this->success(null, 'Production supprimée avec succès');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), [], 403);
        }
    }

    public function updateStatus(Request $request, Production $production)
    {
        $this->authorize('update', $production);

        $request->validate(['status' => 'required|in:pending,in_progress,paused,completed,cancelled']);

        return $this->success($this->productionService->updateStatus($production, $request->status), 'Statut mis à jour avec succès');
    }

    public function updateProgress(Request $request, Production $production)
    {
        $this->authorize('update', $production);

        $request->validate(['progress' => 'required|integer|min:0|max:100']);

        return $this->success($this->productionService->updateProgress($production, $request->progress), 'Progression mise à jour avec succès');
    }

    public function assign(Request $request, Production $production)
    {
        $this->authorize('update', $production);

        $request->validate(['assigned_to' => 'required|exists:users,id']);

        return $this->success($this->productionService->assign($production, $request->assigned_to), 'Production assignée avec succès');
    }

    public function statistics(Request $request)
    {
        $this->authorize('viewAny', Production::class);

        return $this->success($this->productionService->statistics($request->all()));
    }

    public function getStatuses()
    {
        return $this->success($this->productionService->statuses());
    }

    public function getPriorities()
    {
        return $this->success($this->productionService->priorities());
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Production::class);

        return $this->success($this->productionService->export($request->all()));
    }
}
