<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderTransfer;
use App\Models\User;
use App\Support\UserStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class OrderTransferService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = OrderTransfer::with([
            'order.customer',
            'fromSalesperson',
            'toSalesperson',
            'transferredByUser',
        ]);

        if (! empty($filters['order_id'])) {
            $query->where('order_id', $filters['order_id']);
        }

        if (! empty($filters['salesperson_id'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('from_salesperson_id', $filters['salesperson_id'])
                    ->orWhere('to_salesperson_id', $filters['salesperson_id']);
            });
        }

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 10);
    }

    /**
     * @return Collection<int, User>
     */
    public function salesRepresentatives(): Collection
    {
        return User::query()
            ->with('role:id,name')
            ->whereHas('role', fn ($q) => $q->where('name', 'sales'))
            ->whereNotIn('status', UserStatus::blockedForLogin())
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'email', 'role_id']);
    }

    public function transfer(Order $order, int $toSalespersonId, ?string $notes = null): OrderTransfer
    {
        return DB::transaction(function () use ($order, $toSalespersonId, $notes) {
            if (! $this->isSalesRepresentative($toSalespersonId)) {
                throw new \RuntimeException('The selected user must be a sales representative.');
            }

            if ($order->user_id === $toSalespersonId) {
                throw new \RuntimeException('Order is already assigned to this salesperson.');
            }

            $transfer = OrderTransfer::create([
                'order_id' => $order->id,
                'from_salesperson_id' => $order->user_id,
                'to_salesperson_id' => $toSalespersonId,
                'transferred_by' => auth()->id(),
                'notes' => $notes,
            ]);

            $order->update(['user_id' => $toSalespersonId]);

            return $transfer->load([
                'order.customer',
                'fromSalesperson',
                'toSalesperson',
                'transferredByUser',
            ]);
        });
    }

    protected function isSalesRepresentative(int $userId): bool
    {
        return User::query()
            ->where('id', $userId)
            ->whereHas('role', fn ($q) => $q->where('name', 'sales'))
            ->whereNotIn('status', UserStatus::blockedForLogin())
            ->exists();
    }
}
