/**
 * Select export dataset for InvoicesPage.
 * When a single invoice view modal is open, export ONLY that invoice.
 * Otherwise return null so the list page uses ScopedExportButtons.
 */
export function getInvoicesPageExportMode(isViewModalOpen, selectedInvoice) {
  if (isViewModalOpen && selectedInvoice) {
    return {
      mode: 'single',
      data: [selectedInvoice],
    };
  }

  return { mode: 'list', data: null };
}

export function buildSingleInvoiceExportSummary(selectedInvoice, labels) {
  if (!selectedInvoice) return [];

  return [
    { label: labels.invoiceNumber, value: selectedInvoice.invoiceNumber ?? '—' },
    { label: labels.orderNumber, value: selectedInvoice.orderNumber ?? '—' },
    { label: labels.customer, value: selectedInvoice.customer ?? '—' },
    {
      label: labels.total,
      value: `${(selectedInvoice.totalAmount ?? 0).toLocaleString()} ${labels.currency}`,
    },
    {
      label: labels.paidAmount,
      value: `${(selectedInvoice.paidAmount ?? 0).toLocaleString()} ${labels.currency}`,
    },
    { label: labels.paymentStatus, value: selectedInvoice.paymentStatus ?? '—' },
  ];
}
