<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'from_salesperson_id',
        'to_salesperson_id',
        'transferred_by',
        'notes',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function fromSalesperson()
    {
        return $this->belongsTo(User::class, 'from_salesperson_id');
    }

    public function toSalesperson()
    {
        return $this->belongsTo(User::class, 'to_salesperson_id');
    }

    public function transferredByUser()
    {
        return $this->belongsTo(User::class, 'transferred_by');
    }
}
