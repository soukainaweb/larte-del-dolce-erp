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
            'company_name' => 'sometimes|string|max:100',
            'contact_name' => 'nullable|string|max:100',
            'email' => 'sometimes|email|unique:suppliers,email,' . $supplierId,
            'phone' => 'sometimes|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'vat_number' => 'nullable|string|max:50',
            'tax_id' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:200',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,blocked',
        ];
    }
}
