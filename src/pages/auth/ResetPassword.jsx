import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineLockClosed } from 'react-icons/hi';
import { FaArrowLeft } from 'react-icons/fa';
import { resetPassword } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/apiHelpers';
import AuthBrandPanel from '../../components/auth/AuthBrandPanel';
import AuthLogoMark from '../../components/auth/AuthLogoMark';

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.loginError')));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full h-[54px] pl-12 pr-4 rounded-[18px] border border-[#E8DDD1] bg-white focus:border-[#B8863B] focus:ring-2 focus:ring-[#B8863B]/20 focus:outline-none transition-all text-[#3D2F24] font-inter';

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 font-inter">
        <div className="max-w-md w-full bg-white rounded-[22px] p-8 text-center border border-[#E8DDD1]">
          <p className="text-[#6B5E54] mb-4">{t('auth.resetInvalidLink', { defaultValue: 'Lien de réinitialisation invalide ou expiré.' })}</p>
          <Link to="/forgot-password" className="text-[#B8863B] hover:underline">{t('auth.forgotPassword')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] flex items-center justify-center p-4 font-inter">
      <motion.div
        className="w-full max-w-[1280px] bg-white/95 rounded-[22px] shadow-[0_30px_80px_rgba(61,47,36,0.1)] overflow-hidden flex flex-col lg:flex-row border border-[#E8DDD1]/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AuthBrandPanel subtitle={t('auth.changePassword')} />

        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="lg:hidden flex flex-col items-center gap-3 mb-8">
              <AuthLogoMark size="mobile" alt={t('common.appName')} />
            </div>
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#B8863B] to-[#9E6C30] text-white flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
                <p className="font-inter text-[#3D2F24]">{t('auth.passwordUpdated')}</p>
              </div>
            ) : (
              <>
                <h2 className="font-playfair text-3xl font-bold text-[#3D2F24] mb-2">{t('auth.changePassword')}</h2>
                <p className="font-inter text-sm text-[#6B5E54] mb-8">{email}</p>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#3D2F24] mb-2">{t('auth.newPassword')}</label>
                    <div className="relative">
                      <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E6C30]" />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required minLength={8} disabled={isLoading} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3D2F24] mb-2">{t('auth.confirmPassword')}</label>
                    <div className="relative">
                      <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E6C30]" />
                      <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className={inputClass} required minLength={8} disabled={isLoading} />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full h-[56px] rounded-[18px] bg-gradient-to-r from-[#B8863B] to-[#9E6C30] text-white font-semibold disabled:opacity-60">
                    {isLoading ? t('auth.sending') : t('auth.updatePassword')}
                  </button>
                  <Link to="/login" className="flex items-center justify-center gap-2 text-[#B8863B] text-sm py-2">
                    <FaArrowLeft /> {t('auth.backToLogin')}
                  </Link>
                </form>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
