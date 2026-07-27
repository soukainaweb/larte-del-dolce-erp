// src/services/userService.js
import api from "./api";

// ==========================================
// USER PROFILE API SERVICE
// ==========================================

// Get current user profile
export const getProfile = () => {
  return api.get("/profile");
};


// Update profile information
export const updateProfile = (data) => {
  return api.put("/profile", data);
};


// Upload avatar
export const uploadAvatar = (file) => {
  const formData = new FormData();

  formData.append("avatar", file);

  return api.post("/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


// Delete avatar
export const removeAvatar = () => {
  return api.delete("/profile/avatar");
};


// Change password
export const changePassword = (data) => {
  return api.put("/profile/password", data);
};


// Update preferences
export const updatePreferences = (data) => {
  return api.put("/profile/preferences", data);
};


// ==========================================
// ACTIVITY
// ==========================================


// Get activity logs
export const getActivityLog = (params = {}) => {
  return api.get("/profile/activity", {
    params,
  });
};


// Export activity logs
export const exportActivityLog = (params = {}) => {
  return api.get("/profile/activity/export", {
    params,
    responseType: "blob",
  });
};


// ==========================================
// SESSIONS
// ==========================================


// Get active sessions
export const getSessions = () => {
  return api.get("/profile/sessions");
};


// Delete one session
export const revokeSession = (sessionId) => {
  return api.delete(`/profile/sessions/${sessionId}`);
};


// Delete all sessions
export const revokeAllSessions = () => {
  return api.delete("/profile/sessions");
};


// ==========================================
// DOCUMENTS
// ==========================================


// Get documents
export const getDocuments = (params = {}) => {
  return api.get("/profile/documents", {
    params,
  });
};


// Upload document
export const uploadDocument = (file, name, type) => {

  const formData = new FormData();

  formData.append("document", file);
  formData.append("name", name);
  formData.append("type", type);


  return api.post("/profile/documents", formData, {
    headers:{
      "Content-Type":"multipart/form-data",
    },
  });
};


// Delete document
export const deleteDocument = (documentId) => {
  return api.delete(`/profile/documents/${documentId}`);
};


// Download document
export const downloadDocument = (documentId) => {
  return api.get(`/profile/documents/${documentId}/download`, {
    responseType:"blob",
  });
};


// ==========================================
// PERMISSIONS & STATISTICS
// ==========================================


// Get current user permissions
export const getPermissions = () => {
  return api.get("/profile/permissions");
};


// Get user statistics
export const getUserStats = () => {
  return api.get("/profile/statistics");
};


// ==========================================
// SECURITY
// ==========================================


// Enable / Disable 2FA
export const updateTwoFactorAuth = (data) => {
  return api.put("/profile/2fa", data);
};


// ==========================================
// NOTIFICATIONS SETTINGS
// ==========================================


// Get notification settings
export const getNotificationSettings = () => {
  return api.get("/profile/notifications/settings");
};


// Update notification settings
export const updateNotificationSettings = (data) => {
  return api.put("/profile/notifications/settings", data);
};