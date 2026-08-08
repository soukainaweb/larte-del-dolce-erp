/**
 * Whether a sidebar/menu item should render a numeric badge (including zero).
 */
export const hasMenuBadge = (badge) => typeof badge === 'number';

/**
 * Resolve the notifications menu badge from the live unread count.
 */
export const resolveNotificationsMenuBadge = (unreadCount) =>
  typeof unreadCount === 'number' ? unreadCount : 0;
