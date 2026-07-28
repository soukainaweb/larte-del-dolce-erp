<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customers\StoreCustomerRequest;
use App\Http\Requests\Customers\UpdateCustomerRequest;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(private CustomerService $customerService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Customer::class);

        return $this->success($this->customerService->list($request->all()));
    }

    public function store(StoreCustomerRequest $request)
    {
        $this->authorize('create', Customer::class);

        return $this->success(
            $this->customerService->create($request->validated()),
            'Client créé avec succès',
            201
        );
    }

    public function show(Customer $customer)
    {
        $this->authorize('view', $customer);

        return $this->success($customer->load(['orders' => fn ($q) => $q->latest()->take(10)]));
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $this->authorize('update', $customer);

        return $this->success(
            $this->customerService->update($customer, $request->validated()),
            'Client mis à jour avec succès'
        );
    }

    public function destroy(Customer $customer)
    {
        $this->authorize('delete', $customer);

        try {
            $this->customerService->delete($customer);

            return $this->success(null, 'Client supprimé avec succès');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), [], 403);
        }
    }

    public function statistics()
    {
        $this->authorize('viewAny', Customer::class);

        return $this->success($this->customerService->statistics());
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Customer::class);

        return $this->success($this->customerService->export());
    }

    public function types()
    {
        $this->authorize('viewAny', Customer::class);

        return $this->success($this->customerService->types());
    }

    public function statuses()
    {
        return $this->success($this->customerService->statuses());
    }
}
