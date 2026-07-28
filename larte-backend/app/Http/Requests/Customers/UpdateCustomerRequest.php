<?php

namespace App\Http\Requests\Customers;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $customerId = $this->route('customer')?->id ?? $this->route('customer');

        return [
            'name' => 'sometimes|string|max:200',
            'phone' => 'sometimes|string|max:20',
            'email' => 'nullable|email|unique:customers,email,' . $customerId,
            'address' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,blocked',
        ];
    }
}
