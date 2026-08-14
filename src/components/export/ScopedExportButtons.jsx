import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Loader2,
} from 'lucide-react';
import { useExport } from '../../hooks/useExport';
import { useToast } from '../../contexts/ToastContext';
import { getExportScopeConfig } from '../../config/exportScopeConfigs';
import { resolveExportDataset } from '../../utils/resolveExportDataset';
import ExportScopeModal from './ExportScopeModal';
import { EXPORT_FORMAT } from './exportScopeTypes';

/**
 * Drop-in replacement for ExportButtons with explicit export scope selection.
 */
const ScopedExportButtons = ({
  pageId,
  pageContext = {},
  scopeConfig: scopeConfigProp = null,
  columns = [],
  title = 'Rapport',
  subtitle = '',
  filename = 'rapport',
  summary = null,
  rowFormatter = null,
  onSuccess = null,
  onError = null,
  showPDF = true,
  showExcel = true,
  showCSV = true,
  showPrint = true,
  className = '',
  variant = 'default',
  userName = null,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isExporting, exportPDF, exportExcel, exportCSV, print } = useExport({ userName });

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingFormat, setPendingFormat] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  const scopeConfig = useMemo(
    () => scopeConfigProp || getExportScopeConfig(pageId, pageContext),
    [scopeConfigProp, pageId, pageContext]
  );

  const runExport = useCallback(
    async (type, data) => {
      const params = {
        title,
        subtitle,
        columns,
        data,
        filename: `${filename}.${type === EXPORT_FORMAT.PDF ? 'pdf' : type === EXPORT_FORMAT.EXCEL ? 'xlsx' : type === EXPORT_FORMAT.CSV ? 'csv' : 'print'}`,
        summary,
        rowFormatter,
      };

      switch (type) {
        case EXPORT_FORMAT.PDF:
          return exportPDF(params);
        case EXPORT_FORMAT.EXCEL:
          return exportExcel(params);
        case EXPORT_FORMAT.CSV:
          return exportCSV(params);
        case EXPORT_FORMAT.PRINT:
          return print(params);
        default:
          throw new Error(`Unknown export format: ${type}`);
      }
    },
    [title, subtitle, columns, filename, summary, rowFormatter, exportPDF, exportExcel, exportCSV, print]
  );

  const executeExport = useCallback(
    async (type, scopeSelection = null) => {
      try {
        setIsResolving(true);

        let data;
        if (scopeConfig?.skipModal) {
          data = await resolveExportDataset({
            pageId: scopeConfig,
            pageContext: { ...pageContext, data: pageContext.data },
            scopeMode: 'all',
            selectedEntity: null,
          });
        } else {
          data = await resolveExportDataset({
            pageId: scopeConfig,
            pageContext,
            scopeMode: scopeSelection.scopeMode,
            selectedEntity: scopeSelection.selectedEntity,
          });
        }

        if (!data?.length) {
          showToast(t('exportScope.noRecords', 'No records to export'), 'error');
          return;
        }

        const result = await runExport(type, data);

        if (onSuccess) onSuccess(result);

        const typeLabel =
          type === EXPORT_FORMAT.PDF
            ? t('common.pdf')
            : type === EXPORT_FORMAT.EXCEL
              ? t('common.excel')
              : type === EXPORT_FORMAT.CSV
                ? t('common.csv')
                : t('common.print');

        showToast(
          t('common.exportSuccess', { type: typeLabel, count: result.rowCount || data.length }),
          'success'
        );
      } catch (error) {
        if (onError) onError(error);
        showToast(t('common.exportError'), 'error');
      } finally {
        setIsResolving(false);
        setModalOpen(false);
        setPendingFormat(null);
      }
    },
    [scopeConfig, pageContext, runExport, onSuccess, onError, showToast, t]
  );

  const handleButtonClick = useCallback(
    (type) => {
      if (scopeConfig?.skipModal) {
        executeExport(type);
        return;
      }
      setPendingFormat(type);
      setModalOpen(true);
    },
    [scopeConfig, executeExport]
  );

  const handleModalConfirm = useCallback(
    (selection) => {
      if (!pendingFormat) return;
      executeExport(pendingFormat, selection);
    },
    [pendingFormat, executeExport]
  );

  const buttonClasses = {
    default: 'px-4 py-2.5 text-sm gap-2',
    compact: 'px-3 py-2 text-xs gap-1.5',
    'icon-only': 'p-2.5',
  };

  const busy = isExporting || isResolving;
  const loadingIcon = <Loader2 size={18} className="animate-spin" />;

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {showPDF && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleButtonClick(EXPORT_FORMAT.PDF)}
            disabled={busy}
            className={`flex items-center rounded-xl bg-[#B8863B] text-white hover:bg-[#A07532] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[variant]}`}
          >
            {busy ? loadingIcon : <FileText size={variant === 'icon-only' ? 18 : 16} />}
            {variant !== 'icon-only' && (busy ? `${t('common.pdf')}...` : t('common.pdf'))}
          </motion.button>
        )}

        {showExcel && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleButtonClick(EXPORT_FORMAT.EXCEL)}
            disabled={busy}
            className={`flex items-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[variant]}`}
          >
            {busy ? loadingIcon : <FileSpreadsheet size={variant === 'icon-only' ? 18 : 16} />}
            {variant !== 'icon-only' && (busy ? `${t('common.excel')}...` : t('common.excel'))}
          </motion.button>
        )}

        {showCSV && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleButtonClick(EXPORT_FORMAT.CSV)}
            disabled={busy}
            className={`flex items-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[variant]}`}
          >
            {busy ? loadingIcon : <FileText size={variant === 'icon-only' ? 18 : 16} />}
            {variant !== 'icon-only' && (busy ? `${t('common.csv')}...` : t('common.csv'))}
          </motion.button>
        )}

        {showPrint && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleButtonClick(EXPORT_FORMAT.PRINT)}
            disabled={busy}
            className={`flex items-center rounded-xl bg-gray-700 text-white hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[variant]}`}
          >
            {busy ? loadingIcon : <Printer size={variant === 'icon-only' ? 18 : 16} />}
            {variant !== 'icon-only' && (busy ? `${t('common.print')}...` : t('common.print'))}
          </motion.button>
        )}
      </div>

      {scopeConfig && !scopeConfig.skipModal && (
        <ExportScopeModal
          isOpen={modalOpen}
          onClose={() => {
            if (isResolving) return;
            setModalOpen(false);
            setPendingFormat(null);
          }}
          onConfirm={handleModalConfirm}
          exportFormat={pendingFormat || EXPORT_FORMAT.PDF}
          scopeConfig={scopeConfig}
          pageContext={pageContext}
          isResolving={isResolving}
        />
      )}
    </>
  );
};

export default ScopedExportButtons;
