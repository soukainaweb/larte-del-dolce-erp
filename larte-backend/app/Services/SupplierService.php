<?php

namespace App\Services;

use App\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SupplierService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Supplier::query();

        if (!empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('company_name', 'LIKE', "%{$term}%")
                    ->orWhere('contact_name', 'LIKE', "%{$term}%")
                    ->orWhere('email', 'LIKE', "%{$term}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['city'])) {
            $query->where('city', $filters['city']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Supplier
    {
        return Supplier::create($data);
    }

    public function update(Supplier $supplier, array $data): Supplier
    {
        $supplier->update($data);

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
        return [
            'total' => Supplier::count(),
            'active' => Supplier::where('status', 'active')->count(),
            'inactive' => Supplier::where('status', 'inactive')->count(),
            'blocked' => Supplier::where('status', 'blocked')->count(),
            'by_city' => Supplier::selectRaw('city, count(*) as count')->groupBy('city')->get(),
        ];
    }

    public function export()
    {
        return Supplier::all()->map(fn ($s) => [
            'Entreprise' => $s->company_name,
            'Contact' => $s->contact_name,
            'Email' => $s->email,
            'Téléphone' => $s->phone,
            'Ville' => $s->city,
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
        return ['active', 'inactive', 'blocked'];
    }
}
