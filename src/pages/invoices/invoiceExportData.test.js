import { describe, expect, it } from 'vitest';

const getInvoicesExportData = (isViewModalOpen, selectedInvoice, filteredInvoices) =>
  isViewModalOpen && selectedInvoice ? [selectedInvoice] : filteredInvoices;

const getInvoicesExportSummary = (isViewModalOpen, selectedInvoice, listSummary) => {
  if (isViewModalOpen && selectedInvoice) {
    return [
      { label: 'Invoice', value: selectedInvoice.invoiceNumber ?? '—' },
      { label: 'Customer', value: selectedInvoice.customer ?? '—' },
      { label: 'Total', value: selectedInvoice.totalAmount ?? 0 },
    ];
  }

  return listSummary;
};

describe('InvoicesPage export data selection', () => {
  const invoiceA = { id: 1, invoiceNumber: 'INV-015', customer: 'Customer A', totalAmount: 100 };
  const invoiceB = { id: 2, invoiceNumber: 'INV-016', customer: 'Customer B', totalAmount: 200 };
  const filteredInvoices = [invoiceA, invoiceB];
  const listSummary = [
    { label: 'Total', value: 2 },
    { label: 'Revenue', value: 300 },
  ];

  it('exports only invoice A when its view modal is open', () => {
    expect(getInvoicesExportData(true, invoiceA, filteredInvoices)).toEqual([invoiceA]);
  });

  it('exports only invoice B when its view modal is open', () => {
    expect(getInvoicesExportData(true, invoiceB, filteredInvoices)).toEqual([invoiceB]);
  });

  it('exports all filtered invoices when the view modal is closed', () => {
    expect(getInvoicesExportData(false, invoiceA, filteredInvoices)).toEqual(filteredInvoices);
    expect(getInvoicesExportData(false, null, filteredInvoices)).toEqual(filteredInvoices);
  });

  it('scopes export summary to the selected invoice when view modal is open', () => {
    const summary = getInvoicesExportSummary(true, invoiceA, listSummary);

    expect(summary).toEqual([
      { label: 'Invoice', value: 'INV-015' },
      { label: 'Customer', value: 'Customer A' },
      { label: 'Total', value: 100 },
    ]);
  });

  it('keeps list summary when view modal is closed', () => {
    expect(getInvoicesExportSummary(false, invoiceA, listSummary)).toEqual(listSummary);
  });
});
