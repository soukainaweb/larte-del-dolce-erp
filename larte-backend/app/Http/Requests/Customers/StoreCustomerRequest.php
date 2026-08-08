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
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:120',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:customers',
            'status' => 'nullable|in:active,inactive,blocked',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم العميل مطلوب',
            'address.required' => 'العنوان مطلوب',
            'city.required' => 'المدينة مطلوبة',
        ];
    }
}
