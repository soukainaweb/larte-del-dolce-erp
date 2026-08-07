<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Meetings\StoreMeetingRequest;
use App\Http\Requests\Meetings\UpdateMeetingRequest;
use App\Models\Meeting;
use App\Services\MeetingService;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    public function __construct(private MeetingService $meetingService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Meeting::class);

        return $this->success($this->meetingService->list($request->all()));
    }

    public function store(StoreMeetingRequest $request)
    {
        $this->authorize('create', Meeting::class);

        return $this->success(
            $this->meetingService->create($request->validated()),
            'Meeting created successfully',
            201
        );
    }

    public function show(Meeting $meeting)
    {
        $this->authorize('view', $meeting);

        return $this->success($meeting->load(['customer', 'order', 'creator', 'invitees.user']));
    }

    public function update(UpdateMeetingRequest $request, Meeting $meeting)
    {
        $this->authorize('update', $meeting);

        return $this->success(
            $this->meetingService->update($meeting, $request->validated()),
            'Meeting updated successfully'
        );
    }

    public function destroy(Meeting $meeting)
    {
        $this->authorize('delete', $meeting);

        $this->meetingService->delete($meeting);

        return $this->success(null, 'Meeting deleted successfully');
    }

    public function statistics()
    {
        $this->authorize('viewAny', Meeting::class);

        return $this->success($this->meetingService->statistics());
    }

    public function statuses()
    {
        return $this->success($this->meetingService->statuses());
    }

    public function start(Meeting $meeting)
    {
        $this->authorize('start', $meeting);

        return $this->success(
            $this->meetingService->start($meeting),
            'Meeting started successfully'
        );
    }

    public function end(Meeting $meeting)
    {
        $this->authorize('end', $meeting);

        return $this->success(
            $this->meetingService->end($meeting),
            'Meeting ended successfully'
        );
    }

    public function session(Meeting $meeting)
    {
        $this->authorize('join', $meeting);

        return $this->success(
            $this->meetingService->session($meeting, request()->user())
        );
    }
}
