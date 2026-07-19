// src/services/export/csvExport.js
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

/**
 * Exporte des données au format CSV
 */
export const exportCSV = async ({
  title = 'Rapport',
  columns = [],
  data = [],
  filename = 'rapport.csv',
  userName = 'Utilisateur',
  delimiter = ';',
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

      // Fonction d'échappement CSV
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Construire le contenu CSV
      const rows = [];

      // Métadonnées
      rows.push(`# Titre: ${title}`);
      rows.push(`# Généré par: ${userName}`);
      rows.push(`# Date: ${format(new Date(), dateFormat)}`);
      rows.push(`# Total: ${exportData.length} lignes`);
      rows.push('');

      // En-têtes
      const headers = columns.map(col => col.label);
      rows.push(headers.map(escapeCSV).join(delimiter));

      // Données
      exportData.forEach(row => {
        const rowData = columns.map(col => {
          let value = row[col.accessor];
          if (col.formatter) {
            value = col.formatter(value, row);
          }
          return escapeCSV(value);
        });
        rows.push(rowData.join(delimiter));
      });

      // Footer
      rows.push('');
      rows.push(`# Fin du rapport - ${format(new Date(), dateFormat)}`);

      // Contenu final avec BOM UTF-8
      let csvContent = rows.join('\n');
      const BOM = '\uFEFF';
      csvContent = BOM + csvContent;

      // Créer le blob
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });

      saveAs(blob, filename);

      // Calculer la taille
      const fileSize = (blob.size / 1024).toFixed(2);

      resolve({
        success: true,
        filename,
        rowCount: exportData.length,
        fileSize: `${fileSize} KB`
      });

    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      reject(error);
    }
  });
};

export default exportCSV;