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
        $order->loadMissing(['customer']);
        $orderUrl = $this->orderUrl($order);
        $customerName = $order->customer->name ?? '—';
        $creatorName = $this->displayName($creator);
        $total = number_format((float) $order->total_amount, 2) . ' ر.س';

        foreach ($this->activeUsersByRole('manager') as $user) {
            if ((int) $user->id === (int) $creator->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب جديد',
                'message' => sprintf(
                    "تمت إضافة طلب جديد بواسطة %s.\nالعميل: %s\nرقم الطلب: %s\n%s",
                    $creatorName,
                    $customerName,
                    $order->order_number,
                    $orderUrl,
                ),
            ]);
        }

        foreach ($this->activeUsersWithPermission('productions.view') as $user) {
            if ((int) $user->id === (int) $creator->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب جديد للمصنع',
                'message' => sprintf(
                    "تمت إضافة طلب جديد يحتاج إلى المتابعة والتنفيذ.\nرقم الطلب: %s\nالعميل: %s\n%s",
                    $order->order_number,
                    $customerName,
                    $orderUrl,
                ),
            ]);
        }

        foreach ($this->activeUsersByRole('accountant') as $user) {
            if ((int) $user->id === (int) $creator->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب جديد',
                'message' => sprintf(
                    "تمت إضافة طلب جديد ويحتاج إلى المراجعة المالية.\nرقم الطلب: %s\nالإجمالي: %s\n%s",
                    $order->order_number,
                    $total,
                    $orderUrl,
                ),
            ]);
        }
    }

    public function notifyOrderApproved(Order $order, User $approver): void
    {
        $order->loadMissing(['customer', 'user']);
        $orderUrl = $this->orderUrl($order);
        $approverName = $this->displayName($approver);
        $customerName = $order->customer->name ?? '—';

        if ($order->user_id && (int) $order->user_id !== (int) $approver->id) {
            $salesRep = User::find($order->user_id);
            if ($salesRep) {
                $this->createNotification($salesRep, [
                    'type' => 'order',
                    'title' => 'تمت الموافقة على الطلب',
                    'message' => sprintf(
                        "تمت الموافقة على طلبك بواسطة %s.\nرقم الطلب: %s\nالعميل: %s\n%s",
                        $approverName,
                        $order->order_number,
                        $customerName,
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
                    "تمت الموافقة على طلب جديد وجاهز للمتابعة.\nرقم الطلب: %s\nالعميل: %s\n%s",
                    $order->order_number,
                    $customerName,
                    $orderUrl,
                ),
            ]);
        }

        foreach ($this->activeUsersByRole('accountant') as $user) {
            if ((int) $user->id === (int) $approver->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب معتمد',
                'message' => sprintf(
                    "تمت الموافقة على طلب جديد.\nرقم الطلب: %s\n%s",
                    $order->order_number,
                    $orderUrl,
                ),
            ]);
        }
    }

    public function notifyOrderRejected(Order $order, User $rejector, ?string $reason = null): void
    {
        $order->loadMissing(['customer', 'user']);
        $orderUrl = $this->orderUrl($order);
        $rejectorName = $this->displayName($rejector);
        $customerName = $order->customer->name ?? '—';
        $reasonText = trim((string) $reason) ?: '—';

        if ($order->user_id && (int) $order->user_id !== (int) $rejector->id) {
            $salesRep = User::find($order->user_id);
            if ($salesRep) {
                $this->createNotification($salesRep, [
                    'type' => 'order',
                    'title' => 'تم رفض الطلب',
                    'message' => sprintf(
                        "تم رفض طلبك بواسطة %s.\nرقم الطلب: %s\nالعميل: %s\nالسبب: %s\n%s",
                        $rejectorName,
                        $order->order_number,
                        $customerName,
                        $reasonText,
                        $orderUrl,
                    ),
                ]);
            }
        }

        foreach ($this->activeUsersByRole('manager') as $user) {
            if ((int) $user->id === (int) $rejector->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب مرفوض',
                'message' => sprintf(
                    "تم رفض طلب.\nرقم الطلب: %s\nالسبب: %s\n%s",
                    $order->order_number,
                    $reasonText,
                    $orderUrl,
                ),
            ]);
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
