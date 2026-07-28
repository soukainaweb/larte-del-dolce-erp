<?php

namespace App\Http\Requests\Customers;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:200',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|unique:customers',
            'address' => 'nullable|string',
        ];
    }
}
