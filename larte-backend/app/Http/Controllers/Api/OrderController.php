<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['customer', 'user', 'items.product']);

        if ($request->search) {
            $query->where('order_number', 'LIKE', "%{$request->search}%");
        }

        if ($request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->payment_status) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->date_from) {
            $query->whereDate('order_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('order_date', '<=', $request->date_to);
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $orderNumber = 'ORD-' . date('Ymd') . '-' . str_pad(Order::count() + 1, 4, '0', STR_PAD_LEFT);

        $order = Order::create([
            'order_number' => $orderNumber,
            'customer_id' => $request->customer_id,
            'user_id' => auth()->id(),
            'order_date' => now(),
            'status' => 'pending',
            'payment_status' => 'pending',
            'notes' => $request->notes,
        ]);

        $subtotal = 0;

        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);
            $price = $product->price;
            $subtotalItem = $price * $item['quantity'];

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $price,
                'subtotal' => $subtotalItem,
            ]);

            $subtotal += $subtotalItem;
        }

        $order->update([
            'total_amount' => $subtotal,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Commande créée avec succès',
            'data' => $order->load(['customer', 'items.product'])
        ], 201);
    }

    public function show(Order $order)
    {
        return response()->json([
            'success' => true,
            'data' => $order->load(['customer', 'user', 'items.product'])
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'sometimes|in:pending,approved,production,ready,delivered,cancelled',
            'payment_status' => 'sometimes|in:pending,partial,paid,refunded',
            'notes' => 'nullable|string',
        ]);

        $order->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Commande mise à jour avec succès',
            'data' => $order->fresh()->load(['customer', 'items.product'])
        ]);
    }

    public function destroy(Order $order)
    {
        if ($order->status === 'delivered') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer une commande livrée'
            ], 403);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Commande supprimée avec succès'
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,production,ready,delivered,cancelled'
        ]);

        $order->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'data' => $order->fresh()
        ]);
    }

    public function statistics()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Order::count(),
                'pending' => Order::where('status', 'pending')->count(),
                'approved' => Order::where('status', 'approved')->count(),
                'production' => Order::where('status', 'production')->count(),
                'ready' => Order::where('status', 'ready')->count(),
                'delivered' => Order::where('status', 'delivered')->count(),
                'cancelled' => Order::where('status', 'cancelled')->count(),
                'total_revenue' => Order::where('payment_status', 'paid')->sum('total_amount'),
            ]
        ]);
    }

    public function export(Request $request)
    {
        $orders = Order::with(['customer', 'user'])->get();
        
        $data = $orders->map(function($order) {
            return [
                'N° Commande' => $order->order_number,
                'Client' => $order->customer->name ?? '—',
                'Total' => $order->total_amount,
                'Statut' => $order->status,
                'Paiement' => $order->payment_status,
                'Date' => $order->created_at->format('Y-m-d H:i'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}