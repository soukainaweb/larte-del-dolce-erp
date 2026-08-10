<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Inventory;
use App\Models\StockMovement;

class Product extends Model
{
    use HasFactory, SoftDeletes;


    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'description',
        'price',
        'cost_price',
        'stock_quantity',
        'image',
        'status',
    ];


    /**
     * Cast attributes
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'stock_quantity' => 'integer',
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */


    /**
     * Product belongs to Category
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }


    /**
     * Product appears in many order items
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }


    /**
     * Product has inventory records
     */
    public function inventory()
    {
    return $this->hasMany(Inventory::class);
    }


    /**
     * Product has stock movements
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }


    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */


    /**
     * Active products
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }


    /**
     * Low stock products
     */
    public function scopeLowStock($query)
    {
        return $query->where('status', 'low_stock');
    }


    /**
     * Out of stock products
     */
    public function scopeOutOfStock($query)
    {
        return $query->where('status', 'out_of_stock');
    }


    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */


    /**
     * Check if product is available
     */
    public function isAvailable(): bool
    {
        return $this->stock_quantity > 0;
    }


    /**
     * Calculate profit
     */
    public function profit(): float
    {
        return $this->price - $this->cost_price;
    }
}