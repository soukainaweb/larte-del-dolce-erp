<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Product;
use App\Models\Production;
use App\Support\StatusMapper;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardService
{
    public function stats(): array
    {
        $totalOrders = Order::count();
        $totalCustomers = Customer::count();
        $totalProducts = Product::count();
        $totalProduction = Production::count();

        $revenueTotal = (float) Order::sum('total_amount');
        $monthStart = now()->startOfMonth();
        $previousMonthStart = now()->subMonth()->startOfMonth();
        $previousMonthEnd = now()->subMonth()->endOfMonth();

        $monthlyRevenue = (float) Order::where('created_at', '>=', $monthStart)->sum('total_amount');
        $previousMonthlyRevenue = (float) Order::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->sum('total_amount');

        $monthlyOrders = Order::where('created_at', '>=', $monthStart)->count();
        $previousMonthlyOrders = Order::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->count();

        $distribution = [
            'total' => $totalOrders,
            'enAttente' => Order::where('status', 'pending')->count(),
            'enProduction' => Order::where('status', 'processing')->count(),
            'pretes' => Order::where('status', 'confirmed')->count(),
            'livrees' => Order::where('status', 'completed')->count(),
        ];

        return [
            'kpi' => [
                'orders' => $this->kpiMetric($totalOrders, $monthlyOrders, $previousMonthlyOrders),
                'production' => $this->kpiMetric($totalProduction, null, null, $this->monthlyTrend(Production::query())),
                'deliveries' => $this->kpiMetric(
                    Schema::hasTable('deliveries') ? DB::table('deliveries')->count() : 0,
                    null,
                    null,
                    $this->monthlyTrendFromTable('deliveries')
                ),
                'revenue' => $this->kpiMetric(
                    (int) round($revenueTotal),
                    (int) round($monthlyRevenue),
                    (int) round($previousMonthlyRevenue),
                    $this->monthlySumTrend(Order::query(), 'total_amount')
                ),
                'customers' => $this->kpiMetric($totalCustomers, null, null, $this->monthlyTrend(Customer::query())),
                'products' => $this->kpiMetric($totalProducts, null, null, $this->monthlyTrend(Product::query())),
                'invoices' => $this->kpiMetric(
                    Invoice::count(),
                    Invoice::where('created_at', '>=', $monthStart)->count(),
                    Invoice::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->count(),
                    $this->monthlyTrend(Invoice::query())
                ),
            ],
            'distribution' => $distribution,
        ];
    }

    public function analytics(): array
    {
        $months = collect(range(5, 0))->map(function (int $offset) {
            return now()->subMonths($offset)->startOfMonth();
        });

        $labels = $months->map(fn (Carbon $date) => $date->format('M'))->values()->all();
        $revenue = [];
        $orders = [];
        $production = [];
        $invoices = [];

        foreach ($months as $month) {
            $start = $month->copy();
            $end = $month->copy()->endOfMonth();

            $orders[] = Order::whereBetween('created_at', [$start, $end])->count();
            $revenue[] = (float) Order::whereBetween('created_at', [$start, $end])->sum('total_amount');
            $production[] = Production::whereBetween('created_at', [$start, $end])->count();
            $invoices[] = Invoice::whereBetween('created_at', [$start, $end])->count();
        }

        return [
            'chartData' => [
                'labels' => $labels,
                'revenue' => $revenue,
                'orders' => $orders,
                'production' => $production,
                'invoices' => $invoices,
            ],
        ];
    }

    public function orders()
    {
        return StatusMapper::transformOrderCollection(
            Order::with(['customer', 'user'])
                ->latest()
                ->take(10)
                ->get()
                ->map(function (Order $order) {
                    return [
                        'id' => $order->order_number ?? $order->id,
                        'customer' => $order->customer?->name ?? '—',
                        'rep' => trim(($order->user?->first_name ?? '') . ' ' . ($order->user?->last_name ?? '')) ?: '—',
                        'status' => StatusMapper::orderFromDb($order->status),
                        'statusColor' => $this->statusColor($order->status),
                        'amount' => (float) $order->total_amount,
                    ];
                })
        );
    }

    public function notifications()
    {
        return Notification::query()
            ->when(auth()->id(), fn ($query) => $query->where('user_id', auth()->id()))
            ->latest()
            ->take(10)
            ->get()
            ->map(fn (Notification $notification) => [
                'id' => $notification->id,
                'title' => $notification->title ?? 'Notification',
                'desc' => $notification->message ?? '',
                'time' => optional($notification->created_at)->diffForHumans(),
                'type' => $notification->type ?? 'info',
            ]);
    }

    public function production()
    {
        return Production::with('order')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn (Production $item) => [
                'id' => $item->id,
                'name' => $item->name ?? $item->production_number ?? 'Production',
                'progress' => (int) ($item->progress ?? 0),
                'workshop' => $item->assigned_to ?? $item->status ?? '—',
                'img' => '',
            ]);
    }

    public function topProducts()
    {
        if (!Schema::hasTable('order_items')) {
            return Product::query()->orderByDesc('stock_quantity')->take(5)->get()->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'units' => (int) ($product->stock_quantity ?? 0),
                'amount' => (float) (($product->stock_quantity ?? 0) * ($product->price ?? 0)),
                'progress' => 0,
            ]);
        }

        $rows = DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(order_items.quantity) as units'),
                DB::raw('SUM(order_items.quantity * COALESCE(order_items.price, products.price, 0)) as amount')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('units')
            ->limit(5)
            ->get();

        if ($rows->isEmpty()) {
            return Product::query()->orderByDesc('stock_quantity')->take(5)->get()->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'units' => (int) ($product->stock_quantity ?? 0),
                'amount' => (float) (($product->stock_quantity ?? 0) * ($product->price ?? 0)),
                'progress' => 0,
            ]);
        }

        $maxUnits = max(1, (int) $rows->max('units'));

        return $rows->map(fn ($row) => [
            'id' => $row->id,
            'name' => $row->name,
            'units' => (int) $row->units,
            'amount' => (float) $row->amount,
            'progress' => (int) round(((int) $row->units / $maxUnits) * 100),
        ]);
    }

    private function kpiMetric(
        int|float $value,
        int|float|null $current = null,
        int|float|null $previous = null,
        array $trend = [],
    ): array {
        $growth = '0%';
        $isPositive = true;

        if ($current !== null && $previous !== null) {
            if ($previous > 0) {
                $delta = (($current - $previous) / $previous) * 100;
                $isPositive = $delta >= 0;
                $growth = sprintf('%s%.1f%%', $delta >= 0 ? '+' : '', $delta);
            } elseif ($current > 0) {
                $growth = '+100%';
                $isPositive = true;
            }
        }

        return [
            'value' => $value,
            'growth' => $growth,
            'isPositive' => $isPositive,
            'trend' => $trend,
        ];
    }

    private function monthlyTrend($query): array
    {
        return collect(range(5, 0))->map(function (int $offset) use ($query) {
            $start = now()->subMonths($offset)->startOfMonth();
            $end = now()->subMonths($offset)->endOfMonth();

            return (clone $query)->whereBetween('created_at', [$start, $end])->count();
        })->values()->all();
    }

    private function monthlySumTrend($query, string $column): array
    {
        return collect(range(5, 0))->map(function (int $offset) use ($query, $column) {
            $start = now()->subMonths($offset)->startOfMonth();
            $end = now()->subMonths($offset)->endOfMonth();

            return (float) (clone $query)->whereBetween('created_at', [$start, $end])->sum($column);
        })->values()->all();
    }

    private function monthlyTrendFromTable(string $table): array
    {
        if (!Schema::hasTable($table)) {
            return array_fill(0, 6, 0);
        }

        return collect(range(5, 0))->map(function (int $offset) use ($table) {
            $start = now()->subMonths($offset)->startOfMonth();
            $end = now()->subMonths($offset)->endOfMonth();

            return DB::table($table)->whereBetween('created_at', [$start, $end])->count();
        })->values()->all();
    }

    private function statusColor(?string $status): string
    {
        return match ($status) {
            'pending' => 'warning',
            'confirmed', 'processing' => 'info',
            'completed' => 'success',
            'cancelled' => 'danger',
            default => 'info',
        };
    }
}
