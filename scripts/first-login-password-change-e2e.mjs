/**
 * E2E: Admin creates Sales Rep → temp login → forced password change → dashboard.
 */
import { chromium } from 'playwright';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://larte-del-dolce-erp.vercel.app';
const API_URL = (process.env.VITE_API_URL || 'https://larte-del-dolce-erp-production.up.railway.app/api').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'madina7ali7@gmail.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '123456';
const TEST_EMAIL = process.env.E2E_NEW_USER_EMAIL || `mandoub.${Date.now()}@example.com`;
const NEW_PASSWORD = process.env.E2E_NEW_PASSWORD || 'MySecurePass1';

const results = { steps: {}, errors: [], ready: false };

function fail(msg) {
  results.errors.push(msg);
}

async function apiJson(path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json, ok: res.ok };
}

async function main() {
  let tempPassword = null;

  // Admin creates user via API (reliable setup)
  const adminLogin = await apiJson('/login', { method: 'POST', body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  const adminToken = adminLogin.json?.data?.token;
  if (!adminLogin.ok || !adminToken) {
    fail('Admin login failed');
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }

  const create = await apiJson('/users', {
    method: 'POST',
    token: adminToken,
    body: {
      first_name: 'Mohamed',
      last_name: 'said',
      email: TEST_EMAIL,
      phone: '0609720264',
      role_id: 4,
      status: 'active',
    },
  });

  results.steps.createUser = create.status;
  tempPassword = create.json?.data?.temporary_password;
  results.steps.hasTempPassword = Boolean(tempPassword);
  results.steps.mustChangePasswordOnCreate = create.json?.data?.must_change_password === true;

  if (!create.ok || !tempPassword) {
    fail(`Create user failed: ${create.status}`);
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Sales rep login with temp password
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', tempPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/change-password**', { timeout: 30000 });
    results.steps.redirectToChangePassword = page.url().includes('/change-password');

    // Blocked from dashboard before change
    await page.goto(`${FRONTEND_URL}/dashboard/orders`, { waitUntil: 'networkidle' });
    results.steps.blockedOrdersBeforeChange = page.url().includes('/change-password');

    // Change password
    await page.fill('input[name="currentPassword"], input', { timeout: 5000 }).catch(() => {});
    const currentInput = page.locator('input').nth(0);
    const newInput = page.locator('input[type="password"]').nth(1);
    const confirmInput = page.locator('input[type="password"]').nth(2);

    await page.locator('form input[type="password"]').first().fill(tempPassword);
    await page.locator('form input[type="password"]').nth(1).fill(NEW_PASSWORD);
    await page.locator('form input[type="password"]').nth(2).fill(NEW_PASSWORD);
    await page.getByRole('button', { name: /تغيير كلمة المرور|change password/i }).click();
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    results.steps.dashboardAfterChange = page.url().includes('/dashboard');

    // Old temp password rejected
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', tempPassword);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    results.steps.oldTempRejected = page.url().includes('/login');

    // New password works
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', NEW_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    results.steps.newPasswordLogin = page.url().includes('/dashboard');

    await page.goto(`${FRONTEND_URL}/dashboard/orders`, { waitUntil: 'networkidle' });
    results.steps.ordersAccessible = page.url().includes('/dashboard/orders');

    await page.goto(`${FRONTEND_URL}/dashboard/users`, { waitUntil: 'networkidle' });
    results.steps.usersBlocked = !page.url().endsWith('/dashboard/users');

    results.ready =
      results.errors.length === 0 &&
      results.steps.redirectToChangePassword &&
      results.steps.blockedOrdersBeforeChange &&
      results.steps.dashboardAfterChange &&
      results.steps.oldTempRejected &&
      results.steps.newPasswordLogin;
  } catch (error) {
    fail(error.message);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify({ ...results, testEmail: TEST_EMAIL, newPassword: NEW_PASSWORD }, null, 2));
  process.exit(results.ready ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
