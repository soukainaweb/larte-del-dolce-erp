<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreSettingRequest;
use App\Http\Requests\Settings\UpdateSettingRequest;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Setting::class);

        $query = Setting::query();

        if ($request->group) {
            $query->where('group_name', $request->group);
        }

        if ($request->is_public !== null) {
            $query->where('is_public', $request->is_public);
        }

        return $this->success($query->get());
    }

    public function store(StoreSettingRequest $request)
    {
        $this->authorize('create', Setting::class);

        return $this->success(Setting::create($request->validated()), 'Paramètre créé avec succès', 201);
    }

    public function show(Setting $setting)
    {
        $this->authorize('view', $setting);

        return $this->success($setting);
    }

    public function update(UpdateSettingRequest $request, Setting $setting)
    {
        $this->authorize('update', $setting);

        $setting->update($request->validated());

        return $this->success($setting->fresh(), 'Paramètre mis à jour avec succès');
    }

    public function destroy(Setting $setting)
    {
        $this->authorize('delete', $setting);

        $setting->delete();

        return $this->success(null, 'Paramètre supprimé avec succès');
    }

    public function getByKey($key)
    {
        $this->authorize('viewAny', Setting::class);

        $setting = Setting::where('key_name', $key)->firstOrFail();

        return $this->success($setting);
    }

    public function getByGroup($group)
    {
        $this->authorize('viewAny', Setting::class);

        return $this->success(Setting::where('group_name', $group)->get());
    }

    public function updateByKey(Request $request, $key)
    {
        $this->authorize('update', Setting::class);

        $request->validate(['value' => 'required|string']);

        $setting = Setting::where('key_name', $key)->firstOrFail();
        $setting->update(['value' => $request->value]);

        return $this->success($setting->fresh(), 'Paramètre mis à jour avec succès');
    }
}
