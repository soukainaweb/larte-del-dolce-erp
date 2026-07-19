// src/services/export/pdfExport.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Exporte des données au format PDF avec un design professionnel
 */
export const exportPDF = async ({
  title = 'Rapport',
  subtitle = '',
  columns = [],
  data = [],
  filename = 'rapport.pdf',
  logo = null,
  userName = 'Utilisateur',
  companyName = "L'arte ERP",
  summary = null,
  orientation = 'auto',
  rowFormatter = null,
  dateFormat = 'dd/MM/yyyy HH:mm',
  primaryColor = '#B8863B'
}) => {
  return new Promise((resolve, reject) => {
    try {
      // Vérifier les données
      if (!data || data.length === 0) {
        reject(new Error('Aucune donnée à exporter'));
        return;
      }

      // Déterminer l'orientation
      let finalOrientation = orientation;
      if (orientation === 'auto') {
        finalOrientation = columns.length > 7 ? 'landscape' : 'portrait';
      }

      const doc = new jsPDF({
        orientation: finalOrientation,
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 16;
      const currentDate = format(new Date(), dateFormat);

      // Préparer les données avec rowFormatter
      let exportData = data;
      if (rowFormatter && typeof rowFormatter === 'function') {
        exportData = data.map(rowFormatter);
      }

      let yPosition = 15;

      // ===== EN-TÊTE AVEC FOND =====
      doc.setFillColor('#B8863B');
      doc.rect(0, 0, pageWidth, 6, 'F');

      // ===== TITRE =====
      yPosition = 20;

      // Nom de l'entreprise
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#B8863B');
      doc.text(companyName, pageWidth / 2, yPosition, { align: 'center' });

      // Titre du rapport
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#2B2B2B');
      doc.text(title, pageWidth / 2, yPosition + 9, { align: 'center' });

      if (subtitle) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#666666');
        doc.text(subtitle, pageWidth / 2, yPosition + 16, { align: 'center' });
        yPosition = yPosition + 26;
      } else {
        yPosition = yPosition + 20;
      }

      // ===== MÉTADONNÉES =====
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#666666');

      const metaData = [
        `Généré par : ${userName || 'Utilisateur'}`,
        `Date : ${currentDate}`,
        `Total : ${exportData.length} lignes`
      ];

      let xPos = margin;
      metaData.forEach((text, index) => {
        doc.text(text, xPos, yPosition);
        xPos += doc.getTextWidth(text) + 12;
      });

      // Métadonnées à droite
      const metaRight = [
        `Version : 2.0`,
        `Référence : ${format(new Date(), 'yyyyMMddHHmmss')}`
      ];

      let rightX = pageWidth - margin;
      metaRight.forEach((text, index) => {
        const textWidth = doc.getTextWidth(text);
        doc.text(text, rightX - textWidth, yPosition + (index * 4));
      });

      yPosition += 10;

      // ===== LIGNE DE SÉPARATION =====
      doc.setDrawColor('#E8E0D8');
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      // ===== RÉSUMÉ (KPI) - CORRIGÉ =====
      if (summary && typeof summary === 'object' && Object.keys(summary).length > 0) {
        // Si summary est un tableau d'objets avec label et value
        let summaryItems = [];
        
        if (Array.isArray(summary)) {
          // Format: [{ label: 'Total', value: 248 }, ...]
          summaryItems = summary;
        } else {
          // Format: { 'Total': 248, 'Non lues': 10, ... }
          summaryItems = Object.keys(summary).map(key => ({
            label: key,
            value: summary[key]
          }));
        }

        if (summaryItems.length > 0) {
          const colsPerRow = Math.min(4, summaryItems.length);
          const cardWidth = (pageWidth - margin * 2 - (colsPerRow - 1) * 6) / colsPerRow;
          const cardHeight = 20;

          let sumX = margin;
          let sumY = yPosition;

          summaryItems.forEach((item, index) => {
            if (index > 0 && index % colsPerRow === 0) {
              sumX = margin;
              sumY += cardHeight + 5;
            }

            // Carte
            doc.setFillColor('#F8F7F4');
            doc.setDrawColor('#E8E0D8');
            doc.roundedRect(sumX, sumY, cardWidth, cardHeight, 3, 3, 'FD');

            // Label
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor('#888888');
            doc.text(String(item.label), sumX + 5, sumY + 6);

            // Valeur
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#2B2B2B');
            const value = item.value;
            const formattedValue = typeof value === 'number' ? value.toLocaleString() : String(value);
            doc.text(formattedValue, sumX + 5, sumY + 16);

            sumX += cardWidth + 6;
          });

          yPosition = sumY + cardHeight + 10;
        }
      }

      // ===== TABLEAU =====
      if (!columns || columns.length === 0) {
        reject(new Error('Aucune colonne définie pour le tableau'));
        return;
      }

      // Nettoyer les colonnes - s'assurer qu'elles ont les bons champs
      const cleanColumns = columns.map(col => ({
        header: col.label || col.accessor || 'Colonne',
        dataKey: col.accessor,
        align: col.align || 'left'
      }));

      // Nettoyer les données - s'assurer que chaque ligne a toutes les colonnes
      const cleanData = exportData.map(row => {
        const obj = {};
        columns.forEach(col => {
          let value = row[col.accessor];
          if (value === undefined || value === null) {
            value = '';
          }
          if (col.formatter && typeof col.formatter === 'function') {
            value = col.formatter(value, row);
          }
          obj[col.accessor] = String(value);
        });
        return obj;
      });

      // ===== CONFIGURATION DU TABLEAU =====
      const styles = {
        fontSize: 8,
        cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
        lineColor: '#E8E0D8',
        lineWidth: 0.1,
        textColor: '#2B2B2B',
        overflow: 'linebreak',
        valign: 'middle'
      };

      const headStyles = {
        fillColor: '#B8863B',
        textColor: '#FFFFFF',
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: { top: 3, bottom: 3, left: 2, right: 2 }
      };

      const alternateRowStyles = {
        fillColor: '#F8F7F4'
      };

      // ===== CALCUL DES LARGEURS =====
      const columnStyles = {};
      const totalCols = cleanColumns.length;
      
      // Largeur de base par colonne
      const baseWidth = Math.min(40, (pageWidth - margin * 2 - 10) / totalCols);
      
      cleanColumns.forEach((col, index) => {
        // Calculer la largeur en fonction du contenu
        let maxLen = col.header.length;
        cleanData.slice(0, 50).forEach(row => {
          const val = row[col.dataKey];
          if (val && String(val).length > maxLen) {
            maxLen = String(val).length;
          }
        });
        // Limiter la largeur
        let width = Math.max(12, Math.min(45, Math.max(baseWidth, maxLen * 1.5)));
        columnStyles[index] = {
          halign: col.align || 'left',
          cellWidth: width
        };
      });

      // ===== GÉNÉRATION DU TABLEAU =====
      autoTable(doc, {
        columns: cleanColumns,
        body: cleanData,
        startY: yPosition,
        margin: { left: margin, right: margin, top: 2, bottom: 10 },
        styles: styles,
        headStyles: headStyles,
        alternateRowStyles: alternateRowStyles,
        columnStyles: columnStyles,
        tableWidth: 'auto',
        didDrawPage: function(data) {
          const pageNumber = data.pageNumber;
          const totalPages = doc.internal.getNumberOfPages();

          // Footer
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor('#999999');

          // Ligne de séparation footer
          doc.setDrawColor('#E8E0D8');
          doc.setLineWidth(0.2);
          doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

          // Texte footer
          const footerLeft = `${companyName} - ${new Date().getFullYear()}`;
          doc.text(footerLeft, margin, pageHeight - 7);

          const footerCenter = `Page ${pageNumber} / ${totalPages}`;
          doc.text(footerCenter, pageWidth / 2, pageHeight - 7, { align: 'center' });

          const footerRight = `Imprimé le ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
          doc.text(footerRight, pageWidth - margin, pageHeight - 7, { align: 'right' });
        },
        didParseCell: function(data) {
          // Tronquer les textes trop longs
          if (data.cell && data.cell.raw && typeof data.cell.raw === 'string' && data.cell.raw.length > 60) {
            data.cell.raw = data.cell.raw.substring(0, 57) + '...';
          }
          // Formatage des nombres
          if (data.section === 'body' && data.column && typeof data.cell.raw === 'number') {
            data.cell.raw = data.cell.raw.toLocaleString();
          }
        }
      });

      // ===== TÉLÉCHARGEMENT =====
      setTimeout(() => {
        try {
          doc.save(filename);
          resolve({ success: true, filename, rowCount: exportData.length });
        } catch (saveError) {
          reject(saveError);
        }
      }, 150);

    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      reject(error);
    }
  });
};

/**
 * Exporte un tableau simple au format PDF
 */
export const exportTableToPDF = async ({
  title,
  headers,
  rows,
  filename = 'tableau.pdf',
  userName = 'Utilisateur',
  summary = null
}) => {
  if (!headers || headers.length === 0) {
    throw new Error('Aucun en-tête défini');
  }

  const columns = headers.map(header => ({
    label: header,
    accessor: header.toLowerCase().replace(/ /g, '_'),
    align: 'left'
  }));

  const data = rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      const key = header.toLowerCase().replace(/ /g, '_');
      obj[key] = row[index] !== undefined ? String(row[index]) : '';
    });
    return obj;
  });

  return exportPDF({
    title,
    columns,
    data,
    filename,
    userName,
    summary
  });
};

/**
 * Export simple de données
 */
export const exportDataToPDF = (data, columns, title, filename) => {
  return exportPDF({
    title: title || 'Export PDF',
    columns: columns || [],
    data: data || [],
    filename: filename || 'export.pdf'
  });
};

export default exportPDF;