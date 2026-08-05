<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\TransferOrderRequest;
use App\Models\Order;
use App\Models\OrderTransfer;
use App\Services\OrderTransferService;
use Illuminate\Http\Request;

class OrderTransferController extends Controller
{
    public function __construct(private OrderTransferService $transferService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', OrderTransfer::class);

        return $this->success($this->transferService->list($request->all()));
    }

    public function transfer(TransferOrderRequest $request, Order $order)
    {
        $this->authorize('update', $order);

        try {
            $transfer = $this->transferService->transfer(
                $order,
                (int) $request->validated('to_salesperson_id'),
                $request->validated('notes')
            );

            return $this->success($transfer, 'Order transferred successfully');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), [], 422);
        }
    }
}
