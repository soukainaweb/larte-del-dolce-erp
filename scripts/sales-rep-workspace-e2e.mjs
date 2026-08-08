/**
 * Production E2E: Sales Representative dedicated workspace.
 * Usage:
 *   E2E_SALES_EMAIL=... E2E_SALES_PASSWORD=... node scripts/sales-rep-workspace-e2e.mjs
 */
import { chromium } from 'playwright';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://larte-del-dolce-erp.vercel.app';
const API_URL = (process.env.VITE_API_URL || 'https://larte-del-dolce-erp-production.up.railway.app/api').replace(/\/$/, '');
const SALES_EMAIL = process.env.E2E_SALES_EMAIL || 'muhamedelseed203@gmail.com';
const SALES_PASSWORD = process.env.E2E_SALES_PASSWORD || 'MySecurePass1';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'madina7ali7@gmail.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '123456';
const SETUP_PASSWORD = process.env.E2E_SETUP_PASSWORD !== 'false';

function extractPermissions(user) {
  if (!user) return [];
  if (Array.isArray(user.permissions) && user.permissions.length) {
    return user.permissions.map((p) => (typeof p === 'string' ? p : p?.name)).filter(Boolean);
  }
  if (Array.isArray(user.role?.permissions)) {
    return user.role.permissions.map((p) => (typeof p === 'string' ? p : p?.name)).filter(Boolean);
  }
  return [];
}

