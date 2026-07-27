<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%")
                ->orWhere('email', 'LIKE', "%{$request->search}%")
                ->orWhere('phone', 'LIKE', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $customers = $query->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:200',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|unique:customers',
            'address' => 'nullable|string',
        ]);

        $customer = Customer::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Client créé avec succès',
            'data' => $customer
        ], 201);
    }

    public function show(Customer $customer)
    {
        return response()->json([
            'success' => true,
            'data' => $customer->load(['orders' => function($query) {
                $query->latest()->take(10);
            }])
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $request->validate([
            'name' => 'sometimes|string|max:200',
            'phone' => 'sometimes|string|max:20',
            'email' => 'nullable|email|unique:customers,email,' . $customer->id,
            'address' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,blocked',
        ]);

        $customer->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Client mis à jour avec succès',
            'data' => $customer->fresh()
        ]);
    }

    public function destroy(Customer $customer)
    {
        if ($customer->orders()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer un client qui a des commandes'
            ], 403);
        }

        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Client supprimé avec succès'
        ]);
    }

    public function statistics()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Customer::count(),
                'active' => Customer::where('status', 'active')->count(),
                'inactive' => Customer::where('status', 'inactive')->count(),
                'blocked' => Customer::where('status', 'blocked')->count(),
            ]
        ]);
    }

    public function export(Request $request)
    {
        $customers = Customer::withCount('orders')->get();
        
        $data = $customers->map(function($customer) {
            return [
                'Nom' => $customer->name,
                'Email' => $customer->email,
                'Téléphone' => $customer->phone,
                'Adresse' => $customer->address,
                'Commandes' => $customer->orders_count,
                'Statut' => $customer->status,
                'Date création' => $customer->created_at->format('Y-m-d H:i'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}