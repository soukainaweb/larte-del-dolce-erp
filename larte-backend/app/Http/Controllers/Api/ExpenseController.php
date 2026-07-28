<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expenses\StoreExpenseRequest;
use App\Http\Requests\Expenses\UpdateExpenseRequest;
use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function __construct(private ExpenseService $expenseService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Expense::class);

        return $this->success($this->expenseService->list($request->all()));
    }

    public function store(StoreExpenseRequest $request)
    {
        $this->authorize('create', Expense::class);

        return $this->success($this->expenseService->create($request->validated()), 'Dépense créée avec succès', 201);
    }

    public function show(Expense $expense)
    {
        $this->authorize('view', $expense);

        return $this->success($expense->load('user'));
    }

    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        $this->authorize('update', $expense);

        return $this->success($this->expenseService->update($expense, $request->validated()), 'Dépense mise à jour avec succès');
    }

    public function destroy(Expense $expense)
    {
        $this->authorize('delete', $expense);

        $this->expenseService->delete($expense);

        return $this->success(null, 'Dépense supprimée avec succès');
    }

    public function statistics()
    {
        $this->authorize('viewAny', Expense::class);

        return $this->success($this->expenseService->statistics());
    }

    public function getCategories()
    {
        return $this->success($this->expenseService->categories());
    }

    public function paymentMethods()
    {
        return $this->success($this->expenseService->paymentMethods());
    }

    public function paymentStatuses()
    {
        return $this->success($this->expenseService->paymentStatuses());
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Expense::class);

        return $this->success($this->expenseService->export());
    }
}
