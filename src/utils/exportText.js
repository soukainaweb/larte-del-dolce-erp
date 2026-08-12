import ArabicReshaper from 'arabic-persian-reshaper';

const ARABIC_CHAR_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

export const containsArabic = (value) => {
  if (value === null || value === undefined) return false;
  return ARABIC_CHAR_RE.test(String(value));
};

export const containsArabicInValues = (values = []) =>
  values.some((value) => containsArabic(value));

export const prepareArabicText = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (!containsArabic(text)) return text;
  return ArabicReshaper.ArabicShaper.convertArabic(text);
};

export const prepareExportText = (value) => prepareArabicText(value);

export const getTextAlignment = (value, fallback = 'left') =>
  containsArabic(value) ? 'right' : fallback;

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const shouldUseRtlLayout = (texts = []) => containsArabicInValues(texts);

export const NOTO_SANS_ARABIC_FAMILY = "'Noto Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif";

export const NOTO_SANS_ARABIC_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap';
