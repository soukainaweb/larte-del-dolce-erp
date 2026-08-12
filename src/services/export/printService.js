// src/services/export/printService.js
import { format } from 'date-fns';
import {
  containsArabic,
  escapeHtml,
  getTextAlignment,
  NOTO_SANS_ARABIC_FAMILY,
  NOTO_SANS_ARABIC_FONT_URL,
  prepareExportText,
  shouldUseRtlLayout,
} from '../../utils/exportText';

/**
 * Service d'impression professionnel
 */
export const printData = async ({
  title = 'Rapport',
  subtitle = '',
  columns = [],
  data = [],
  userName = 'Utilisateur',
  companyName = "L'arte ERP",
  summary = null,
  rowFormatter = null,
  dateFormat = 'dd/MM/yyyy HH:mm'
}) => {
  return new Promise((resolve, reject) => {
    try {
      // Préparer les données
      let printData = data;
      if (rowFormatter) {
        printData = data.map(rowFormatter);
      }

      // Créer le contenu HTML
      const printContent = createPrintContent({
        title,
        subtitle,
        columns,
        data: printData,
        userName,
        companyName,
        summary,
        dateFormat
      });

      // Ouvrir la fenêtre d'impression
      const printWindow = window.open('', '_blank', 'width=1200,height=800,menubar=no,toolbar=no,location=no,status=no');
      if (!printWindow) {
        throw new Error('Impossible d\'ouvrir la fenêtre d\'impression');
      }

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Attendre le chargement puis imprimer
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          // Fermer automatiquement après impression
          setTimeout(() => {
            printWindow.close();
          }, 1000);
          resolve({ success: true, rowCount: printData.length });
        }, 500);
      };

    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      reject(error);
    }
  });
};

/**
 * Crée le contenu HTML pour l'impression
 */
