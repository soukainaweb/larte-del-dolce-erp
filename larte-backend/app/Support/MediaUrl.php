<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class MediaUrl
{
    public static function publicStorageUrl(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, 'data:')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function transformOrderMedia(array $data): array
    {
        if (isset($data['pickup_photo'])) {
            $data['pickup_photo'] = self::publicStorageUrl($data['pickup_photo']);
        }

        if (isset($data['delivery_photo'])) {
            $data['delivery_photo'] = self::publicStorageUrl($data['delivery_photo']);
        }

        foreach (['items', 'products'] as $collectionKey) {
            if (! isset($data[$collectionKey]) || ! is_array($data[$collectionKey])) {
                continue;
            }

            foreach ($data[$collectionKey] as $index => $item) {
                if (! is_array($item)) {
                    continue;
                }

                if (isset($item['product']) && is_array($item['product']) && array_key_exists('image', $item['product'])) {
                    $item['product']['image'] = self::publicStorageUrl($item['product']['image']);
                }

                if (array_key_exists('image', $item)) {
                    $item['image'] = self::publicStorageUrl($item['image']);
                }

                $data[$collectionKey][$index] = $item;
            }
        }

        return $data;
    }
}
