<?php

namespace App\Http\Requests\Permissions;

use Illuminate\Foundation\Http\FormRequest;

class StorePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100|unique:permissions,name',
            'display_name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'module' => 'required|string|max:50',
            'status' => 'nullable|in:active,inactive',
        ];
    }
}
