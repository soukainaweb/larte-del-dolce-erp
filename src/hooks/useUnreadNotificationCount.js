import { useState, useEffect, useCallback } from 'react';
import { getUnreadCount } from '../services/notificationService';

const REFRESH_EVENT = 'notifications:refresh';

const parseUnreadCount = (response) => {
  const count =
    response?.data?.data?.count ??
    response?.data?.count ??
    response?.data?.data ??
    0;

  return typeof count === 'number' ? count : 0;
};

/**
 * Shared unread notification count for the authenticated user.
 * Listens for `notifications:refresh` so pages can trigger updates after read/create.
 */
export function useUnreadNotificationCount(isAuthenticated) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(parseUnreadCount(response));
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return undefined;
    }

    refreshUnreadCount();

    const interval = setInterval(refreshUnreadCount, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, refreshUnreadCount]);

  return { unreadCount, setUnreadCount, refreshUnreadCount };
}

export function dispatchNotificationsRefresh() {
  window.dispatchEvent(new Event(REFRESH_EVENT));
}
