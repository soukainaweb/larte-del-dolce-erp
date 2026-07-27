<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\UserSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Get authenticated user profile
     */
    public function show()
    {
        $user = Auth::user()->load('role');

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    /**
     * Update profile information
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'timezone' => 'nullable|string|max:100',
            'date_format' => 'nullable|string|max:50',
            'currency' => 'nullable|string|max:10',
        ]);

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $user->fresh()->load('role'),
        ]);
    }

    /**
     * Update device information
     */
    public function updateDevice(Request $request)
    {
        $user = Auth::user();

        $user->update([
            'last_device' => $request->userAgent(),
            'last_login_ip' => $request->ip(),
            'last_login_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Device information updated',
            'user' => $user->fresh()->load('role'),
        ]);
    }

    /**
     * Get authenticated user activity logs
     */
    public function activity(Request $request)
    {
        $user = Auth::user();

        $query = ActivityLog::with('user')
            ->where('user_id', $user->id);

        if ($request->module) {
            $query->where('module', $request->module);
        }

        if ($request->action) {
            $query->where('action', $request->action);
        }

        if ($request->level) {
            $query->where('level', $request->level);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->search) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('description', 'LIKE', "%{$search}%")
                  ->orWhere('action', 'LIKE', "%{$search}%")
                  ->orWhere('module', 'LIKE', "%{$search}%");
            });
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Export authenticated user activity logs
     */
    public function exportActivity(Request $request)
    {
        $user = Auth::user();

        $query = ActivityLog::with('user')
            ->where('user_id', $user->id);

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        $exportData = $logs->map(function ($log) {
            return [
                'Date' => optional($log->created_at)->format('Y-m-d H:i:s'),
                'Utilisateur' => $log->user?->name ?? 'N/A',
                'Module' => $log->module,
                'Action' => $log->action,
                'Description' => $log->description,
                'Niveau' => $log->level,
                'Statut' => $log->status,
                'IP' => $log->ip_address,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $exportData,
            'meta' => [
                'total' => $exportData->count(),
                'exported_at' => now()->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Get user sessions
     */
    public function sessions()
    {
        $user = Auth::user();

        $sessions = UserSession::where('user_id', $user->id)
            ->orderByDesc('last_active_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'sessions' => $sessions,
        ]);
    }

    /**
     * Revoke one session
     */
    public function revokeSession($id)
    {
        $user = Auth::user();

        $session = UserSession::where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found',
            ], 404);
        }

        $session->delete();

        return response()->json([
            'success' => true,
            'message' => 'Session revoked successfully',
        ]);
    }

    /**
     * Revoke all sessions
     */
    public function revokeAllSessions()
    {
        $user = Auth::user();

        $count = UserSession::where('user_id', $user->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'All sessions revoked successfully',
            'revoked_count' => $count,
        ]);
    }

    /**
     * Update profile preferences
     */
    public function updatePreferences(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'timezone' => 'nullable|string|max:100',
            'date_format' => 'nullable|string|max:50',
            'currency' => 'nullable|string|max:10',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Preferences updated successfully',
            'user' => $user->fresh()->load('role'),
        ]);
    }

    /**
     * Upload profile avatar
     */
    public function uploadAvatar(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update([
            'avatar' => $path,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar uploaded successfully',
            'avatar' => $path,
            'user' => $user->fresh()->load('role'),
        ]);
    }

    /**
     * Remove avatar
     */
    public function removeAvatar()
    {
        $user = Auth::user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);

            $user->update([
                'avatar' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Avatar removed successfully',
            'user' => $user->fresh()->load('role'),
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }

    /**
     * Documents list
     */
    public function documents()
    {
        $user = Auth::user();
        $folder = "documents/user-{$user->id}";

        $files = Storage::disk('public')->exists($folder)
            ? Storage::disk('public')->files($folder)
            : [];

        $documents = collect($files)->map(function ($file) {
            return [
                'id' => basename($file),
                'name' => basename($file),
                'url' => Storage::disk('public')->url($file),
                'size' => Storage::disk('public')->size($file),
                'updated_at' => Storage::disk('public')->lastModified($file),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'documents' => $documents,
        ]);
    }

    /**
     * Upload document
     */
    public function uploadDocument(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'document' => 'required|file|max:10240',
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:100',
        ]);

        $folder = "documents/user-{$user->id}";
        $file = $request->file('document');

        $baseName = $validated['name']
            ? Str::slug($validated['name'])
            : pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

        $extension = $file->getClientOriginalExtension();
        $fileName = $baseName . '-' . time() . '.' . $extension;

        $path = $file->storeAs($folder, $fileName, 'public');

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'document' => [
                'id' => basename($path),
                'name' => $fileName,
                'url' => Storage::disk('public')->url($path),
                'path' => $path,
                'type' => $validated['type'] ?? null,
            ],
        ], 201);
    }

    /**
     * Delete document
     */
    public function deleteDocument($id)
    {
        $user = Auth::user();
        $folder = "documents/user-{$user->id}";

        $files = Storage::disk('public')->exists($folder)
            ? Storage::disk('public')->files($folder)
            : [];

        $file = collect($files)->first(function ($path) use ($id) {
            return basename($path) === $id;
        });

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found',
            ], 404);
        }

        Storage::disk('public')->delete($file);

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully',
        ]);
    }

    /**
     * Download document
     */
    public function downloadDocument($id)
    {
        $user = Auth::user();
        $folder = "documents/user-{$user->id}";

        $files = Storage::disk('public')->exists($folder)
            ? Storage::disk('public')->files($folder)
            : [];

        $file = collect($files)->first(function ($path) use ($id) {
            return basename($path) === $id;
        });

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found',
            ], 404);
        }

        return response()->download(storage_path('app/public/' . $file));
    }

    /**
     * Get permissions for current user
     */
    public function permissions()
    {
        $user = Auth::user()->loadMissing('role');

        $role = $user->role;
        $permissions = [];

        if ($role && method_exists($role, 'permissions')) {
            $permissions = $role->permissions()->pluck('name')->values();
        }

        return response()->json([
            'success' => true,
            'permissions' => $permissions,
        ]);
    }

    /**
     * User statistics
     */
    public function statistics()
    {
        $user = Auth::user();

        $activityCount = ActivityLog::where('user_id', $user->id)->count();
        $sessionCount = UserSession::where('user_id', $user->id)->count();
        $activeSessionCount = UserSession::where('user_id', $user->id)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->count();

        $filled = collect([
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'address' => $user->address,
            'city' => $user->city,
            'country' => $user->country,
            'timezone' => $user->timezone,
            'date_format' => $user->date_format,
            'currency' => $user->currency,
        ])->filter(fn ($value) => !empty($value))->count();

        $profileCompletion = round(($filled / 10) * 100, 2);

        return response()->json([
            'success' => true,
            'statistics' => [
                'activity_count' => $activityCount,
                'session_count' => $sessionCount,
                'active_session_count' => $activeSessionCount,
                'profile_completion' => $profileCompletion,
                'last_login_at' => $user->last_login_at,
                'last_login_ip' => $user->last_login_ip,
            ],
        ]);
    }

    /**
     * Update two factor settings
     */
    public function updateTwoFactor(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'enabled' => 'required|boolean',
            'method' => 'nullable|in:app,sms,email',
        ]);

        $updates = [];

        if (Schema::hasColumn('users', 'two_factor_enabled')) {
            $updates['two_factor_enabled'] = $validated['enabled'];
        }

        if (Schema::hasColumn('users', 'two_factor_method') && !empty($validated['method'])) {
            $updates['two_factor_method'] = $validated['method'];
        }

        if (!empty($updates)) {
            $user->update($updates);
        }

        return response()->json([
            'success' => true,
            'message' => '2FA settings updated successfully',
            'data' => $validated,
        ]);
    }

    /**
     * Notification settings
     */
    public function notificationSettings()
    {
        $user = Auth::user();

        $settings = [];

        foreach ([
            'email_notifications',
            'sms_notifications',
            'push_notifications',
            'marketing_notifications',
        ] as $column) {
            if (Schema::hasColumn('users', $column)) {
                $settings[$column] = (bool) $user->{$column};
            }
        }

        return response()->json([
            'success' => true,
            'settings' => $settings,
        ]);
    }

    /**
     * Update notification settings
     */
    public function updateNotificationSettings(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'email_notifications' => 'nullable|boolean',
            'sms_notifications' => 'nullable|boolean',
            'push_notifications' => 'nullable|boolean',
            'marketing_notifications' => 'nullable|boolean',
        ]);

        $updates = [];

        foreach ($validated as $key => $value) {
            if (Schema::hasColumn('users', $key)) {
                $updates[$key] = $value;
            }
        }

        if (!empty($updates)) {
            $user->update($updates);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification settings updated successfully',
            'settings' => $validated,
        ]);
    }
}