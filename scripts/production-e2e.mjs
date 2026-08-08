/**
 * Production smoke test — Vercel frontend + Railway API.
 * Usage: node scripts/production-e2e.mjs
 */
import { chromium } from 'playwright';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://larte-del-dolce-erp.vercel.app';
const API_URL = process.env.VITE_API_URL || 'https://larte-del-dolce-erp-production.up.railway.app/api';
const LOGIN_EMAIL = process.env.E2E_EMAIL || 'manager@larte.com';
const LOGIN_PASSWORD = process.env.E2E_PASSWORD || '123456';

const ROUTES = [
  '/dashboard',
  '/dashboard/orders',
  '/dashboard/customers',
  '/dashboard/products',
  '/dashboard/categories',
  '/dashboard/inventory',
  '/dashboard/warehouse',
  '/dashboard/suppliers',
  '/dashboard/deliveries',
  '/dashboard/invoices',
  '/dashboard/payments',
  '/dashboard/expenses',
  '/dashboard/production',
  '/dashboard/finance',
  '/dashboard/reports',
  '/dashboard/analytics',
  '/dashboard/notifications',
  '/dashboard/profile',
];

async function apiLogin() {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD }),
  });
  const body = await res.json();
  return { status: res.status, token: body?.data?.token, ok: res.ok };
}

async function apiProbe(token, path) {
  const res = await fetch(`${API_URL}/${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return res.status;
}

async function main() {
  const results = { api: {}, ui: {}, errors: [] };

  // --- API layer ---
  const login = await apiLogin();
  results.api.login = login.status;
  if (!login.ok || !login.token) {
    results.errors.push(`API login failed: ${login.status}`);
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }

  const endpoints = [
    'dashboard/stats',
    'orders',
    'customers',
    'products',
    'categories',
    'meetings',
    'notifications',
    'users',
    'suppliers',
    'warehouses',
    'inventory',
    'invoices',
    'payments',
    'expenses',
    'deliveries',
    'productions',
    'reports/sales-overview',
    'analytics/metrics',
  ];

  for (const ep of endpoints) {
    results.api[ep] = await apiProbe(login.token, ep);
  }

  // --- UI layer ---
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.fill('#email', LOGIN_EMAIL);
  await page.fill('#password', LOGIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 30000 }).catch(() => null);

  results.ui.loginRedirect = page.url().includes('/dashboard');
  if (!results.ui.loginRedirect) {
    const alert = await page.locator('[role="alert"]').textContent().catch(() => '');
    results.errors.push(`UI login failed: ${alert?.trim() || page.url()}`);
  }

  for (const route of ROUTES) {
    const path = route;
    try {
      await page.goto(`${FRONTEND_URL}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
      results.ui[path] = {
        ok: !page.url().includes('/login'),
        url: page.url(),
      };
    } catch (error) {
      results.ui[path] = { ok: false, error: error.message };
      results.errors.push(`Route ${path}: ${error.message}`);
    }
  }

  results.consoleErrors = consoleErrors.filter(
    (e) => !e.includes('favicon') && !e.includes('404')
  ).slice(0, 10);

  await browser.close();

  console.log(JSON.stringify(results, null, 2));
  const failed = results.errors.length > 0 || !results.ui.loginRedirect;
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
