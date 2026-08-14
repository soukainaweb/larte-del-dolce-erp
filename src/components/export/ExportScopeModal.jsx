import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, AlertTriangle, Loader2 } from 'lucide-react';
import { SCOPE_MODE } from './exportScopeTypes';
import { countExportRecords } from '../../utils/resolveExportDataset';
import { buildExportPreview } from '../../utils/buildExportPreview';

const ExportScopeModal = ({
  isOpen,
  onClose,
  onConfirm,
  exportFormat = 'pdf',
  scopeConfig,
  pageContext = {},
  isResolving = false,
}) => {
  const { t } = useTranslation();
  const [scopeMode, setScopeMode] = useState(null);
  const [entityQuery, setEntityQuery] = useState('');
  const [entityOptions, setEntityOptions] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [previewCount, setPreviewCount] = useState(null);
  const [isCountLoading, setIsCountLoading] = useState(false);
  const [showLargeWarning, setShowLargeWarning] = useState(false);

  const modes = scopeConfig?.modes ?? [SCOPE_MODE.ENTITY, SCOPE_MODE.ALL];
  const supportsEntity = modes.includes(SCOPE_MODE.ENTITY) && scopeConfig?.searchEntities;
  const supportsFilters = modes.includes(SCOPE_MODE.FILTERS);
  const supportsAll = modes.includes(SCOPE_MODE.ALL);
  const hasActiveFilters = scopeConfig?.hasActiveFilters?.(pageContext) ?? false;
  const threshold = scopeConfig?.largeExportThreshold ?? 100;

  const entityLabel = scopeConfig?.entityKind
    ? t(`exportScope.entity.${scopeConfig.entityKind}`, scopeConfig.entityKind)
    : t('exportScope.entity.default', 'Entity');

  const recordLabel = scopeConfig?.recordKind
    ? t(`exportScope.record.${scopeConfig.recordKind}`, scopeConfig.recordKind)
    : t('exportScope.record.default', 'records');

  const formatLabel = t(`common.${exportFormat}`, exportFormat);

  useEffect(() => {
    if (!isOpen) {
      setScopeMode(null);
      setEntityQuery('');
      setEntityOptions([]);
      setSelectedEntity(null);
      setPreviewCount(null);
      setShowLargeWarning(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || scopeMode !== SCOPE_MODE.ENTITY || !scopeConfig?.searchEntities) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await scopeConfig.searchEntities(entityQuery.trim());
        if (!cancelled) setEntityOptions(results);
      } catch {
        if (!cancelled) setEntityOptions([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, scopeMode, entityQuery, scopeConfig]);

  useEffect(() => {
    if (!isOpen || !scopeMode) {
      setPreviewCount(null);
      return;
    }
    if (scopeMode === SCOPE_MODE.ENTITY && !selectedEntity) {
      setPreviewCount(null);
      return;
    }

    let cancelled = false;
    const loadCount = async () => {
      setIsCountLoading(true);
      try {
        const count = await countExportRecords({
          pageId: scopeConfig,
          pageContext,
          scopeMode,
          selectedEntity,
        });
        if (!cancelled) {
          setPreviewCount(count);
          setShowLargeWarning(count >= threshold && scopeMode === SCOPE_MODE.ALL);
        }
      } catch {
        if (!cancelled) setPreviewCount(null);
      } finally {
        if (!cancelled) setIsCountLoading(false);
      }
    };

    loadCount();
    return () => {
      cancelled = true;
    };
  }, [isOpen, scopeMode, selectedEntity, scopeConfig, pageContext, threshold]);

  const preview = useMemo(() => {
    if (previewCount == null) return null;
    return buildExportPreview({
      entityLabel: selectedEntity?.label,
      count: previewCount,
      recordLabel,
      scopeMode,
      hasActiveFilters,
    });
  }, [previewCount, selectedEntity, recordLabel, scopeMode, hasActiveFilters]);

  const canConfirm =
    scopeMode &&
    (scopeMode !== SCOPE_MODE.ENTITY || selectedEntity) &&
    previewCount != null &&
    previewCount > 0 &&
    !isCountLoading &&
    !isResolving;

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;
    onConfirm({ scopeMode, selectedEntity, count: previewCount });
  }, [canConfirm, onConfirm, scopeMode, selectedEntity, previewCount]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-scope-title"
          >
            <div className="p-6 border-b border-[#ECE8E1] flex items-center justify-between">
              <div>
                <h2 id="export-scope-title" className="text-lg font-bold text-[#3D2F24]">
                  {t('exportScope.title', 'Export data')}
                </h2>
                <p className="text-sm text-[#6D6D6D] mt-1">
                  {t('exportScope.formatLabel', { format: formatLabel, defaultValue: `Format: ${formatLabel}` })}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
                aria-label={t('common.close')}
              >
                <X size={20} className="text-[#6D6D6D]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm font-medium text-[#3D2F24]">
                {t('exportScope.chooseScope', 'Choose export scope')}
              </p>

              {supportsEntity && (
                <label className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${scopeMode === SCOPE_MODE.ENTITY ? 'border-[#B8863B] bg-[#FBF7EF]' : 'border-[#ECE8E1] hover:bg-[#F8F7F4]'}`}>
                  <input
                    type="radio"
                    name="export-scope"
                    className="mt-1"
                    checked={scopeMode === SCOPE_MODE.ENTITY}
                    onChange={() => {
                      setScopeMode(SCOPE_MODE.ENTITY);
                      setSelectedEntity(null);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3D2F24]">
                      {t('exportScope.selectEntity', { entity: entityLabel, defaultValue: `Select specific ${entityLabel}` })}
                    </p>

                    {scopeMode === SCOPE_MODE.ENTITY && (
                      <div className="mt-3 space-y-2">
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
                          <input
                            type="text"
                            value={entityQuery}
                            onChange={(e) => {
                              setEntityQuery(e.target.value);
                              setSelectedEntity(null);
                            }}
                            placeholder={t('exportScope.searchEntity', { entity: entityLabel, defaultValue: `Search ${entityLabel}...` })}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30"
                          />
                        </div>

                        <div className="max-h-40 overflow-y-auto border border-[#ECE8E1] rounded-lg">
                          {isSearching ? (
                            <div className="p-3 text-sm text-[#6D6D6D] flex items-center gap-2">
                              <Loader2 size={16} className="animate-spin" />
                              {t('common.loading', 'Loading...')}
                            </div>
                          ) : entityOptions.length === 0 ? (
                            <div className="p-3 text-sm text-[#6D6D6D]">
                              {t('exportScope.noEntities', 'No results found')}
                            </div>
                          ) : (
                            entityOptions.map((option) => (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setSelectedEntity(option)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-[#F8F7F4] ${selectedEntity?.id === option.id ? 'bg-[#FBF7EF] text-[#B8863B] font-medium' : 'text-[#3D2F24]'}`}
                              >
                                {option.label}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              )}

              {supportsAll && (
                <label className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${scopeMode === SCOPE_MODE.ALL ? 'border-[#B8863B] bg-[#FBF7EF]' : 'border-[#ECE8E1] hover:bg-[#F8F7F4]'}`}>
                  <input
                    type="radio"
                    name="export-scope"
                    className="mt-1"
                    checked={scopeMode === SCOPE_MODE.ALL}
                    onChange={() => {
                      setScopeMode(SCOPE_MODE.ALL);
                      setSelectedEntity(null);
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#3D2F24]">
                      {t('exportScope.exportAll', 'Export all')}
                    </p>
                    <p className="text-xs text-[#6D6D6D] mt-1">
                      {t('exportScope.exportAllHint', 'Export every accessible record for this module')}
                    </p>
                  </div>
                </label>
              )}

              {supportsFilters && hasActiveFilters && (
                <label className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${scopeMode === SCOPE_MODE.FILTERS ? 'border-[#B8863B] bg-[#FBF7EF]' : 'border-[#ECE8E1] hover:bg-[#F8F7F4]'}`}>
                  <input
                    type="radio"
                    name="export-scope"
                    className="mt-1"
                    checked={scopeMode === SCOPE_MODE.FILTERS}
                    onChange={() => {
                      setScopeMode(SCOPE_MODE.FILTERS);
                      setSelectedEntity(null);
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#3D2F24]">
                      {t('exportScope.useCurrentFilters', 'Use current filters')}
                    </p>
                    <p className="text-xs text-[#6D6D6D] mt-1">
                      {t('exportScope.useCurrentFiltersHint', 'Export only records matching the active page filters')}
                    </p>
                  </div>
                </label>
              )}

              {(preview || isCountLoading) && (
                <div className="rounded-xl bg-[#F8F7F4] border border-[#ECE8E1] p-4">
                  <p className="text-xs uppercase tracking-wide text-[#6D6D6D] mb-1">
                    {t('exportScope.preview', 'Preview')}
                  </p>
                  {isCountLoading ? (
                    <div className="flex items-center gap-2 text-sm text-[#6D6D6D]">
                      <Loader2 size={16} className="animate-spin" />
                      {t('exportScope.counting', 'Calculating...')}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-[#3D2F24]">
                      {t('exportScope.willExport', {
                        preview: preview?.primary,
                        defaultValue: `${preview?.primary} will be exported`,
                      })}
                    </p>
                  )}
                </div>
              )}

              {showLargeWarning && (
                <div className="flex gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <p>{t('exportScope.largeExportWarning', { count: previewCount, defaultValue: `You are about to export ${previewCount} records.` })}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#ECE8E1] flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-xl hover:bg-[#F8F7F4]"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isResolving && <Loader2 size={16} className="animate-spin" />}
                {t('exportScope.confirmExport', { format: formatLabel, defaultValue: `Export ${formatLabel}` })}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExportScopeModal;
