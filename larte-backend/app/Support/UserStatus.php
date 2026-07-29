<?php

namespace App\Support;

/**
 * Canonical user status values.
 *
 * Presence: online, offline, away (login/session lifecycle)
 * Account:   active, inactive, suspended, locked (admin-managed access)
 */
final class UserStatus
{
    public const ONLINE = 'online';
    public const OFFLINE = 'offline';
    public const AWAY = 'away';

    public const ACTIVE = 'active';
    public const INACTIVE = 'inactive';
    public const SUSPENDED = 'suspended';
    public const LOCKED = 'locked';

    /** @return list<string> */
    public static function all(): array
    {
        return [
            self::ONLINE,
            self::OFFLINE,
            self::AWAY,
            self::ACTIVE,
            self::INACTIVE,
            self::SUSPENDED,
            self::LOCKED,
        ];
    }

    /** @return list<string> */
    public static function presence(): array
    {
        return [self::ONLINE, self::OFFLINE, self::AWAY];
    }

    /** @return list<string> */
    public static function account(): array
    {
        return [self::ACTIVE, self::INACTIVE, self::SUSPENDED, self::LOCKED];
    }

    public static function isValid(?string $status): bool
    {
        return $status !== null && in_array($status, self::all(), true);
    }

    public static function isPresence(?string $status): bool
    {
        return $status !== null && in_array($status, self::presence(), true);
    }

    /**
     * Normalize legacy / localized labels to a DB-safe slug.
     */
    public static function normalize(?string $status, string $default = self::OFFLINE): string
    {
        if ($status === null || $status === '') {
            return $default;
        }

        $key = strtolower(trim($status));

        $map = [
            'en ligne' => self::ONLINE,
            'online' => self::ONLINE,
            'hors ligne' => self::OFFLINE,
            'offline' => self::OFFLINE,
            'absent' => self::AWAY,
            'away' => self::AWAY,
            'actif' => self::ACTIVE,
            'active' => self::ACTIVE,
            'inactif' => self::INACTIVE,
            'inactive' => self::INACTIVE,
            'suspendu' => self::SUSPENDED,
            'suspended' => self::SUSPENDED,
            'verrouille' => self::LOCKED,
            'verrouillé' => self::LOCKED,
            'locked' => self::LOCKED,
            'نشط' => self::ACTIVE,
            'غير نشط' => self::INACTIVE,
        ];

        if (isset($map[$key])) {
            return $map[$key];
        }

        return self::isValid($key) ? $key : $default;
    }

    /** Account statuses that must not authenticate. */
    public static function blockedForLogin(): array
    {
        return [self::INACTIVE, self::SUSPENDED, self::LOCKED];
    }

    public static function canAuthenticate(?string $status): bool
    {
        $normalized = self::normalize($status, self::ACTIVE);

        return !in_array($normalized, self::blockedForLogin(), true);
    }
}
