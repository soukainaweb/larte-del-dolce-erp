import { describe, expect, it } from 'vitest';

const getOrdersExportData = (isDetailsModalOpen, selectedOrder, filteredOrders) =>
  isDetailsModalOpen && selectedOrder ? [selectedOrder] : filteredOrders;

describe('OrdersPage export data selection', () => {
  const orderA = { id: 1, orderNumber: 'ORD015' };
  const orderB = { id: 2, orderNumber: 'ORD016' };
  const filteredOrders = [orderA, orderB];

  it('exports only the selected order when Order Details is open', () => {
    expect(getOrdersExportData(true, orderA, filteredOrders)).toEqual([orderA]);
    expect(getOrdersExportData(true, orderB, filteredOrders)).toEqual([orderB]);
  });

  it('exports all filtered orders when Order Details is closed', () => {
    expect(getOrdersExportData(false, orderA, filteredOrders)).toEqual(filteredOrders);
    expect(getOrdersExportData(false, null, filteredOrders)).toEqual(filteredOrders);
  });
});
