// src/services/api.js
import axios from 'axios';
import i18n from '../i18n';
import { AUTH_TOKEN_KEY, clearAuthStorage, getStoredToken } from '../utils/authStorage';
import { dispatchAppToast } from '../utils/toastBus';
import { extractValidationMessage } from '../utils/apiHelpers';
import { translateApiErrorMessage } from '../utils/apiErrorTranslator';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

if (!API_BASE_URL) {
  console.error(
    '[API] VITE_API_URL is not set. Copy .env.example to .env and set the backend API URL.'
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
    if (!API_BASE_URL) {
      const configError = new Error(
        i18n.t('errors.apiNotConfigured', {
          defaultValue:
            'عنوان واجهة البرمجة (VITE_API_URL) غير مُعدّ. انسخ .env.example إلى .env واضبط عنوان الخادم.',
        })
      );
      configError.configMissing = true;
      return Promise.reject(configError);
    }

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

    if (status === 404) {
      const contentType = String(error.response?.headers?.['content-type'] || '');
      const requestUrl = String(error.config?.url || '');
      const isHtmlResponse = contentType.includes('text/html');
      const isAuthRequest = /^\/?(login|password\/)/.test(requestUrl);

      if (isHtmlResponse || isAuthRequest) {
        const endpointMessage = isAuthRequest
          ? i18n.t('errors.loginServiceUnavailable', {
              defaultValue:
                'خدمة تسجيل الدخول غير متاحة. تحقق من تشغيل الخادم وإعدادات API.',
            })
          : i18n.t('errors.endpointNotFound', {
              defaultValue:
                'مسار واجهة البرمجة غير موجود. تحقق من عنوان API (VITE_API_URL).',
            });
        error.endpointMessage = endpointMessage;
        error.message = endpointMessage;
      }
    }

    return Promise.reject(error);
  }
);

export { API_BASE_URL, AUTH_TOKEN_KEY };
export default api;
