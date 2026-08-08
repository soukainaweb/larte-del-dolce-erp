/**
 * Full browser E2E: Admin UI create user → success modal → logout → new user login.
 */
import { chromium } from 'playwright';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://larte-del-dolce-erp.vercel.app';
const API_URL = (process.env.VITE_API_URL || 'https://larte-del-dolce-erp-production.up.railway.app/api').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'madina7ali7@gmail.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '123456';
const TEST_EMAIL = process.env.E2E_NEW_USER_EMAIL || 'muhamedelseed203@gmail.com';

const results = { steps: {}, errors: [], ready: false };

function fail(msg) {
  results.errors.push(msg);
}

async function apiJson(path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, json: await res.json(), ok: res.ok };
}

async function prepareUser() {
  const login = await apiJson('/login', { method: 'POST', body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  const token = login.json?.data?.token;
  if (!token) return;
  const search = await apiJson('/users?search=muhamed&per_page=100', { token });
  const users = search.json?.data?.data || [];
  const existing = users.find((u) => u.email?.toLowerCase() === TEST_EMAIL.toLowerCase());
  if (existing?.id) {
    await apiJson(`/users/${existing.id}`, { method: 'DELETE', token });
  }
}

async function main() {
  await prepareUser();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let capturedPassword = null;

  page.on('response', async (response) => {
    if (response.url().includes('/api/users') && response.request().method() === 'POST') {
      try {
        const body = await response.json();
        capturedPassword = body?.data?.temporary_password || capturedPassword;
      } catch { /* ignore */ }
    }
  });

  try {
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.fill('#email', ADMIN_EMAIL);
    await page.fill('#password', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    results.steps.adminLogin = true;

    await page.goto(`${FRONTEND_URL}/dashboard/users`, { waitUntil: 'networkidle', timeout: 60000 });
    results.steps.usersPage = page.url().includes('/dashboard/users');

    await page.getByRole('button', { name: /new user|مستخدم جديد|add user|إضافة مستخدم/i }).first().click();
    await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });
    results.steps.addModalOpen = true;

    await page.fill('input[name="firstName"]', 'Mohamed');
    await page.fill('input[name="lastName"]', 'said');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="phone"]', '0609720264');
    await page.selectOption('select[name="roleId"]', '4');
    await page.selectOption('select[name="status"]', 'active');

    await page.locator('form button[type="submit"]').click();
    await page.waitForSelector('code', { timeout: 15000 });

    const modalPassword = (await page.locator('code').first().textContent())?.trim();
    const tempPassword = modalPassword || capturedPassword;
    results.steps.successModal = Boolean(tempPassword);
    results.steps.tempPasswordLength = tempPassword?.length || 0;

    const modalText = await page.locator('.fixed.inset-0').last().textContent();
    results.steps.roleLabelInModal = /المندوب|Sales Representative/i.test(modalText || '');

    await page.locator('.fixed.inset-0 button').filter({ hasText: /^تم$/ }).click();

    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
    results.steps.logout = page.url().includes('/login');

    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', tempPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    results.steps.newUserLoginRedirect = page.url().includes('/dashboard');

    await page.goto(`${FRONTEND_URL}/dashboard/users`, { waitUntil: 'networkidle' });
    results.steps.usersBlockedAfterLogin = !page.url().endsWith('/dashboard/users');

    await page.goto(`${FRONTEND_URL}/dashboard/orders`, { waitUntil: 'networkidle' });
    results.steps.ordersAccessible = page.url().includes('/dashboard/orders');

    results.ready =
      results.errors.length === 0 &&
      results.steps.adminLogin &&
      results.steps.successModal &&
      results.steps.newUserLoginRedirect &&
      results.steps.ordersAccessible &&
      results.steps.roleLabelInModal;
  } catch (error) {
    fail(error.message);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
  process.exit(results.ready ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
