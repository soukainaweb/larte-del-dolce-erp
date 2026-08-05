<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;

final class NumberGenerator
{
    /**
     * Generate the next sequential code (e.g. PRD001, ORD002).
     */
    public static function next(string $prefix, string $modelClass, string $column, int $padLength = 3): string
    {
        /** @var class-string<Model> $modelClass */
        $records = $modelClass::withTrashed()
            ->where($column, 'like', $prefix . '%')
            ->pluck($column);

        $max = 0;
        $pattern = '/^' . preg_quote($prefix, '/') . '(\d+)$/';

        foreach ($records as $value) {
            if (preg_match($pattern, (string) $value, $matches)) {
                $max = max($max, (int) $matches[1]);
            }
        }

        return $prefix . str_pad((string) ($max + 1), $padLength, '0', STR_PAD_LEFT);
    }
}
