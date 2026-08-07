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

@if($meeting->notes)
**Notes:**

{{ $meeting->notes }}
@endif

<x-mail::button :url="$joinUrl">
Join Meeting
</x-mail::button>

This link opens the meeting inside the ERP video room.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
