/**
 * Production E2E: Order creation + notifications workflow.
 * Usage: node scripts/orders-production-e2e.mjs
 */
import { chromium } from 'playwright';

const API = (process.env.VITE_API_URL || 'https://larte-del-dolce-erp-production.up.railway.app/api').replace(/\/$/, '');
const FRONTEND = process.env.FRONTEND_URL || 'https://larte-del-dolce-erp.vercel.app';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'madina7ali7@gmail.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '123456';
const SALES_EMAIL = process.env.E2E_SALES_EMAIL || 'muhamedelseed203@gmail.com';
const SALES_PASSWORD = process.env.E2E_SALES_PASSWORD || 'MySecurePass1';
const MANAGER_EMAIL = process.env.E2E_MANAGER_EMAIL || 'manager@larte.com';
const MANAGER_PASSWORD = process.env.E2E_MANAGER_PASSWORD || '123456';

const results = { api: {}, steps: {}, errors: [], ready: false };

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
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 300) }; }
  return { status: res.status, json, ok: res.ok };
}

function unwrapList(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

async function login(email, password) {
  const res = await api('/login', { method: 'POST', body: { email, password } });
  return { token: res.json?.data?.token, user: res.json?.data?.user, status: res.status, ok: res.ok };
}

async function main() {
  const admin = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  if (!admin.ok || !admin.token) {
    fail('Admin login failed');
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }

  const sales = await login(SALES_EMAIL, SALES_PASSWORD);
  const manager = await login(MANAGER_EMAIL, MANAGER_PASSWORD);
  results.api.adminLogin = admin.status;
  results.api.salesLogin = sales.status;
  results.api.managerLogin = manager.status;

  if (!sales.ok || !sales.token) fail('Sales login failed');
  if (!manager.ok || !manager.token) fail('Manager login failed');

  // Sales: products blocked, form-options works
  const salesProducts = await api('/products?per_page=1', { token: sales.token });
  results.api.salesProducts = salesProducts.status;
  if (salesProducts.status !== 403) fail(`Sales GET /products expected 403, got ${salesProducts.status}`);

  const formOpts = await api('/orders/form-options', { token: sales.token });
  results.api.salesFormOptions = formOpts.status;
  const opts = formOpts.json?.data || {};
  if (formOpts.status !== 200) fail('Sales form-options failed');
  if (!Array.isArray(opts.products) || opts.products.length === 0) fail('No products in form-options');
  if (!Array.isArray(opts.customers) || opts.customers.length === 0) fail('No customers in form-options');

  const managerNotifsBefore = unwrapList((await api('/notifications?per_page=50', { token: manager.token })).json).length;

  const createRes = await api('/orders', {
    method: 'POST',
    token: sales.token,
    body: {
      customer_id: opts.customers[0].id,
      sales_rep_id: sales.user?.id,
      priority: 'medium',
      delivery_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      delivery_time: '14:00',
      payment_method: 'cash',
      notes: `E2E order ${Date.now()}`,
      items: [{
        product_id: opts.products[0].id,
        quantity: 2,
        price: opts.products[0].price || 100,
        discount: 5,
      }],
    },
  });
  results.api.createOrder = createRes.status;
  const orderId = createRes.json?.data?.id;
  const orderNumber = createRes.json?.data?.order_number;
  if (!createRes.ok || !orderId) fail(`Order creation failed: ${createRes.status} — ${createRes.json?.message}`);

  const showOrder = await api(`/orders/${orderId}`, { token: sales.token });
  results.api.showOrder = showOrder.status;
  if (!showOrder.ok) fail('Created order not retrievable');

  const putBlocked = await api(`/orders/${orderId}`, {
    method: 'PUT',
    token: sales.token,
    body: { notes: 'blocked' },
  });
  results.api.salesPutOrder = putBlocked.status;
  if (putBlocked.status !== 403) fail(`Sales PUT order expected 403, got ${putBlocked.status}`);

  const deleteBlocked = await api(`/orders/${orderId}`, {
    method: 'DELETE',
    token: sales.token,
  });
  results.api.salesDeleteOrder = deleteBlocked.status;
  if (deleteBlocked.status !== 403) fail(`Sales DELETE order expected 403, got ${deleteBlocked.status}`);

  const managerNotifsAfter = unwrapList((await api('/notifications?per_page=50', { token: manager.token })).json);
  const orderNotif = managerNotifsAfter.find((n) => n.type === 'order' && (n.message || '').includes(orderNumber || ''));
  results.api.managerOrderNotification = Boolean(orderNotif);
  if (!orderNotif) fail('Manager did not receive order notification');

  // Sample notification
  const sampleRes = await api('/samples', {
    method: 'POST',
    token: sales.token,
    body: { name: `E2E Sample ${Date.now()}`, quantity: 1, status: 'pending', notes: 'E2E' },
  });
  results.api.createSample = sampleRes.status;
  const sampleNotifs = unwrapList((await api('/notifications?per_page=50', { token: manager.token })).json);
  const sampleNotif = sampleNotifs.find((n) => n.type === 'sample' && (n.title || '').includes('عينة'));
  results.api.managerSampleNotification = Boolean(sampleNotif);
  if (!sampleRes.ok) fail(`Sample creation failed: ${sampleRes.status}`);
  if (!sampleNotif) fail('Manager did not receive sample notification');

  // UI smoke: open orders page and create modal
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(`${FRONTEND}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.fill('#email, input[type="email"]', SALES_EMAIL);
    await page.fill('#password, input[type="password"]', SALES_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });

    await page.goto(`${FRONTEND}/dashboard/orders`, { waitUntil: 'networkidle', timeout: 60000 });
    results.steps.ordersPage = page.url().includes('/dashboard/orders');

    await page.getByRole('button', { name: /طلب جديد|New Order/i }).first().click();
    await page.waitForTimeout(2500);

    const customerSelect = page.locator('select[name="customer_id"]');
    const productSelect = page.locator('select').filter({ has: page.locator('option') }).nth(1);
    results.steps.customerOptions = await customerSelect.locator('option').count();
    results.steps.modalOpen = await customerSelect.isVisible();
    if (results.steps.customerOptions <= 1) fail('Customer dropdown empty in UI');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const actionButtons = await page.locator('tbody tr').first().locator('td').last().locator('button').count();
    results.steps.orderActionButtons = actionButtons;
    if (actionButtons > 1) fail('Sales rep should not see edit/delete buttons on orders');
  } catch (err) {
    fail(`UI smoke failed: ${err.message}`);
  } finally {
    await browser.close();
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
