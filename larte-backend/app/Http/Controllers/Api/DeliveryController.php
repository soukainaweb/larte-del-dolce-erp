<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function index(Request $request)
    {
        $query = Delivery::with(['order', 'driver', 'vehicle']);

        if ($request->search) {
            $query->where('delivery_number', 'LIKE', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->driver_id) {
            $query->where('driver_id', $request->driver_id);
        }

        if ($request->date_from) {
            $query->whereDate('delivery_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('delivery_date', '<=', $request->date_to);
        }

        $deliveries = $query->orderBy('delivery_date', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $deliveries
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'driver_id' => 'nullable|exists:users,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'delivery_date' => 'required|date',
            'address' => 'required|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:pending,assigned,in_progress,delivered,failed,cancelled',
        ]);

        $deliveryNumber = 'LIV-' . date('Ymd') . '-' . str_pad(Delivery::count() + 1, 4, '0', STR_PAD_LEFT);

        $delivery = Delivery::create([
            'order_id' => $request->order_id,
            'delivery_number' => $deliveryNumber,
            'driver_id' => $request->driver_id,
            'vehicle_id' => $request->vehicle_id,
            'delivery_date' => $request->delivery_date,
            'address' => $request->address,
            'notes' => $request->notes,
            'status' => $request->status ?? 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Livraison créée avec succès',
            'data' => $delivery->load(['order', 'driver', 'vehicle'])
        ], 201);
    }

    public function show(Delivery $delivery)
    {
        return response()->json([
            'success' => true,
            'data' => $delivery->load(['order', 'driver', 'vehicle'])
        ]);
    }

    public function update(Request $request, Delivery $delivery)
    {
        $request->validate([
            'driver_id' => 'nullable|exists:users,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'delivery_date' => 'sometimes|date',
            'address' => 'sometimes|string',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:pending,assigned,in_progress,delivered,failed,cancelled',
        ]);

        $delivery->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Livraison mise à jour avec succès',
            'data' => $delivery->fresh()->load(['order', 'driver', 'vehicle'])
        ]);
    }

    public function destroy(Delivery $delivery)
    {
        if ($delivery->status === 'delivered') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer une livraison terminée'
            ], 403);
        }

        $delivery->delete();

        return response()->json([
            'success' => true,
            'message' => 'Livraison supprimée avec succès'
        ]);
    }

    public function updateStatus(Request $request, Delivery $delivery)
    {
        $request->validate([
            'status' => 'required|in:pending,assigned,in_progress,delivered,failed,cancelled'
        ]);

        $delivery->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Statut de livraison mis à jour',
            'data' => $delivery->fresh()
        ]);
    }

    // Vehicles CRUD
    public function vehiclesIndex(Request $request)
    {
        $vehicles = Vehicle::paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $vehicles
        ]);
    }

    public function vehiclesStore(Request $request)
    {
        $request->validate([
            'plate_number' => 'required|string|unique:vehicles|max:20',
            'driver_name' => 'required|string|max:100',
            'type' => 'required|string|max:50',
            'status' => 'nullable|in:active,inactive,maintenance',
        ]);

        $vehicle = Vehicle::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Véhicule créé avec succès',
            'data' => $vehicle
        ], 201);
    }

    public function vehiclesShow(Vehicle $vehicle)
    {
        return response()->json([
            'success' => true,
            'data' => $vehicle
        ]);
    }

    public function vehiclesUpdate(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'plate_number' => 'sometimes|string|unique:vehicles,plate_number,' . $vehicle->id . '|max:20',
            'driver_name' => 'sometimes|string|max:100',
            'type' => 'sometimes|string|max:50',
            'status' => 'sometimes|in:active,inactive,maintenance',
        ]);

        $vehicle->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Véhicule mis à jour avec succès',
            'data' => $vehicle->fresh()
        ]);
    }

    public function vehiclesDestroy(Vehicle $vehicle)
    {
        if ($vehicle->deliveries()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer un véhicule associé à des livraisons'
            ], 403);
        }

        $vehicle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Véhicule supprimé avec succès'
        ]);
    }
}