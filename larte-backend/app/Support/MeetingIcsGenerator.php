<?php

namespace App\Support;

use App\Models\Meeting;
use Carbon\Carbon;

class MeetingIcsGenerator
{
    public static function generate(Meeting $meeting, string $joinUrl, int $durationMinutes = 60): string
    {
        $meeting->loadMissing('creator');

        $start = self::resolveStart($meeting);
        $end = $start->copy()->addMinutes($durationMinutes);
        $organizerName = self::organizerName($meeting);
        $organizerEmail = $meeting->creator?->email ?? config('mail.from.address', 'noreply@example.com');
        $uid = 'meeting-' . $meeting->id . '@' . parse_url((string) config('app.url'), PHP_URL_HOST);

        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Larte del Dolce ERP//Meetings//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:REQUEST',
            'BEGIN:VEVENT',
            'UID:' . self::escape($uid),
            'DTSTAMP:' . now()->utc()->format('Ymd\THis\Z'),
            'DTSTART:' . $start->utc()->format('Ymd\THis\Z'),
            'DTEND:' . $end->utc()->format('Ymd\THis\Z'),
            'SUMMARY:' . self::escape($meeting->title),
            'DESCRIPTION:' . self::escape(trim(($meeting->notes ?? '') . "\n\nJoin: " . $joinUrl)),
            'LOCATION:' . self::escape($joinUrl),
            'ORGANIZER;CN=' . self::escape($organizerName) . ':MAILTO:' . $organizerEmail,
            'URL:' . self::escape($joinUrl),
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR',
        ];

        return implode("\r\n", $lines) . "\r\n";
    }

    public static function googleCalendarUrl(Meeting $meeting, string $joinUrl, int $durationMinutes = 60): string
    {
        $start = self::resolveStart($meeting);
        $end = $start->copy()->addMinutes($durationMinutes);
        $organizerName = self::organizerName($meeting);

        $params = http_build_query([
            'action' => 'TEMPLATE',
            'text' => $meeting->title,
            'dates' => $start->utc()->format('Ymd\THis\Z') . '/' . $end->utc()->format('Ymd\THis\Z'),
            'details' => trim(
                "Organizer: {$organizerName}\n\n" .
                ($meeting->notes ? "Notes:\n{$meeting->notes}\n\n" : '') .
                "Join meeting: {$joinUrl}"
            ),
            'location' => $joinUrl,
        ], '', '&', PHP_QUERY_RFC3986);

        return 'https://calendar.google.com/calendar/render?' . $params;
    }

    protected static function resolveStart(Meeting $meeting): Carbon
    {
        $date = $meeting->meeting_date instanceof Carbon
            ? $meeting->meeting_date->format('Y-m-d')
            : (string) $meeting->meeting_date;

        $time = is_string($meeting->meeting_time)
            ? substr($meeting->meeting_time, 0, 5)
            : '10:00';

        return Carbon::parse("{$date} {$time}", config('app.timezone', 'UTC'));
    }

    protected static function organizerName(Meeting $meeting): string
    {
        if (! $meeting->creator) {
            return config('app.name', 'Larte del Dolce ERP');
        }

        $name = trim(($meeting->creator->first_name ?? '') . ' ' . ($meeting->creator->last_name ?? ''));

        return $name !== '' ? $name : ($meeting->creator->email ?? config('app.name'));
    }

    protected static function escape(string $value): string
    {
        return str_replace(["\r", "\n", ',', ';'], ['', '\n', '\,', '\;'], $value);
    }
}
