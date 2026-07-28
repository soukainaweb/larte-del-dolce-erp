<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private ReportService $reportService)
    {
    }

    public function sales(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->sales($request->all()));
    }

    public function orders(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->orders($request->all()));
    }

    public function production(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->production($request->all()));
    }

    public function inventory(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->products($request->all()));
    }

    public function financial(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->financial($request->all()));
    }

    public function customers(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->customers($request->all()));
    }

    public function deliveries(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->deliveries($request->all()));
    }

    public function salesReps(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->salesReps($request->all()));
    }

    public function yearlyComparison(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->yearlyComparison($request->all()));
    }

    public function orderStatus(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->orderStatusDistribution($request->all()));
    }

    public function activities(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->activities($request->all()));
    }

    public function alerts(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->alerts($request->all()));
    }

    public function quickSummary(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->alerts($request->all()));
    }

    public function generate(Request $request)
    {
        $this->authorize('reports.view');

        $data = $request->validate([
            'name' => 'nullable|string|max:200',
            'type' => 'nullable|string|max:100',
            'period' => 'nullable|string|max:100',
        ]);

        return $this->success($this->reportService->generate(array_merge($request->all(), $data)), 'Rapport généré', 201);
    }

    public function listGenerated(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->listGenerated($request->all()));
    }

    public function showGenerated(int $id)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->getGenerated($id));
    }

    public function deleteGenerated(int $id)
    {
        $this->authorize('reports.view');

        $this->reportService->deleteGenerated($id);

        return $this->success(null, 'Rapport supprimé');
    }

    public function export(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->export($request->all()));
    }
}
