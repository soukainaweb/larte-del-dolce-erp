const FONT_PATH = '/fonts/NotoSansArabic-Regular.ttf';
const FONT_FILE_NAME = 'NotoSansArabic-Regular.ttf';
const FONT_FAMILY = 'NotoSansArabic';

let cachedBase64 = null;
let loadingPromise = null;

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

export const loadArabicFontBase64 = async () => {
  if (cachedBase64) return cachedBase64;
  if (loadingPromise) return loadingPromise;

  loadingPromise = fetch(FONT_PATH)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Unable to load Arabic PDF font.');
      }
      return response.arrayBuffer();
    })
    .then((buffer) => {
      cachedBase64 = arrayBufferToBase64(buffer);
      return cachedBase64;
    })
    .finally(() => {
      loadingPromise = null;
    });

  return loadingPromise;
};

export const registerArabicPdfFont = async (doc) => {
  const base64 = await loadArabicFontBase64();
  doc.addFileToVFS(FONT_FILE_NAME, base64);
  doc.addFont(FONT_FILE_NAME, FONT_FAMILY, 'normal');
  doc.addFont(FONT_FILE_NAME, FONT_FAMILY, 'bold');
  return FONT_FAMILY;
};

export const ARABIC_PDF_FONT = FONT_FAMILY;
