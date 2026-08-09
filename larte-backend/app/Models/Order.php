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
        'priority',
        'delivery_date',
        'delivery_time',
        'payment_method',
        'notes',

    ];


    protected function casts(): array
    {

        return [
            'total_amount' => 'decimal:2',
            'delivery_date' => 'date',
        ];

    }



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

    public function transfers()
    {
        return $this->hasMany(OrderTransfer::class);
    }

    public function meetings()
    {
        return $this->hasMany(Meeting::class);
    }

    public function approvals()
    {
        return $this->hasMany(OrderApproval::class);
    }
}