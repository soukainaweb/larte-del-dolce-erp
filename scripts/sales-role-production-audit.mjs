/**
 * Production audit: every user with role `sales` gets identical permissions and workspace.
 * Usage: node scripts/sales-role-production-audit.mjs
 */
import { chromium } from 'playwright';

const API = (process.env.VITE_API_URL || 'https://larte-del-dolce-erp-production.up.railway.app/api').replace(/\/$/, '');
const FRONTEND = process.env.FRONTEND_URL || 'https://larte-del-dolce-erp.vercel.app';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'madina7ali7@gmail.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '123456';
const AUDIT_PASSWORD = process.env.E2E_AUDIT_PASSWORD || 'SalesAuditPass1!';

const EXPECTED_PERMISSIONS = [
  'dashboard.view', 'notifications.view',
  'orders.view', 'orders.create', 'orders.update',
  'customers.view', 'customers.create', 'customers.update',
  'meetings.view', 'meetings.create', 'meetings.update',
  'samples.view', 'samples.create', 'samples.update',
].sort();

const AUTHORIZED_API = ['/orders?per_page=1', '/customers?per_page=1', '/meetings?per_page=1', '/samples?per_page=1', '/notifications?per_page=1'];
const UNAUTHORIZED_API = ['/products?per_page=1', '/users?per_page=1', '/roles', '/settings', '/inventory?per_page=1', '/suppliers?per_page=1', '/productions?per_page=1', '/reports/sales-overview', '/activity-logs?per_page=1', '/finance/metrics'];

const UNAUTHORIZED_PATHS = [
  '/dashboard/products', '/dashboard/products/1',
  '/dashboard/users', '/dashboard/roles', '/dashboard/settings', '/dashboard/inventory',
  '/dashboard/suppliers', '/dashboard/production', '/dashboard/warehouse', '/dashboard/reports',
  '/dashboard/analytics', '/dashboard/payments', '/dashboard/expenses', '/dashboard/finance',
  '/dashboard/invoices', '/dashboard/activity-logs',
];

const results = {
  rolePermissions: [],
  usersTested: [],
  newUserAudit: null,
  hardcodedEmailInApp: false,
  errors: [],
  ready: false,
};

function fail(msg) {
  results.errors.push(msg);
}

async function api(path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: res.status, json, ok: res.ok };
}

function extractPermissions(user) {
  const perms = user?.role?.permissions || [];
  return perms.map((p) => (typeof p === 'string' ? p : p?.name)).filter(Boolean).sort();
}

