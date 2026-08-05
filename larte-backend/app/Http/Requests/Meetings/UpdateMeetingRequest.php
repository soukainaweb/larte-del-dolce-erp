<?php

namespace App\Http\Requests\Meetings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMeetingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'meeting_date' => ['sometimes', 'date'],
            'meeting_time' => ['sometimes', 'date_format:H:i'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'order_id' => ['nullable', 'exists:orders,id'],
            'notes' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:scheduled,completed,cancelled'],
        ];
    }
}
