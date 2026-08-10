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

        if ($order->user_id) {
            $salesRep = User::find($order->user_id);
            if ($salesRep) {
                $this->createNotification($salesRep, [
                    'type' => 'order',
                    'title' => 'تم إرسال الطلب',
                    'message' => sprintf(
                        "تم إرسال طلبك #%s وهو بانتظار موافقة المدير.\nالعميل: %s\n%s",
                        $order->order_number,
                        $customerName,
                        $orderUrl,
                    ),
                ]);
            }
        }

        foreach ($this->activeUsersByRole('manager') as $user) {
            if ((int) $user->id === (int) $creator->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب جديد يحتاج موافقتك',
                'message' => sprintf(
                    "طلب جديد يحتاج إلى موافقة المدير.\nرقم الطلب: %s\nالعميل: %s\n%s",
                    $order->order_number,
                    $customerName,
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

        foreach ($this->activeUsersByRole('accountant') as $user) {
            if ((int) $user->id === (int) $approver->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب يحتاج موافقة المحاسب',
                'message' => sprintf(
                    "تمت موافقة المدير %s على الطلب #%s ويحتاج موافقة المحاسب.\n%s",
                    $approverName,
                    $order->order_number,
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

        foreach ($this->activeUsersByRole('responsible') as $user) {
            if ((int) $user->id === (int) $approver->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب يحتاج موافقة المسؤول',
                'message' => sprintf(
                    "تمت موافقة المحاسب %s على الطلب #%s ويحتاج موافقتك.\n%s",
                    $approverName,
                    $order->order_number,
                    $orderUrl,
                ),
            ]);
        }
    }

    public function notifyResponsibleApproved(Order $order, User $approver): void
    {
        $order->loadMissing(['customer', 'user']);
        $orderUrl = $this->orderUrl($order);
        $approverName = $this->displayName($approver);

        if ($order->user_id && (int) $order->user_id !== (int) $approver->id) {
            $salesRep = User::find($order->user_id);
            if ($salesRep) {
                $this->createNotification($salesRep, [
                    'type' => 'order',
                    'title' => 'تمت الموافقة الإدارية على الطلب',
                    'message' => sprintf(
                        "تمت الموافقة الإدارية على طلبك #%s وهو في انتظار المصنع.\n%s",
                        $order->order_number,
                        $orderUrl,
                    ),
                ]);
            }
        }

        foreach ($this->activeUsersByRole('factory') as $user) {
            if ((int) $user->id === (int) $approver->id) {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب جديد للمصنع',
                'message' => sprintf(
                    "تمت الموافقة النهائية على الطلب #%s من %s وهو جاهز للمعالجة.\n%s",
                    $order->order_number,
                    $approverName,
                    $orderUrl,
                ),
            ]);
        }
    }

    /** @deprecated Use notifyResponsibleApproved */
    public function notifyOrderFullyApproved(Order $order, User $approver): void
    {
        $this->notifyResponsibleApproved($order, $approver);
    }

    public function notifyOrderReadyForPickup(Order $order, User $actor): void
    {
        $order->loadMissing(['customer', 'assignedRep']);
        $orderUrl = $this->orderUrl($order);

        if ($order->assigned_rep_id && $order->assignedRep) {
            $this->notifyRepresentativeReadyForPickup($order, $order->assignedRep);
            return;
        }

        foreach ($this->activeUsersByRole('sales') as $user) {
            if ($user->availability_status !== 'available') {
                continue;
            }
            $this->createNotification($user, [
                'type' => 'order',
                'title' => 'طلب جاهز للاستلام',
                'message' => sprintf(
                    "الطلب #%s جاهز للاستلام من المصنع.\n%s",
                    $order->order_number,
                    $orderUrl,
                ),
            ]);
        }
    }

    public function notifyRepresentativeReadyForPickup(Order $order, User $representative): void
    {
        $order->loadMissing(['customer']);
        $orderUrl = $this->orderUrl($order);
        $customerName = $order->customer->name ?? '—';

        $this->createNotification($representative, [
            'type' => 'order',
            'title' => 'طلبك جاهز للاستلام',
            'message' => sprintf(
                "الطلب #%s جاهز للاستلام من المصنع.\nالعميل: %s\n%s",
                $order->order_number,
                $customerName,
                $orderUrl,
            ),
        ]);
    }

    public function notifyOrderRejectedAtStage(Order $order, User $rejector, string $role, string $reason): void
    {
        $order->loadMissing(['customer', 'user']);
        $orderUrl = $this->orderUrl($order);
        $rejectorName = $this->displayName($rejector);
        $roleLabel = match ($role) {
            'manager' => 'المدير',
            'accountant' => 'المحاسب',
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
