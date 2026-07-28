<?php

namespace App\Http\Requests\Payments;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required_without:method|in:cash,card,transfer,bank_transfer,mada,stc_pay,apple_pay,online',
            'method' => 'required_without:payment_method|in:cash,card,transfer,bank_transfer,mada,stc_pay,apple_pay,online',
            'payment_date' => 'required|date',
            'status' => 'nullable|in:pending,partial,paid,refunded,completed,failed',
            'reference' => 'nullable|string|max:100',
        ];
    }
}
