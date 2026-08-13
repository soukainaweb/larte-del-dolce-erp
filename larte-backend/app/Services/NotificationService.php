<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationService
{
    public function __construct(
        private NotificationDeliveryService $notificationDelivery,
    ) {
    }
    public function list(array $filters = [], ?int $userId = null): LengthAwarePaginator
    {
        $userId = $userId ?? auth()->id();
        $query = Notification::where('user_id', $userId);

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            if ($filters['status'] === 'unread') {
                $query->where('is_read', false);
            } elseif ($filters['status'] === 'read') {
                $query->where('is_read', true);
            }
        } elseif (isset($filters['is_read'])) {
            $query->where('is_read', filter_var($filters['is_read'], FILTER_VALIDATE_BOOLEAN));
        }

        if (! empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Notification
    {
        $userId = $data['user_id'] ?? auth()->id();
        $user = User::findOrFail($userId);

        $notification = $this->notificationDelivery->deliver($user, [
            'title' => $data['title'],
            'message' => $data['message'],
            'type' => $data['type'],
        ]);

        if ($notification === null) {
            return Notification::create([
                'title' => $data['title'],
                'message' => $data['message'],
                'type' => $data['type'],
                'user_id' => $userId,
            ]);
        }

        return $notification;
    }

    public function markAsRead(Notification $notification): Notification
    {
        $notification->update(['is_read' => true, 'read_at' => now()]);

        return $notification->fresh();
    }

    public function markBatchRead(array $ids, int $userId): void
    {
        Notification::where('user_id', $userId)
            ->whereIn('id', $ids)
            ->update(['is_read' => true, 'read_at' => now()]);
    }

    public function markAllRead(int $userId): void
    {
        Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);
    }

    public function deleteBatch(array $ids, int $userId): void
    {
        Notification::where('user_id', $userId)->whereIn('id', $ids)->delete();
    }

    public function deleteRead(int $userId): void
    {
        Notification::where('user_id', $userId)->where('is_read', true)->delete();
    }

    public function delete(Notification $notification): void
    {
        $notification->delete();
    }

    public function unreadCount(int $userId): int
    {
        return Notification::where('user_id', $userId)->where('is_read', false)->count();
    }

    public function statistics(int $userId): array
    {
        return [
            'total' => Notification::where('user_id', $userId)->count(),
            'unread' => Notification::where('user_id', $userId)->where('is_read', false)->count(),
            'read' => Notification::where('user_id', $userId)->where('is_read', true)->count(),
        ];
    }

    public function export(int $userId)
    {
        return Notification::where('user_id', $userId)->latest()->get();
    }

    public function modules(): array
    {
        return [
            ['value' => 'orders', 'label' => 'Commandes'],
            ['value' => 'inventory', 'label' => 'Inventaire'],
            ['value' => 'finance', 'label' => 'Finance'],
            ['value' => 'deliveries', 'label' => 'Livraisons'],
            ['value' => 'production', 'label' => 'Production'],
            ['value' => 'system', 'label' => 'Système'],
        ];
    }

    public function priorities(): array
    {
        return [
            ['value' => 'low', 'label' => 'Basse'],
            ['value' => 'normal', 'label' => 'Normale'],
            ['value' => 'high', 'label' => 'Haute'],
            ['value' => 'urgent', 'label' => 'Urgente'],
        ];
    }
}
