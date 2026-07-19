// src/services/export/index.js
import { exportPDF, exportTableToPDF } from './pdfExport';
import { exportExcel } from './excelExport';
import { exportCSV } from './csvExport';
import { printData } from './printService';

// Exports nommés
export {
  exportPDF,
  exportTableToPDF,
  exportExcel,
  exportCSV,
  printData
};

// Export par défaut
const exportService = {
  exportPDF,
  exportTableToPDF,
  exportExcel,
  exportCSV,
  printData
};

export default exportService;