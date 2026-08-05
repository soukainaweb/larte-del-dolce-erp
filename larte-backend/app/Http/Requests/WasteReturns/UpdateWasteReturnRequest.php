<?php

namespace App\Http\Requests\WasteReturns;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWasteReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'in:waste,return'],
            'product_id' => ['sometimes', 'exists:products,id'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
            'reason' => ['sometimes', 'string', 'max:255'],
            'recorded_date' => ['sometimes', 'date'],
            'notes' => ['nullable', 'string'],
            'inventory_adjusted' => ['nullable', 'boolean'],
        ];
    }
}
