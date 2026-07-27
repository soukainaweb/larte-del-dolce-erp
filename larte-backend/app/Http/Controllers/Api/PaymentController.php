<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with('invoice');

        if ($request->invoice_id) {
            $query->where('invoice_id', $request->invoice_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->whereDate('payment_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('payment_date', '<=', $request->date_to);
        }

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,transfer,mada,stc_pay,apple_pay',
            'payment_date' => 'required|date',
            'status' => 'nullable|in:pending,completed,failed,refunded',
        ]);

        $payment = Payment::create($request->all());

        // Update invoice status if payment is completed
        if ($payment->status === 'completed') {
            $invoice = Invoice::find($request->invoice_id);
            $totalPaid = Payment::where('invoice_id', $request->invoice_id)
                ->where('status', 'completed')
                ->sum('amount');
            
            if ($totalPaid >= $invoice->total_amount) {
                $invoice->update(['status' => 'paid']);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Paiement enregistré avec succès',
            'data' => $payment->load('invoice')
        ], 201);
    }

    public function show(Payment $payment)
    {
        return response()->json([
            'success' => true,
            'data' => $payment->load('invoice')
        ]);
    }

    public function update(Request $request, Payment $payment)
    {
        $request->validate([
            'amount' => 'sometimes|numeric|min:0.01',
            'payment_method' => 'sometimes|in:cash,card,transfer,mada,stc_pay,apple_pay',
            'payment_date' => 'sometimes|date',
            'status' => 'sometimes|in:pending,completed,failed,refunded',
        ]);

        $payment->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Paiement mis à jour avec succès',
            'data' => $payment->fresh()->load('invoice')
        ]);
    }

    public function destroy(Payment $payment)
    {
        if ($payment->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer un paiement complété'
            ], 403);
        }

        $payment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Paiement supprimé avec succès'
        ]);
    }

    public function statistics()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Payment::count(),
                'total_amount' => Payment::sum('amount'),
                'completed' => Payment::where('status', 'completed')->sum('amount'),
                'pending' => Payment::where('status', 'pending')->sum('amount'),
                'by_method' => Payment::selectRaw('payment_method, sum(amount) as total')
                    ->groupBy('payment_method')
                    ->get(),
            ]
        ]);
    }
}