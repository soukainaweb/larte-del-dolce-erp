<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService)
    {
    }

    private function authorizeDashboard(): void
    {
        abort_unless(Gate::allows('dashboard.view'), 403, 'Forbidden');
    }

    public function stats(Request $request)
    {
        $this->authorizeDashboard();

        return $this->success($this->dashboardService->stats());
    }

    public function analytics()
    {
        $this->authorizeDashboard();

        return $this->success($this->dashboardService->analytics());
    }

    public function orders()
    {
        $this->authorizeDashboard();

        return $this->success($this->dashboardService->orders());
    }

    public function notifications()
    {
        $this->authorizeDashboard();

        return $this->success($this->dashboardService->notifications());
    }

    public function production()
    {
        $this->authorizeDashboard();

        return $this->success($this->dashboardService->production());
    }

    public function topProducts()
    {
        $this->authorizeDashboard();

        return $this->success($this->dashboardService->topProducts());
    }
}
