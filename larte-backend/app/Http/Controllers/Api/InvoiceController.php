<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with(['order', 'customer']);

        if ($request->search) {
            $query->where('invoice_number', 'LIKE', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->date_from) {
            $query->whereDate('invoice_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('invoice_date', '<=', $request->date_to);
        }

        $invoices = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $invoices
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'invoice_date' => 'required|date',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'nullable|in:draft,sent,paid,overdue,cancelled',
        ]);

        $order = Order::find($request->order_id);

        $invoiceNumber = 'FAC-' . date('Ymd') . '-' . str_pad(Invoice::count() + 1, 4, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'invoice_number' => $invoiceNumber,
            'order_id' => $request->order_id,
            'customer_id' => $order->customer_id,
            'total_amount' => $request->total_amount,
            'invoice_date' => $request->invoice_date,
            'status' => $request->status ?? 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Facture créée avec succès',
            'data' => $invoice->load(['order', 'customer'])
        ], 201);
    }

    public function show(Invoice $invoice)
    {
        return response()->json([
            'success' => true,
            'data' => $invoice->load(['order', 'customer'])
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $request->validate([
            'total_amount' => 'sometimes|numeric|min:0',
            'invoice_date' => 'sometimes|date',
            'status' => 'sometimes|in:draft,sent,paid,overdue,cancelled',
        ]);

        $invoice->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Facture mise à jour avec succès',
            'data' => $invoice->fresh()->load(['order', 'customer'])
        ]);
    }

    public function destroy(Invoice $invoice)
    {
        if ($invoice->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer une facture payée'
            ], 403);
        }

        $invoice->delete();

        return response()->json([
            'success' => true,
            'message' => 'Facture supprimée avec succès'
        ]);
    }

    public function statistics()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Invoice::count(),
                'total_amount' => Invoice::sum('total_amount'),
                'draft' => Invoice::where('status', 'draft')->count(),
                'sent' => Invoice::where('status', 'sent')->count(),
                'paid' => Invoice::where('status', 'paid')->count(),
                'overdue' => Invoice::where('status', 'overdue')->count(),
                'cancelled' => Invoice::where('status', 'cancelled')->count(),
            ]
        ]);
    }

    public function export(Request $request)
    {
        $invoices = Invoice::with(['order', 'customer'])->get();
        
        $data = $invoices->map(function($invoice) {
            return [
                'N° Facture' => $invoice->invoice_number,
                'Client' => $invoice->customer->name ?? '—',
                'Total' => $invoice->total_amount,
                'Statut' => $invoice->status,
                'Date' => $invoice->invoice_date,
                'Date création' => $invoice->created_at->format('Y-m-d H:i'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}