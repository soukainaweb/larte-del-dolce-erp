<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Order;
use App\Models\Product;
use App\Models\Production;
use App\Support\StatusMapper;

class DashboardService
{
    public function stats(): array
    {
        $orders = Order::query();
        $totalOrders = $orders->count();

        $distribution = [
            'total' => $totalOrders,
            'enAttente' => Order::where('status', 'pending')->count(),
            'enProduction' => Order::where('status', 'processing')->count(),
            'pretes' => Order::where('status', 'processing')->count(),
            'livrees' => Order::where('status', 'completed')->count(),
        ];

        return [
            'kpi' => [
                'orders' => [
                    'value' => $totalOrders,
                    'growth' => '0%',
                    'isPositive' => true,
                    'trend' => [],
                ],
                'production' => [
                    'value' => Production::count(),
                    'growth' => '0%',
                    'isPositive' => true,
                    'trend' => [],
                ],
            ],
            'distribution' => $distribution,
        ];
    }

    public function analytics(): array
    {
        $months = collect(range(5, 0))->map(fn ($i) => now()->subMonths($i)->format('M'));

        return [
            'chartData' => [
                'labels' => $months->values()->all(),
                'revenue' => array_fill(0, 6, 0),
                'orders' => array_fill(0, 6, 0),
                'production' => array_fill(0, 6, 0),
                'invoices' => array_fill(0, 6, 0),
            ],
        ];
    }

    public function orders()
    {
        return StatusMapper::transformOrderCollection(
            Order::with('customer')->latest()->take(10)->get()
        );
    }

    public function notifications()
    {
        return Notification::where('user_id', auth()->id())
            ->latest()
            ->take(10)
            ->get();
    }

    public function production()
    {
        return Production::with('order')->latest()->take(10)->get();
    }

    public function topProducts()
    {
        return Product::orderByDesc('stock_quantity')->take(5)->get();
    }
}
