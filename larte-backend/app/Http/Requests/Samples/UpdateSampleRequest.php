<?php

namespace App\Http\Requests\Samples;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSampleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'product_id' => ['nullable', 'exists:products,id'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:pending,delivered,returned,cancelled'],
            'salesperson_id' => ['nullable', 'exists:users,id'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
