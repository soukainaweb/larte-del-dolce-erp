<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Samples\StoreSampleRequest;
use App\Http\Requests\Samples\UpdateSampleRequest;
use App\Models\Sample;
use App\Services\SampleService;
use Illuminate\Http\Request;

class SampleController extends Controller
{
    public function __construct(private SampleService $sampleService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Sample::class);

        return $this->success($this->sampleService->list($request->all()));
    }

    public function store(StoreSampleRequest $request)
    {
        $this->authorize('create', Sample::class);

        return $this->success(
            $this->sampleService->create($request->validated()),
            'Sample created successfully',
            201
        );
    }

    public function show(Sample $sample)
    {
        $this->authorize('view', $sample);

        return $this->success($sample->load(['product', 'salesperson', 'creator']));
    }

    public function update(UpdateSampleRequest $request, Sample $sample)
    {
        $this->authorize('update', $sample);

        return $this->success(
            $this->sampleService->update($sample, $request->validated()),
            'Sample updated successfully'
        );
    }

    public function destroy(Sample $sample)
    {
        $this->authorize('delete', $sample);

        $this->sampleService->delete($sample);

        return $this->success(null, 'Sample deleted successfully');
    }

    public function statistics()
    {
        $this->authorize('viewAny', Sample::class);

        return $this->success($this->sampleService->statistics());
    }

    public function statuses()
    {
        return $this->success($this->sampleService->statuses());
    }
}
