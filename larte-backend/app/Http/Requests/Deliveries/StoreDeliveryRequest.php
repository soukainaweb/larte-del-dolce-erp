<?php

namespace App\Http\Requests\Deliveries;

use Illuminate\Foundation\Http\FormRequest;

class StoreDeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => 'required|exists:orders,id',
            'driver_id' => 'nullable|exists:users,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'delivery_date' => 'required|date',
            'address' => 'required|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:pending,assigned,in_progress,delivered,failed,cancelled',
        ];
    }
}
