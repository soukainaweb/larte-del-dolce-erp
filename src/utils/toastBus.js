/**
 * Dispatch a global toast event consumable by ToastProvider (outside React tree, e.g. axios interceptors).
 */
export const dispatchAppToast = (message, type = 'error') => {
  if (typeof window === 'undefined' || !message) return;
  window.dispatchEvent(
    new CustomEvent('app:toast', { detail: { message, type } })
  );
};
