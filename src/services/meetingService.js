import api from './api';

export const getMeetings = (params = {}) => api.get('/meetings', { params });
export const getMeetingById = (id) => api.get(`/meetings/${id}`);
export const createMeeting = (data) => api.post('/meetings', data);
export const updateMeeting = (id, data) => api.put(`/meetings/${id}`, data);
export const deleteMeeting = (id) => api.delete(`/meetings/${id}`);
export const getMeetingStatistics = (params = {}) => api.get('/meetings/statistics', { params });
export const getMeetingStatuses = () => api.get('/meetings/statuses');
export const startMeeting = (id) => api.post(`/meetings/${id}/start`);
export const endMeeting = (id) => api.post(`/meetings/${id}/end`);
export const getMeetingSession = (id) => api.get(`/meetings/${id}/session`);

export default {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingStatistics,
  getMeetingStatuses,
  startMeeting,
  endMeeting,
  getMeetingSession,
};
