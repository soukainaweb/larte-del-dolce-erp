import React from 'react';

/**
 * Full-viewport modal backdrop. Renders above layout chrome (header/sidebar).
 * Use nested={true} when opening a modal on top of another modal.
 */
const ModalOverlay = ({
  children,
  nested = false,
  className = '',
  dir,
  onClick,
  role = 'presentation',
}) => {
  const layerClass = nested ? 'modal-overlay-nested' : 'modal-overlay';

  return (
    <div
      className={`${layerClass} p-3 sm:p-4 ${className}`.trim()}
      dir={dir}
      onClick={onClick}
      role={role}
    >
      {children}
    </div>
  );
};

export default ModalOverlay;
