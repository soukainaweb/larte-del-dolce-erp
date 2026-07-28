// src/components/ExportButtons.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Loader2,
} from 'lucide-react';
import { useExport } from '../hooks/useExport';
import { useToast } from '../contexts/ToastContext';

const ExportButtons = ({
  data = [],
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
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isExporting, exportPDF, exportExcel, exportCSV, print } = useExport();

  const handleExport = async (type, exportFn) => {
    try {
      const params = {
        title,
        subtitle,
        columns,
        data,
        filename: `${filename}.${type === 'pdf' ? 'pdf' : type === 'excel' ? 'xlsx' : 'csv'}`,
        summary,
        rowFormatter,
      };

      const result = await exportFn(params);

      if (onSuccess) {
        onSuccess(result);
      }

      const typeLabel = type === 'pdf' ? t('common.pdf') : type === 'excel' ? t('common.excel') : type === 'csv' ? t('common.csv') : t('common.print');
      showToast(
        t('common.exportSuccess', { type: typeLabel, count: result.rowCount || data.length }),
        'success'
      );
    } catch (error) {
      if (onError) {
        onError(error);
      }
      showToast(t('common.exportError'), 'error');
    }
  };

  const buttonClasses = {
    default: 'px-4 py-2.5 text-sm gap-2',
    compact: 'px-3 py-2 text-xs gap-1.5',
    'icon-only': 'p-2.5',
  };

  const loadingIcon = <Loader2 size={18} className="animate-spin" />;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {showPDF && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('pdf', exportPDF)}
          disabled={isExporting || data.length === 0}
          className={`flex items-center rounded-xl bg-[#B8863B] text-white hover:bg-[#A07532] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[variant]}`}
        >
          {isExporting ? loadingIcon : <FileText size={variant === 'icon-only' ? 18 : 16} />}
          {variant !== 'icon-only' && (isExporting ? `${t('common.pdf')}...` : t('common.pdf'))}
        </motion.button>
      )}

      {showExcel && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('excel', exportExcel)}
          disabled={isExporting || data.length === 0}
          className={`flex items-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[variant]}`}
        >
          {isExporting ? loadingIcon : <FileSpreadsheet size={variant === 'icon-only' ? 18 : 16} />}
          {variant !== 'icon-only' && (isExporting ? `${t('common.excel')}...` : t('common.excel'))}
        </motion.button>
      )}

      {showCSV && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('csv', exportCSV)}
          disabled={isExporting || data.length === 0}
          className={`flex items-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[variant]}`}
        >
          {isExporting ? loadingIcon : <FileText size={variant === 'icon-only' ? 18 : 16} />}
          {variant !== 'icon-only' && (isExporting ? `${t('common.csv')}...` : t('common.csv'))}
        </motion.button>
      )}

      {showPrint && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('print', print)}
          disabled={isExporting || data.length === 0}
          className={`flex items-center rounded-xl bg-gray-700 text-white hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[variant]}`}
        >
          {isExporting ? loadingIcon : <Printer size={variant === 'icon-only' ? 18 : 16} />}
          {variant !== 'icon-only' && (isExporting ? `${t('common.print')}...` : t('common.print'))}
        </motion.button>
      )}
    </div>
  );
};

export default ExportButtons;
