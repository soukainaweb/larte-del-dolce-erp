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

export const createPrintContent = ({ title, subtitle, columns, data, userName, companyName, summary, dateFormat }) => {
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
      </head>
      <body style="font-family:${NOTO_SANS_ARABIC_FAMILY}; direction:${textDirection};">
        <div class="title">${escapeHtml(prepareExportText(title))}</div>
        <table><tbody>${tableRows}</tbody></table>
        <div>${escapeHtml(currentDate)} - Page 1 / ${totalPages}</div>
        ${summaryHTML}
      </body>
    </html>
  `;
};
