<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($request->search) {
            $query->where('company_name', 'LIKE', "%{$request->search}%")
                ->orWhere('contact_name', 'LIKE', "%{$request->search}%")
                ->orWhere('email', 'LIKE', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->city) {
            $query->where('city', $request->city);
        }

        $suppliers = $query->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $suppliers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:100',
            'contact_name' => 'nullable|string|max:100',
            'email' => 'required|email|unique:suppliers',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'vat_number' => 'nullable|string|max:50',
            'tax_id' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:200',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,blocked',
        ]);

        $supplier = Supplier::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Fournisseur créé avec succès',
            'data' => $supplier
        ], 201);
    }

    public function show(Supplier $supplier)
    {
        return response()->json([
            'success' => true,
            'data' => $supplier
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $request->validate([
            'company_name' => 'sometimes|string|max:100',
            'contact_name' => 'nullable|string|max:100',
            'email' => 'sometimes|email|unique:suppliers,email,' . $supplier->id,
            'phone' => 'sometimes|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'vat_number' => 'nullable|string|max:50',
            'tax_id' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:200',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,blocked',
        ]);

        $supplier->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Fournisseur mis à jour avec succès',
            'data' => $supplier->fresh()
        ]);
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fournisseur supprimé avec succès'
        ]);
    }

    public function toggleStatus(Request $request, Supplier $supplier)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,blocked'
        ]);

        $supplier->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'data' => $supplier->fresh()
        ]);
    }

    public function statistics()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Supplier::count(),
                'active' => Supplier::where('status', 'active')->count(),
                'inactive' => Supplier::where('status', 'inactive')->count(),
                'blocked' => Supplier::where('status', 'blocked')->count(),
                'by_city' => Supplier::selectRaw('city, count(*) as count')
                    ->groupBy('city')
                    ->get(),
            ]
        ]);
    }
}