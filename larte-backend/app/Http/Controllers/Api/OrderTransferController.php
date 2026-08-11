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

    public function salesRepresentatives()
    {
        $this->authorize('viewAny', OrderTransfer::class);

        $reps = $this->transferService->salesRepresentatives()
            ->map(fn ($user) => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'full_name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'role' => $user->role?->name,
            ])
            ->values()
            ->all();

        return $this->success($reps);
    }

    public function transfer(TransferOrderRequest $request, Order $order)
    {
        if (\App\Support\SalesScope::isSalesRep()) {
            return $this->error('Sales representatives cannot transfer orders.', [], 403);
        }

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
