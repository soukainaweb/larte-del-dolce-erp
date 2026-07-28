<?php

namespace App\Http\Requests\Permissions;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $permissionId = $this->route('permission')?->id ?? $this->route('permission');

        return [
            'name' => 'sometimes|string|max:100|unique:permissions,name,' . $permissionId,
            'display_name' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'module' => 'sometimes|string|max:50',
            'status' => 'nullable|in:active,inactive',
        ];
    }
}
