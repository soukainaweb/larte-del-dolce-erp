<?php

namespace App\Http\Requests\Suppliers;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $supplierId = $this->route('supplier')?->id ?? $this->route('supplier');

        return [
            'name' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:suppliers,email,' . $supplierId,
            'phone' => 'sometimes|string|max:20',
            'address' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ];
    }
}
