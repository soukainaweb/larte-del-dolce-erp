<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        $query = Setting::query();

        if ($request->group) {
            $query->where('group_name', $request->group);
        }

        if ($request->is_public !== null) {
            $query->where('is_public', $request->is_public);
        }

        $settings = $query->get();

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'group_name' => 'required|string|max:50',
            'key_name' => 'required|string|max:100|unique:settings,key_name',
            'value' => 'required|string',
            'type' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'is_public' => 'nullable|boolean',
        ]);

        $setting = Setting::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Paramètre créé avec succès',
            'data' => $setting
        ], 201);
    }

    public function show(Setting $setting)
    {
        return response()->json([
            'success' => true,
            'data' => $setting
        ]);
    }

    public function update(Request $request, Setting $setting)
    {
        $request->validate([
            'value' => 'sometimes|string',
            'description' => 'nullable|string',
            'is_public' => 'nullable|boolean',
        ]);

        $setting->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Paramètre mis à jour avec succès',
            'data' => $setting->fresh()
        ]);
    }

    public function destroy(Setting $setting)
    {
        $setting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Paramètre supprimé avec succès'
        ]);
    }

    public function getByKey($key)
    {
        $setting = Setting::where('key_name', $key)->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Paramètre non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $setting
        ]);
    }

    public function getByGroup($group)
    {
        $settings = Setting::where('group_name', $group)->get();

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    public function updateByKey(Request $request, $key)
    {
        $request->validate([
            'value' => 'required|string',
        ]);

        $setting = Setting::where('key_name', $key)->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Paramètre non trouvé'
            ], 404);
        }

        $setting->update(['value' => $request->value]);

        return response()->json([
            'success' => true,
            'message' => 'Paramètre mis à jour avec succès',
            'data' => $setting->fresh()
        ]);
    }
}