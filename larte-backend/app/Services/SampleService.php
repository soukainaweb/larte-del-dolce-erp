<?php

namespace App\Services;

use App\Models\Sample;
use App\Models\User;
use App\Support\NumberGenerator;
use App\Support\SalesScope;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SampleService
{
    public function __construct(private OrderWorkflowNotificationService $notifications)
    {
    }
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Sample::with(['product', 'salesperson', 'creator']);

        if (! empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('name', 'LIKE', "%{$term}%")
                    ->orWhere('sample_code', 'LIKE', "%{$term}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['salesperson_id'])) {
            $query->where('salesperson_id', $filters['salesperson_id']);
        }

        SalesScope::applySampleScope($query);

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Sample
    {
        $data['sample_code'] = $data['sample_code']
            ?? NumberGenerator::next('SMP', Sample::class, 'sample_code');
        $data['created_by'] = auth()->id();

        if (SalesScope::isSalesRep()) {
            $data['salesperson_id'] = auth()->id();
        }

        $sample = Sample::create($data)->load(['product', 'salesperson', 'creator']);
        $creator = User::find(auth()->id());

        if ($creator) {
            $this->notifications->notifySampleCreated($sample, $creator);
        }

        return $sample;
    }

    public function update(Sample $sample, array $data): Sample
    {
        unset($data['sample_code']);

        if (SalesScope::isSalesRep()) {
            unset($data['salesperson_id']);
        }

        $sample->update($data);

        return $sample->fresh()->load(['product', 'salesperson', 'creator']);
    }

    public function delete(Sample $sample): void
    {
        $sample->delete();
    }

    public function statistics(): array
    {
        $query = SalesScope::applySampleScope(Sample::query());

        return [
            'total' => (clone $query)->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'delivered' => (clone $query)->where('status', 'delivered')->count(),
            'returned' => (clone $query)->where('status', 'returned')->count(),
        ];
    }

    public function statuses(): array
    {
        return [
            ['value' => 'pending', 'label' => 'Pending'],
            ['value' => 'delivered', 'label' => 'Delivered'],
            ['value' => 'returned', 'label' => 'Returned'],
            ['value' => 'cancelled', 'label' => 'Cancelled'],
        ];
    }
}
