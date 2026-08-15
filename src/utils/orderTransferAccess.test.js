import { describe, expect, it } from 'vitest';
import { canTransferOrders } from './permissions';

const managerPerms = [
  'orders.view',
  'orders.create',
  'orders.update',
  'orders.delete',
  'orders.approve.manager',
];

const accountantPerms = ['orders.view', 'orders.approve.accountant', 'customers.view'];

const salesRepPerms = ['orders.view', 'orders.create', 'orders.pickup', 'orders.deliver'];

describe('canTransferOrders', () => {
  it('allows manager with orders.update', () => {
    expect(canTransferOrders({
      user: { role: { name: 'manager' } },
      permissions: managerPerms,
    })).toBe(true);
  });

  it('allows responsible with orders.update', () => {
    expect(canTransferOrders({
      user: { role: { name: 'responsible' } },
      permissions: ['orders.view', 'orders.update', 'orders.approve.responsible'],
    })).toBe(true);
  });

  it('denies sales representative even with broad permissions', () => {
    expect(canTransferOrders({
      user: { role: { name: 'sales' } },
      permissions: [...salesRepPerms, 'orders.update'],
    })).toBe(false);
  });

  it('denies accountant (view only, no update)', () => {
    expect(canTransferOrders({
      user: { role: { name: 'accountant' } },
      permissions: accountantPerms,
    })).toBe(false);
  });

  it('denies while auth is loading', () => {
    expect(canTransferOrders({
      authLoading: true,
      user: { role: { name: 'manager' } },
      permissions: managerPerms,
    })).toBe(false);
  });

  it('denies viewer with orders.view only', () => {
    expect(canTransferOrders({
      user: { role: { name: 'viewer' } },
      permissions: ['orders.view'],
    })).toBe(false);
  });
});