const createPrintContent = ({ title, subtitle, columns, data, userName, companyName, summary, dateFormat }) => {
  const currentDate = format(new Date(), dateFormat);
  const totalPages = Math.ceil(data.length / 25);
  const previewValues = [
    title,
    subtitle,
    userName,
    companyName,
    ...columns.map((col) => col.label),
    ...data.flatMap((row) => columns.map((col) => row[col.accessor])),
  ];
  const useRtl = shouldUseRtlLayout(previewValues);
  const textDirection = useRtl ? 'rtl' : 'ltr';
  const textAlignDefault = useRtl ? 'right' : 'left';

  let summaryHTML = '';
  if (summary && Object.keys(summary).length > 0) {
    const summaryKeys = Object.keys(summary);
    summaryHTML = `
      <div class="summary-container">
        ${summaryKeys.map(key => `
          <div class="summary-card">
            <div class="summary-label">${escapeHtml(prepareExportText(key))}</div>
            <div class="summary-value">${escapeHtml(prepareExportText(typeof summary[key] === 'number' ? summary[key].toLocaleString() : summary[key]))}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  let tableRows = '';
  data.forEach(row => {
    tableRows += `<tr>`;
    columns.forEach(col => {
      let value = row[col.accessor];
      if (col.printFormatter) {
        value = col.printFormatter(value, row);
      }
      const displayValue = escapeHtml(prepareExportText(value !== undefined && value !== null ? value : ''));
      const align = getTextAlignment(value, textAlignDefault);
      tableRows += `<td style="text-align:${align}; direction:${containsArabic(value) ? 'rtl' : 'inherit'};">${displayValue}</td>`;
    });
    tableRows += `</tr>`;
  });

  return `
    <!DOCTYPE html>
    <html dir="${textDirection}" lang="${useRtl ? 'ar' : 'en'}">
      <head>
        <meta charset="UTF-8">
        <title>${escapeHtml(prepareExportText(title))}</title>
        <link rel="stylesheet" href="${NOTO_SANS_ARABIC_FONT_URL}">
        <style>
          /* Reset et styles de base */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: ${NOTO_SANS_ARABIC_FAMILY};
            background: #FFFFFF;
            padding: 30px 40px;
            color: #2B2B2B;
            font-size: 12px;
            line-height: 1.5;
            direction: ${textDirection};
            text-align: ${textAlignDefault};
          }

          /* En-tête */
          .print-header {
            border-bottom: 3px solid #B8863B;
            padding-bottom: 20px;
            margin-bottom: 25px;
            text-align: center;
          }

          .print-header .company {
            font-family: 'Cormorant Garamond', serif;
            font-size: 28px;
            color: #B8863B;
            font-weight: 700;
          }

          .print-header .title {
            font-size: 18px;
            color: #2B2B2B;
            font-weight: 600;
            margin-top: 5px;
          }

          .print-header .subtitle {
            font-size: 13px;
            color: #6D6D6D;
            margin-top: 3px;
          }

          .print-header .meta {
            font-size: 11px;
            color: #6D6D6D;
            margin-top: 10px;
          }

          .print-header .meta span {
            margin: 0 12px;
          }

          /* Résumé */
          .summary-container {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 25px;
            padding: 15px;
            background: #F8F7F4;
            border-radius: 8px;
          }

          .summary-card {
            flex: 1;
            min-width: 100px;
            background: #FFFFFF;
            padding: 10px 15px;
            border-radius: 6px;
            border: 1px solid #E8E0D8;
          }

          .summary-label {
            font-size: 10px;
            color: #6D6D6D;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .summary-value {
            font-size: 16px;
            font-weight: 700;
            color: #2B2B2B;
            margin-top: 2px;
          }

          /* Tableau */
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 11px;
          }

          .print-table thead {
            background: #B8863B;
            color: #FFFFFF;
          }

          .print-table thead th {
            padding: 8px 10px;
            text-align: ${textAlignDefault};
            font-weight: 600;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .print-table tbody tr:nth-child(even) {
            background: #F8F7F4;
          }

          .print-table tbody td {
            padding: 6px 10px;
            border-bottom: 1px solid #E8E0D8;
            text-align: ${textAlignDefault};
          }

          /* Badges */
          .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 600;
          }

          .badge-success {
            background: #E8F5E9;
            color: #2E7D32;
          }

          .badge-danger {
            background: #FFEBEE;
            color: #C62828;
          }

          .badge-warning {
            background: #FFF8E1;
            color: #F57F17;
          }

          .badge-info {
            background: #E3F2FD;
            color: #1565C0;
          }

          /* Footer */
          .print-footer {
            text-align: center;
            font-size: 10px;
            color: #6D6D6D;
            border-top: 1px solid #E8E0D8;
            padding-top: 15px;
            margin-top: 30px;
          }

          /* Print optimizations */
          @media print {
            body {
              padding: 20px 25px;
            }

            .no-print {
              display: none !important;
            }

            .print-table {
              font-size: 9px;
            }

            .print-table thead th {
              padding: 5px 8px;
              font-size: 9px;
            }

            .print-table tbody td {
              padding: 4px 8px;
            }

            .print-header .company {
              font-size: 22px;
            }

            .print-header .title {
              font-size: 15px;
            }

            .summary-card {
              padding: 6px 10px;
            }

            .summary-value {
              font-size: 13px;
            }

            .print-footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 10px 40px;
              margin: 0;
            }
          }

          /* Page break */
          .page-break {
            page-break-after: always;
          }

          /* Responsive */
          @media screen and (max-width: 768px) {
            body {
              padding: 15px;
            }

            .print-table {
              font-size: 9px;
            }

            .print-table thead th,
            .print-table tbody td {
              padding: 4px 6px;
            }

            .summary-container {
              flex-direction: column;
              gap: 8px;
            }

            .summary-card {
              min-width: auto;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="print-header">
          <div class="company">${escapeHtml(prepareExportText(companyName))}</div>
          <div class="title">${escapeHtml(prepareExportText(title))}</div>
          ${subtitle ? `<div class="subtitle">${escapeHtml(prepareExportText(subtitle))}</div>` : ''}
          <div class="meta">
            <span>${escapeHtml(currentDate)}</span>
            <span>${escapeHtml(prepareExportText(userName))}</span>
            <span>${data.length}</span>
          </div>
        </div>

        <!-- Summary -->
        ${summaryHTML}

        <!-- Tableau -->
        <table class="print-table">
          <thead>
            <tr>
              ${columns.map(col => `<th style="text-align:${getTextAlignment(col.label, textAlignDefault)};">${escapeHtml(prepareExportText(col.label))}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <!-- Footer -->
        <div class="print-footer">
          <div>${escapeHtml(prepareExportText(companyName))} - © ${new Date().getFullYear()}</div>
          <div style="margin-top: 5px; font-size: 9px;">
            ${escapeHtml(currentDate)} - Page 1 / ${totalPages}
          </div>
        </div>
      </body>
    </html>
  `;
};

export default printData;