import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import brandLogo from '../../constants/brandAssets';

/**
 * Shared left branding panel for auth pages (login, forgot password, reset password).
 */
const AuthBrandPanel = ({ subtitle }) => {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] bg-gradient-to-br from-[#FAF7F2] via-[#F7F1E8] to-[#F0E8DC] p-10 xl:p-14 flex-col items-center justify-center relative min-h-[680px] border-r border-[#E8DDD1]/60">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -end-24 w-72 h-72 rounded-full bg-[#B8863B]/8 blur-3xl" />
        <div className="absolute -bottom-32 -start-16 w-80 h-80 rounded-full bg-[#C89B5A]/10 blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="mb-10 p-6 rounded-full bg-white/70 shadow-[0_20px_60px_rgba(184,134,59,0.15)] border border-[#E8DDD1]/80">
          <img
            src={brandLogo}
            alt={t('common.appName')}
            className="w-36 h-36 xl:w-44 xl:h-44 object-contain"
          />
        </div>

        <h1 className="font-playfair text-4xl xl:text-5xl font-bold text-[#3D2F24] leading-tight tracking-tight mb-3">
          {t('common.appName')}
        </h1>
        <p className="font-inter text-sm uppercase tracking-[0.25em] text-[#9E6C30] mb-8">
          {t('common.erp')}
        </p>

        {subtitle && (
          <p className="font-inter text-base text-[#6B5E54] leading-relaxed max-w-sm">
            {subtitle}
          </p>
        )}

        <div className="mt-12 w-16 h-px bg-gradient-to-r from-transparent via-[#B8863B]/50 to-transparent" />
      </motion.div>
    </div>
  );
};

export default AuthBrandPanel;