async function adminToken() {
  const login = await api('/login', { method: 'POST', body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  if (!login.ok) throw new Error(`Admin login failed: ${login.status}`);
  return login.json?.data?.token;
}

async function prepareSalesUser(token, userId, email, existingPassword) {
  if (existingPassword) {
    const login = await api('/login', { method: 'POST', body: { email, password: existingPassword } });
    if (login.ok) return { email, password: existingPassword, login: login.json?.data };
  }

  const reset = await api(`/users/${userId}/reset-password`, { method: 'POST', token });
  const temp = reset.json?.data?.temporary_password;
  if (!reset.ok || !temp) throw new Error(`Reset failed for ${email}: ${reset.status}`);

  const login = await api('/login', { method: 'POST', body: { email, password: temp } });
  const salesToken = login.json?.data?.token;
  if (!login.ok || !salesToken) throw new Error(`Temp login failed for ${email}`);

  const change = await api('/profile/password', {
    method: 'PUT',
    token: salesToken,
    body: {
      current_password: temp,
      password: AUDIT_PASSWORD,
      password_confirmation: AUDIT_PASSWORD,
    },
  });
  if (!change.ok) throw new Error(`Password change failed for ${email}`);

  const finalLogin = await api('/login', { method: 'POST', body: { email, password: AUDIT_PASSWORD } });
  if (!finalLogin.ok) throw new Error(`Final login failed for ${email}`);
  return { email, password: AUDIT_PASSWORD, login: finalLogin.json?.data };
}

async function auditSalesUser({ email, password, userId }, token, runUi = false) {
  const session = await prepareSalesUser(token, userId, email, password);
  const user = session.login.user;
  const salesToken = session.login.token;
  const perms = extractPermissions(user);
  const roleName = user?.role?.name;

  const userResult = {
    email,
    userId: user?.id,
    role: roleName,
    frontendRoleKey: roleName === 'sales' ? 'sales_rep' : roleName,
    permissions: perms,
    permissionsMatch: JSON.stringify(perms) === JSON.stringify(EXPECTED_PERMISSIONS),
    api: { authorized: {}, unauthorized: {} },
    ui: null,
  };

  if (roleName !== 'sales') fail(`${email}: role is ${roleName}, expected sales`);
  if (!userResult.permissionsMatch) {
    fail(`${email}: permissions mismatch. Missing: ${EXPECTED_PERMISSIONS.filter((p) => !perms.includes(p)).join(', ')} Extra: ${perms.filter((p) => !EXPECTED_PERMISSIONS.includes(p)).join(', ')}`);
  }

  for (const path of AUTHORIZED_API) {
    const res = await api(path, { token: salesToken });
    userResult.api.authorized[path] = res.status;
    if (res.status !== 200) fail(`${email}: authorized ${path} returned ${res.status}`);
  }

  for (const path of UNAUTHORIZED_API) {
    const res = await api(path, { token: salesToken });
    userResult.api.unauthorized[path] = res.status;
    if (res.status !== 403) fail(`${email}: unauthorized ${path} returned ${res.status}, expected 403`);
  }

  if (runUi) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await page.goto(`${FRONTEND}/login`, { waitUntil: 'networkidle', timeout: 60000 });
      await page.fill('#email', email);
      await page.fill('#password', session.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/, { timeout: 30000 });

      const header = await page.locator('header').innerText();
      userResult.ui = {
        arabicRole: header.includes('المندوب'),
        englishRole: header.includes('Sales Representative'),
        usersBlocked: null,
        samplesOk: null,
      };
      if (!userResult.ui.arabicRole) fail(`${email}: header missing المندوب`);
      if (userResult.ui.englishRole) fail(`${email}: header shows English Sales Representative`);

      await page.goto(`${FRONTEND}/dashboard/users`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      userResult.ui.usersBlocked = new URL(page.url()).pathname === '/dashboard';

      await page.goto(`${FRONTEND}/dashboard/products`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      userResult.ui.productsBlocked = new URL(page.url()).pathname === '/dashboard';

      await page.goto(`${FRONTEND}/dashboard/products/1`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      userResult.ui.productDetailBlocked = new URL(page.url()).pathname === '/dashboard';

      await page.goto(`${FRONTEND}/dashboard/samples`, { waitUntil: 'networkidle' });
      userResult.ui.samplesOk = page.url().includes('/dashboard/samples');

      if (!userResult.ui.usersBlocked) fail(`${email}: /dashboard/users not blocked`);
      if (!userResult.ui.productsBlocked) fail(`${email}: /dashboard/products not blocked`);
      if (!userResult.ui.productDetailBlocked) fail(`${email}: /dashboard/products/1 not blocked`);
      if (!userResult.ui.samplesOk) fail(`${email}: /dashboard/samples not accessible`);
    } finally {
      await browser.close();
    }
  }

  return userResult;
}

async function main() {
  const token = await adminToken();

  const rolePerms = await api('/roles/4/permissions', { token });
  results.rolePermissions = (rolePerms.json?.data || []).map((p) => p.name).sort();
  if (JSON.stringify(results.rolePermissions) !== JSON.stringify(EXPECTED_PERMISSIONS)) {
    fail(`Role sales permissions on server do not match DefaultRolePermissions`);
  }

  const usersResp = await api('/users?role=4&per_page=100', { token });
  const salesUsers = usersResp.json?.data?.data || [];

  // Pick 3 diverse existing sales users (by id, not hardcoded authorization logic)
  const pick = salesUsers
    .filter((u) => u.status !== 'inactive')
    .sort((a, b) => a.id - b.id)
    .slice(0, 3);

  if (pick.length < 3) fail(`Fewer than 3 active sales users in production (${pick.length})`);

  // UI audit on first user only; API audit on all 3
  for (let i = 0; i < pick.length; i++) {
    const u = pick[i];
    const existingPassword = u.email === 'muhamedelseed203@gmail.com' ? 'MySecurePass1' : null;
    try {
      const audited = await auditSalesUser(
        { email: u.email, userId: u.id, password: existingPassword },
        token,
        i === 0,
      );
      results.usersTested.push(audited);
    } catch (err) {
      fail(`Audit failed for ${u.email}: ${err.message}`);
    }
  }

  // Create new sales user and verify identical permissions
  const newEmail = `sales.audit.${Date.now()}@example.com`;
  const create = await api('/users', {
    method: 'POST',
    token,
    body: {
      first_name: 'Audit',
      last_name: 'Sales',
      email: newEmail,
      phone: '0600000000',
      role_id: 4,
      status: 'active',
    },
  });
  if (!create.ok) {
    fail(`Create new sales user failed: ${create.status}`);
  } else {
    const temp = create.json?.data?.temporary_password;
    const newUserId = create.json?.data?.id;
    try {
      const audited = await auditSalesUser({ email: newEmail, userId: newUserId, password: null }, token, false);
      results.newUserAudit = audited;
      results.usersTested.push({ ...audited, isNewUser: true });
    } catch (err) {
      fail(`New user audit failed: ${err.message}`);
    }
  }

  // Verify production bundle has no email-based sales workspace logic
  const indexHtml = await fetch(`${FRONTEND}/`).then((r) => r.text());
  const bundleMatch = indexHtml.match(/assets\/index-[^"]+\.js/);
  if (bundleMatch) {
    const bundle = await fetch(`${FRONTEND}/${bundleMatch[0]}`).then((r) => r.text());
    results.hardcodedEmailInApp = bundle.includes('muhamedelseed203@gmail.com');
    if (results.hardcodedEmailInApp) fail('Production frontend bundle contains hardcoded muhamedelseed203@gmail.com');
  }

  results.ready = results.errors.length === 0;
  console.log(JSON.stringify(results, null, 2));
  process.exit(results.ready ? 0 : 1);
}

main().catch((err) => {
  fail(err.message);
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
});
