// src/components/ExportButtons.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Loader2
} from 'lucide-react';
import { useExport } from '../hooks/useExport';

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
  variant = 'default' // 'default' | 'compact' | 'icon-only'
}) => {
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
        rowFormatter
      };

      const result = await exportFn(params);

      if (onSuccess) {
        onSuccess(result);
      }

      // Notification automatique
      const message = `${type.toUpperCase()} exporté avec succès ! (${result.rowCount || data.length} lignes)`;
      console.log(`✅ ${message}`);

    } catch (error) {
      if (onError) {
        onError(error);
      }
      console.error(`❌ Erreur export ${type}:`, error);
    }
  };

  const buttonClasses = {
    default: 'px-4 py-2.5 text-sm gap-2',
    compact: 'px-3 py-2 text-xs gap-1.5',
    'icon-only': 'p-2.5'
  };

  const loadingIcon = <Loader2 size={18} className="animate-spin" />;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {showPDF && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('pdf', exportPDF)}
          disabled={isExporting || data.length === 0}
          className={`flex items-center rounded-xl bg-[#B8863B] text-white hover:bg-[#A07532] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[variant]}`}
        >
          {isExporting ? loadingIcon : <FileText size={variant === 'icon-only' ? 18 : 16} />}
          {variant !== 'icon-only' && (isExporting ? 'PDF...' : 'PDF')}
        </motion.button>
      )}

      {showExcel && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('excel', exportExcel)}
          disabled={isExporting || data.length === 0}
          className={`flex items-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[variant]}`}
        >
          {isExporting ? loadingIcon : <FileSpreadsheet size={variant === 'icon-only' ? 18 : 16} />}
          {variant !== 'icon-only' && (isExporting ? 'Excel...' : 'Excel')}
        </motion.button>
      )}

      {showCSV && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('csv', exportCSV)}
          disabled={isExporting || data.length === 0}
          className={`flex items-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[variant]}`}
        >
          {isExporting ? loadingIcon : <FileText size={variant === 'icon-only' ? 18 : 16} />}
          {variant !== 'icon-only' && (isExporting ? 'CSV...' : 'CSV')}
        </motion.button>
      )}

      {showPrint && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('print', print)}
          disabled={isExporting || data.length === 0}
          className={`flex items-center rounded-xl bg-gray-700 text-white hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[variant]}`}
        >
          {isExporting ? loadingIcon : <Printer size={variant === 'icon-only' ? 18 : 16} />}
          {variant !== 'icon-only' && (isExporting ? 'Impression...' : 'Imprimer')}
        </motion.button>
      )}
    </div>
  );
};

export default ExportButtons;