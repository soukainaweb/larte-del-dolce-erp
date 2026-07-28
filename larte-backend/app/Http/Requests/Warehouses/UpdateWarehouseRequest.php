<?php

namespace App\Http\Requests\Warehouses;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:100',
            'location' => 'nullable|string|max:200',
            'manager_id' => 'nullable|exists:users,id',
            'status' => 'nullable|in:active,inactive,maintenance',
        ];
    }
}
