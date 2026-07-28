<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'sometimes|in:pending,confirmed,processing,completed,cancelled',
            'payment_status' => 'sometimes|in:unpaid,paid,partial',
            'notes' => 'nullable|string',
        ];
    }
}
