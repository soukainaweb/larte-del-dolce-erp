<?php

namespace App\Services;

use App\Models\Sample;
use App\Support\NumberGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SampleService
{
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

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Sample
    {
        $data['sample_code'] = $data['sample_code']
            ?? NumberGenerator::next('SMP', Sample::class, 'sample_code');
        $data['created_by'] = auth()->id();

        return Sample::create($data)->load(['product', 'salesperson', 'creator']);
    }

    public function update(Sample $sample, array $data): Sample
    {
        unset($data['sample_code']);
        $sample->update($data);

        return $sample->fresh()->load(['product', 'salesperson', 'creator']);
    }

    public function delete(Sample $sample): void
    {
        $sample->delete();
    }

    public function statistics(): array
    {
        return [
            'total' => Sample::count(),
            'pending' => Sample::where('status', 'pending')->count(),
            'delivered' => Sample::where('status', 'delivered')->count(),
            'returned' => Sample::where('status', 'returned')->count(),
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
