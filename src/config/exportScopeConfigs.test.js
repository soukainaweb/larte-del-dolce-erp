import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SCOPE_MODE } from '../components/export/exportScopeTypes';
import {
  getReportsExportConfig,
  isReportTabExportEnabled,
  REPORT_TAB_EXPORT,
} from './reportExportConfigs';
import { resolveExportDataset } from '../utils/resolveExportDataset';

vi.mock('../utils/fetchAllPaginated', () => ({
  fetchAllPaginated: vi.fn(),
}));

vi.mock('../services/inventoryService', () => ({
  getInventory: vi.fn(),
}));

vi.mock('../services/paymentService', () => ({
  getPayments: vi.fn(),
}));

vi.mock('../services/invoiceService', () => ({
  getInvoices: vi.fn(),
}));

vi.mock('../services/deliveryService', () => ({
  default: {
    getDeliveries: vi.fn(),
  },
}));

import { fetchAllPaginated } from '../utils/fetchAllPaginated';
import { getInventory } from '../services/inventoryService';
import { getPayments } from '../services/paymentService';
import { getInvoices } from '../services/invoiceService';
import deliveryService from '../services/deliveryService';

describe('report export configs', () => {
  it('enables export only for configured tabs', () => {
    expect(isReportTabExportEnabled('orders')).toBe(true);
    expect(isReportTabExportEnabled('invoices')).toBe(true);
    expect(isReportTabExportEnabled('unknown-tab')).toBe(false);
  });

  it('returns null config for unsupported tabs (no orders fallback)', () => {
    expect(getReportsExportConfig('unknown-tab', {})).toBeNull();
  });

  it('maps each supported tab to its own resolver', () => {
    expect(Object.keys(REPORT_TAB_EXPORT)).toEqual(
      expect.arrayContaining(['overview', 'orders', 'sales', 'analytics', 'reports', 'invoices', 'customers'])
    );
  });
});

describe('inventory category export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports inventory items for a category, not the category row', async () => {
    const inventoryItems = [{ id: 1, name: 'Cola', category: 'Beverages' }];
    fetchAllPaginated.mockResolvedValueOnce({ items: inventoryItems, total: 1 });
    getInventory.mockResolvedValue({
      data: { data: inventoryItems, total: 1 },
    });

    const result = await resolveExportDataset({
      pageId: 'inventory',
      pageContext: { filters: {} },
      scopeMode: SCOPE_MODE.ENTITY,
      selectedEntity: { id: 9, label: 'Beverages', raw: { id: 9, name: 'Beverages' } },
    });

    expect(result).toEqual(inventoryItems);
    expect(fetchAllPaginated).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ category: 'Beverages' })
    );
  });
});

describe('deliveries and payments customer export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses customer_id for delivery entity export', async () => {
    fetchAllPaginated.mockResolvedValueOnce({ items: [{ id: 1 }], total: 1 });
    deliveryService.getDeliveries.mockResolvedValue({ data: { data: [{ id: 1 }], total: 1 } });

    await resolveExportDataset({
      pageId: 'deliveries',
      pageContext: { filters: {} },
      scopeMode: SCOPE_MODE.ENTITY,
      selectedEntity: { id: 4, label: 'Ahmed', raw: { id: 4, name: 'Ahmed' } },
    });

    expect(fetchAllPaginated).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ customer_id: 4 })
    );
  });

  it('uses customer_id for payment entity export', async () => {
    fetchAllPaginated.mockResolvedValueOnce({ items: [{ id: 2 }], total: 1 });
    getPayments.mockResolvedValue({ data: { data: [{ id: 2 }], total: 1 } });

    await resolveExportDataset({
      pageId: 'payments',
      pageContext: { filters: {} },
      scopeMode: SCOPE_MODE.ENTITY,
      selectedEntity: { id: 7, label: 'Sara', raw: { id: 7, name: 'Sara' } },
    });

    expect(fetchAllPaginated).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ customer_id: 7 })
    );
  });

  it('reports invoices tab uses invoice list API with customer_id for entity export', async () => {
    fetchAllPaginated.mockResolvedValueOnce({ items: [{ id: 11 }], total: 1 });
    getInvoices.mockResolvedValue({ data: { data: [{ id: 11 }], total: 1 } });

    const config = getReportsExportConfig('invoices', { filters: {} });

    await config.resolveDataset({
      scopeMode: SCOPE_MODE.ENTITY,
      selectedEntity: { id: 5, label: 'Client A', raw: { id: 5, name: 'Client A' } },
      pageContext: { filters: {} },
    });

    expect(fetchAllPaginated).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ customer_id: 5, client: 5 })
    );
  });
});

describe('analytics and myProfile scope behavior', () => {
  it('analytics requires explicit FILTERS scope', async () => {
    await expect(
      resolveExportDataset({
        pageId: 'analytics',
        pageContext: { data: [{ label: 'Revenue', value: 100 }] },
        scopeMode: SCOPE_MODE.ALL,
        selectedEntity: null,
      })
    ).rejects.toThrow(/scope is required/i);
  });

  it('myProfile requires explicit ALL scope via modal', async () => {
    const data = await resolveExportDataset({
      pageId: 'myProfile',
      pageContext: { data: [{ id: 1 }] },
      scopeMode: SCOPE_MODE.ALL,
      selectedEntity: null,
    });
    expect(data).toHaveLength(1);
  });
});
