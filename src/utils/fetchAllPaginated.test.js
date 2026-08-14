import { describe, expect, it, vi } from 'vitest';
import { fetchAllPaginated, ExportDatasetTooLargeError } from './fetchAllPaginated';

describe('fetchAllPaginated', () => {
  it('fetches all pages until meta.total is reached', async () => {
    const fetchPage = vi.fn()
      .mockResolvedValueOnce({
        data: [{ id: 1 }, { id: 2 }],
        total: 3,
        current_page: 1,
        per_page: 2,
      })
      .mockResolvedValueOnce({
        data: [{ id: 3 }],
        total: 3,
        current_page: 2,
        per_page: 2,
      });

    const { items, total } = await fetchAllPaginated(fetchPage, { customer_id: 5 }, 2);

    expect(items).toHaveLength(3);
    expect(total).toBe(3);
    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(fetchPage.mock.calls[0][0]).toMatchObject({ customer_id: 5, page: 1, per_page: 2 });
    expect(fetchPage.mock.calls[1][0]).toMatchObject({ customer_id: 5, page: 2, per_page: 2 });
  });

  it('stops on empty page', async () => {
    const fetchPage = vi.fn()
      .mockResolvedValueOnce({
        data: [{ id: 1 }],
        total: 1,
        current_page: 1,
        per_page: 100,
      })
      .mockResolvedValueOnce({
        data: [],
        total: 1,
        current_page: 2,
        per_page: 100,
      });

    const { items } = await fetchAllPaginated(fetchPage, {});
    expect(items).toHaveLength(1);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('throws when the safety page cap is exceeded', async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      data: [{ id: 1 }],
      total: 999999,
      current_page: 1,
      per_page: 1,
    });

    await expect(fetchAllPaginated(fetchPage, {}, 1)).rejects.toBeInstanceOf(ExportDatasetTooLargeError);
  });
});
