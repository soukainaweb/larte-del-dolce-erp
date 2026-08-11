<?php

namespace App\Http\Requests\Orders;

use App\Models\User;
use App\Support\UserStatus;
use Illuminate\Foundation\Http\FormRequest;

class TransferOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'to_salesperson_id' => [
                'required',
                'integer',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $isSalesRep = User::query()
                        ->where('id', $value)
                        ->whereHas('role', fn ($q) => $q->where('name', 'sales'))
                        ->whereNotIn('status', UserStatus::blockedForLogin())
                        ->exists();

                    if (! $isSalesRep) {
                        $fail('The selected user must be a sales representative.');
                    }
                },
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
