<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationService
{
    public function list(array $filters = [], ?int $userId = null): LengthAwarePaginator
    {
        $userId = $userId ?? auth()->id();
        $query = Notification::where('user_id', $userId);

        if (isset($filters['is_read'])) {
            $query->where('is_read', filter_var($filters['is_read'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Notification
    {
        return Notification::create([
            'title' => $data['title'],
            'message' => $data['message'],
            'type' => $data['type'],
            'user_id' => $data['user_id'] ?? auth()->id(),
        ]);
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
