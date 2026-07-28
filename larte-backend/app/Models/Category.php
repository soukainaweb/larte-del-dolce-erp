<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'name_ar',
        'slug',
        'code',
        'description',
        'image',
        'icon',
        'color',
        'status',
        'visible',
        'featured',
        'display_order',
        'parent_id',
        'show_on_pos',
        'available_online',
        'product_count',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'visible' => 'boolean',
            'featured' => 'boolean',
            'show_on_pos' => 'boolean',
            'available_online' => 'boolean',
            'display_order' => 'integer',
            'product_count' => 'integer',
        ];
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('name_ar', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%");
        });
    }
}
