<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function orders(Request $request)
    {
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;

        $query = Order::query();

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $totalOrders = $query->count();
        $totalRevenue = $query->where('payment_status', 'paid')->sum('total_amount');
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        $ordersByStatus = Order::selectRaw('status, count(*) as count, sum(total_amount) as total')
            ->when($dateFrom, function($q) use ($dateFrom) {
                return $q->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($dateTo, function($q) use ($dateTo) {
                return $q->whereDate('created_at', '<=', $dateTo);
            })
            ->groupBy('status')
            ->get();

        $ordersByPayment = Order::selectRaw('payment_status, count(*) as count, sum(total_amount) as total')
            ->when($dateFrom, function($q) use ($dateFrom) {
                return $q->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($dateTo, function($q) use ($dateTo) {
                return $q->whereDate('created_at', '<=', $dateTo);
            })
            ->groupBy('payment_status')
            ->get();

        $dailyOrders = $query->clone()
            ->selectRaw('DATE(created_at) as date, count(*) as count, sum(total_amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'average_order_value' => $avgOrderValue,
                'by_status' => $ordersByStatus,
                'by_payment_status' => $ordersByPayment,
                'daily_orders' => $dailyOrders,
            ]
        ]);
    }

    public function revenue(Request $request)
    {
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;

        $totalRevenue = Order::where('payment_status', 'paid')
            ->when($dateFrom, function($q) use ($dateFrom) {
                return $q->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($dateTo, function($q) use ($dateTo) {
                return $q->whereDate('created_at', '<=', $dateTo);
            })
            ->sum('total_amount');

        $dailyRevenue = Order::where('payment_status', 'paid')
            ->selectRaw('DATE(created_at) as date, sum(total_amount) as revenue, count(*) as orders')
            ->when($dateFrom, function($q) use ($dateFrom) {
                return $q->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($dateTo, function($q) use ($dateTo) {
                return $q->whereDate('created_at', '<=', $dateTo);
            })
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $revenueByCategory = Order::where('orders.payment_status', 'paid')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->selectRaw('categories.id, categories.name, sum(order_items.subtotal) as revenue')
            ->when($dateFrom, function($q) use ($dateFrom) {
                return $q->whereDate('orders.created_at', '>=', $dateFrom);
            })
            ->when($dateTo, function($q) use ($dateTo) {
                return $q->whereDate('orders.created_at', '<=', $dateTo);
            })
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('revenue', 'desc')
            ->get();

        $monthlyRevenue = Order::where('payment_status', 'paid')
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, sum(total_amount) as revenue')
            ->when($dateFrom, function($q) use ($dateFrom) {
                return $q->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($dateTo, function($q) use ($dateTo) {
                return $q->whereDate('created_at', '<=', $dateTo);
            })
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_revenue' => $totalRevenue,
                'daily_revenue' => $dailyRevenue,
                'by_category' => $revenueByCategory,
                'monthly_trend' => $monthlyRevenue,
            ]
        ]);
    }

    public function products(Request $request)
    {
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;

        $topProducts = Product::selectRaw('products.*, sum(order_items.quantity) as total_sold, sum(order_items.subtotal) as revenue')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->when($dateFrom, function($q) use ($dateFrom) {
                return $q->whereDate('orders.created_at', '>=', $dateFrom);
            })
            ->when($dateTo, function($q) use ($dateTo) {
                return $q->whereDate('orders.created_at', '<=', $dateTo);
            })
            ->where('orders.payment_status', 'paid')
            ->groupBy('products.id')
            ->orderBy('total_sold', 'desc')
            ->limit(10)
            ->get();

        $stockStatus = [
            'in_stock' => Product::where('stock_quantity', '>', 10)->count(),
            'low_stock' => Product::whereBetween('stock_quantity', [1, 10])->count(),
            'out_of_stock' => Product::where('stock_quantity', 0)->count(),
            'total' => Product::count(),
        ];

        $productsByCategory = Category::withCount('products')
            ->orderBy('products_count', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'top_products' => $topProducts,
                'stock_status' => $stockStatus,
                'by_category' => $productsByCategory,
            ]
        ]);
    }

    public function customers(Request $request)
    {
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;

        $topCustomers = Customer::selectRaw('customers.*, sum(orders.total_amount) as total_spent, count(orders.id) as total_orders')
            ->join('orders', 'customers.id', '=', 'orders.customer_id')
            ->when($dateFrom, function($q) use ($dateFrom) {
                return $q->whereDate('orders.created_at', '>=', $dateFrom);
            })
            ->when($dateTo, function($q) use ($dateTo) {
                return $q->whereDate('orders.created_at', '<=', $dateTo);
            })
            ->where('orders.payment_status', 'paid')
            ->groupBy('customers.id')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get();

        $newCustomers = Customer::whereBetween('created_at', [$dateFrom, $dateTo])->count();
        $totalCustomers = Customer::count();

        $customerStatus = Customer::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'top_customers' => $topCustomers,
                'new_customers' => $newCustomers,
                'total_customers' => $totalCustomers,
                'status_distribution' => $customerStatus,
            ]
        ]);
    }

    public function expenses(Request $request)
    {
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;

        $query = Expense::query();

        if ($dateFrom) {
            $query->whereDate('expense_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('expense_date', '<=', $dateTo);
        }

        $totalExpenses = $query->clone()->sum('amount');
        $count = $query->clone()->count();

        $dailyExpenses = $query->clone()
            ->selectRaw('DATE(expense_date) as date, sum(amount) as total, count(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $expensesByCategory = $query->clone()
            ->selectRaw('category, sum(amount) as total, count(*) as count')
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->get();

        $monthlyExpenses = $query->clone()
            ->selectRaw('YEAR(expense_date) as year, MONTH(expense_date) as month, sum(amount) as total')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_expenses' => $totalExpenses,
                'count' => $count,
                'daily_expenses' => $dailyExpenses,
                'by_category' => $expensesByCategory,
                'monthly_trend' => $monthlyExpenses,
            ]
        ]);
    }

    public function summary(Request $request)
    {
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;

        $ordersQuery = Order::query();
        if ($dateFrom) $ordersQuery->whereDate('created_at', '>=', $dateFrom);
        if ($dateTo) $ordersQuery->whereDate('created_at', '<=', $dateTo);

        $totalOrders = $ordersQuery->count();
        $totalRevenue = $ordersQuery->where('payment_status', 'paid')->sum('total_amount');

        $customersQuery = Customer::query();
        if ($dateFrom) $customersQuery->whereDate('created_at', '>=', $dateFrom);
        if ($dateTo) $customersQuery->whereDate('created_at', '<=', $dateTo);
        $newCustomers = $customersQuery->count();

        $totalProducts = Product::count();
        $lowStock = Product::where('stock_quantity', '<', 10)->count();

        $expensesQuery = Expense::query();
        if ($dateFrom) $expensesQuery->whereDate('expense_date', '>=', $dateFrom);
        if ($dateTo) $expensesQuery->whereDate('expense_date', '<=', $dateTo);
        $totalExpenses = $expensesQuery->sum('amount');

        $profit = $totalRevenue - $totalExpenses;
        $profitMargin = $totalRevenue > 0 ? ($profit / $totalRevenue) * 100 : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_orders' => $totalOrders,
                    'total_revenue' => $totalRevenue,
                    'total_expenses' => $totalExpenses,
                    'profit' => $profit,
                    'profit_margin' => round($profitMargin, 2),
                    'new_customers' => $newCustomers,
                    'total_customers' => Customer::count(),
                    'total_products' => $totalProducts,
                    'low_stock_products' => $lowStock,
                ],
                'period' => [
                    'date_from' => $dateFrom,
                    'date_to' => $dateTo,
                ]
            ]
        ]);
    }

    public function realtime(Request $request)
    {
        $today = Carbon::today();

        $todayOrders = Order::whereDate('created_at', $today)->count();
        $todayRevenue = Order::where('payment_status', 'paid')
            ->whereDate('created_at', $today)
            ->sum('total_amount');

        $pendingOrders = Order::where('status', 'pending')->count();

        $lowStockItems = Product::where('stock_quantity', '<', 10)->count();
        $outOfStock = Product::where('stock_quantity', 0)->count();

        $onlineUsers = User::where('status', 'online')->count();

        $recentOrders = Order::with(['customer'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'today' => [
                    'orders' => $todayOrders,
                    'revenue' => $todayRevenue,
                ],
                'pending_orders' => $pendingOrders,
                'stock' => [
                    'low_stock' => $lowStockItems,
                    'out_of_stock' => $outOfStock,
                ],
                'online_users' => $onlineUsers,
                'recent_orders' => $recentOrders,
                'timestamp' => now(),
            ]
        ]);
    }
}