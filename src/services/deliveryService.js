// src/services/deliveryService.js
import api from './api';

const deliveryService = {
  getDeliveries: async (params = {}) => {
    const response = await api.get('/deliveries', { params });
    return response.data;
  },

  getDeliveryById: async (id) => {
    const response = await api.get(`/deliveries/${id}`);
    return response.data;
  },

  createDelivery: async (data) => {
    const response = await api.post('/deliveries', data);
    return response.data;
  },

  updateDelivery: async (id, data) => {
    const response = await api.put(`/deliveries/${id}`, data);
    return response.data;
  },

  deleteDelivery: async (id) => {
    const response = await api.delete(`/deliveries/${id}`);
    return response.data;
  },

  updateDeliveryStatus: async (id, status) => {
    const response = await api.patch(`/deliveries/${id}/status`, { status });
    return response.data;
  },

  getVehicles: async (params = {}) => {
    const response = await api.get('/deliveries/vehicles', { params });
    return response.data;
  },

  exportDeliveries: async (params = {}) => {
    const response = await api.get('/deliveries/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default deliveryService;
