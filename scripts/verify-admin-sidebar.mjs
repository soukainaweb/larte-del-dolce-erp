/**
 * Browser verification: admin session should show required ERP sidebar items.
 * Uses server-side login (no CORS) + Playwright API mocks for session bootstrap.
 *
 * Run: node scripts/verify-admin-sidebar.mjs
 */
import { chromium } from 'playwright';

const BASE_URL = process.env.APP_URL || 'http://localhost:5173';
const API_URL = process.env.VITE_API_URL || 'https://larte-del-dolce-erp-production.up.railway.app/api';
const EMAIL = process.env.ADMIN_EMAIL || 'madina7ali7@gmail.com';
const PASSWORD = process.env.ADMIN_PASSWORD || '123456';

const REQUIRED_ITEMS = [
  'meetings',
  'samples',
  'wasteReturns',
  'purchases',
  'categories',
  'products',
];

const NAV_LABELS = {
  meetings: /réunion|meeting|اجتماع/i,
  samples: /échantillon|sample|عينات|عينة/i,
  wasteReturns: /déchet|retour|waste|return|نفا|مرتج|هدر/i,
  purchases: /achat|purchase|مشتري/i,
  categories: /catégor|categor|فئ/i,
  products: /produit|product|منتج/i,
};

function normalizeUser(rawUser) {
  const role = rawUser?.role || {};
  const slug = role.name || 'admin';
  const permissions = (role.permissions || []).map((p) => (typeof p === 'string' ? p : p.name)).filter(Boolean);

  return {
    ...rawUser,
    firstName: rawUser.first_name || '',
    lastName: rawUser.last_name || '',
    fullName: rawUser.name || rawUser.email,
    role: {
      ...role,
      name: slug,
      frontendKey: slug,
      display_name: role.display_name || slug,
    },
    permissions,
  };
}

async function loginViaApi() {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: HTTP ${response.status}`);
  }

  const body = await response.json();
  const token = body?.data?.token;
  const user = normalizeUser(body?.data?.user);

  if (!token || !user) {
    throw new Error('Login response missing token or user');
  }

  return { token, user };
}

async function main() {
  const { token, user } = await loginViaApi();
  console.log('API login OK — role:', user.role?.name, '| permissions:', user.permissions.length);
  console.log('New module perms present:', REQUIRED_ITEMS.map((id) => {
    const perm = id === 'wasteReturns' ? 'waste_returns.view' : `${id}.view`;
    return `${perm}=${user.permissions.includes(perm)}`;
  }).join(', '));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleLogs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[Sidebar]') || text.includes('[DashboardLayout]')) {
      consoleLogs.push(text);
    }
  });

  await page.route(`${API_URL}/**`, async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.endsWith('/user') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { user } }),
      });
    }

    if (url.includes('/notifications')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { data: [], count: 0 } }),
      });
    }

    if (url.includes('/dashboard')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: {} }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: {} }),
    });
  });

  await page.addInitScript(({ authToken, authUser }) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(authUser));
  }, { authToken: token, authUser: user });

  console.log(`Opening ${BASE_URL}/dashboard ...`);
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  if (page.url().includes('/login')) {
    throw new Error('Session bootstrap failed — redirected to login');
  }

  const sidebarText = await page.locator('aside nav').first().innerText();

  console.log('\n--- Captured debug logs ---');
  consoleLogs.forEach((line) => console.log(line));

  console.log('\n--- Sidebar visibility check ---');
  const results = {};
  for (const id of REQUIRED_ITEMS) {
    results[id] = NAV_LABELS[id].test(sidebarText);
    console.log(`${id}: ${results[id] ? 'FOUND' : 'MISSING'}`);
  }

  const allFound = Object.values(results).every(Boolean);
  if (!allFound) {
    console.error('\nFAILED: Not all required admin sidebar items are visible.');
    console.error('Sidebar text preview:\n', sidebarText.slice(0, 1200));
    await browser.close();
    process.exit(1);
  }

  console.log('\nPASSED: All required admin sidebar items are visible in the browser.');
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
