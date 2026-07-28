<?php

namespace App\Http\Requests\Invoices;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'total_amount' => 'sometimes|numeric|min:0',
            'invoice_date' => 'sometimes|date',
            'status' => 'sometimes|in:draft,sent,paid,overdue,cancelled',
        ];
    }
}
