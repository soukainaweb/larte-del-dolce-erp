<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class FinanceService
{
    public function metrics(): array
    {
        $totalRevenue = Payment::sum('amount');
        $totalExpenses = Expense::sum('amount');

        return [
            'total_revenue' => $totalRevenue,
            'total_expenses' => $totalExpenses,
            'net_profit' => $totalRevenue - $totalExpenses,
            'pending_invoices' => Invoice::where('status', '!=', 'paid')->count(),
            'orders_count' => Order::count(),
        ];
    }

    public function revenueExpenses(): array
    {
        return collect(range(0, 5))->map(function ($i) {
            $date = now()->subMonths($i);
            $month = $date->format('Y-m');

            return [
                'month' => $month,
                'revenue' => Payment::whereYear('payment_date', $date->year)
                    ->whereMonth('payment_date', $date->month)
                    ->sum('amount'),
                'expenses' => Expense::whereYear('expense_date', $date->year)
                    ->whereMonth('expense_date', $date->month)
                    ->sum('amount'),
            ];
        })->reverse()->values()->all();
    }

    public function expenseCategories()
    {
        return Expense::select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->get();
    }

    public function transactions()
    {
        $payments = Payment::latest()->take(20)->get()->map(fn ($p) => [
            'id' => $p->id,
            'type' => 'payment',
            'amount' => $p->amount,
            'date' => $p->payment_date,
            'reference' => $p->reference ?? ('PAY-' . $p->id),
        ]);

        $expenses = Expense::latest()->take(20)->get()->map(fn ($e) => [
            'id' => $e->id,
            'type' => 'expense',
            'amount' => $e->amount,
            'date' => $e->expense_date,
            'reference' => $e->category,
        ]);

        return $payments->concat($expenses)->sortByDesc('date')->values();
    }

    public function topCustomers()
    {
        return Customer::withCount('orders')
            ->orderByDesc('orders_count')
            ->take(10)
            ->get();
    }

    public function topSuppliers()
    {
        return Supplier::orderByDesc('created_at')->take(10)->get();
    }

    public function pendingCustomerPayments(array $filters = []): array
    {
        $limit = (int) ($filters['limit'] ?? $filters['per_page'] ?? 10);

        return Invoice::with('order.customer')
            ->where('status', '!=', 'paid')
            ->orderBy('due_date')
            ->take($limit)
            ->get()
            ->map(function (Invoice $invoice) {
                $dueDate = $invoice->due_date;
                $isOverdue = $dueDate && $dueDate->isPast();

                return [
                    'invoice' => $invoice->invoice_number ?? ('INV-' . $invoice->id),
                    'customer' => $invoice->order?->customer?->name ?? '—',
                    'amount' => (float) ($invoice->total_amount ?? 0),
                    'dueDate' => $dueDate?->format('Y-m-d') ?? '—',
                    'status' => $isOverdue ? 'Overdue' : 'Pending',
                ];
            })
            ->values()
            ->all();
    }

    public function pendingSupplierPayments(array $filters = []): array
    {
        $limit = (int) ($filters['limit'] ?? $filters['per_page'] ?? 10);

        return Expense::query()
            ->latest('expense_date')
            ->take($limit)
            ->get()
            ->map(function (Expense $expense) {
                return [
                    'purchaseOrder' => 'EXP-' . $expense->id,
                    'supplier' => $expense->description ?: ($expense->category ?? '—'),
                    'amount' => (float) ($expense->amount ?? 0),
                    'dueDate' => $expense->expense_date?->format('Y-m-d') ?? '—',
                    'status' => 'Pending',
                ];
            })
            ->values()
            ->all();
    }

    public function financeNotifications(array $filters = []): array
    {
        $limit = (int) ($filters['limit'] ?? 5);

        return Notification::query()
            ->when(auth()->id(), fn ($query) => $query->where('user_id', auth()->id()))
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn (Notification $notification) => [
                'id' => $notification->id,
                'title' => $notification->title ?? 'Notification',
                'time' => optional($notification->created_at)->diffForHumans(),
                'type' => $notification->type ?? 'info',
            ])
            ->values()
            ->all();
    }
}
