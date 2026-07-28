<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notifications\StoreNotificationRequest;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $notificationService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Notification::class);

        return $this->success($this->notificationService->list($request->all()));
    }

    public function store(StoreNotificationRequest $request)
    {
        $this->authorize('create', Notification::class);

        return $this->success($this->notificationService->create($request->validated()), 'Notification créée avec succès', 201);
    }

    public function show(Notification $notification)
    {
        $this->authorize('view', $notification);

        return $this->success($notification);
    }

    public function markAsRead(Notification $notification)
    {
        $this->authorize('update', $notification);

        return $this->success($this->notificationService->markAsRead($notification), 'Notification marquée comme lue');
    }

    public function destroy(Notification $notification)
    {
        $this->authorize('delete', $notification);

        $this->notificationService->delete($notification);

        return $this->success(null, 'Notification supprimée avec succès');
    }

    public function getUnreadCount()
    {
        return $this->success(['count' => $this->notificationService->unreadCount(auth()->id())]);
    }

    public function markBatchRead(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);

        $this->notificationService->markBatchRead($request->ids, auth()->id());

        return $this->success(null, 'Notifications marquées comme lues');
    }

    public function markAllRead()
    {
        $this->notificationService->markAllRead(auth()->id());

        return $this->success(null, 'Toutes les notifications marquées comme lues');
    }

    public function deleteBatch(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);

        $this->notificationService->deleteBatch($request->ids, auth()->id());

        return $this->success(null, 'Notifications supprimées');
    }

    public function deleteRead()
    {
        $this->notificationService->deleteRead(auth()->id());

        return $this->success(null, 'Notifications lues supprimées');
    }

    public function statistics()
    {
        return $this->success($this->notificationService->statistics(auth()->id()));
    }

    public function export(Request $request)
    {
        return $this->success($this->notificationService->export(auth()->id()));
    }

    public function modules()
    {
        return $this->success($this->notificationService->modules());
    }

    public function priorities()
    {
        return $this->success($this->notificationService->priorities());
    }
}
