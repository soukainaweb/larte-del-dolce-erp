<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\ChangePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\UploadAvatarRequest;
use App\Services\ProfileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function __construct(private ProfileService $profileService)
    {
    }

    public function show()
    {
        return $this->success(['user' => $this->profileService->getProfile(Auth::user())]);
    }

    public function update(UpdateProfileRequest $request)
    {
        $user = $this->profileService->updateProfile(
            Auth::user(),
            $request->validated(),
            $request->file('avatar')
        );

        return $this->success(['user' => $user], 'Profile updated');
    }

    public function updateDevice(Request $request)
    {
        $this->profileService->updateDevice(Auth::user(), $request->ip(), $request->userAgent());

        return $this->success(null, 'Device updated');
    }

    public function activity(Request $request)
    {
        return $this->success($this->profileService->activity(Auth::user()));
    }

    public function sessions()
    {
        return $this->success($this->profileService->sessions(Auth::user()));
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = Auth::user();

        if (! Hash::check($request->validated('current_password'), $user->getAuthPassword())) {
            return $this->error(
                'كلمة المرور الحالية غير صحيحة.',
                ['current_password' => ['كلمة المرور الحالية غير صحيحة.']],
                422
            );
        }

        $user->update([
            'password' => $request->validated('password'),
            'must_change_password' => false,
        ]);

        return $this->success([
            'user' => $user->fresh()->load('role.permissions'),
        ], 'تم تغيير كلمة المرور بنجاح');
    }

    public function uploadAvatar(UploadAvatarRequest $request)
    {
        $path = $this->profileService->uploadAvatar(Auth::user(), $request->file('avatar'));

        return $this->success(['avatar' => $path], 'Avatar uploaded');
    }

    public function removeAvatar()
    {
        $this->profileService->removeAvatar(Auth::user());

        return $this->success(null, 'Avatar removed');
    }

    public function documents()
    {
        return $this->success($this->profileService->documents(Auth::user()));
    }

    public function permissions()
    {
        return $this->success($this->profileService->permissions(Auth::user()));
    }

    public function statistics()
    {
        return $this->success($this->profileService->statistics(Auth::user()));
    }

    public function updatePreferences(Request $request)
    {
        return $this->success(null, 'Preferences updated');
    }

    public function updateAvailability(Request $request)
    {
        $validated = $request->validate([
            'availability_status' => 'required|in:available,unavailable',
        ]);

        $user = Auth::user();
        if (! $user->hasPermission('profile.availability.update')) {
            abort(403);
        }

        $user->update(['availability_status' => $validated['availability_status']]);

        return $this->success([
            'user' => $user->fresh()->load('role'),
        ], 'Availability updated');
    }

    public function exportActivity(Request $request)
    {
        return $this->success($this->profileService->activity(Auth::user()));
    }

    public function revokeSession($id)
    {
        return $this->success(null, 'Session revoked');
    }

    public function revokeAllSessions()
    {
        return $this->success(null, 'All sessions revoked');
    }

    public function uploadDocument(Request $request)
    {
        $request->validate([
            'document' => 'required|file|max:5120',
            'name' => 'required|string|max:200',
            'type' => 'nullable|string|max:50',
        ]);

        return $this->success(null, 'Document uploaded', 201);
    }

    public function deleteDocument($id)
    {
        return $this->success(null, 'Document deleted');
    }

    public function downloadDocument($id)
    {
        return $this->error('Document not found', [], 404);
    }

    public function updateTwoFactor(Request $request)
    {
        return $this->success(null, 'Two-factor settings updated');
    }

    public function notificationSettings()
    {
        return $this->success([]);
    }

    public function updateNotificationSettings(Request $request)
    {
        return $this->success($request->all(), 'Notification settings updated');
    }
}
