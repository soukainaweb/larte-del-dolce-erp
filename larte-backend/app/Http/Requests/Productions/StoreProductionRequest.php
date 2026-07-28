<?php

namespace App\Http\Requests\Productions;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => 'nullable|exists:orders,id',
            'name' => 'required|string|max:200',
            'status' => 'nullable|in:pending,in_progress,paused,completed,cancelled',
            'priority' => 'nullable|in:low,medium,high,critical',
            'progress' => 'nullable|integer|min:0|max:100',
            'estimated_start_date' => 'nullable|date',
            'estimated_end_date' => 'nullable|date|after_or_equal:estimated_start_date',
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ];
    }
}
