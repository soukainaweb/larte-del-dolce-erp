import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  getInvoicesPageExportMode,
  buildSingleInvoiceExportSummary,
} from './invoiceExportSelection';

describe('invoice export selection', () => {
  const invoiceA = { id: 1, invoiceNumber: 'INV-015', customer: 'Customer A', totalAmount: 100 };
  const invoiceB = { id: 2, invoiceNumber: 'INV-016', customer: 'Customer B', totalAmount: 200 };
  const filteredInvoices = [invoiceA, invoiceB];

  it('uses single-invoice mode when view modal is open', () => {
    expect(getInvoicesPageExportMode(true, invoiceA)).toEqual({
      mode: 'single',
      data: [invoiceA],
    });
  });

  it('exports only the opened invoice, not the full list', () => {
    const result = getInvoicesPageExportMode(true, invoiceA);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(1);
    expect(result.data).not.toEqual(filteredInvoices);
  });

  it('uses list mode when view modal is closed', () => {
    expect(getInvoicesPageExportMode(false, invoiceA)).toEqual({ mode: 'list', data: null });
    expect(getInvoicesPageExportMode(false, null)).toEqual({ mode: 'list', data: null });
  });
});

describe('single invoice export handlers use one record', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PDF export receives only the selected invoice in data array', async () => {
    const exportPDF = vi.fn().mockResolvedValue({ rowCount: 1 });
    const invoice = { id: 123, invoiceNumber: 'INV-123', customer: 'Acme', totalAmount: 500 };

    await exportPDF({
      title: 'Invoice',
      data: getInvoicesPageExportMode(true, invoice).data,
      columns: [],
      filename: 'invoice.pdf',
    });

    expect(exportPDF).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [invoice],
      })
    );
    expect(exportPDF.mock.calls[0][0].data).toHaveLength(1);
    expect(exportPDF.mock.calls[0][0].data[0].id).toBe(123);
  });

  it('print export receives only the selected invoice in data array', async () => {
    const print = vi.fn().mockResolvedValue({ rowCount: 1 });
    const invoice = { id: 456, invoiceNumber: 'INV-456', customer: 'Beta', totalAmount: 250 };

    await print({
      title: 'Invoice',
      data: getInvoicesPageExportMode(true, invoice).data,
      columns: [],
      filename: 'invoice.print',
    });

    expect(print.mock.calls[0][0].data).toEqual([invoice]);
  });

  it('excel export receives only the selected invoice in data array', async () => {
    const exportExcel = vi.fn().mockResolvedValue({ rowCount: 1 });
    const invoice = { id: 789, invoiceNumber: 'INV-789', customer: 'Gamma', totalAmount: 99 };

    await exportExcel({
      title: 'Invoice',
      data: getInvoicesPageExportMode(true, invoice).data,
      columns: [],
      filename: 'invoice.xlsx',
    });

    expect(exportExcel.mock.calls[0][0].data).toEqual([invoice]);
  });
});

describe('buildSingleInvoiceExportSummary', () => {
  it('builds summary for one invoice only', () => {
    const summary = buildSingleInvoiceExportSummary(
      { invoiceNumber: 'INV-015', orderNumber: 'ORD-1', customer: 'A', totalAmount: 100, paidAmount: 50, paymentStatus: 'partial' },
      {
        invoiceNumber: 'Invoice',
        orderNumber: 'Order',
        customer: 'Customer',
        total: 'Total',
        paidAmount: 'Paid',
        paymentStatus: 'Payment',
        currency: 'SAR',
      }
    );

    expect(summary[0]).toEqual({ label: 'Invoice', value: 'INV-015' });
    expect(summary).toHaveLength(6);
  });
});
