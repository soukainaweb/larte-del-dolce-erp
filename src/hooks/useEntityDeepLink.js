import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { unwrapData } from '../utils/apiHelpers';

/**
 * Opens a list-page detail/edit modal when navigated with location.state
 * (e.g. from EntityDetailRedirect or notification links).
 */
export function useEntityDeepLink({
  items = [],
  viewStateKey,
  editStateKey,
  fetchById,
  onView,
  onEdit,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const onViewRef = useRef(onView);
  const onEditRef = useRef(onEdit);

  onViewRef.current = onView;
  onEditRef.current = onEdit;

  useEffect(() => {
    if (!viewStateKey) return;

    const viewId = location.state?.[viewStateKey];
    const editId = editStateKey ? location.state?.[editStateKey] : null;
    const targetId = viewId || editId;
    if (!targetId) return;

    let cancelled = false;

    const openEntity = async () => {
      let entity = items.find(
        (item) => String(item.id) === String(targetId)
          || String(item.orderNumber) === String(targetId)
      );

      if (!entity && fetchById) {
        try {
          const response = await fetchById(targetId);
          entity = unwrapData(response) ?? response?.data ?? null;
        } catch (error) {
          console.error('Entity deep link load failed:', error);
        }
      }

      if (cancelled) return;

      if (entity) {
        if (editId && onEditRef.current) {
          onEditRef.current(entity);
        } else if (onViewRef.current) {
          onViewRef.current(entity);
        }
      }

      navigate(location.pathname, { replace: true, state: {} });
    };

    openEntity();

    return () => {
      cancelled = true;
    };
  }, [
    location.state,
    location.pathname,
    items,
    viewStateKey,
    editStateKey,
    fetchById,
    navigate,
  ]);
}

export default useEntityDeepLink;
