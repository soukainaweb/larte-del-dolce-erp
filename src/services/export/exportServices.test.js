import { describe, expect, it, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import * as XLSX from 'xlsx';
import { exportPDF } from './pdfExport';
import { exportExcel } from './excelExport';
import { createPrintContent } from './printService.test-utils';
import { prepareExportText } from '../../utils/exportText';

const saveAsMock = vi.fn();

vi.mock('file-saver', () => ({
  saveAs: (...args) => saveAsMock(...args),
}));

const arabicSample = {
  title: 'تقرير المستخدمين',
  userName: 'محمد علي',
  companyName: "L'arte ERP",
  columns: [
    { label: 'الاسم', accessor: 'fullName' },
    { label: 'البريد', accessor: 'email' },
  ],
  data: [
    { fullName: 'أحمد حسن', email: 'ahmed@example.com' },
    { fullName: 'فاطمة الزهراء', email: 'fatima@example.com' },
  ],
};

describe('export services Arabic support', () => {
  beforeEach(() => {
    saveAsMock.mockReset();
    const fontBuffer = fs.readFileSync('public/fonts/NotoSansArabic-Regular.ttf');
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      arrayBuffer: async () => fontBuffer.buffer.slice(
        fontBuffer.byteOffset,
        fontBuffer.byteOffset + fontBuffer.byteLength
      ),
    })));
  });

  it('generates a PDF export for Arabic content', async () => {
    const result = await exportPDF({
      ...arabicSample,
      filename: 'arabic-users.pdf',
    });

    expect(result.success).toBe(true);
    expect(result.filename).toBe('arabic-users.pdf');
  });

  it('writes Excel cells preserving Arabic UTF-8 strings', async () => {
    await exportExcel({
      ...arabicSample,
      filename: 'arabic-users.xlsx',
      sheetName: 'Users',
    });

    expect(saveAsMock).toHaveBeenCalledTimes(1);
    const blob = saveAsMock.mock.calls[0][0];
    const buffer = await blob.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets.Users;

    expect(sheet.A1.v).toContain('تقرير');
    expect(sheet.A6.v).toBe('الاسم');
    expect(sheet.A7.v).toBe('أحمد حسن');
  });

  it('builds print HTML with RTL direction and Arabic font', () => {
    const html = createPrintContent({
      ...arabicSample,
      subtitle: '',
      summary: null,
      dateFormat: 'dd/MM/yyyy HH:mm',
    });

    expect(html).toContain('dir="rtl"');
    expect(html).toContain('lang="ar"');
    expect(html).toContain('Noto Sans Arabic');
    expect(html).toContain(prepareExportText('أحمد حسن'));
  });
});
