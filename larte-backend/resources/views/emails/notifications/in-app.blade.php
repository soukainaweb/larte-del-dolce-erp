<x-mail::message>
@if($isRtl)
<div dir="rtl" style="text-align: right; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
@endif

@if($recipientName)
@if($isRtl)
مرحباً **{{ $recipientName }}**،
@else
Hello **{{ $recipientName }}**,
@endif

@endif

# {{ $notificationTitle }}

<div style="white-space: pre-wrap; line-height: 1.6;">{{ $notificationMessage }}</div>

@if($actionUrl)
<x-mail::button :url="$actionUrl">
@if($isRtl)
عرض التفاصيل
@else
View Details
@endif
</x-mail::button>
@endif

@if($isRtl)
<br>
{{ config('app.name') }}
</div>
@else
Thanks,<br>
{{ config('app.name') }}
@endif
</x-mail::message>
