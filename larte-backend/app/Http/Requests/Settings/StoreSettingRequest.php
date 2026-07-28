<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class StoreSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_name' => 'required|string|max:50',
            'key_name' => 'required|string|max:100|unique:settings,key_name',
            'value' => 'required|string',
            'type' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'is_public' => 'nullable|boolean',
        ];
    }
}
