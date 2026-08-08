/**
 * Production E2E: Admin creates user → temp password → logout → new user login → permissions.
 * Usage: node scripts/user-login-flow-e2e.mjs
 */
import { chromium } from 'playwright';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://larte-del-dolce-erp.vercel.app';
const API_URL = (process.env.VITE_API_URL || 'https://larte-del-dolce-erp-production.up.railway.app/api').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'madina7ali7@gmail.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '123456';
const TEST_EMAIL = process.env.E2E_NEW_USER_EMAIL || 'muhamedelseed203@gmail.com';

const results = { api: {}, ui: {}, errors: [], ready: false };

async function apiJson(path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json, ok: res.ok };
}

function fail(msg) {
  results.errors.push(msg);
}

async function runApiFlow() {
  const adminLogin = await apiJson('/login', {
    method: 'POST',
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  results.api.adminLogin = adminLogin.status;
  const adminToken = adminLogin.json?.data?.token;
  if (!adminLogin.ok || !adminToken) {
    fail(`Admin login failed: HTTP ${adminLogin.status}`);
    return null;
  }

  const search = await apiJson(`/users?search=${encodeURIComponent(TEST_EMAIL.split('@')[0])}&per_page=100`, {
    token: adminToken,
  });
  const users = search.json?.data?.data || [];
  const existing = users.find((u) => u.email?.toLowerCase() === TEST_EMAIL.toLowerCase());
  if (existing?.id) {
    const del = await apiJson(`/users/${existing.id}`, { method: 'DELETE', token: adminToken });
    results.api.deleteExisting = del.status;
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
  results.api.createUser = create.status;
  const tempPassword = create.json?.data?.temporary_password;
  const createdUser = create.json?.data;
  results.api.hasTemporaryPassword = Boolean(tempPassword);
  results.api.createdRoleId = createdUser?.role_id;

  if (!create.ok || !tempPassword) {
    fail(`Create user failed: HTTP ${create.status} — ${create.json?.message || 'no temp password'}`);
    return null;
  }

  const newLogin = await apiJson('/login', {
    method: 'POST',
    body: { email: TEST_EMAIL, password: tempPassword },
  });
  results.api.newUserLogin = newLogin.status;
  const newToken = newLogin.json?.data?.token;
  const newUser = newLogin.json?.data?.user;
  results.api.newUserRole = newUser?.role?.name;
  results.api.newUserRoleDisplay = newUser?.role?.display_name;

  if (!newLogin.ok || !newToken) {
    fail(`New user login failed: HTTP ${newLogin.status}`);
    return null;
  }

  results.api.usersListAsSales = (await apiJson('/users', { token: newToken })).status;
  results.api.ordersAsSales = (await apiJson('/orders', { token: newToken })).status;
  results.api.customersAsSales = (await apiJson('/customers', { token: newToken })).status;

  return { tempPassword, newToken };
}

async function runUiFlow(tempPassword) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', tempPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 30000 }).catch(() => null);
    results.ui.loginRedirect = page.url().includes('/dashboard');

    if (!results.ui.loginRedirect) {
      const alert = await page.locator('[role="alert"]').textContent().catch(() => '');
      fail(`UI login redirect failed: ${alert?.trim() || page.url()}`);
      return;
    }

    await page.goto(`${FRONTEND_URL}/dashboard/users`, { waitUntil: 'networkidle', timeout: 30000 });
    results.ui.usersPageBlocked = page.url().includes('/login') || !page.url().includes('/dashboard/users');

    await page.goto(`${FRONTEND_URL}/dashboard/roles`, { waitUntil: 'networkidle', timeout: 30000 });
    results.ui.rolesPageBlocked = page.url().includes('/login') || !page.url().includes('/dashboard/roles');

    await page.goto(`${FRONTEND_URL}/dashboard/orders`, { waitUntil: 'networkidle', timeout: 30000 });
    results.ui.ordersAccessible = page.url().includes('/dashboard/orders');

    const sidebarText = await page.locator('nav, aside').first().textContent().catch(() => '');
    results.ui.sidebarHasUsersLink = /users|المستخدمين/i.test(sidebarText);
  } finally {
    await browser.close();
  }
}

async function main() {
  if (API_URL.includes('127.0.0.1') || API_URL.includes('localhost')) {
    fail('Production API URL must not be localhost');
  }

  const apiResult = await runApiFlow();
  if (apiResult?.tempPassword) {
    await runUiFlow(apiResult.tempPassword);
  }

  results.ready =
    results.errors.length === 0 &&
    results.api.createUser === 201 &&
    results.api.newUserLogin === 200 &&
    results.api.usersListAsSales === 403 &&
    results.ui.loginRedirect === true;

  console.log(JSON.stringify(results, null, 2));
  process.exit(results.ready ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
