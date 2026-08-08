import { chromium } from 'playwright';

const PREVIEW_URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const API_URL = process.env.VITE_API_URL || 'https://larte-del-dolce-erp-production.up.railway.app/api';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const loginResponses = [];
  page.on('response', (response) => {
    if (response.url().includes('/login')) {
      loginResponses.push({ url: response.url(), status: response.status() });
    }
  });

  await page.goto(`${PREVIEW_URL}/login`, { waitUntil: 'networkidle' });

  await page.fill('#email', 'manager@larte.com');
  await page.fill('#password', '123456');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => null);

  const currentUrl = page.url();
  const hasDashboard = currentUrl.includes('/dashboard');
  const errorText = await page.locator('[role="alert"]').textContent().catch(() => '');

  console.log(JSON.stringify({
    previewUrl: PREVIEW_URL,
    apiUrl: API_URL,
    loginResponses,
    currentUrl,
    hasDashboard,
    errorText: errorText?.trim() || null,
  }, null, 2));

  await browser.close();
  process.exit(hasDashboard ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
