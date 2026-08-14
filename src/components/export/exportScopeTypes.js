/** Export scope mode selected by the user in ExportScopeModal */
export const SCOPE_MODE = {
  ENTITY: 'entity',
  ALL: 'all',
  FILTERS: 'filters',
};

/** How the selected entity constrains the dataset */
export const ENTITY_SCOPE_TYPE = {
  /** Filter list records by entity (e.g. invoices by customer) */
  FILTER: 'filter',
  /** Export the entity row itself (e.g. one customer record) */
  ROW: 'row',
};

export const EXPORT_FORMAT = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  PRINT: 'print',
};

export const DEFAULT_PAGE_SIZE = 100;

export const LARGE_EXPORT_THRESHOLD = 100;
