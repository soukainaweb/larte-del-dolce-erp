// src/components/auth/AuthLoadingScreen.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const AuthLoadingScreen = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-[#B88A44]/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-[#B88A44]">L</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#B88A44] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#B88A44] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#B88A44] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="mt-4 text-sm text-[#7A6855]">{t('common.loading')}</p>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
