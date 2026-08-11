import api from './api';
import { unwrapData, unwrapPaginated } from '../utils/apiHelpers';

export const getOrderTransfers = async (params = {}) => {
  const response = await api.get('/order-transfers', { params });
  const { items, meta } = unwrapPaginated(response);
  return { data: items, meta, success: true };
};

export const getTransferSalesReps = async () => {
  const response = await api.get('/order-transfers/sales-reps');
  const data = unwrapData(response);
  return { data: Array.isArray(data) ? data : [], success: true };
};

export const transferOrder = async (orderId, data) => {
  const response = await api.post(`/orders/${orderId}/transfer`, data);
  return { data: unwrapData(response), success: true };
};

export default {
  getOrderTransfers,
  getTransferSalesReps,
  transferOrder,
};
