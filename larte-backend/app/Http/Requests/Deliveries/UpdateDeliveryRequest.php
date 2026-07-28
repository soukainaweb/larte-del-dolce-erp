<?php

namespace App\Http\Requests\Deliveries;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'driver_id' => 'nullable|exists:users,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'delivery_date' => 'sometimes|date',
            'address' => 'sometimes|string',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:pending,assigned,in_progress,delivered,failed,cancelled',
        ];
    }
}