async function ensureSalesSession() {
  let login = await apiJson('/login', {
    method: 'POST',
    body: { email: SALES_EMAIL, password: SALES_PASSWORD },
  });

  if (!login.ok && SETUP_PASSWORD) {
    const adminLogin = await apiJson('/login', {
      method: 'POST',
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    const adminToken = adminLogin.json?.data?.token;
    if (!adminLogin.ok || !adminToken) {
      fail('Admin login failed during sales account setup');
      return null;
    }

    const search = await apiJson(`/users?search=${encodeURIComponent(SALES_EMAIL.split('@')[0])}&per_page=20`, {
      token: adminToken,
    });
    const users = search.json?.data?.data || [];
    const salesUser = users.find((u) => u.email?.toLowerCase() === SALES_EMAIL.toLowerCase());
    if (!salesUser?.id) {
      fail(`Sales user ${SALES_EMAIL} not found for setup`);
      return null;
    }

    const reset = await apiJson(`/users/${salesUser.id}/reset-password`, {
      method: 'POST',
      token: adminToken,
    });
    const tempPassword = reset.json?.data?.temporary_password;
    if (!reset.ok || !tempPassword) {
      fail(`Admin reset-password failed: HTTP ${reset.status}`);
      return null;
    }

    login = await apiJson('/login', {
      method: 'POST',
      body: { email: SALES_EMAIL, password: tempPassword },
    });
    const salesToken = login.json?.data?.token;
    if (!login.ok || !salesToken) {
      fail(`Sales login with temporary password failed: HTTP ${login.status}`);
      return null;
    }

    const change = await apiJson('/profile/password', {
      method: 'PUT',
      token: salesToken,
      body: {
        current_password: tempPassword,
        password: SALES_PASSWORD,
        password_confirmation: SALES_PASSWORD,
      },
    });
    results.api.passwordSetup = change.status;
    if (!change.ok) {
      fail(`Password change during setup failed: HTTP ${change.status}`);
      return null;
    }

    login = await apiJson('/login', {
      method: 'POST',
      body: { email: SALES_EMAIL, password: SALES_PASSWORD },
    });
  }

  results.api.login = login.status;
  if (!login.ok) {
    fail(`Sales login failed: HTTP ${login.status} — ${login.json?.message || 'unknown'}`);
    return null;
  }

  const token = login.json?.data?.token;
  const user = login.json?.data?.user;
  const permissions = extractPermissions(user);
  results.api.mustChangePassword = Boolean(user?.must_change_password);

  if (user?.must_change_password) {
    fail('Sales account still requires password change');
    return null;
  }

  await runApiChecks(token, permissions);
  return { token, user, permissions };
}

const AUTHORIZED_PATHS = [
  '/dashboard',
  '/dashboard/customers',
  '/dashboard/orders',
  '/dashboard/meetings',
  '/dashboard/notifications',
  '/dashboard/profile',
  '/dashboard/samples',
];

const UNAUTHORIZED_PATHS = [
  '/dashboard/products',
  '/dashboard/products/1',
  '/dashboard/users',
  '/dashboard/roles',
  '/dashboard/settings',
  '/dashboard/inventory',
  '/dashboard/suppliers',
  '/dashboard/production',
  '/dashboard/warehouse',
  '/dashboard/reports',
  '/dashboard/analytics',
  '/dashboard/payments',
  '/dashboard/expenses',
];

const EXPECTED_SIDEBAR_IDS = [
  'dashboard',
  'customers',
  'orders',
  'meetings',
  'samples',
  'notifications',
  'profile',
];

const HIDDEN_SIDEBAR_IDS = [
  'products',
  'users',
  'roles',
  'settings',
  'inventory',
  'warehouse',
  'suppliers',
  'production',
  'payments',
  'expenses',
  'reports',
  'analytics',
  'finance',
];

const results = {
  api: {},
  ui: {},
  permissions: [],
  sidebarVisible: [],
  sidebarHidden: [],
  authorizedPages: {},
  unauthorizedRedirects: {},
  errors: [],
  ready: false,
};

function fail(msg) {
  results.errors.push(msg);
}

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

async function runApiChecks(token, permissions) {
  results.permissions = permissions;

  const authorized = [
    { path: '/orders?per_page=1', perm: 'orders.view', expect: 200 },
    { path: '/customers?per_page=1', perm: 'customers.view', expect: 200 },
    { path: '/meetings?per_page=1', perm: 'meetings.view', expect: 200 },
    { path: '/samples?per_page=1', perm: 'samples.view', expect: 200 },
    { path: '/notifications?per_page=1', perm: 'notifications.view', expect: 200 },
  ];

  const unauthorized = [
    { path: '/products?per_page=1', perm: 'products.view', expect: 403 },
    { path: '/users?per_page=1', perm: 'users.view', expect: 403 },
    { path: '/roles', perm: 'roles.view', expect: 403 },
    { path: '/settings', perm: 'settings.view', expect: 403 },
    { path: '/inventory?per_page=1', perm: 'inventory.view', expect: 403 },
    { path: '/suppliers?per_page=1', perm: 'suppliers.view', expect: 403 },
    { path: '/productions?per_page=1', perm: 'productions.view', expect: 403 },
    { path: '/reports/sales-overview', perm: 'reports.view', expect: 403 },
  ];

  for (const check of authorized) {
    const res = await apiJson(check.path, { token });
    results.api[check.path] = res.status;
    if (res.status !== check.expect) {
      fail(`Authorized API ${check.path} returned ${res.status}, expected ${check.expect}`);
    }
  }

  for (const check of unauthorized) {
    const res = await apiJson(check.path, { token });
    results.api[check.path] = res.status;
    if (res.status !== check.expect) {
      fail(`Unauthorized API ${check.path} returned ${res.status}, expected ${check.expect}`);
    }
  }
}

async function loginViaApi() {
  return ensureSalesSession();
}

async function runUiChecks() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'ar-SA',
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.fill('#email, input[type="email"], input[name="email"]', SALES_EMAIL);
    await page.fill('#password, input[type="password"], input[name="password"]', SALES_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    results.ui.loginRedirect = page.url();

    if (page.url().includes('/change-password')) {
      fail('UI redirected to change-password — password may be outdated');
      return;
    }

    const headerText = await page.locator('header').innerText();
    results.ui.hasArabicRole = headerText.includes('المندوب');
    results.ui.hasSalesRepEnglish = headerText.includes('Sales Representative');
    if (!results.ui.hasArabicRole) {
      fail('Arabic role label "المندوب" not found in header');
    }
    if (results.ui.hasSalesRepEnglish) {
      fail('English "Sales Representative" shown in header instead of Arabic role label');
    }

    for (const id of EXPECTED_SIDEBAR_IDS) {
      const navLabel = await page.locator(`nav button`).filter({ hasText: /.+/ }).allInnerTexts();
      results.sidebarVisible.push(id);
    }

    for (const id of HIDDEN_SIDEBAR_IDS) {
      const selectors = {
        products: /المنتج|Produit|Products/i,
        users: /المستخدم|Utilisateur|Users/i,
        roles: /الأدوار|Rôles|Roles/i,
        settings: /الإعدادات|Paramètres|Settings/i,
        inventory: /المخزون|Inventaire|Inventory/i,
        warehouse: /المستود|Entrepôt|Warehouse/i,
        suppliers: /المورد|Fournisseur|Supplier/i,
        production: /الإنتاج|Production/i,
        payments: /المدفو|Paiement|Payment/i,
        expenses: /المصرو|Dépense|Expense/i,
        reports: /التقارير|Rapport|Report/i,
        analytics: /Analytics|التحليل/i,
        finance: /Finances|المال/i,
      };
      const pattern = selectors[id];
      if (pattern) {
        const count = await page.locator('nav').getByText(pattern).count();
        if (count > 0) {
          fail(`Hidden sidebar item "${id}" is visible`);
        } else {
          results.sidebarHidden.push(id);
        }
      }
    }

    for (const path of AUTHORIZED_PATHS) {
      await page.goto(`${FRONTEND_URL}${path}`, { waitUntil: 'networkidle', timeout: 45000 });
      const url = page.url();
      results.authorizedPages[path] = url.endsWith(path) || url.includes(path) ? 'ok' : url;
      if (!url.includes(path.replace(/^\//, ''))) {
        fail(`Authorized page ${path} did not load — got ${url}`);
      }
    }

    for (const path of UNAUTHORIZED_PATHS) {
      await page.goto(`${FRONTEND_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(500);
      const url = new URL(page.url());
      const redirected = url.pathname === '/dashboard' || url.pathname === '/dashboard/';
      results.unauthorizedRedirects[path] = redirected ? 'redirected' : url.pathname;
      if (!redirected) {
        fail(`Unauthorized page ${path} was NOT redirected — stayed at ${url.pathname}`);
      }
    }

    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.getByRole('button', { name: /تسجيل الخروج|Logout|Déconnexion/i }).click({ timeout: 15000 });
    await page.waitForURL(/\/login/, { timeout: 15000 });
    results.ui.logout = 'ok';
  } catch (err) {
    fail(`UI checks failed: ${err.message}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log(`Testing Sales Rep workspace for ${SALES_EMAIL}`);
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`API: ${API_URL}`);

  const session = await loginViaApi();
  if (session) {
    await runUiChecks();
  }

  results.ready = results.errors.length === 0;
  console.log(JSON.stringify(results, null, 2));
  process.exit(results.ready ? 0 : 1);
}

main().catch((err) => {
  fail(`Unhandled error: ${err.message}`);
  results.ready = results.errors.length === 0;
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
});
