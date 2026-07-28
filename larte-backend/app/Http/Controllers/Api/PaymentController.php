<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payments\StorePaymentRequest;
use App\Http\Requests\Payments\UpdatePaymentRequest;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $paymentService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Payment::class);

        return $this->success($this->paymentService->list($request->all()));
    }

    public function store(StorePaymentRequest $request)
    {
        $this->authorize('create', Payment::class);

        return $this->success($this->paymentService->create($request->validated()), 'Paiement enregistré avec succès', 201);
    }

    public function show(Payment $payment)
    {
        $this->authorize('view', $payment);

        return $this->success($payment->load('invoice'));
    }

    public function update(UpdatePaymentRequest $request, Payment $payment)
    {
        $this->authorize('update', $payment);

        return $this->success($this->paymentService->update($payment, $request->validated()), 'Paiement mis à jour avec succès');
    }

    public function destroy(Payment $payment)
    {
        $this->authorize('delete', $payment);

        try {
            $this->paymentService->delete($payment);

            return $this->success(null, 'Paiement supprimé avec succès');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), [], 403);
        }
    }

    public function showByReference(string $reference)
    {
        $this->authorize('viewAny', Payment::class);

        return $this->success($this->paymentService->findByReference($reference));
    }

    public function statistics()
    {
        $this->authorize('viewAny', Payment::class);

        return $this->success($this->paymentService->statistics());
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Payment::class);

        return $this->success($this->paymentService->export());
    }

    public function methods()
    {
        return $this->success($this->paymentService->methods());
    }

    public function statuses()
    {
        return $this->success($this->paymentService->statuses());
    }

    public function receipt(Payment $payment)
    {
        $this->authorize('view', $payment);

        return $this->success(null, 'Reçu envoyé');
    }

    public function print(Payment $payment, Request $request)
    {
        $this->authorize('view', $payment);

        return $this->success($this->paymentService->receiptData($payment));
    }
}
