<x-mail::message>
# Meeting Invitation

@if($recipientName)
Hello **{{ $recipientName }}**,
@else
Hello,
@endif

You have been invited to a video meeting on **L'arte del dolce ERP**.

**Title:** {{ $meeting->title }}

**Date:** {{ $meeting->meeting_date?->format('l, F j, Y') ?? $meeting->meeting_date }}

**Time:** {{ is_string($meeting->meeting_time) ? substr($meeting->meeting_time, 0, 5) : $meeting->meeting_time }}

**Organizer:** {{ $organizerName ?: config('app.name') }}

@if($meeting->notes)
**Notes:**

{{ $meeting->notes }}
@endif

<x-mail::button :url="$joinUrl">
Join Meeting
</x-mail::button>

@if($googleCalendarUrl)
<x-mail::button :url="$googleCalendarUrl" color="success">
Add to Google Calendar
</x-mail::button>
@endif

An ICS calendar file is attached so you can add this meeting to Outlook, Apple Calendar, or other apps.

You can also [view meeting details]({{ $detailsUrl }}) in the ERP.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
