<?php

namespace App\Services;

use App\Models\GeneratedReport;
use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Production;
use App\Models\Category;
use App\Models\Delivery;
use App\Models\User;
use App\Support\StatusMapper;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function sales(array $filters = []): array
    {
        $dateFrom = $filters['date_from'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $filters['date_to'] ?? Carbon::now()->format('Y-m-d');
        $groupBy = $filters['group_by'] ?? 'day';

        $salesData = $this->getSalesData($dateFrom, $dateTo, $groupBy);

        $salesByCategory = Order::where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$dateFrom, $dateTo])
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->selectRaw('categories.id, categories.name, sum(order_items.subtotal) as revenue, sum(order_items.quantity) as quantity')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->get();

        $totalRevenue = Order::where('payment_status', 'paid')->whereBetween('created_at', [$dateFrom, $dateTo])->sum('total_amount');
        $totalOrders = Order::where('payment_status', 'paid')->whereBetween('created_at', [$dateFrom, $dateTo])->count();

        return [
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'average_order_value' => $totalOrders > 0 ? $totalRevenue / $totalOrders : 0,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'sales_data' => $salesData,
            'by_category' => $salesByCategory,
        ];
    }

    public function orders(array $filters = []): array
    {
        $dateFrom = $filters['date_from'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $filters['date_to'] ?? Carbon::now()->format('Y-m-d');

        $query = Order::with(['customer', 'user', 'items.product'])
            ->whereBetween('created_at', [$dateFrom, $dateTo]);

        if (!empty($filters['status'])) {
            $query->where('status', StatusMapper::orderToDb($filters['status']));
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        $orders = StatusMapper::transformOrderCollection($query->orderByDesc('created_at')->get());

        return [
            'summary' => [
                'total_orders' => $orders->count(),
                'total_revenue' => $orders->where('payment_status', 'paid')->sum('total_amount'),
            ],
            'orders' => $orders,
            'by_status' => Order::whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('status, count(*) as count, sum(total_amount) as total')
                ->groupBy('status')->get()
                ->map(fn ($r) => ['status' => StatusMapper::orderFromDb($r->status), 'count' => $r->count, 'total' => $r->total]),
        ];
    }

    public function production(array $filters = []): array
    {
        $dateFrom = $filters['date_from'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $filters['date_to'] ?? Carbon::now()->format('Y-m-d');

        $productions = Production::with(['order', 'assignedTo'])
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->orderByDesc('created_at')
            ->get();

        return [
            'summary' => [
                'total' => $productions->count(),
                'pending' => $productions->where('status', 'pending')->count(),
                'in_progress' => $productions->where('status', 'in_progress')->count(),
                'completed' => $productions->where('status', 'completed')->count(),
            ],
            'productions' => $productions,
        ];
    }

    public function products(array $filters = []): array
    {
        $products = Product::with('category')->orderByDesc('stock_quantity')->get();

        return [
            'summary' => [
                'total_products' => $products->count(),
                'total_stock' => $products->sum('stock_quantity'),
                'low_stock' => $products->where('stock_quantity', '<', 10)->count(),
                'out_of_stock' => $products->where('stock_quantity', 0)->count(),
            ],
            'products' => $products,
        ];
    }

    public function customers(array $filters = []): array
    {
        $dateFrom = $filters['date_from'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $filters['date_to'] ?? Carbon::now()->format('Y-m-d');

        return [
            'top_customers' => Customer::selectRaw('customers.*, sum(orders.total_amount) as total_spent, count(orders.id) as total_orders')
                ->join('orders', 'customers.id', '=', 'orders.customer_id')
                ->where('orders.payment_status', 'paid')
                ->whereBetween('orders.created_at', [$dateFrom, $dateTo])
                ->groupBy('customers.id')
                ->orderByDesc('total_spent')
                ->limit(10)
                ->get(),
            'total_customers' => Customer::count(),
        ];
    }

    public function financial(array $filters = []): array
    {
        $dateFrom = $filters['date_from'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $filters['date_to'] ?? Carbon::now()->format('Y-m-d');

        $revenue = Order::where('payment_status', 'paid')->whereBetween('created_at', [$dateFrom, $dateTo])->sum('total_amount');
        $expenses = Expense::whereBetween('expense_date', [$dateFrom, $dateTo])->sum('amount');

        return [
            'summary' => [
                'total_revenue' => $revenue,
                'total_expenses' => $expenses,
                'profit' => $revenue - $expenses,
                'profit_margin' => $revenue > 0 ? (($revenue - $expenses) / $revenue) * 100 : 0,
            ],
        ];
    }

    public function deliveries(array $filters = []): array
    {
        $dateFrom = $filters['date_from'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $filters['date_to'] ?? Carbon::now()->format('Y-m-d');

        $deliveries = Delivery::with('order')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->get();

        return [
            'summary' => [
                'total' => $deliveries->count(),
                'delivered' => $deliveries->where('status', 'delivered')->count(),
                'pending' => $deliveries->where('status', 'pending')->count(),
            ],
            'deliveries' => $deliveries,
        ];
    }

    public function salesReps(array $filters = []): array
    {
        $dateFrom = $filters['date_from'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $filters['date_to'] ?? Carbon::now()->format('Y-m-d');

        $reps = User::selectRaw('users.id, users.first_name, users.last_name, count(orders.id) as orders_count, sum(orders.total_amount) as total_revenue')
            ->join('orders', 'users.id', '=', 'orders.user_id')
            ->whereBetween('orders.created_at', [$dateFrom, $dateTo])
            ->groupBy('users.id', 'users.first_name', 'users.last_name')
            ->orderByDesc('total_revenue')
            ->get();

        return ['sales_reps' => $reps];
    }

    public function yearlyComparison(array $filters = []): array
    {
        $years = $filters['years'] ?? [now()->year - 1, now()->year];

        $data = collect($years)->map(function ($year) {
            return [
                'year' => $year,
                'revenue' => Order::where('payment_status', 'paid')->whereYear('created_at', $year)->sum('total_amount'),
                'orders' => Order::whereYear('created_at', $year)->count(),
                'expenses' => Expense::whereYear('expense_date', $year)->sum('amount'),
            ];
        });

        return ['comparison' => $data];
    }

    public function orderStatusDistribution(array $filters = []): array
    {
        $dateFrom = $filters['date_from'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $filters['date_to'] ?? Carbon::now()->format('Y-m-d');

        $distribution = Order::whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->map(fn ($r) => [
                'status' => StatusMapper::orderFromDb($r->status),
                'count' => $r->count,
            ]);

        return ['distribution' => $distribution];
    }

    public function activities(array $filters = []): array
    {
        $limit = $filters['limit'] ?? 10;

        return [
            'activities' => Order::with('customer')->latest()->take($limit)->get(),
        ];
    }

    public function alerts(array $filters = []): array
    {
        return [
            'alerts' => [
                ['type' => 'low_stock', 'count' => Product::where('stock_quantity', '<', 10)->count()],
                ['type' => 'pending_orders', 'count' => Order::where('status', 'submitted')->count()],
            ],
        ];
    }

    public function generate(array $data): GeneratedReport
    {
        $reportData = match ($data['type'] ?? 'Ventes') {
            'Commandes' => $this->orders($data),
            'Production' => $this->production($data),
            'Financier' => $this->financial($data),
            'Clients' => $this->customers($data),
            'Produits' => $this->products($data),
            default => $this->sales($data),
        };

        return GeneratedReport::create([
            'name' => $data['name'] ?? 'Rapport ' . now()->format('Y-m-d H:i'),
            'type' => $data['type'] ?? 'Ventes',
            'period' => $data['period'] ?? 'Mensuel',
            'status' => 'completed',
            'parameters' => $data,
            'data' => $reportData,
            'created_by' => auth()->id(),
        ]);
    }

    public function listGenerated(array $filters = [])
    {
        $query = GeneratedReport::with('creator')->latest();

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function getGenerated(int $id): GeneratedReport
    {
        return GeneratedReport::with('creator')->findOrFail($id);
    }

    public function deleteGenerated(int $id): void
    {
        GeneratedReport::findOrFail($id)->delete();
    }

    public function export(array $filters = [])
    {
        $type = $filters['type'] ?? 'sales';
        $dateFrom = $filters['date_from'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $filters['date_to'] ?? Carbon::now()->format('Y-m-d');

        return match ($type) {
            'orders' => $this->orders(['date_from' => $dateFrom, 'date_to' => $dateTo]),
            'production' => $this->production(['date_from' => $dateFrom, 'date_to' => $dateTo]),
            default => $this->sales(['date_from' => $dateFrom, 'date_to' => $dateTo]),
        };
    }

    private function getSalesData(string $dateFrom, string $dateTo, string $groupBy)
    {
        $query = Order::where('payment_status', 'paid')->whereBetween('created_at', [$dateFrom, $dateTo]);

        return match ($groupBy) {
            'month' => $query->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, count(*) as orders, sum(total_amount) as revenue')
                ->groupBy('year', 'month')->orderBy('year')->orderBy('month')->get(),
            default => $query->selectRaw('DATE(created_at) as date, count(*) as orders, sum(total_amount) as revenue')
                ->groupBy('date')->orderBy('date')->get(),
        };
    }
}
