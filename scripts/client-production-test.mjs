/**
 * Comprehensive production client test — Vercel UI + Railway API.
 * Run: node scripts/client-production-test.mjs
 */
import { chromium } from 'playwright';

const FRONTEND = process.env.FRONTEND_URL || 'https://larte-del-dolce-erp.vercel.app';
const API = process.env.VITE_API_URL || 'https://larte-del-dolce-erp-production.up.railway.app/api';

const MANAGER = { email: 'manager@larte.com', password: '123456' };
const ADMIN = { email: 'madina7ali7@gmail.com', password: '123456' };

const PAGES = [
  '/dashboard',
  '/dashboard/users',
  '/dashboard/customers',
  '/dashboard/categories',
  '/dashboard/products',
  '/dashboard/suppliers',
  '/dashboard/warehouse',
  '/dashboard/inventory',
  '/dashboard/orders',
  '/dashboard/deliveries',
  '/dashboard/invoices',
  '/dashboard/payments',
  '/dashboard/expenses',
  '/dashboard/production',
  '/dashboard/notifications',
  '/dashboard/reports',
  '/dashboard/analytics',
  '/dashboard/meetings',
  '/dashboard/settings',
  '/dashboard/activity-logs',
  '/dashboard/roles',
  '/dashboard/profile',
];

async function apiLogin(creds) {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(creds),
  });
  const body = await res.json();
  return { status: res.status, token: body?.data?.token, user: body?.data?.user };
}

async function apiJson(token, method, path, data) {
  const res = await fetch(`${API}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  let body = null;
  try { body = await res.json(); } catch { /* html */ }
  return { status: res.status, body };
}

async function testManagerMeetingsApi(token) {
  const results = {};
  results.list = (await apiJson(token, 'GET', 'meetings')).status;
  const create = await apiJson(token, 'POST', 'meetings', {
    title: `Client Test ${Date.now()}`,
    meeting_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    meeting_time: '10:00',
    notes: 'Production audit meeting',
  });
  results.create = create.status;
  const meetingId = create.body?.data?.id;
  if (meetingId) {
    results.show = (await apiJson(token, 'GET', `meetings/${meetingId}`)).status;
    results.update = (await apiJson(token, 'PUT', `meetings/${meetingId}`, {
      title: `Updated ${Date.now()}`,
      description: 'Updated',
    })).status;
    results.schedule = (await apiJson(token, 'POST', `meetings/${meetingId}/schedule`)).status;
    results.session = (await apiJson(token, 'GET', `meetings/${meetingId}/session`)).status;
    results.delete = (await apiJson(token, 'DELETE', `meetings/${meetingId}`)).status;
  }
  return results;
}

async function uiLogin(page, creds) {
  await page.goto(`${FRONTEND}/login`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.fill('#email', creds.email);
  await page.fill('#password', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 30000 });
  return page.url().includes('/dashboard');
}

async function main() {
  const report = { api: {}, ui: { pages: {} }, errors: [], passed: true };

  // --- Manager API ---
  const mgr = await apiLogin(MANAGER);
  report.api.managerLogin = mgr.status;
  if (!mgr.token) {
    report.errors.push('Manager API login failed');
    report.passed = false;
  } else {
    report.api.managerMeetings = await testManagerMeetingsApi(mgr.token);
    if (report.api.managerMeetings.list !== 200) {
      report.errors.push(`Manager GET /meetings = ${report.api.managerMeetings.list}`);
      report.passed = false;
    }
    if (report.api.managerMeetings.create !== 201 && report.api.managerMeetings.create !== 200) {
      report.errors.push(`Manager POST /meetings = ${report.api.managerMeetings.create}`);
      report.passed = false;
    }
  }

  // --- Admin API login ---
  const adm = await apiLogin(ADMIN);
  report.api.adminLogin = adm.status;

  // --- UI test (manager) ---
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('/api/') && res.status() >= 400) {
      failedRequests.push({ url, status: res.status() });
    }
  });

  try {
    report.ui.login = await uiLogin(page, MANAGER);
    if (!report.ui.login) {
      report.errors.push('UI login failed');
      report.passed = false;
    }

    // Session persistence
    await page.reload({ waitUntil: 'networkidle' });
    report.ui.sessionPersisted = page.url().includes('/dashboard') && !page.url().includes('/login');

    for (const path of PAGES) {
      await page.waitForTimeout(800);
      await page.goto(`${FRONTEND}${path}`, { waitUntil: 'networkidle', timeout: 45000 });
      const ok = page.url().includes('/dashboard') && !page.url().includes('/login');
      report.ui.pages[path] = { ok, url: page.url() };
      if (!ok) {
        report.errors.push(`Page failed: ${path} → ${page.url()}`);
        report.passed = false;
      }
    }

    // Meetings page smoke
    await page.goto(`${FRONTEND}/dashboard/meetings`, { waitUntil: 'networkidle' });
    const hasMeetingsContent = await page.locator('body').textContent();
    report.ui.meetingsPageLoads = !hasMeetingsContent?.includes('403') && page.url().includes('/meetings');

    // Logout
    const logoutBtn = page.locator('button, a').filter({ hasText: /logout|تسجيل الخروج|déconnexion/i }).first();
    if (await logoutBtn.count()) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
    }
    report.ui.logout = page.url().includes('/login');
  } catch (err) {
    report.errors.push(`UI test error: ${err.message}`);
    report.passed = false;
  }

  report.consoleErrors = consoleErrors
    .filter((e) => !e.includes('favicon') && !e.includes('429'))
    .slice(0, 15);
  report.failedApiRequests = failedRequests
    .filter((r) => r.status !== 429)
    .slice(0, 20);

  if (report.failedApiRequests.some((r) => [401, 403, 404, 500].includes(r.status))) {
    report.passed = false;
  }

  await browser.close();

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.passed ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
