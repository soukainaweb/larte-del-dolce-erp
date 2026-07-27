<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\User;

class Expense extends Model
{
    use HasFactory, SoftDeletes;


    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'user_id',
        'category',
        'description',
        'amount',
        'expense_date',
    ];


    /**
     * Cast attributes
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'expense_date' => 'date',
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
     * Expense belongs to User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }


    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */


    /**
     * Filter by category
     */
    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }


    /**
     * Filter expenses by date
     */
    public function scopeBetweenDates($query, $start, $end)
    {
        return $query->whereBetween('expense_date', [
            $start,
            $end
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */


    /**
     * Format amount
     */
    public function formattedAmount(): string
    {
        return number_format($this->amount, 2);
    }
}