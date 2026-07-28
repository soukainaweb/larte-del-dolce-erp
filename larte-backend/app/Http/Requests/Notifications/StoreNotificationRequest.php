<?php

namespace App\Http\Requests\Notifications;

use Illuminate\Foundation\Http\FormRequest;

class StoreNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:200',
            'message' => 'required|string',
            'type' => 'required|string|max:50',
            'user_id' => 'nullable|exists:users,id',
        ];
    }
}
