<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with('user');

        if ($request->search) {
            $query->where('description', 'LIKE', "%{$request->search}%");
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->date_from) {
            $query->whereDate('expense_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('expense_date', '<=', $request->date_to);
        }

        $expenses = $query->orderBy('expense_date', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $expenses
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string|max:100',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
        ]);

        $expense = Expense::create([
            'user_id' => auth()->id(),
            'category' => $request->category,
            'description' => $request->description,
            'amount' => $request->amount,
            'expense_date' => $request->expense_date,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dépense créée avec succès',
            'data' => $expense->load('user')
        ], 201);
    }

    public function show(Expense $expense)
    {
        return response()->json([
            'success' => true,
            'data' => $expense->load('user')
        ]);
    }

    public function update(Request $request, Expense $expense)
    {
        $request->validate([
            'category' => 'sometimes|string|max:100',
            'description' => 'sometimes|string',
            'amount' => 'sometimes|numeric|min:0',
            'expense_date' => 'sometimes|date',
        ]);

        $expense->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Dépense mise à jour avec succès',
            'data' => $expense->fresh()->load('user')
        ]);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dépense supprimée avec succès'
        ]);
    }

    public function statistics()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Expense::sum('amount'),
                'count' => Expense::count(),
                'by_category' => Expense::selectRaw('category, sum(amount) as total')
                    ->groupBy('category')
                    ->get(),
                'this_month' => Expense::whereMonth('expense_date', now()->month)
                    ->sum('amount'),
            ]
        ]);
    }

    public function getCategories()
    {
        $categories = [
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

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    public function export(Request $request)
    {
        $expenses = Expense::with('user')->get();
        
        $data = $expenses->map(function($expense) {
            return [
                'Catégorie' => $expense->category,
                'Description' => $expense->description,
                'Montant' => $expense->amount,
                'Date' => $expense->expense_date,
                'Créé par' => $expense->user->name ?? '—',
                'Date création' => $expense->created_at->format('Y-m-d H:i'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}