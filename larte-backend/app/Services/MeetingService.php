<?php

namespace App\Services;

use App\Models\Meeting;
use App\Support\SalesScope;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MeetingService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Meeting::with(['customer', 'order', 'creator']);

        if (! empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('title', 'LIKE', "%{$term}%")
                    ->orWhere('notes', 'LIKE', "%{$term}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('meeting_date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('meeting_date', '<=', $filters['date_to']);
        }

        SalesScope::applyMeetingScope($query);

        return $query->orderByDesc('meeting_date')->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Meeting
    {
        $data['created_by'] = auth()->id();

        return Meeting::create($data)->load(['customer', 'order', 'creator']);
    }

    public function update(Meeting $meeting, array $data): Meeting
    {
        $meeting->update($data);

        return $meeting->fresh()->load(['customer', 'order', 'creator']);
    }

    public function delete(Meeting $meeting): void
    {
        $meeting->delete();
    }

    public function statistics(): array
    {
        $query = SalesScope::applyMeetingScope(Meeting::query());

        return [
            'total' => (clone $query)->count(),
            'scheduled' => (clone $query)->where('status', 'scheduled')->count(),
            'completed' => (clone $query)->where('status', 'completed')->count(),
            'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
        ];
    }

    public function statuses(): array
    {
        return [
            ['value' => 'scheduled', 'label' => 'Scheduled'],
            ['value' => 'completed', 'label' => 'Completed'],
            ['value' => 'cancelled', 'label' => 'Cancelled'],
        ];
    }
}
