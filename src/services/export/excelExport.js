// src/services/export/excelExport.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

/**
 * Exporte des données au format Excel
 */
export const exportExcel = async ({
  title = 'Rapport',
  columns = [],
  data = [],
  filename = 'rapport.xlsx',
  sheetName = 'Données',
  userName = 'Utilisateur',
  companyName = "L'arte ERP",
  summary = null,
  rowFormatter = null,
  dateFormat = 'dd/MM/yyyy HH:mm'
}) => {
  return new Promise((resolve, reject) => {
    try {
      // Préparer les données
      let exportData = data;
      if (rowFormatter) {
        exportData = data.map(rowFormatter);
      }

      // ===== FEUILLE PRINCIPALE =====
      const wb = XLSX.utils.book_new();

      // En-têtes avec styles
      const headerRow = columns.map(col => col.label);

      // Données formatées
      const dataRows = exportData.map(row => {
        return columns.map(col => {
          let value = row[col.accessor];
          if (col.formatter) {
            value = col.formatter(value, row);
          }
          return value !== undefined && value !== null ? value : '';
        });
      });

      // Mettre les données ensemble
      const wsData = [
        [`${companyName} - ${title}`],
        [`Généré par : ${userName}`],
        [`Date : ${format(new Date(), dateFormat)}`],
        [`Total : ${exportData.length} lignes`],
        [],
        headerRow,
        ...dataRows
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Styles - Largeur des colonnes
      const colWidths = headerRow.map((header, index) => {
        let maxLength = header.length;
        dataRows.forEach(row => {
          const value = row[index];
          if (value !== undefined && value !== null) {
            const str = String(value);
            if (str.length > maxLength) maxLength = str.length;
          }
        });
        return { wch: Math.min(Math.max(maxLength + 4, 12), 50) };
      });
      ws['!cols'] = colWidths;

      // Fusionner les cellules du titre
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headerRow.length - 1 } }
      ];

      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // ===== FEUILLE RÉSUMÉ =====
      if (summary && Object.keys(summary).length > 0) {
        const summaryData = [
          ['Résumé du rapport'],
          [],
          ['Indicateur', 'Valeur']
        ];

        Object.entries(summary).forEach(([key, value]) => {
          summaryData.push([key, typeof value === 'number' ? value.toLocaleString() : value]);
        });

        summaryData.push([]);
        summaryData.push([`Généré le : ${format(new Date(), dateFormat)}`]);
        summaryData.push([`Par : ${userName}`]);

        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');
      }

      // ===== FEUILLE MÉTADONNÉES =====
      const metaData = [
        ['Métadonnées du rapport'],
        [],
        ['Titre', title],
        ['Entreprise', companyName],
        ['Utilisateur', userName],
        ['Date de génération', format(new Date(), dateFormat)],
        ['Nombre de lignes', exportData.length],
        ['Nombre de colonnes', columns.length],
        ['Fichier', filename],
        ['Version', '1.0']
      ];

      const wsMeta = XLSX.utils.aoa_to_sheet(metaData);
      wsMeta['!cols'] = [{ wch: 25 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, wsMeta, 'Métadonnées');

      // ===== GÉNÉRER LE FICHIER =====
      const wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'array',
        bookSST: false
      });

      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      saveAs(blob, filename);

      // Calculer la taille du fichier
      const fileSize = (blob.size / 1024).toFixed(2);

      resolve({
        success: true,
        filename,
        rowCount: exportData.length,
        fileSize: `${fileSize} KB`
      });

    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      reject(error);
    }
  });
};

export default exportExcel;