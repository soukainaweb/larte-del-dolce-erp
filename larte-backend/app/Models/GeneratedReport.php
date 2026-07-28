<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GeneratedReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'period',
        'status',
        'parameters',
        'data',
        'created_by',
    ];

    protected $casts = [
        'parameters' => 'array',
        'data' => 'array',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
