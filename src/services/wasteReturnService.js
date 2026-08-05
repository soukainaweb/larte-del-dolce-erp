import api from './api';

export const getWasteReturns = (params = {}) => api.get('/waste-returns', { params });
export const getWasteReturnById = (id) => api.get(`/waste-returns/${id}`);
export const createWasteReturn = (data) => api.post('/waste-returns', data);
export const updateWasteReturn = (id, data) => api.put(`/waste-returns/${id}`, data);
export const deleteWasteReturn = (id) => api.delete(`/waste-returns/${id}`);
export const getWasteReturnStatistics = (params = {}) => api.get('/waste-returns/statistics', { params });
export const getWasteReturnTypes = () => api.get('/waste-returns/types');

export default {
  getWasteReturns,
  getWasteReturnById,
  createWasteReturn,
  updateWasteReturn,
  deleteWasteReturn,
  getWasteReturnStatistics,
  getWasteReturnTypes,
};
