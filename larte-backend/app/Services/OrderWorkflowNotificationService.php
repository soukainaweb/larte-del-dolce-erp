<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Order;
use App\Models\Sample;
use App\Models\User;
use App\Support\UserStatus;
use Illuminate\Support\Collection;

class OrderWorkflowNotificationService
{
    public function notifyOrderCreated(Order $order, User $creator): void
    {
        $order->loadMissing(['customer', 'user']);
        $orderUrl = $this->orderUrl($order);
        $customerName = $order->customer->name ?? '—';
        $creatorName = $this->displayName($creator);

        if ($order->user_id) {
            $salesRep = User::find($order->user_id);
            if ($salesRep) {
                $this->createNotification($salesRep, [
                    'type' => 'order',
                    'title' => 'تم إرسال الطلب',
                    'message' => sprintf(
                        "تم إرسال طلبك #%s وهو بانتظار موافقة المحاسب.\nالعميل: %s\n%s",
                        $order->order_number,
                        $customerName,
                        $orderUrl,
                    ),
                ]);
            }
        }

        foreach ($this->activeUsersByRole('accountant') as $user) {
            if ((int) $user->id === (int) $creator->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب جديد يحتاج موافقتك',
                'message' => sprintf(
                    "طلب جديد يحتاج إلى موافقة المحاسب.\nرقم الطلب: %s\nالعميل: %s\n%s",
                    $order->order_number,
                    $customerName,
                    $orderUrl,
                ),
            ]);
        }
    }

    public function notifyAccountantApproved(Order $order, User $approver): void
    {
        $order->loadMissing(['customer']);
        $orderUrl = $this->orderUrl($order);
        $approverName = $this->displayName($approver);

        foreach ($this->activeUsersByRole('manager') as $user) {
            if ((int) $user->id === (int) $approver->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب يحتاج موافقة المدير',
                'message' => sprintf(
                    "تمت موافقة المحاسب %s على الطلب #%s ويحتاج موافقتك.\n%s",
                    $approverName,
                    $order->order_number,
                    $orderUrl,
                ),
            ]);
        }
    }

    public function notifyManagerApproved(Order $order, User $approver): void
    {
        $order->loadMissing(['customer']);
        $orderUrl = $this->orderUrl($order);
        $approverName = $this->displayName($approver);

        foreach ($this->activeUsersByRole('responsible') as $user) {
            if ((int) $user->id === (int) $approver->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب يحتاج موافقة المسؤول',
                'message' => sprintf(
                    "تمت موافقة المدير %s على الطلب #%s ويحتاج موافقتك.\n%s",
                    $approverName,
                    $order->order_number,
                    $orderUrl,
                ),
            ]);
        }
    }

    public function notifyOrderFullyApproved(Order $order, User $approver): void
    {
        $order->loadMissing(['customer', 'user']);
        $orderUrl = $this->orderUrl($order);
        $approverName = $this->displayName($approver);

        if ($order->user_id && (int) $order->user_id !== (int) $approver->id) {
            $salesRep = User::find($order->user_id);
            if ($salesRep) {
                $this->createNotification($salesRep, [
                    'type' => 'order',
                    'title' => 'تمت الموافقة على الطلب',
                    'message' => sprintf(
                        "تمت الموافقة على طلبك #%s وهو جاهز للتنفيذ.\n%s",
                        $order->order_number,
                        $orderUrl,
                    ),
                ]);
            }
        }

        foreach ($this->activeUsersWithPermission('productions.view') as $user) {
            if ((int) $user->id === (int) $approver->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب معتمد للمصنع',
                'message' => sprintf(
                    "تمت الموافقة النهائية على الطلب #%s وهو جاهز للمتابعة.\n%s",
                    $order->order_number,
                    $orderUrl,
                ),
            ]);
        }
    }

    public function notifyOrderRejectedAtStage(Order $order, User $rejector, string $role, string $reason): void
    {
        $order->loadMissing(['customer', 'user']);
        $orderUrl = $this->orderUrl($order);
        $rejectorName = $this->displayName($rejector);
        $roleLabel = match ($role) {
            'accountant' => 'المحاسب',
            'manager' => 'المدير',
            'responsible' => 'المسؤول',
            default => $role,
        };

        if ($order->user_id && (int) $order->user_id !== (int) $rejector->id) {
            $salesRep = User::find($order->user_id);
            if ($salesRep) {
                $this->createNotification($salesRep, [
                    'type' => 'order',
                    'title' => 'تم رفض الطلب',
                    'message' => sprintf(
                        "طلبك #%s تم رفضه من %s %s.\n\nالسبب:\n%s\n\n%s",
                        $order->order_number,
                        $roleLabel,
                        $rejectorName,
                        $reason,
                        $orderUrl,
                    ),
                ]);
            }
        }
    }

    public function notifySampleCreated(Sample $sample, User $creator): void
    {
        $sample->loadMissing(['product', 'salesperson']);
        $sampleUrl = $this->sampleUrl($sample);
        $creatorName = $this->displayName($creator);
        $productName = $sample->product->name ?? '—';

        foreach ($this->activeUsersByRole('manager') as $user) {
            if ((int) $user->id === (int) $creator->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'sample',
                'title' => 'عينة جديدة',
                'message' => sprintf(
                    "تمت إضافة عينة جديدة بواسطة %s.\nالاسم: %s\nالمنتج: %s\nالرمز: %s\n%s",
                    $creatorName,
                    $sample->name,
                    $productName,
                    $sample->sample_code,
                    $sampleUrl,
                ),
            ]);
        }
    }

    /**
     * @return Collection<int, User>
     */
    protected function activeUsersByRole(string $roleSlug): Collection
    {
        return User::query()
            ->with('role:id,name')
            ->whereHas('role', fn ($q) => $q->where('name', $roleSlug))
            ->whereNotIn('status', UserStatus::blockedForLogin())
            ->get();
    }

    /**
     * @return Collection<int, User>
     */
    protected function activeUsersWithPermission(string $permission): Collection
    {
        return User::query()
            ->whereNotIn('status', UserStatus::blockedForLogin())
            ->whereHas('role.permissions', fn ($q) => $q->where('name', $permission))
            ->get();
    }

    protected function createNotification(User $user, array $payload): void
    {
        try {
            Notification::create([
                'user_id' => $user->id,
                'title' => $payload['title'],
                'message' => $payload['message'],
                'type' => $payload['type'],
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    protected function displayName(User $user): string
    {
        return trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')) ?: ($user->email ?? 'مستخدم');
    }

    protected function frontendBaseUrl(): string
    {
        return rtrim((string) config('app.frontend_url', ''), '/');
    }

    protected function orderUrl(Order $order): string
    {
        return $this->frontendBaseUrl() . '/dashboard/orders/' . $order->id;
    }

    protected function sampleUrl(Sample $sample): string
    {
        return $this->frontendBaseUrl() . '/dashboard/samples';
    }
}
