/**
 * Production E2E: Meetings module — real customers, orders, participants, schedule flow.
 * Usage: node scripts/meetings-production-e2e.mjs
 */
import { chromium } from 'playwright';

const FRONTEND = process.env.FRONTEND_URL || 'https://larte-del-dolce-erp.vercel.app';
const API = (process.env.VITE_API_URL || 'https://larte-del-dolce-erp-production.up.railway.app/api').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'madina7ali7@gmail.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '123456';

const results = { steps: {}, api: {}, errors: [], ready: false };

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

function unwrapList(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

async function main() {
  const login = await api('/login', { method: 'POST', body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  const token = login.json?.data?.token;
  if (!login.ok || !token) {
    fail('Admin login failed');
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }
  results.api.login = login.status;

  // Ensure at least one customer and order exist
  let customers = unwrapList((await api('/customers?per_page=5', { token })).json);
  if (customers.length === 0) {
    const created = await api('/customers', {
      method: 'POST',
      token,
      body: { name: `E2E Customer ${Date.now()}`, email: `e2e.customer.${Date.now()}@example.com`, phone: '0600000001', status: 'active' },
    });
    results.api.createCustomer = created.status;
    if (!created.ok) fail(`Create customer failed: ${created.status}`);
    customers = [created.json?.data];
  }
  results.api.customersCount = customers.length;

  let orders = unwrapList((await api('/orders?per_page=5', { token })).json);
  if (orders.length === 0 && customers[0]?.id) {
    const products = unwrapList((await api('/products?per_page=1', { token })).json);
    const productId = products[0]?.id;
    if (!productId) {
      fail('Cannot create order: no products in database');
    } else {
      const created = await api('/orders', {
        method: 'POST',
        token,
        body: {
          customer_id: customers[0].id,
          items: [{ product_id: productId, quantity: 1 }],
          notes: 'E2E meeting test order',
        },
      });
      results.api.createOrder = created.status;
      if (!created.ok) fail(`Create order failed: ${created.status} — ${created.json?.message}`);
      orders = created.json?.data ? [created.json.data] : [];
    }
  }
  results.api.ordersCount = orders.length;

  const inviteesRes = await api('/meetings/invitees?per_page=20', { token });
  results.api.invitees = inviteesRes.status;
  const invitees = unwrapList(inviteesRes.json);
  if (inviteesRes.status !== 200) fail(`GET /meetings/invitees returned ${inviteesRes.status}`);
  if (!Array.isArray(invitees) || invitees.length === 0) fail('No eligible invitees returned');

  const manager = invitees.find((u) => u.email === 'manager@larte.com') || invitees[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const draft = await api('/meetings', {
    method: 'POST',
    token,
    body: {
      title: `E2E Draft ${Date.now()}`,
      meeting_date: tomorrow,
      meeting_time: '14:30',
      customer_id: customers[0]?.id || null,
      order_id: orders[0]?.id || null,
      notes: 'Draft from E2E',
      invitee_user_ids: [manager.id],
      publish: false,
    },
  });
  results.api.createDraft = draft.status;
  if (!draft.ok || draft.json?.data?.status !== 'draft') fail('Draft meeting creation failed');

  const scheduled = await api('/meetings', {
    method: 'POST',
    token,
    body: {
      title: `E2E Scheduled ${Date.now()}`,
      meeting_date: tomorrow,
      meeting_time: '15:00',
      customer_id: customers[0]?.id || null,
      order_id: orders[0]?.id || null,
      notes: 'Scheduled from E2E',
      invitee_user_ids: [manager.id],
      publish: true,
    },
  });
  results.api.createScheduled = scheduled.status;
  const meetingId = scheduled.json?.data?.id;
  if (!scheduled.ok || scheduled.json?.data?.status !== 'scheduled') {
    fail('Scheduled meeting creation failed');
  } else {
    results.api.meetingId = meetingId;
    results.api.roomName = scheduled.json?.data?.room_name;
  }

  if (meetingId) {
    const show = await api(`/meetings/${meetingId}`, { token });
    results.api.showMeeting = show.status;
    if (show.ok) {
      results.api.hasCustomer = Boolean(show.json?.data?.customer_id);
      results.api.hasOrder = Boolean(show.json?.data?.order_id);
      results.api.inviteeCount = (show.json?.data?.invitees || []).length;
    }

    const session = await api(`/meetings/${meetingId}/session`, { token });
    results.api.session = session.status;
    if (session.ok) {
      results.api.jitsiRoom = session.json?.data?.jitsi?.roomName || session.json?.data?.session?.roomName;
    }
  }

  // UI smoke: open meetings page and verify modal loads options
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(`${FRONTEND}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.fill('#email', ADMIN_EMAIL);
    await page.fill('#password', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });

    await page.goto(`${FRONTEND}/dashboard/meetings`, { waitUntil: 'networkidle', timeout: 60000 });
    results.steps.meetingsPage = page.url().includes('/dashboard/meetings');

    await page.getByRole('button', { name: /إضافة|Add/i }).first().click();
    await page.waitForTimeout(2000);

    const customerOptions = await page.locator('select[name="customer_id"] option').count();
    const orderOptions = await page.locator('select[name="order_id"] option').count();
    results.steps.customerOptions = customerOptions;
    results.steps.orderOptions = orderOptions;
    results.steps.participantCheckboxes = await page.locator('input[type="checkbox"]').count();

    if (customerOptions <= 1 && customers.length > 0) fail('Customer dropdown empty in UI');
    if (orderOptions <= 1 && orders.length > 0) fail('Order dropdown empty in UI');
    if (results.steps.participantCheckboxes === 0) fail('No participant checkboxes in UI');
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
