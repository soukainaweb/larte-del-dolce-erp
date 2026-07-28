<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(private ReportService $reportService)
    {
    }

    public function metrics(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->sales($request->all())['summary'] ?? []);
    }

    public function salesOverview(Request $request)
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

    public function products(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->products($request->all()));
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

    public function regions(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success(['regions' => []]);
    }

    public function yearlyComparison(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->yearlyComparison($request->all()));
    }

    public function forecast(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success(['forecast' => []]);
    }

    public function kpiComparison(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->sales($request->all())['summary'] ?? []);
    }

    public function radar(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success(['radar' => []]);
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

    public function revenue(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->sales($request->all()));
    }

    public function expenses(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->financial($request->all()));
    }

    public function summary(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success([
            'sales' => $this->reportService->sales($request->all())['summary'] ?? [],
            'orders' => $this->reportService->orders($request->all())['summary'] ?? [],
        ]);
    }

    public function realtime(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->alerts($request->all()));
    }

    public function export(Request $request)
    {
        $this->authorize('reports.view');

        return $this->success($this->reportService->export($request->all()));
    }
}
