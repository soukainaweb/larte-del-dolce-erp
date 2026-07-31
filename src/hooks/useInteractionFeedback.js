import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';

/**
 * Shared handlers for button feedback: toasts, navigation, clipboard, coming-soon stubs.
 */
export const useInteractionFeedback = () => {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const notifyComingSoon = useCallback((featureName) => {
    showToast(
      featureName
        ? t('common.featureComingSoonNamed', { feature: featureName })
        : t('common.featureComingSoon'),
      'info'
    );
  }, [showToast, t]);

  const copyShareLink = useCallback(async (url = window.location.href) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast(t('common.linkCopied'), 'success');
    } catch {
      showToast(t('common.copyFailed'), 'error');
    }
  }, [showToast, t]);

  const navigateTo = useCallback((path, state) => {
    navigate(path, state ? { state } : undefined);
  }, [navigate]);

  return {
    showToast,
    t,
    navigate,
    navigateTo,
    notifyComingSoon,
    copyShareLink,
  };
};

export default useInteractionFeedback;
