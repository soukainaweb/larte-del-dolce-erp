import api from './api';

export const getPurchases = (params = {}) => api.get('/purchases', { params });
export const getPurchaseById = (id) => api.get(`/purchases/${id}`);
export const createPurchase = (data) => api.post('/purchases', data);
export const updatePurchase = (id, data) => api.put(`/purchases/${id}`, data);
export const deletePurchase = (id) => api.delete(`/purchases/${id}`);
export const getPurchaseStatistics = (params = {}) => api.get('/purchases/statistics', { params });
export const getPurchaseStatuses = () => api.get('/purchases/statuses');

export default {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getPurchaseStatistics,
  getPurchaseStatuses,
};
