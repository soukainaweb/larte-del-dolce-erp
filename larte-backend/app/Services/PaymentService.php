<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Invoice;
use App\Support\StatusMapper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PaymentService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Payment::with('invoice');

        if (!empty($filters['invoice_id'])) {
            $query->where('invoice_id', $filters['invoice_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', StatusMapper::paymentRecordToDb($filters['status']));
        }

        if (!empty($filters['method'])) {
            $query->where('method', $filters['method']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('payment_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('payment_date', '<=', $filters['date_to']);
        }

        if (!empty($filters['customer_id'])) {
            $query->whereHas('invoice.order', fn ($q) => $q->where('customer_id', $filters['customer_id']));
        }

        $paginator = $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 10);
        $paginator->getCollection()->transform(fn ($p) => $this->transform($p));

        return $paginator;
    }

    public function create(array $data): Payment
    {
        $data['status'] = StatusMapper::paymentRecordToDb($data['status'] ?? 'pending');
        $data['method'] = $data['method'] ?? $data['payment_method'] ?? 'cash';

        $payment = Payment::create([
            'invoice_id' => $data['invoice_id'],
            'amount' => $data['amount'],
            'method' => $data['method'],
            'payment_date' => $data['payment_date'],
            'status' => $data['status'],
            'reference' => $data['reference'] ?? null,
        ]);

        $this->syncInvoiceStatus($payment);

        $payment->load('invoice');
        app(EntityCreatedNotificationService::class)->notify('payment', $payment);

        return $this->transform($payment);
    }

    public function update(Payment $payment, array $data): Payment
    {
        if (isset($data['status'])) {
            $data['status'] = StatusMapper::paymentRecordToDb($data['status']);
        }
        if (isset($data['payment_method'])) {
            $data['method'] = $data['payment_method'];
            unset($data['payment_method']);
        }

        $payment->update($data);
        $this->syncInvoiceStatus($payment->fresh());

        return $this->transform($payment->fresh()->load('invoice'));
    }

    public function delete(Payment $payment): void
    {
        if (in_array($payment->status, ['completed', 'partial'], true)) {
            throw new \RuntimeException('Impossible de supprimer un paiement complété');
        }

        $payment->delete();
    }

    public function findByReference(string $reference): Payment
    {
        return $this->transform(
            Payment::with('invoice')->where('reference', $reference)->firstOrFail()
        );
    }

    public function statistics(): array
    {
        return [
            'total' => Payment::count(),
            'total_amount' => Payment::sum('amount'),
            'completed' => Payment::where('status', 'completed')->sum('amount'),
            'pending' => Payment::where('status', 'pending')->sum('amount'),
            'by_method' => Payment::selectRaw('method, sum(amount) as total')->groupBy('method')->get(),
        ];
    }

    public function export()
    {
        return Payment::with('invoice')->get()->map(fn ($p) => [
            'Référence' => $p->reference,
            'Facture' => $p->invoice->invoice_number ?? '—',
            'Montant' => $p->amount,
            'Méthode' => $p->method,
            'Statut' => StatusMapper::paymentRecordFromDb($p->status),
            'Date' => $p->payment_date,
        ]);
    }

    public function methods(): array
    {
        return [
            ['value' => 'cash', 'label' => 'Espèces'],
            ['value' => 'card', 'label' => 'Carte'],
            ['value' => 'bank_transfer', 'label' => 'Virement'],
            ['value' => 'mada', 'label' => 'Mada'],
            ['value' => 'stc_pay', 'label' => 'STC Pay'],
            ['value' => 'apple_pay', 'label' => 'Apple Pay'],
            ['value' => 'transfer', 'label' => 'Transfert'],
            ['value' => 'online', 'label' => 'En ligne'],
        ];
    }

    public function statuses(): array
    {
        return StatusMapper::paymentStatuses();
    }

    public function receiptData(Payment $payment): array
    {
        return [
            'payment' => $this->transform($payment->load('invoice')),
            'printed_at' => now()->toIso8601String(),
        ];
    }

    private function syncInvoiceStatus(Payment $payment): void
    {
        if (!in_array($payment->status, ['completed', 'partial'], true)) {
            return;
        }

        $invoice = Invoice::find($payment->invoice_id);
        if (!$invoice) {
            return;
        }

        $totalPaid = Payment::where('invoice_id', $invoice->id)
            ->whereIn('status', ['completed', 'partial'])
            ->sum('amount');

        if ($totalPaid >= $invoice->total_amount) {
            $invoice->update(['status' => 'paid']);
        } elseif ($totalPaid > 0) {
            $invoice->update(['status' => 'sent']);
        }
    }

    private function transform(Payment $payment): Payment
    {
        $payment->status = StatusMapper::paymentRecordFromDb($payment->status);

        return $payment;
    }
}
