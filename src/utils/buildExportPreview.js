/**
 * Build preview lines for ExportScopeModal.
 * @param {Object} options
 * @param {string} options.entityLabel - e.g. customer name
 * @param {number} options.count - record count
 * @param {string} options.recordLabel - e.g. "invoices"
 * @param {string} options.scopeMode - SCOPE_MODE value
 * @param {boolean} options.hasActiveFilters
 * @returns {{ primary: string, secondary?: string }}
 */
export function buildExportPreview({
  entityLabel = '',
  count = 0,
  recordLabel = '',
  scopeMode = '',
  hasActiveFilters = false,
} = {}) {
  if (scopeMode === 'all') {
    return {
      primary: `${count} ${recordLabel}`,
      secondary: hasActiveFilters ? 'filtered' : undefined,
    };
  }

  if (scopeMode === 'filters') {
    return {
      primary: `${count} ${recordLabel}`,
      secondary: 'currentFilters',
    };
  }

  if (entityLabel) {
    return {
      primary: `${entityLabel} — ${count} ${recordLabel}`,
    };
  }

  return {
    primary: `${count} ${recordLabel}`,
  };
}

export default buildExportPreview;
