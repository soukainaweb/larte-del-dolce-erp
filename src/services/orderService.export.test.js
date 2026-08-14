import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from './api';
import orderService from './orderService';

describe('orderService.getOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          data: [{ id: 1, order_number: 'ORD-1' }],
          total: 1,
          current_page: 1,
          per_page: 100,
        },
      },
    });
  });

  it('forwards customer_id to the API query string', async () => {
    await orderService.getOrders({
      customer_id: 123,
      status: 'pending',
      search: 'test',
      page: 1,
      per_page: 50,
    });

    expect(api.get).toHaveBeenCalledTimes(1);
    const url = api.get.mock.calls[0][0];
    expect(url).toContain('customer_id=123');
    expect(url).toContain('status=pending');
    expect(url).toContain('search=test');
    expect(url).toContain('page=1');
    expect(url).toContain('per_page=50');
  });

  it('preserves existing filters when customer_id is omitted', async () => {
    await orderService.getOrders({ status: 'delivered', page: 2, per_page: 25 });

    const url = api.get.mock.calls[0][0];
    expect(url).toContain('status=delivered');
    expect(url).not.toContain('customer_id=');
  });
});
