<?php

namespace App\Services;

use App\Models\Customer;
use App\Support\SalesScope;
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
                    ->orWhere('phone', 'LIKE', "%{$term}%")
                    ->orWhere('city', 'LIKE', "%{$term}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        SalesScope::applyCustomerScope($query);

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Customer
    {
        if (SalesScope::isSalesRep()) {
            $data['user_id'] = auth()->id();
        }

        $data['status'] = $data['status'] ?? 'active';

        $customer = Customer::create($data);

        ActivityLogger::logModelEvent($customer, 'created', sprintf('Client %s créé', $customer->name));

        return $customer;
    }

    public function update(Customer $customer, array $data): Customer
    {
        $customer->update($data);

        ActivityLogger::logModelEvent($customer, 'updated', sprintf('Client %s mis à jour', $customer->name));

        return $customer->fresh();
    }

    public function delete(Customer $customer): void
    {
        if ($customer->orders()->count() > 0) {
            throw new \RuntimeException('Impossible de supprimer un client qui a des commandes');
        }

        $name = $customer->name;
        $customer->delete();

        ActivityLogger::log(
            module: 'customers',
            action: 'deleted',
            description: sprintf('Client %s supprimé', $name),
        );
    }

    public function statistics(): array
    {
        $query = SalesScope::applyCustomerScope(Customer::query());

        return [
            'total' => (clone $query)->count(),
            'active' => (clone $query)->where('status', 'active')->count(),
            'inactive' => (clone $query)->where('status', 'inactive')->count(),
            'blocked' => (clone $query)->where('status', 'blocked')->count(),
        ];
    }

    public function export()
    {
        $query = SalesScope::applyCustomerScope(Customer::withCount('orders'));

        return $query->get()->map(fn ($c) => [
            'Nom' => $c->name,
            'Email' => $c->email,
            'Téléphone' => $c->phone,
            'Adresse' => $c->address,
            'Ville' => $c->city,
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
