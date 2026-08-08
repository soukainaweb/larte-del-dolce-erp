<?php

namespace App\Services;

use App\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Schema;

class SupplierService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Supplier::query();

        if (! empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('name', 'LIKE', "%{$term}%")
                    ->orWhere('email', 'LIKE', "%{$term}%")
                    ->orWhere('phone', 'LIKE', "%{$term}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Supplier
    {
        return Supplier::create($this->normalizePayload($data));
    }

    public function update(Supplier $supplier, array $data): Supplier
    {
        $supplier->update($this->normalizePayload($data));

        return $supplier->fresh();
    }

    public function delete(Supplier $supplier): void
    {
        $supplier->delete();
    }

    public function toggleStatus(Supplier $supplier, string $status): Supplier
    {
        $supplier->update(['status' => $status]);

        return $supplier->fresh();
    }

    public function statistics(): array
    {
        $stats = [
            'total' => Supplier::count(),
            'active' => Supplier::where('status', 'active')->count(),
            'inactive' => Supplier::where('status', 'inactive')->count(),
        ];

        if (Schema::hasColumn('suppliers', 'status')) {
            $stats['blocked'] = Supplier::where('status', 'blocked')->count();
        } else {
            $stats['blocked'] = 0;
        }

        $stats['by_city'] = Schema::hasColumn('suppliers', 'city')
            ? Supplier::selectRaw('city, count(*) as count')->groupBy('city')->get()
            : collect();

        return $stats;
    }

    public function export()
    {
        return Supplier::all()->map(fn ($s) => [
            'Nom' => $s->name,
            'Email' => $s->email,
            'Téléphone' => $s->phone,
            'Adresse' => $s->address,
            'Statut' => $s->status,
        ]);
    }

    public function types(): array
    {
        return [
            ['value' => 'raw_materials', 'label' => 'Matières premières'],
            ['value' => 'packaging', 'label' => 'Emballages'],
            ['value' => 'equipment', 'label' => 'Équipements'],
            ['value' => 'services', 'label' => 'Services'],
        ];
    }

    public function statuses(): array
    {
        return ['active', 'inactive'];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function normalizePayload(array $data): array
    {
        $payload = [
            'name' => $data['name'] ?? $data['company_name'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'address' => $data['address'] ?? null,
            'status' => $data['status'] ?? 'active',
        ];

        return array_filter($payload, fn ($value) => $value !== null);
    }
}
