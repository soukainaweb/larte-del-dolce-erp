// src/pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { forgotPassword } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/apiHelpers';
import AuthBrandPanel from '../../components/auth/AuthBrandPanel';
import AuthLogoMark from '../../components/auth/AuthLogoMark';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.loginError')));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full h-[54px] pl-12 pr-4 rounded-[18px] border border-[#E8DDD1] bg-white focus:border-[#B8863B] focus:ring-2 focus:ring-[#B8863B]/20 focus:outline-none transition-all text-[#3D2F24] placeholder-[#B0A8A0] font-inter text-left';

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter relative overflow-hidden">
      <motion.div
        className="w-full max-w-[1280px] bg-white/95 backdrop-blur-sm rounded-[22px] shadow-[0_30px_80px_rgba(61,47,36,0.1)] overflow-hidden flex flex-col lg:flex-row border border-[#E8DDD1]/50"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <AuthBrandPanel subtitle={t('auth.forgotPasswordSubtitle')} />

        <div className="flex-1 p-8 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden flex flex-col items-center gap-3 mb-10">
              <AuthLogoMark size="mobile" alt={t('common.appName')} />
            </div>

            {!isSubmitted ? (
              <>
                <div className="mb-10 text-center lg:text-start">
                  <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[#3D2F24] mb-2">
                    {t('auth.forgotPasswordTitle')}
                  </h2>
                  <p className="font-inter text-[#6B5E54] text-sm">{t('auth.forgotPasswordSubtitle')}</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm text-center font-inter">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#3D2F24] mb-2 font-inter">
                      {t('auth.email')}
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E6C30] text-lg" />
                      <input
                        id="email"
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: isLoading ? 1 : 1.01 }}
                    whileTap={{ scale: isLoading ? 1 : 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[56px] rounded-[18px] bg-gradient-to-r from-[#B8863B] to-[#9E6C30] text-white font-semibold text-lg shadow-lg shadow-[#B8863B]/25 transition-all disabled:opacity-60 font-inter"
                  >
                    {isLoading ? t('auth.sending') : t('auth.sendResetLink')}
                  </motion.button>

                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 w-full text-[#B8863B] hover:text-[#9E6C30] py-3 font-inter text-sm"
                  >
                    <FaArrowLeft />
                    <span>{t('auth.backToLogin')}</span>
                  </Link>
                </form>
              </>
            ) : (
              <motion.div className="text-center py-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#B8863B] to-[#9E6C30] flex items-center justify-center text-white text-2xl mx-auto mb-5 shadow-lg shadow-[#B8863B]/25">
                  ✓
                </div>
                <h2 className="font-playfair text-2xl font-bold text-[#3D2F24] mb-2">{t('auth.resetLinkSent')}</h2>
                <p className="font-inter text-[#6B5E54] text-sm mb-6">
                  <strong className="text-[#3D2F24]">{email}</strong>
                </p>
                <Link to="/login" className="inline-flex items-center gap-2 text-[#B8863B] hover:text-[#9E6C30] font-inter text-sm">
                  <FaArrowLeft />
                  {t('auth.backToLogin')}
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
