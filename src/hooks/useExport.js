// src/hooks/useExport.js
import { useState, useCallback } from 'react';
import {
  exportPDF,
  exportExcel,
  exportCSV,
  printData
} from '../services/export';

/**
 * Hook personnalisé pour l'exportation
 */
export const useExport = (options = {}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const defaultOptions = {
    companyName: "L'arte ERP",
    userName: 'Utilisateur',
    dateFormat: 'dd/MM/yyyy HH:mm'
  };

  const mergedOptions = { ...defaultOptions, ...options };

  /**
   * Export PDF
   */
  const exportPDFHandler = useCallback(async (params) => {
    setIsExporting(true);
    setError(null);
    setResult(null);

    try {
      const result = await exportPDF({
        ...mergedOptions,
        ...params
      });
      setResult(result);
      return result;
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'export PDF');
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [mergedOptions]);

  /**
   * Export Excel
   */
  const exportExcelHandler = useCallback(async (params) => {
    setIsExporting(true);
    setError(null);
    setResult(null);

    try {
      const result = await exportExcel({
        ...mergedOptions,
        ...params
      });
      setResult(result);
      return result;
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'export Excel');
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [mergedOptions]);

  /**
   * Export CSV
   */
  const exportCSVHandler = useCallback(async (params) => {
    setIsExporting(true);
    setError(null);
    setResult(null);

    try {
      const result = await exportCSV({
        ...mergedOptions,
        ...params
      });
      setResult(result);
      return result;
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'export CSV');
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [mergedOptions]);

  /**
   * Impression
   */
  const printHandler = useCallback(async (params) => {
    setIsExporting(true);
    setError(null);
    setResult(null);

    try {
      const result = await printData({
        ...mergedOptions,
        ...params
      });
      setResult(result);
      return result;
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'impression');
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [mergedOptions]);

  return {
    isExporting,
    error,
    result,
    exportPDF: exportPDFHandler,
    exportExcel: exportExcelHandler,
    exportCSV: exportCSVHandler,
    print: printHandler
  };
};

export default useExport;