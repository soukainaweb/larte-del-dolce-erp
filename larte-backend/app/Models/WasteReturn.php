<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class WasteReturn extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reference',
        'type',
        'product_id',
        'quantity',
        'reason',
        'recorded_date',
        'notes',
        'inventory_adjusted',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'recorded_date' => 'date',
            'inventory_adjusted' => 'boolean',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
