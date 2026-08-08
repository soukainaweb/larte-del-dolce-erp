import api from './api';

export const getMeetings = (params = {}) => api.get('/meetings', { params });
export const getMeetingById = (id) => api.get(`/meetings/${id}`);
export const createMeeting = (data) => api.post('/meetings', data);
export const updateMeeting = (id, data) => api.put(`/meetings/${id}`, data);
export const deleteMeeting = (id) => api.delete(`/meetings/${id}`);
export const getMeetingStatistics = (params = {}) => api.get('/meetings/statistics', { params });
export const getMeetingStatuses = () => api.get('/meetings/statuses');
export const getMeetingInvitees = (params = {}) => api.get('/meetings/invitees', { params });
export const scheduleMeeting = (id) => api.post(`/meetings/${id}/schedule`);
export const cancelMeeting = (id) => api.post(`/meetings/${id}/cancel`);
export const startMeeting = (id) => api.post(`/meetings/${id}/start`);
export const endMeeting = (id) => api.post(`/meetings/${id}/end`);
export const getMeetingSession = (id) => api.get(`/meetings/${id}/session`);
export const getMeetingHistory = (id) => api.get(`/meetings/${id}/history`);

export const downloadMeetingIcs = async (id) => {
  const response = await api.get(`/meetings/${id}/ics`, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `meeting-${id}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getGoogleCalendarUrl = (meeting) => {
  if (!meeting?.meeting_date) return '';
  const date = meeting.meeting_date.split?.('T')?.[0] || meeting.meeting_date;
  const time = (meeting.meeting_time || '10:00').slice(0, 5);
  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const joinUrl = `${base}/dashboard/meetings/${meeting.id}/room`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: meeting.title || 'Meeting',
    dates: `${fmt(start)}/${fmt(end)}`,
    details: meeting.notes ? `${meeting.notes}\n\nJoin: ${joinUrl}` : `Join: ${joinUrl}`,
    location: joinUrl,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export default {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingStatistics,
  getMeetingStatuses,
  scheduleMeeting,
  cancelMeeting,
  startMeeting,
  endMeeting,
  getMeetingSession,
  getMeetingHistory,
  downloadMeetingIcs,
  getGoogleCalendarUrl,
};
