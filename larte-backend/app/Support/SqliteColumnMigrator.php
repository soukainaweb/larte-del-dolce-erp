<?php

namespace App\Support;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

final class SqliteColumnMigrator
{
    public static function replaceStringColumn(
        string $table,
        string $column,
        int $length,
        string $default,
        ?string $indexName = null,
    ): void {
        if (DB::getDriverName() !== 'sqlite') {
            return;
        }

        if (! self::needsWidening($table, $column, $length)) {
            return;
        }

        if ($indexName !== null && self::hasIndex($table, $indexName)) {
            Schema::table($table, function (Blueprint $blueprint) use ($indexName) {
                $blueprint->dropIndex($indexName);
            });
        }

        $temp = $column . '_new';

        Schema::table($table, function (Blueprint $blueprint) use ($temp, $length, $default) {
            $blueprint->string($temp, $length)->default($default);
        });

        DB::table($table)->update([$temp => DB::raw($column)]);

        Schema::table($table, function (Blueprint $blueprint) use ($column) {
            $blueprint->dropColumn($column);
        });

        Schema::table($table, function (Blueprint $blueprint) use ($temp, $column) {
            $blueprint->renameColumn($temp, $column);
        });

        if ($indexName !== null) {
            Schema::table($table, function (Blueprint $blueprint) use ($column) {
                $blueprint->index($column);
            });
        }
    }

    public static function needsWidening(string $table, string $column, int $length): bool
    {
        if (in_array($column . '_new', Schema::getColumnListing($table), true)) {
            return true;
        }

        if (! Schema::hasColumn($table, $column)) {
            return false;
        }

        $row = DB::selectOne(
            'SELECT sql FROM sqlite_master WHERE type = ? AND name = ?',
            ['table', $table]
        );

        $sql = (string) ($row->sql ?? '');
        $pattern = '/"' . preg_quote($column, '/') . '"\s+varchar\s*\(\s*' . $length . '\s*\)/i';

        return ! preg_match($pattern, $sql);
    }

    private static function hasIndex(string $table, string $indexName): bool
    {
        $indexes = DB::select('PRAGMA index_list("' . str_replace('"', '""', $table) . '")');

        foreach ($indexes as $index) {
            if (($index->name ?? null) === $indexName) {
                return true;
            }
        }

        return false;
    }
}
