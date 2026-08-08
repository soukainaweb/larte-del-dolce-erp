<?php

namespace App\Services;

use App\Models\Production;
use App\Models\ProductionItem;
use App\Models\Order;
use App\Support\StatusMapper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ProductionService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Production::with(['order', 'assignedTo']);

        if (!empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('name', 'LIKE', "%{$term}%")
                    ->orWhere('production_number', 'LIKE', "%{$term}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (!empty($filters['assigned_to'])) {
            $query->where('assigned_to', $filters['assigned_to']);
        }

        if (!empty($filters['order_id'])) {
            $query->where('order_id', $filters['order_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Production
    {
        return DB::transaction(function () use ($data) {
            $productionNumber = 'PRD-' . date('Ymd') . '-' . str_pad(Production::count() + 1, 4, '0', STR_PAD_LEFT);

            $production = Production::create([
                'production_number' => $productionNumber,
                'order_id' => $data['order_id'] ?? null,
                'name' => $data['name'],
                'status' => $data['status'] ?? 'pending',
                'priority' => $data['priority'] ?? 'medium',
                'progress' => $data['progress'] ?? 0,
                'estimated_start_date' => $data['estimated_start_date'] ?? null,
                'estimated_end_date' => $data['estimated_end_date'] ?? null,
                'assigned_to' => $data['assigned_to'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                ProductionItem::create([
                    'production_id' => $production->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'completed_quantity' => 0,
                    'progress_percentage' => 0,
                ]);
            }

            if (!empty($data['order_id'])) {
                Order::where('id', $data['order_id'])->update(['status' => StatusMapper::orderToDb('production')]);
            }

            $production = $production->load(['order', 'assignedTo', 'items.product']);
            app(EntityCreatedNotificationService::class)->notify('production', $production);

            return $production;
        });
    }

    public function update(Production $production, array $data): Production
    {
        if (($data['status'] ?? null) === 'completed') {
            $data['progress'] = 100;
        }

        $production->update($data);
        $this->syncOrderStatus($production);

        return $production->fresh()->load(['order', 'assignedTo', 'items.product']);
    }

    public function delete(Production $production): void
    {
        if ($production->status === 'completed') {
            throw new \RuntimeException('Impossible de supprimer une production terminée');
        }

        $production->delete();
    }

    public function updateStatus(Production $production, string $status): Production
    {
        if ($status === 'completed') {
            $production->update(['progress' => 100]);
        }

        $production->update(['status' => $status]);
        $this->syncOrderStatus($production->fresh());

        return $production->fresh()->load(['order', 'assignedTo']);
    }

    public function updateProgress(Production $production, int $progress): Production
    {
        $production->update(['progress' => $progress]);

        if ($progress === 100) {
            $production->update(['status' => 'completed']);
        } elseif ($progress > 0 && $production->status === 'pending') {
            $production->update(['status' => 'in_progress']);
        }

        return $production->fresh();
    }

    public function assign(Production $production, int $userId): Production
    {
        $production->update(['assigned_to' => $userId]);

        return $production->fresh()->load(['order', 'assignedTo']);
    }

    public function statistics(array $filters = []): array
    {
        $query = Production::query();

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return [
            'total' => (clone $query)->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'in_progress' => (clone $query)->where('status', 'in_progress')->count(),
            'paused' => (clone $query)->where('status', 'paused')->count(),
            'completed' => (clone $query)->where('status', 'completed')->count(),
            'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
            'avg_progress' => (clone $query)->avg('progress'),
            'by_priority' => (clone $query)->selectRaw('priority, count(*) as count')->groupBy('priority')->get(),
        ];
    }

    public function statuses(): array
    {
        return [
            ['value' => 'pending', 'label' => 'En attente'],
            ['value' => 'in_progress', 'label' => 'En production'],
            ['value' => 'paused', 'label' => 'Suspendue'],
            ['value' => 'completed', 'label' => 'Terminée'],
            ['value' => 'cancelled', 'label' => 'Annulée'],
        ];
    }

    public function priorities(): array
    {
        return [
            ['value' => 'low', 'label' => 'Basse'],
            ['value' => 'medium', 'label' => 'Moyenne'],
            ['value' => 'high', 'label' => 'Haute'],
            ['value' => 'critical', 'label' => 'Critique'],
        ];
    }

    public function export(array $filters = [])
    {
        $query = Production::with(['order', 'assignedTo']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->get()->map(fn ($p) => [
            'N° Production' => $p->production_number,
            'Nom' => $p->name,
            'Statut' => $p->status,
            'Progression' => $p->progress . '%',
        ]);
    }

    private function syncOrderStatus(Production $production): void
    {
        if (!$production->order_id) {
            return;
        }

        $map = [
            'pending' => 'pending',
            'in_progress' => 'production',
            'paused' => 'production',
            'completed' => 'delivered',
            'cancelled' => 'cancelled',
        ];

        Order::where('id', $production->order_id)->update([
            'status' => StatusMapper::orderToDb($map[$production->status] ?? 'production'),
        ]);
    }
}
