<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:200',
            'sku' => 'nullable|string|max:50|unique:products,sku',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'image' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,out_of_stock,low_stock',
        ];
    }

    protected function prepareForValidation(): void
    {
        $sku = $this->input('sku');
        if ($sku === '' || $sku === null) {
            $this->merge(['sku' => null]);
        }
    }
}
