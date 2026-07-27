<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        $query = Warehouse::with(['manager']);

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $warehouses = $query->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $warehouses
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'location' => 'nullable|string|max:200',
            'manager_id' => 'nullable|exists:users,id',
            'status' => 'nullable|in:active,inactive,maintenance',
        ]);

        $warehouse = Warehouse::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Entrepôt créé avec succès',
            'data' => $warehouse->load('manager')
        ], 201);
    }

    public function show(Warehouse $warehouse)
    {
        return response()->json([
            'success' => true,
            'data' => $warehouse->load(['manager'])
        ]);
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $request->validate([
            'name' => 'sometimes|string|max:100',
            'location' => 'nullable|string|max:200',
            'manager_id' => 'nullable|exists:users,id',
            'status' => 'nullable|in:active,inactive,maintenance',
        ]);

        $warehouse->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Entrepôt mis à jour avec succès',
            'data' => $warehouse->fresh()->load('manager')
        ]);
    }

    public function destroy(Warehouse $warehouse)
    {
        $warehouse->delete();

        return response()->json([
            'success' => true,
            'message' => 'Entrepôt supprimé avec succès'
        ]);
    }

    public function statistics()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Warehouse::count(),
                'active' => Warehouse::where('status', 'active')->count(),
                'inactive' => Warehouse::where('status', 'inactive')->count(),
                'maintenance' => Warehouse::where('status', 'maintenance')->count(),
            ]
        ]);
    }
}