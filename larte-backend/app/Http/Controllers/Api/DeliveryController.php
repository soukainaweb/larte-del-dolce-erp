<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Deliveries\StoreDeliveryRequest;
use App\Http\Requests\Deliveries\UpdateDeliveryRequest;
use App\Models\Delivery;
use App\Models\Vehicle;
use App\Services\DeliveryService;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function __construct(private DeliveryService $deliveryService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Delivery::class);

        return $this->success($this->deliveryService->list($request->all()));
    }

    public function store(StoreDeliveryRequest $request)
    {
        $this->authorize('create', Delivery::class);

        return $this->success($this->deliveryService->create($request->validated()), 'Livraison créée avec succès', 201);
    }

    public function show(Delivery $delivery)
    {
        $this->authorize('view', $delivery);

        return $this->success($delivery->load(['order', 'driver', 'vehicle']));
    }

    public function update(UpdateDeliveryRequest $request, Delivery $delivery)
    {
        $this->authorize('update', $delivery);

        return $this->success($this->deliveryService->update($delivery, $request->validated()), 'Livraison mise à jour avec succès');
    }

    public function destroy(Delivery $delivery)
    {
        $this->authorize('delete', $delivery);

        try {
            $this->deliveryService->delete($delivery);

            return $this->success(null, 'Livraison supprimée avec succès');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), [], 403);
        }
    }

    public function updateStatus(Request $request, Delivery $delivery)
    {
        $this->authorize('update', $delivery);

        $request->validate(['status' => 'required|in:pending,assigned,in_progress,delivered,failed,cancelled']);

        return $this->success($this->deliveryService->updateStatus($delivery, $request->status), 'Statut de livraison mis à jour');
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Delivery::class);

        return $this->success($this->deliveryService->export());
    }

    public function vehiclesIndex(Request $request)
    {
        $this->authorize('viewAny', Delivery::class);

        return $this->success($this->deliveryService->listVehicles($request->all()));
    }

    public function vehiclesStore(Request $request)
    {
        $this->authorize('create', Delivery::class);

        $data = $request->validate([
            'plate_number' => 'required|string|unique:vehicles|max:20',
            'driver_name' => 'required|string|max:100',
            'type' => 'required|string|max:50',
            'status' => 'nullable|in:active,inactive,maintenance',
        ]);

        return $this->success($this->deliveryService->createVehicle($data), 'Véhicule créé avec succès', 201);
    }

    public function vehiclesShow(Vehicle $vehicle)
    {
        $this->authorize('viewAny', Delivery::class);

        return $this->success($vehicle);
    }

    public function vehiclesUpdate(Request $request, Vehicle $vehicle)
    {
        $this->authorize('update', Delivery::class);

        $data = $request->validate([
            'plate_number' => 'sometimes|string|unique:vehicles,plate_number,' . $vehicle->id . '|max:20',
            'driver_name' => 'sometimes|string|max:100',
            'type' => 'sometimes|string|max:50',
            'status' => 'sometimes|in:active,inactive,maintenance',
        ]);

        return $this->success($this->deliveryService->updateVehicle($vehicle, $data), 'Véhicule mis à jour avec succès');
    }

    public function vehiclesDestroy(Vehicle $vehicle)
    {
        $this->authorize('delete', Delivery::class);

        try {
            $this->deliveryService->deleteVehicle($vehicle);

            return $this->success(null, 'Véhicule supprimé avec succès');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), [], 403);
        }
    }
}
