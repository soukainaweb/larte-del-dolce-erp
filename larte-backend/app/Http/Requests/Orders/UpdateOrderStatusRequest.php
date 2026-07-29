<?php

namespace App\Http\Requests\Orders;

use App\Support\OrderWorkflow;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $allowed = array_merge(
            OrderWorkflow::frontendStatuses(),
            OrderWorkflow::statuses(),
        );

        return [
            'status' => ['required', Rule::in(array_unique($allowed))],
            'comment' => 'nullable|string|max:1000',
        ];
    }
}
