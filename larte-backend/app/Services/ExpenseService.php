<?php

namespace App\Services;

use App\Models\Expense;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ExpenseService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Expense::with('user');

        if (!empty($filters['search'])) {
            $query->where('description', 'LIKE', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('expense_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('expense_date', '<=', $filters['date_to']);
        }

        return $query->orderByDesc('expense_date')->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Expense
    {
        $expense = Expense::create([
            'user_id' => auth()->id(),
            'category' => $data['category'],
            'description' => $data['description'],
            'amount' => $data['amount'],
            'expense_date' => $data['expense_date'],
        ])->load('user');

        app(EntityCreatedNotificationService::class)->notify('expense', $expense);

        return $expense;
    }

    public function update(Expense $expense, array $data): Expense
    {
        $expense->update($data);

        return $expense->fresh()->load('user');
    }

    public function delete(Expense $expense): void
    {
        $expense->delete();
    }

    public function statistics(): array
    {
        return [
            'total' => Expense::sum('amount'),
            'count' => Expense::count(),
            'by_category' => Expense::selectRaw('category, sum(amount) as total')->groupBy('category')->get(),
            'this_month' => Expense::whereMonth('expense_date', now()->month)->sum('amount'),
        ];
    }

    public function categories(): array
    {
        return [
            ['value' => 'raw_materials', 'label' => 'Matières premières'],
            ['value' => 'packaging', 'label' => 'Emballages'],
            ['value' => 'equipment', 'label' => 'Équipements'],
            ['value' => 'maintenance', 'label' => 'Maintenance'],
            ['value' => 'utilities', 'label' => 'Services publics'],
            ['value' => 'rent', 'label' => 'Loyer'],
            ['value' => 'salaries', 'label' => 'Salaires'],
            ['value' => 'transportation', 'label' => 'Transport'],
            ['value' => 'marketing', 'label' => 'Marketing'],
            ['value' => 'office_supplies', 'label' => 'Fournitures bureau'],
            ['value' => 'services', 'label' => 'Services'],
            ['value' => 'taxes', 'label' => 'Taxes'],
            ['value' => 'other', 'label' => 'Autre'],
        ];
    }

    public function paymentMethods(): array
    {
        return [
            ['value' => 'cash', 'label' => 'Espèces'],
            ['value' => 'card', 'label' => 'Carte'],
            ['value' => 'transfer', 'label' => 'Virement'],
            ['value' => 'check', 'label' => 'Chèque'],
        ];
    }

    public function paymentStatuses(): array
    {
        return ['pending', 'paid', 'partial', 'overdue'];
    }

    public function export()
    {
        return Expense::with('user')->get()->map(fn ($e) => [
            'Catégorie' => $e->category,
            'Description' => $e->description,
            'Montant' => $e->amount,
            'Date' => $e->expense_date,
            'Créé par' => $e->user->name ?? '—',
        ]);
    }
}
