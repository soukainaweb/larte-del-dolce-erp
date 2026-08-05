<?php

namespace App\Http\Requests\Samples;

use Illuminate\Foundation\Http\FormRequest;

class StoreSampleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'sample_code' => ['nullable', 'string', 'max:50', 'unique:samples,sample_code'],
            'product_id' => ['nullable', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'status' => ['nullable', 'in:pending,delivered,returned,cancelled'],
            'salesperson_id' => ['nullable', 'exists:users,id'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
