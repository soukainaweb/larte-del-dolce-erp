<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Production;
use App\Models\ProductionItem;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $dateFrom = $request->input('date_from', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', Carbon::now()->format('Y-m-d'));
        $groupBy = $request->input('group_by', 'day');

        $salesData = $this->getSalesData($dateFrom, $dateTo, $groupBy);

        $salesByCategory = Order::where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$dateFrom, $dateTo])
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->selectRaw('categories.id, categories.name, sum(order_items.subtotal) as revenue, sum(order_items.quantity) as quantity')
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('revenue', 'desc')
            ->get();

        $salesByProduct = Order::where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$dateFrom, $dateTo])
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->selectRaw('products.id, products.name, products.sku, sum(order_items.subtotal) as revenue, sum(order_items.quantity) as quantity')
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderBy('revenue', 'desc')
            ->limit(20)
            ->get();

        $summary = [
            'total_revenue' => Order::where('payment_status', 'paid')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->sum('total_amount'),
            'total_orders' => Order::where('payment_status', 'paid')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->count(),
            'average_order_value' => 0,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ];

        $summary['average_order_value'] = $summary['total_orders'] > 0 
            ? $summary['total_revenue'] / $summary['total_orders'] 
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'sales_data' => $salesData,
                'by_category' => $salesByCategory,
                'top_products' => $salesByProduct,
            ]
        ]);
    }

    public function expenses(Request $request)
    {
        $dateFrom = $request->input('date_from', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', Carbon::now()->format('Y-m-d'));
        $groupBy = $request->input('group_by', 'day');

        $expensesData = $this->getExpensesData($dateFrom, $dateTo, $groupBy);

        $expensesByCategory = Expense::whereBetween('expense_date', [$dateFrom, $dateTo])
            ->selectRaw('category, sum(amount) as total, count(*) as count')
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->get();

        $summary = [
            'total_expenses' => Expense::whereBetween('expense_date', [$dateFrom, $dateTo])->sum('amount'),
            'total_transactions' => Expense::whereBetween('expense_date', [$dateFrom, $dateTo])->count(),
            'average_expense' => 0,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ];

        $summary['average_expense'] = $summary['total_transactions'] > 0 
            ? $summary['total_expenses'] / $summary['total_transactions'] 
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'expenses_data' => $expensesData,
                'by_category' => $expensesByCategory,
            ]
        ]);
    }

    public function orders(Request $request)
    {
        $dateFrom = $request->input('date_from', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', Carbon::now()->format('Y-m-d'));
        $status = $request->input('status');

        $query = Order::with(['customer', 'user', 'items.product'])
            ->whereBetween('created_at', [$dateFrom, $dateTo]);

        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        $ordersByStatus = Order::whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('status, count(*) as count, sum(total_amount) as total')
            ->groupBy('status')
            ->get();

        $ordersByPayment = Order::whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('payment_status, count(*) as count, sum(total_amount) as total')
            ->groupBy('payment_status')
            ->get();

        $summary = [
            'total_orders' => $orders->count(),
            'total_revenue' => $orders->where('payment_status', 'paid')->sum('total_amount'),
            'pending' => $orders->where('status', 'pending')->count(),
            'approved' => $orders->where('status', 'approved')->count(),
            'production' => $orders->where('status', 'production')->count(),
            'ready' => $orders->where('status', 'ready')->count(),
            'delivered' => $orders->where('status', 'delivered')->count(),
            'cancelled' => $orders->where('status', 'cancelled')->count(),
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'orders' => $orders,
                'by_status' => $ordersByStatus,
                'by_payment_status' => $ordersByPayment,
            ]
        ]);
    }

    public function inventory(Request $request)
    {
        $products = Product::with(['category'])
            ->orderBy('stock_quantity', 'desc')
            ->get();

        $summary = [
            'total_products' => $products->count(),
            'total_stock' => $products->sum('stock_quantity'),
            'total_value' => $products->sum('stock_quantity * price'),
            'low_stock' => $products->where('stock_quantity', '<', 10)->count(),
            'out_of_stock' => $products->where('stock_quantity', 0)->count(),
            'in_stock' => $products->where('stock_quantity', '>', 0)->count(),
        ];

        $stockByCategory = Category::withCount(['products' => function($query) {
                $query->select(DB::raw('sum(stock_quantity)'));
            }])
            ->get()
            ->map(function($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'total_stock' => $category->products->sum('stock_quantity'),
                    'product_count' => $category->products_count,
                ];
            });

        $lowStockProducts = Product::where('stock_quantity', '<', 10)
            ->where('stock_quantity', '>', 0)
            ->orderBy('stock_quantity', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'products' => $products,
                'by_category' => $stockByCategory,
                'low_stock_products' => $lowStockProducts,
            ]
        ]);
    }

    public function production(Request $request)
    {
        $dateFrom = $request->input('date_from', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', Carbon::now()->format('Y-m-d'));

        $productions = Production::with(['order', 'assignedTo', 'items.product'])
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->orderBy('created_at', 'desc')
            ->get();

        $summary = [
            'total' => $productions->count(),
            'pending' => $productions->where('status', 'pending')->count(),
            'in_progress' => $productions->where('status', 'in_progress')->count(),
            'paused' => $productions->where('status', 'paused')->count(),
            'completed' => $productions->where('status', 'completed')->count(),
            'cancelled' => $productions->where('status', 'cancelled')->count(),
            'avg_progress' => $productions->avg('progress') ?? 0,
        ];

        $byPriority = Production::whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('priority, count(*) as count')
            ->groupBy('priority')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'productions' => $productions,
                'by_priority' => $byPriority,
            ]
        ]);
    }

    public function financial(Request $request)
    {
        $dateFrom = $request->input('date_from', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', Carbon::now()->format('Y-m-d'));

        $revenue = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->sum('total_amount');

        $expenses = Expense::whereBetween('expense_date', [$dateFrom, $dateTo])
            ->sum('amount');

        $profit = $revenue - $expenses;

        $monthlyRevenue = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, sum(total_amount) as total')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        $monthlyExpenses = Expense::whereBetween('expense_date', [$dateFrom, $dateTo])
            ->selectRaw('YEAR(expense_date) as year, MONTH(expense_date) as month, sum(amount) as total')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_revenue' => $revenue,
                    'total_expenses' => $expenses,
                    'profit' => $profit,
                    'profit_margin' => $revenue > 0 ? ($profit / $revenue) * 100 : 0,
                ],
                'monthly_revenue' => $monthlyRevenue,
                'monthly_expenses' => $monthlyExpenses,
            ]
        ]);
    }

    public function customers(Request $request)
    {
        $dateFrom = $request->input('date_from', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', Carbon::now()->format('Y-m-d'));

        $topCustomers = Customer::selectRaw('customers.*, sum(orders.total_amount) as total_spent, count(orders.id) as total_orders')
            ->join('orders', 'customers.id', '=', 'orders.customer_id')
            ->where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$dateFrom, $dateTo])
            ->groupBy('customers.id')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get();

        $newCustomers = Customer::whereBetween('created_at', [$dateFrom, $dateTo])->count();
        $totalCustomers = Customer::count();

        $statusDistribution = Customer::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'top_customers' => $topCustomers,
                'new_customers' => $newCustomers,
                'total_customers' => $totalCustomers,
                'status_distribution' => $statusDistribution,
            ]
        ]);
    }

    public function export(Request $request)
    {
        $type = $request->input('type', 'sales');
        $format = $request->input('format', 'json'); // ✅ الطريقة الصحيحة
        $dateFrom = $request->input('date_from', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', Carbon::now()->format('Y-m-d'));

        $data = collect();
        $headers = [];
        $filename = "rapport_{$type}_{$dateFrom}_{$dateTo}";

        switch ($type) {
            case 'sales':
                $data = $this->getSalesData($dateFrom, $dateTo, 'day');
                $headers = ['Date', 'Commandes', 'Revenu', 'Moyenne'];
                $filename .= '_ventes';
                break;

            case 'expenses':
                $data = $this->getExpensesData($dateFrom, $dateTo, 'day');
                $headers = ['Date', 'Dépenses', 'Transactions'];
                $filename .= '_depenses';
                break;

            case 'orders':
                $orders = Order::whereBetween('created_at', [$dateFrom, $dateTo])
                    ->with(['customer', 'user'])
                    ->get();
                $data = $orders->map(function($order) {
                    return [
                        'Commande' => $order->order_number,
                        'Client' => $order->customer->name ?? '—',
                        'Total' => $order->total_amount,
                        'Statut' => $order->status,
                        'Paiement' => $order->payment_status,
                        'Date' => $order->created_at->format('Y-m-d'),
                    ];
                });
                $headers = ['Commande', 'Client', 'Total', 'Statut', 'Paiement', 'Date'];
                $filename .= '_commandes';
                break;

            case 'inventory':
                $products = Product::with('category')->get();
                $data = $products->map(function($product) {
                    return [
                        'Produit' => $product->name,
                        'SKU' => $product->sku,
                        'Catégorie' => $product->category->name ?? '—',
                        'Prix' => $product->price,
                        'Stock' => $product->stock_quantity,
                        'Statut' => $product->status,
                    ];
                });
                $headers = ['Produit', 'SKU', 'Catégorie', 'Prix', 'Stock', 'Statut'];
                $filename .= '_inventaire';
                break;

            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Type de rapport non valide'
                ], 400);
        }

        if ($format === 'json') {
            return response()->json([
                'success' => true,
                'data' => $data,
                'meta' => [
                    'type' => $type,
                    'date_from' => $dateFrom,
                    'date_to' => $dateTo,
                    'exported_at' => now()->format('Y-m-d H:i:s'),
                    'count' => $data->count(),
                ]
            ]);
        }

        if ($format === 'csv') {
            $csv = implode(',', $headers) . "\n";
            foreach ($data as $row) {
                if (is_array($row)) {
                    $csv .= implode(',', array_values($row)) . "\n";
                } else {
                    $csv .= implode(',', (array) $row) . "\n";
                }
            }

            return response($csv, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename={$filename}.csv",
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Format non supporté. Utilisez "json" ou "csv"'
        ], 400);
    }

    public function quickSummary(Request $request)
    {
        $today = Carbon::today();

        $todayRevenue = Order::where('payment_status', 'paid')
            ->whereDate('created_at', $today)
            ->sum('total_amount');
        $todayOrders = Order::whereDate('created_at', $today)->count();

        $monthRevenue = Order::where('payment_status', 'paid')
            ->whereMonth('created_at', Carbon::now()->month)
            ->sum('total_amount');
        $monthOrders = Order::whereMonth('created_at', Carbon::now()->month)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'today' => [
                    'revenue' => $todayRevenue,
                    'orders' => $todayOrders,
                ],
                'this_month' => [
                    'revenue' => $monthRevenue,
                    'orders' => $monthOrders,
                ],
                'pending_orders' => Order::where('status', 'pending')->count(),
                'low_stock' => Product::where('stock_quantity', '<', 10)->count(),
            ]
        ]);
    }

    private function getSalesData($dateFrom, $dateTo, $groupBy)
    {
        $query = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$dateFrom, $dateTo]);

        switch ($groupBy) {
            case 'week':
                return $query->selectRaw('YEARWEEK(created_at) as period, count(*) as orders, sum(total_amount) as revenue, avg(total_amount) as average')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->get();
            case 'month':
                return $query->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, count(*) as orders, sum(total_amount) as revenue, avg(total_amount) as average')
                    ->groupBy('year', 'month')
                    ->orderBy('year')
                    ->orderBy('month')
                    ->get();
            case 'year':
                return $query->selectRaw('YEAR(created_at) as year, count(*) as orders, sum(total_amount) as revenue, avg(total_amount) as average')
                    ->groupBy('year')
                    ->orderBy('year')
                    ->get();
            default:
                return $query->selectRaw('DATE(created_at) as date, count(*) as orders, sum(total_amount) as revenue, avg(total_amount) as average')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get();
        }
    }

    private function getExpensesData($dateFrom, $dateTo, $groupBy)
    {
        $query = Expense::whereBetween('expense_date', [$dateFrom, $dateTo]);

        switch ($groupBy) {
            case 'week':
                return $query->selectRaw('YEARWEEK(expense_date) as period, count(*) as transactions, sum(amount) as total')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->get();
            case 'month':
                return $query->selectRaw('YEAR(expense_date) as year, MONTH(expense_date) as month, count(*) as transactions, sum(amount) as total')
                    ->groupBy('year', 'month')
                    ->orderBy('year')
                    ->orderBy('month')
                    ->get();
            case 'year':
                return $query->selectRaw('YEAR(expense_date) as year, count(*) as transactions, sum(amount) as total')
                    ->groupBy('year')
                    ->orderBy('year')
                    ->get();
            default:
                return $query->selectRaw('DATE(expense_date) as date, count(*) as transactions, sum(amount) as total')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get();
        }
    }
}