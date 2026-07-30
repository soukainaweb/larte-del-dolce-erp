/**
 * Shared Arabic label helpers for status badges, table headers, and CRUD actions.
 */
export const getStatusLabel = (t, key) => {
  const normalized = String(key ?? '').toLowerCase();
  return t(`common.statuses.${normalized}`, { defaultValue: t(`common.${normalized}`, key) });
};

export const getCommonStatusConfig = (t) => ({
  active: { label: t('common.active'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  online: { label: t('common.statuses.online'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  inactive: { label: t('common.inactive'), class: 'bg-gray-50 text-gray-600 border-gray-200' },
  offline: { label: t('common.statuses.offline'), class: 'bg-gray-50 text-gray-600 border-gray-200' },
  suspended: { label: t('common.statuses.suspended'), class: 'bg-amber-50 text-amber-700 border-amber-200' },
  locked: { label: t('common.statuses.locked'), class: 'bg-rose-50 text-rose-700 border-rose-200' },
  pending: { label: t('common.pending'), class: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: t('common.completed'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: t('common.cancelled'), class: 'bg-rose-50 text-rose-700 border-rose-200' },
  validated: { label: t('common.statuses.validated'), class: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_production: { label: t('common.statuses.inProduction'), class: 'bg-purple-50 text-purple-700 border-purple-200' },
  ready: { label: t('common.statuses.ready'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  delivered: { label: t('common.statuses.delivered'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paid: { label: t('common.statuses.paid'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  unpaid: { label: t('common.statuses.unpaid'), class: 'bg-amber-50 text-amber-700 border-amber-200' },
  overdue: { label: t('common.statuses.overdue'), class: 'bg-rose-50 text-rose-700 border-rose-200' },
  sent: { label: t('common.statuses.sent'), class: 'bg-blue-50 text-blue-700 border-blue-200' },
  archived: { label: t('common.statuses.archived'), class: 'bg-gray-50 text-gray-600 border-gray-200' },
  failed: { label: t('common.statuses.failed'), class: 'bg-rose-50 text-rose-700 border-rose-200' },
});

export const getActionLabels = (t) => ({
  view: t('common.view'),
  edit: t('common.edit'),
  delete: t('common.delete'),
  export: t('common.export'),
  download: t('common.download'),
  print: t('common.print'),
  share: t('common.share'),
  refresh: t('common.refresh'),
});

export default { getStatusLabel, getCommonStatusConfig, getActionLabels };
