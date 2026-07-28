<?php

namespace App\Http\Requests\Payments;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'sometimes|numeric|min:0.01',
            'payment_method' => 'sometimes|in:cash,card,transfer,mada,stc_pay,apple_pay',
            'payment_date' => 'sometimes|date',
            'status' => 'sometimes|in:pending,completed,failed,refunded',
        ];
    }
}
