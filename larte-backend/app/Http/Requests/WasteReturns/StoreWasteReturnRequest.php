<?php

namespace App\Http\Requests\WasteReturns;

use Illuminate\Foundation\Http\FormRequest;

class StoreWasteReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:waste,return'],
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:255'],
            'recorded_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'inventory_adjusted' => ['nullable', 'boolean'],
        ];
    }
}
