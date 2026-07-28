<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'production_id',
        'product_id',
        'quantity',
        'completed_quantity',
        'progress_percentage',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'completed_quantity' => 'integer',
            'progress_percentage' => 'integer',
        ];
    }

    public function production()
    {
        return $this->belongsTo(Production::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
