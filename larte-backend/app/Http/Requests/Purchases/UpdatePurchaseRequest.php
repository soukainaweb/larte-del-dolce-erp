<?php

namespace App\Http\Requests\Purchases;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'material_name' => ['sometimes', 'string', 'max:255'],
            'product_id' => ['nullable', 'exists:products,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
            'unit_price' => ['sometimes', 'numeric', 'min:0'],
            'purchase_date' => ['sometimes', 'date'],
            'status' => ['sometimes', 'in:pending,received,cancelled'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
