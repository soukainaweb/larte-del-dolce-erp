<?php

namespace App\Services;

use App\Models\Delivery;
use App\Models\Vehicle;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DeliveryService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Delivery::with(['order', 'driver', 'vehicle']);

        if (!empty($filters['search'])) {
            $query->where('delivery_number', 'LIKE', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['driver_id'])) {
            $query->where('driver_id', $filters['driver_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('delivery_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('delivery_date', '<=', $filters['date_to']);
        }

        return $query->orderByDesc('delivery_date')->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Delivery
    {
        $deliveryNumber = 'LIV-' . date('Ymd') . '-' . str_pad(Delivery::count() + 1, 4, '0', STR_PAD_LEFT);

        return Delivery::create([
            'order_id' => $data['order_id'],
            'delivery_number' => $deliveryNumber,
            'driver_id' => $data['driver_id'] ?? null,
            'vehicle_id' => $data['vehicle_id'] ?? null,
            'delivery_date' => $data['delivery_date'],
            'address' => $data['address'],
            'notes' => $data['notes'] ?? null,
            'status' => $data['status'] ?? 'pending',
        ])->load(['order', 'driver', 'vehicle']);
    }

    public function update(Delivery $delivery, array $data): Delivery
    {
        $delivery->update($data);

        return $delivery->fresh()->load(['order', 'driver', 'vehicle']);
    }

    public function delete(Delivery $delivery): void
    {
        if ($delivery->status === 'delivered') {
            throw new \RuntimeException('Impossible de supprimer une livraison terminée');
        }

        $delivery->delete();
    }

    public function updateStatus(Delivery $delivery, string $status): Delivery
    {
        $delivery->update(['status' => $status]);

        return $delivery->fresh();
    }

    public function export()
    {
        return Delivery::with(['order', 'driver'])->get()->map(fn ($d) => [
            'N° Livraison' => $d->delivery_number,
            'Commande' => $d->order->order_number ?? '—',
            'Adresse' => $d->address,
            'Statut' => $d->status,
            'Date' => $d->delivery_date,
        ]);
    }

    public function listVehicles(array $filters = []): LengthAwarePaginator
    {
        return Vehicle::paginate($filters['per_page'] ?? 10);
    }

    public function createVehicle(array $data): Vehicle
    {
        return Vehicle::create($data);
    }

    public function updateVehicle(Vehicle $vehicle, array $data): Vehicle
    {
        $vehicle->update($data);

        return $vehicle->fresh();
    }

    public function deleteVehicle(Vehicle $vehicle): void
    {
        if ($vehicle->deliveries()->count() > 0) {
            throw new \RuntimeException('Impossible de supprimer un véhicule associé à des livraisons');
        }

        $vehicle->delete();
    }
}
