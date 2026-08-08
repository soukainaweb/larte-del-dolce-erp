<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\CancelOrderRequest;
use App\Http\Requests\Orders\RejectOrderRequest;
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
use InvalidArgumentException;

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

            return $this->success($order, 'تم إنشاء الطلب بنجاح', 201);
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function formOptions()
    {
        $this->authorize('create', Order::class);

        return $this->success($this->orderService->formOptions(auth()->user()));
    }

    public function show(Order $order)
    {
        $this->authorize('view', $order);

        return $this->success(StatusMapper::transformOrder($order->load(['customer', 'user', 'items.product'])));
    }

    public function update(UpdateOrderRequest $request, Order $order)
    {
        $this->authorize('update', $order);

        return $this->success(
            $this->orderService->update($order, $request->validated()),
            'Commande mise à jour avec succès'
        );
    }

    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);

        try {
            $this->orderService->delete($order);

            return $this->success(null, 'Commande supprimée avec succès');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 403);
        }
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        $this->authorize('transition', [$order, $request->validated('status')]);

        try {
            return $this->success(
                $this->orderService->updateStatus(
                    $order,
                    $request->validated('status'),
                    $request->validated('comment')
                ),
                'Statut mis à jour avec succès'
            );
        } catch (InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 403);
        }
    }

    public function validateOrder(Order $order)
    {
        $this->authorize('transition', [$order, 'validated']);

        try {
            return $this->success(
                $this->orderService->validate($order),
                'تمت الموافقة على الطلب'
            );
        } catch (InvalidArgumentException|\RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function reject(RejectOrderRequest $request, Order $order)
    {
        $this->authorize('transition', [$order, 'rejected']);

        try {
            return $this->success(
                $this->orderService->reject($order, $request->validated('reason')),
                'تم رفض الطلب'
            );
        } catch (InvalidArgumentException|\RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function cancel(CancelOrderRequest $request, Order $order)
    {
        $this->authorize('transition', [$order, 'cancelled']);

        try {
            return $this->success(
                $this->orderService->cancel($order, $request->validated('reason')),
                'Commande annulée'
            );
        } catch (InvalidArgumentException|\RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function updatePayment(UpdateOrderPaymentRequest $request, Order $order)
    {
        $this->authorize('update', $order);

        return $this->success(
            $this->orderService->updatePayment($order, $request->validated()),
            'Paiement mis à jour'
        );
    }

    public function startProduction(Request $request, Order $order)
    {
        $this->authorize('transition', [$order, 'in_production']);

        try {
            return $this->success(
                $this->orderService->startProduction($order),
                'Production démarrée'
            );
        } catch (InvalidArgumentException|\RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function statusHistory(Order $order)
    {
        $this->authorize('view', $order);

        return $this->success($this->orderService->statusHistory($order));
    }

    public function allowedTransitions(Order $order)
    {
        $this->authorize('view', $order);

        return $this->success($this->orderService->allowedTransitions($order));
    }

    public function products(Order $order)
    {
        $this->authorize('view', $order);

        return $this->success($this->orderService->getProducts($order));
    }

    public function addProduct(StoreOrderProductRequest $request, Order $order)
    {
        $this->authorize('update', $order);

        $item = $this->orderService->addProduct($order, $request->validated());

        return $this->success($item, 'Produit ajouté à la commande', 201);
    }

    public function updateProduct(UpdateOrderProductRequest $request, Order $order, OrderItem $orderItem)
    {
        $this->authorize('update', $order);

        return $this->success(
            $this->orderService->updateProductQuantity($order, $orderItem, $request->validated('quantity')),
            'Quantité mise à jour'
        );
    }

    public function removeProduct(Order $order, OrderItem $orderItem)
    {
        $this->authorize('update', $order);

        $this->orderService->removeProduct($order, $orderItem);

        return $this->success(null, 'Produit retiré de la commande');
    }

    public function history(Request $request)
    {
        $this->authorize('viewAny', Order::class);

        return $this->success($this->orderService->history($request->all()));
    }

    public function statistics()
    {
        $this->authorize('viewAny', Order::class);

        return $this->success($this->orderService->statistics());
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Order::class);

        return $this->success($this->orderService->export());
    }
}
