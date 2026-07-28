<?php

namespace App\Http\Requests\Productions;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:200',
            'status' => 'sometimes|in:pending,in_progress,paused,completed,cancelled',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'progress' => 'sometimes|integer|min:0|max:100',
            'estimated_start_date' => 'nullable|date',
            'estimated_end_date' => 'nullable|date|after_or_equal:estimated_start_date',
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ];
    }
}
