<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\Delivery;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;


    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'driver_name',
        'plate_number',
        'type',
        'status',
    ];


    /**
     * Cast attributes
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */


    /**
     * Vehicle has many Deliveries
     */
    public function deliveries()
    {
        return $this->hasMany(Delivery::class);
    }


    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */


    /**
     * Filter vehicles by status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }


    /**
     * Search vehicle
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {

            $q->where('driver_name', 'like', "%{$search}%")
              ->orWhere('plate_number', 'like', "%{$search}%")
              ->orWhere('type', 'like', "%{$search}%");

        });
    }


    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */


    /**
     * Check if vehicle is available
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }


    /**
     * Vehicle information
     */
    public function getInfo(): string
    {
        return "{$this->driver_name} - {$this->plate_number}";
    }
}