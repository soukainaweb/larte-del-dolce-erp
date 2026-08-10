<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Order;
use App\Support\SalesScope;
use App\Support\StatusMapper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InvoiceService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Invoice::with(['order.customer']);

        if (!empty($filters['search'])) {
            $query->where('invoice_number', 'LIKE', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['customer_id'])) {
            $query->whereHas('order', fn ($q) => $q->where('customer_id', $filters['customer_id']));
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('invoice_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('invoice_date', '<=', $filters['date_to']);
        }

        SalesScope::applyInvoiceScope($query);

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Invoice
    {
        $order = Order::findOrFail($data['order_id']);

        $invoiceNumber = 'FAC-' . date('Ymd') . '-' . str_pad(Invoice::count() + 1, 4, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'invoice_number' => $invoiceNumber,
            'order_id' => $order->id,
            'total_amount' => $data['total_amount'],
            'invoice_date' => $data['invoice_date'],
            'status' => $data['status'] ?? 'draft',
        ])->load(['order.customer']);

        ActivityLogger::log(
            module: 'invoices',
            action: 'created',
            description: sprintf('Facture %s créée', $invoiceNumber),
        );

        app(EntityCreatedNotificationService::class)->notify('invoice', $invoice);

        return $invoice;
    }

    public function update(Invoice $invoice, array $data): Invoice
    {
        $invoice->update($data);

        ActivityLogger::log(
            module: 'invoices',
            action: 'updated',
            description: sprintf('Facture %s mise à jour', $invoice->invoice_number),
        );

        return $invoice->fresh()->load(['order.customer']);
    }

    public function delete(Invoice $invoice): void
    {
        if ($invoice->status === 'paid') {
            throw new \RuntimeException('Cannot delete a paid invoice.');
        }

        $invoiceNumber = $invoice->invoice_number;
        $invoice->delete();

        ActivityLogger::log(
            module: 'invoices',
            action: 'deleted',
            description: sprintf('Facture %s supprimée', $invoiceNumber),
        );
    }

    public function restore(Invoice $invoice): Invoice
    {
        $invoice->restore();

        return $invoice->fresh()->load(['order.customer']);
    }

    public function send(Invoice $invoice, array $data = []): Invoice
    {
        $invoice->update(['status' => 'sent']);

        ActivityLogger::log(
            module: 'invoices',
            action: 'sent',
            description: sprintf('Facture %s envoyée', $invoice->invoice_number),
        );

        return $invoice->fresh()->load(['order.customer']);
    }

    public function printData(Invoice $invoice): array
    {
        return [
            'invoice' => $invoice->load(['order.customer']),
            'printed_at' => now()->toIso8601String(),
        ];
    }

    public function statuses(): array
    {
        return ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    }

    public function paymentStatuses(): array
    {
        return StatusMapper::paymentStatuses();
    }

    public function paymentMethods(): array
    {
        return [
            ['value' => 'cash', 'label' => 'Espèces'],
            ['value' => 'card', 'label' => 'Carte'],
            ['value' => 'transfer', 'label' => 'Virement'],
            ['value' => 'online', 'label' => 'En ligne'],
        ];
    }

    public function statistics(): array
    {
        return [
            'total' => Invoice::count(),
            'total_amount' => Invoice::sum('total_amount'),
            'draft' => Invoice::where('status', 'draft')->count(),
            'sent' => Invoice::where('status', 'sent')->count(),
            'paid' => Invoice::where('status', 'paid')->count(),
            'overdue' => Invoice::where('status', 'overdue')->count(),
            'cancelled' => Invoice::where('status', 'cancelled')->count(),
        ];
    }

    public function export()
    {
        return Invoice::with(['order.customer'])->get()->map(fn ($invoice) => [
            'N° Facture' => $invoice->invoice_number,
            'Client' => $invoice->order?->customer?->name ?? '—',
            'Total' => $invoice->total_amount,
            'Statut' => $invoice->status,
            'Date' => $invoice->invoice_date,
            'Date création' => $invoice->created_at->format('Y-m-d H:i'),
        ]);
    }
}
