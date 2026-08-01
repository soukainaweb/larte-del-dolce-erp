// src/services/api.js
import axios from 'axios';
import i18n from '../i18n';
import { AUTH_TOKEN_KEY, clearAuthStorage, getStoredToken } from '../utils/authStorage';
import { dispatchAppToast } from '../utils/toastBus';
import { extractValidationMessage } from '../utils/apiHelpers';
import { translateApiErrorMessage } from '../utils/apiErrorTranslator';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL && import.meta.env.DEV) {
  console.warn(
    'VITE_API_URL is not set. Add it to .env (see .env.example).'
  );
}

const AUTH_PAGES = ['/login', '/forgot-password', '/reset-password', '/change-password'];

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      clearAuthStorage();

      const isAuthPage = AUTH_PAGES.includes(window.location.pathname);
      if (!isAuthPage) {
        window.location.href = '/login';
      }
    }

    if (status === 422) {
      const validationMessage = extractValidationMessage(data);
      if (validationMessage) {
        error.validationMessage = validationMessage;
        error.message = validationMessage;
      }
    }

    if (status === 401) {
      const authMessage =
        translateApiErrorMessage(data?.message) ||
        i18n.t('errors.unauthorized', {
          defaultValue: 'يرجى تسجيل الدخول للوصول لهذه الصفحة.',
        });
      error.authMessage = authMessage;
      error.message = authMessage;
    }

    if (status >= 500) {
      const serverMessage =
        data?.message ||
        i18n.t('errors.serverConnectionError', {
          defaultValue: 'حدث خطأ في الاتصال بالخادم',
        });

      error.serverMessage = serverMessage;
      error.message = serverMessage;

      const isAuthPage = AUTH_PAGES.includes(window.location.pathname);
      if (!isAuthPage) {
        dispatchAppToast(serverMessage, 'error');
      }
    }

    if (!error.response) {
      const timeoutMessage = error.code === 'ECONNABORTED'
        ? i18n.t('errors.requestTimeout', {
            defaultValue: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
          })
        : i18n.t('errors.networkError');
      error.timeoutMessage = timeoutMessage;
      error.message = timeoutMessage;
    }

    return Promise.reject(error);
  }
);

export { API_BASE_URL, AUTH_TOKEN_KEY };
export default api;
