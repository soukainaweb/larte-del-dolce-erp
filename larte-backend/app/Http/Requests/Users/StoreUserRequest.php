<?php

namespace App\Http\Requests\Users;

use App\Support\UserStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required_without_all:first_name,last_name|string|max:255',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->whereNull('deleted_at'),
            ],
            'password' => 'prohibited',
            'role_id' => 'required|exists:roles,id',
            'phone' => 'nullable|string|max:20',
            'status' => ['nullable', Rule::in(UserStatus::all())],
        ];
    }
}
