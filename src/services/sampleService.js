import api from './api';

export const getSamples = (params = {}) => api.get('/samples', { params });
export const getSampleById = (id) => api.get(`/samples/${id}`);
export const createSample = (data) => api.post('/samples', data);
export const updateSample = (id, data) => api.put(`/samples/${id}`, data);
export const deleteSample = (id) => api.delete(`/samples/${id}`);
export const getSampleStatistics = (params = {}) => api.get('/samples/statistics', { params });
export const getSampleStatuses = () => api.get('/samples/statuses');

export default {
  getSamples,
  getSampleById,
  createSample,
  updateSample,
  deleteSample,
  getSampleStatistics,
  getSampleStatuses,
};
