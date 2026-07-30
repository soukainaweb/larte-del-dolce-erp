import React from 'react';
import brandLogo from '../../constants/brandAssets';

const SIZE_PRESETS = {
  desktop: {
    container: 'mb-10 p-6',
    image: 'w-44 h-44 xl:w-52 xl:h-52',
  },
  mobile: {
    container: 'p-4',
    image: 'w-24 h-24 sm:w-28 sm:h-28',
  },
};

/**
 * Premium square logo mark for auth screens (login, forgot/reset password).
 */
const AuthLogoMark = ({ size = 'desktop', alt, className = '' }) => {
  const preset = SIZE_PRESETS[size] ?? SIZE_PRESETS.desktop;

  return (
    <div
      className={[
        'inline-flex items-center justify-center rounded-2xl bg-white border border-amber-900/10 shadow-lg',
        preset.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <img src={brandLogo} alt={alt} className={`${preset.image} object-contain`} />
    </div>
  );
};

export default AuthLogoMark;
