<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;


    protected $fillable = [

        'customer_id',
        'user_id',
        'order_number',
        'status',
        'total_amount',
        'payment_status',
        'notes',

    ];


    protected $casts = [

        'total_amount' => 'decimal:2',

    ];



    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }



    public function user()
    {
        return $this->belongsTo(User::class);
    }



    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function delivery()
    {
        return $this->hasOne(Delivery::class);
    }
}