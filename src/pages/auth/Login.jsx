// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { login as loginService } from '../../services/authService';
import { extractUserFromResponse, extractTokenFromResponse, getApiErrorMessage } from '../../utils/apiHelpers';
import AuthBrandPanel from '../../components/auth/AuthBrandPanel';
import AuthLogoMark from '../../components/auth/AuthLogoMark';

const Login = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await loginService({
        email: formData.email,
        password: formData.password,
        remember: formData.remember,
      });

      const userData = extractUserFromResponse(data);
      const token = extractTokenFromResponse(data);

      if (!userData || !token) {
        throw new Error(t('auth.invalidLoginData'));
      }

      login(userData, token);
      showToast(t('auth.loginSuccess'), 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, t('auth.loginError'));
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full h-[54px] ps-12 pe-4 rounded-[18px] border border-[#E8DDD1] bg-white focus:border-[#B8863B] focus:ring-2 focus:ring-[#B8863B]/20 focus:outline-none transition-all duration-300 text-[#3D2F24] placeholder-[#B0A8A0] font-inter text-start';

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter relative overflow-hidden">
      <div className="absolute top-[-20%] end-[-10%] w-[500px] h-[500px] rounded-full bg-[#B8863B]/6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] start-[-10%] w-[500px] h-[500px] rounded-full bg-[#C89B5A]/8 blur-3xl pointer-events-none" />

      <motion.div
        className="w-full max-w-[1280px] bg-white/95 backdrop-blur-sm rounded-[22px] shadow-[0_30px_80px_rgba(61,47,36,0.1)] overflow-hidden flex flex-col lg:flex-row border border-[#E8DDD1]/50"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <AuthBrandPanel subtitle={t('auth.loginSubtitle')} />

        <div className="flex-1 p-8 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden flex flex-col items-center gap-3 mb-10">
              <AuthLogoMark size="mobile" alt={t('common.appName')} />
              <h1 className="font-playfair text-2xl font-bold text-[#3D2F24] text-center">{t('common.appName')}</h1>
            </div>

            <div className="mb-10 text-center lg:text-start">
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[#3D2F24] mb-2">
                {t('auth.welcomeBack')}
              </h2>
              <p className="font-inter text-[#6B5E54] text-sm sm:text-base">{t('auth.loginSubtitle')}</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm text-center font-inter"
                role="alert"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#3D2F24] mb-2 font-inter">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E6C30] text-lg" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#3D2F24] mb-2 font-inter">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E6C30] text-lg" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleChange}
                    className={`${inputClass} pr-12`}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B5E54] hover:text-[#B8863B] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm text-[#3D2F24] cursor-pointer font-inter">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-[#E8DDD1] text-[#B8863B] focus:ring-[#B8863B]/20"
                    disabled={isLoading}
                  />
                  <span>{t('auth.rememberMe')}</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#B8863B] hover:text-[#9E6C30] transition-colors font-inter whitespace-nowrap"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full h-[56px] rounded-[18px] bg-gradient-to-r from-[#B8863B] to-[#9E6C30] text-white font-semibold text-lg shadow-lg shadow-[#B8863B]/25 hover:shadow-xl hover:shadow-[#B8863B]/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed font-inter"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('auth.signingIn')}
                  </span>
                ) : (
                  t('auth.signIn')
                )}
              </motion.button>
            </form>

            <p className="mt-10 text-center text-[#B0A8A0] text-xs font-inter leading-relaxed">
              {t('auth.copyright')}
              <br />
              {t('auth.platformTagline')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
