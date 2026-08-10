<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Invoices\StoreInvoiceRequest;
use App\Http\Requests\Invoices\UpdateInvoiceRequest;
use App\Models\Invoice;
use App\Services\InvoiceService;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function __construct(private InvoiceService $invoiceService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Invoice::class);

        return $this->success($this->invoiceService->list($request->all()));
    }

    public function store(StoreInvoiceRequest $request)
    {
        $this->authorize('create', Invoice::class);

        return $this->success($this->invoiceService->create($request->validated()), 'Facture créée avec succès', 201);
    }

    public function show(Invoice $invoice)
    {
        $this->authorize('view', $invoice);

        return $this->success($invoice->load(['order.customer']));
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice)
    {
        $this->authorize('update', $invoice);

        return $this->success($this->invoiceService->update($invoice, $request->validated()), 'Facture mise à jour avec succès');
    }

    public function destroy(Invoice $invoice)
    {
        $this->authorize('delete', $invoice);

        try {
            $this->invoiceService->delete($invoice);

            return $this->success(null, 'Facture supprimée avec succès');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), [], 403);
        }
    }

    public function restore(Invoice $invoice)
    {
        $this->authorize('update', $invoice);

        return $this->success($this->invoiceService->restore($invoice), 'Facture restaurée');
    }

    public function send(Invoice $invoice, Request $request)
    {
        $this->authorize('update', $invoice);

        return $this->success($this->invoiceService->send($invoice, $request->all()), 'Facture envoyée');
    }

    public function print(Invoice $invoice, Request $request)
    {
        $this->authorize('view', $invoice);

        return $this->success($this->invoiceService->printData($invoice));
    }

    public function statistics()
    {
        $this->authorize('viewAny', Invoice::class);

        return $this->success($this->invoiceService->statistics());
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Invoice::class);

        return $this->success($this->invoiceService->export());
    }

    public function statuses()
    {
        return $this->success($this->invoiceService->statuses());
    }

    public function paymentStatuses()
    {
        return $this->success($this->invoiceService->paymentStatuses());
    }

    public function paymentMethods()
    {
        return $this->success($this->invoiceService->paymentMethods());
    }
}
