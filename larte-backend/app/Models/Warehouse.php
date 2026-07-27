<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use HasFactory, SoftDeletes;


    protected $fillable = [
        'name',
        'location',
        'manager_id',
        'status',
    ];


    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }


    public function inventory()
    {
        return $this->hasMany(Inventory::class, 'warehouse_id');
    }


    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}