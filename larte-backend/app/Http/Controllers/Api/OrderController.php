<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\CancelOrderRequest;
use App\Http\Requests\Orders\StoreOrderProductRequest;
use App\Http\Requests\Orders\StoreOrderRequest;
use App\Http\Requests\Orders\UpdateOrderPaymentRequest;
use App\Http\Requests\Orders\UpdateOrderProductRequest;
use App\Http\Requests\Orders\UpdateOrderRequest;
use App\Http\Requests\Orders\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\OrderService;
use App\Support\StatusMapper;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Order::class);

        return $this->success($this->orderService->list($request->all()));
    }

    public function store(StoreOrderRequest $request)
    {
        $this->authorize('create', Order::class);

        try {
            $order = $this->orderService->create($request->validated(), auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Commande créée avec succès',
                'data' => $order,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function show(Order $order)
    {
        $this->authorize('view', $order);

        return $this->success(StatusMapper::transformOrder($order->load(['customer', 'user', 'items.product'])));
    }

    public function update(UpdateOrderRequest $request, Order $order)
    {
        $this->authorize('update', $order);

        return response()->json([
            'success' => true,
            'message' => 'Commande mise à jour avec succès',
            'data' => $this->orderService->update($order, $request->validated()),
        ]);
    }

    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);

        try {
            $this->orderService->delete($order);

            return response()->json([
                'success' => true,
                'message' => 'Commande supprimée avec succès',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
        }
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        $this->authorize('update', $order);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'data' => $this->orderService->updateStatus($order, $request->validated('status')),
        ]);
    }

    public function validateOrder(Order $order)
    {
        $this->authorize('update', $order);

        try {
            return response()->json([
                'success' => true,
                'message' => 'Commande validée',
                'data' => $this->orderService->validate($order),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function cancel(CancelOrderRequest $request, Order $order)
    {
        $this->authorize('update', $order);

        try {
            return response()->json([
                'success' => true,
                'message' => 'Commande annulée',
                'data' => $this->orderService->cancel($order, $request->validated('reason')),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function updatePayment(UpdateOrderPaymentRequest $request, Order $order)
    {
        $this->authorize('update', $order);

        return response()->json([
            'success' => true,
            'message' => 'Paiement mis à jour',
            'data' => $this->orderService->updatePayment($order, $request->validated()),
        ]);
    }

    public function startProduction(Request $request, Order $order)
    {
        $this->authorize('update', $order);

        try {
            return response()->json([
                'success' => true,
                'message' => 'Production démarrée',
                'data' => $this->orderService->startProduction($order, $request->all()),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function products(Order $order)
    {
        $this->authorize('view', $order);

        return response()->json([
            'success' => true,
            'data' => $this->orderService->getProducts($order),
        ]);
    }

    public function addProduct(StoreOrderProductRequest $request, Order $order)
    {
        $this->authorize('update', $order);

        $item = $this->orderService->addProduct($order, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Produit ajouté à la commande',
            'data' => $item,
        ], 201);
    }

    public function updateProduct(UpdateOrderProductRequest $request, Order $order, OrderItem $orderItem)
    {
        $this->authorize('update', $order);

        return response()->json([
            'success' => true,
            'message' => 'Quantité mise à jour',
            'data' => $this->orderService->updateProductQuantity($order, $orderItem, $request->validated('quantity')),
        ]);
    }

    public function removeProduct(Order $order, OrderItem $orderItem)
    {
        $this->authorize('update', $order);

        $this->orderService->removeProduct($order, $orderItem);

        return response()->json([
            'success' => true,
            'message' => 'Produit retiré de la commande',
        ]);
    }

    public function history(Request $request)
    {
        $this->authorize('viewAny', Order::class);

        return response()->json([
            'success' => true,
            'data' => $this->orderService->history($request->all()),
        ]);
    }

    public function statistics()
    {
        $this->authorize('viewAny', Order::class);

        return response()->json([
            'success' => true,
            'data' => $this->orderService->statistics(),
        ]);
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Order::class);

        return response()->json([
            'success' => true,
            'data' => $this->orderService->export(),
        ]);
    }
}
