<?php

namespace App\Http\Requests\Categories;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'name_ar' => 'nullable|string|max:100',
            'code' => 'required|string|max:50|unique:categories,code',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive,archived',
            'visible' => 'nullable|boolean',
            'featured' => 'nullable|boolean',
            'display_order' => 'nullable|integer',
            'parent_id' => 'nullable|exists:categories,id',
            'show_on_pos' => 'nullable|boolean',
            'available_online' => 'nullable|boolean',
        ];
    }
}
