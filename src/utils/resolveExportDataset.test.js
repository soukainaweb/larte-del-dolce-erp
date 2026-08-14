import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SCOPE_MODE } from '../components/export/exportScopeTypes';
import { resolveExportDataset, countExportRecords } from './resolveExportDataset';
import { fetchAllPaginated } from './fetchAllPaginated';

vi.mock('./fetchAllPaginated', () => ({
  fetchAllPaginated: vi.fn(),
}));

vi.mock('../services/invoiceService', () => ({
  getInvoices: vi.fn(),
}));

vi.mock('../services/customerService', () => ({
  getCustomers: vi.fn(),
}));

import { getInvoices } from '../services/invoiceService';

describe('resolveExportDataset — invoices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires scope mode', async () => {
    await expect(
      resolveExportDataset({
        pageId: 'invoices',
        pageContext: { filters: {} },
        scopeMode: null,
        selectedEntity: null,
      })
    ).rejects.toThrow(/scope is required/i);
  });

  it('requires entity when scope mode is entity', async () => {
    await expect(
      resolveExportDataset({
        pageId: 'invoices',
        pageContext: { filters: {} },
        scopeMode: SCOPE_MODE.ENTITY,
        selectedEntity: null,
      })
    ).rejects.toThrow(/entity selection is required/i);
  });

  it('resolves all invoices for a selected customer across pages', async () => {
    const customerInvoices = Array.from({ length: 37 }, (_, i) => ({
      id: i + 1,
      invoiceNumber: `INV-${i + 1}`,
      customer: 'Ahmed',
    }));

    fetchAllPaginated.mockResolvedValueOnce({ items: customerInvoices, total: 37 });

    const result = await resolveExportDataset({
      pageId: 'invoices',
      pageContext: { filters: {} },
      scopeMode: SCOPE_MODE.ENTITY,
      selectedEntity: { id: 5, label: 'Ahmed', raw: { id: 5, name: 'Ahmed' } },
    });

    expect(result).toHaveLength(37);
    expect(fetchAllPaginated).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ customer_id: 5 })
    );
  });

  it('counts invoices for customer using API meta.total', async () => {
    getInvoices.mockResolvedValueOnce({
      status: 200,
      data: {
        success: true,
        data: {
          data: [{ id: 1 }],
          total: 12,
          current_page: 1,
          per_page: 1,
        },
      },
    });

    const count = await countExportRecords({
      pageId: 'invoices',
      pageContext: { filters: {} },
      scopeMode: SCOPE_MODE.ENTITY,
      selectedEntity: { id: 2, label: 'Ahmed' },
    });

    expect(getInvoices).toHaveBeenCalledWith(
      expect.objectContaining({ customer_id: 2, per_page: 1, page: 1 })
    );
    expect(count).toBe(12);
  });

  it('does not use modal state — only explicit entity scope', async () => {
    fetchAllPaginated.mockResolvedValueOnce({ items: [{ id: 1 }], total: 1 });

    const result = await resolveExportDataset({
      pageId: 'invoices',
      pageContext: {
        filters: {},
        isViewModalOpen: true,
        selectedInvoice: { id: 99 },
      },
      scopeMode: SCOPE_MODE.ENTITY,
      selectedEntity: { id: 3, label: 'Customer B' },
    });

    expect(result).toHaveLength(1);
    expect(fetchAllPaginated).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ customer_id: 3 })
    );
  });
});

describe('buildExportPreview', () => {
  it('builds customer invoice preview text', async () => {
    const { buildExportPreview } = await import('./buildExportPreview');
    const preview = buildExportPreview({
      entityLabel: 'Ahmed',
      count: 12,
      recordLabel: 'invoices',
      scopeMode: SCOPE_MODE.ENTITY,
    });
    expect(preview.primary).toBe('Ahmed — 12 invoices');
  });
});
