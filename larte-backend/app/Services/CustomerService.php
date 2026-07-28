<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Customer::query();

        if (!empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('name', 'LIKE', "%{$term}%")
                    ->orWhere('email', 'LIKE', "%{$term}%")
                    ->orWhere('phone', 'LIKE', "%{$term}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Customer
    {
        return Customer::create($data);
    }

    public function update(Customer $customer, array $data): Customer
    {
        $customer->update($data);

        return $customer->fresh();
    }

    public function delete(Customer $customer): void
    {
        if ($customer->orders()->count() > 0) {
            throw new \RuntimeException('Impossible de supprimer un client qui a des commandes');
        }

        $customer->delete();
    }

    public function statistics(): array
    {
        return [
            'total' => Customer::count(),
            'active' => Customer::where('status', 'active')->count(),
            'inactive' => Customer::where('status', 'inactive')->count(),
            'blocked' => Customer::where('status', 'blocked')->count(),
        ];
    }

    public function export()
    {
        return Customer::withCount('orders')->get()->map(fn ($c) => [
            'Nom' => $c->name,
            'Email' => $c->email,
            'Téléphone' => $c->phone,
            'Adresse' => $c->address,
            'Commandes' => $c->orders_count,
            'Statut' => $c->status,
            'Date création' => $c->created_at->format('Y-m-d H:i'),
        ]);
    }

    public function types(): array
    {
        return [
            ['value' => 'individual', 'label' => 'Particulier'],
            ['value' => 'business', 'label' => 'Entreprise'],
            ['value' => 'wholesale', 'label' => 'Grossiste'],
        ];
    }

    public function statuses(): array
    {
        return ['active', 'inactive', 'blocked'];
    }
}
