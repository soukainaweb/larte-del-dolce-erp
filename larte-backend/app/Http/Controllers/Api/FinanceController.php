<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FinanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class FinanceController extends Controller
{
    public function __construct(private FinanceService $financeService)
    {
    }

    private function authorizeFinance(): void
    {
        abort_unless(Gate::allows('finance.view'), 403, 'Forbidden');
    }

    public function metrics(Request $request)
    {
        $this->authorizeFinance();

        return $this->success($this->financeService->metrics());
    }

    public function revenueExpenses(Request $request)
    {
        $this->authorizeFinance();

        return $this->success($this->financeService->revenueExpenses());
    }

    public function expenseCategories()
    {
        $this->authorizeFinance();

        return $this->success($this->financeService->expenseCategories());
    }

    public function transactions(Request $request)
    {
        $this->authorizeFinance();

        return $this->success($this->financeService->transactions());
    }

    public function topCustomers()
    {
        $this->authorizeFinance();

        return $this->success($this->financeService->topCustomers());
    }

    public function topSuppliers()
    {
        $this->authorizeFinance();

        return $this->success($this->financeService->topSuppliers());
    }

    public function summary()
    {
        $this->authorizeFinance();

        return $this->success($this->financeService->metrics());
    }

    public function export(Request $request)
    {
        $this->authorizeFinance();

        return $this->success(['metrics' => $this->financeService->metrics()]);
    }
}
