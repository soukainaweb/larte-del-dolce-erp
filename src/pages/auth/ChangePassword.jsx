// src/pages/auth/ChangePassword.jsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaCheckCircle,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { changePassword } from '../../services/authService';
import { extractUserFromResponse, getApiErrorMessage, normalizeUser } from '../../utils/apiHelpers';
import AuthBrandPanel from '../../components/auth/AuthBrandPanel';
import AuthLogoMark from '../../components/auth/AuthLogoMark';

const ChangePassword = () => {
  const { t } = useTranslation();
  const { logout, updateUser, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const isMandatory = Boolean(user?.mustChangePassword);

  const schema = useMemo(
    () =>
      yup.object().shape({
        currentPassword: yup.string().required(t('auth.currentPasswordRequired')),
        newPassword: yup
          .string()
          .required(t('auth.newPasswordRequired'))
          .min(8, t('auth.min8Chars'))
          .matches(/[A-Z]/, t('auth.uppercaseRequired'))
          .matches(/[a-z]/, t('auth.lowercaseRequired'))
          .matches(/[0-9]/, t('auth.numberRequired'))
          .notOneOf([yup.ref('currentPassword')], t('auth.newPasswordMustDiffer')),
        confirmPassword: yup
          .string()
          .required(t('auth.confirmPasswordRequired'))
          .oneOf([yup.ref('newPassword'), null], t('auth.passwordMismatch')),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const newPassword = watch('newPassword', '');

  const calculateStrength = (password) => {
    const rules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };

    setPasswordRules(rules);
    setPasswordStrength(Object.values(rules).filter(Boolean).length * 25);
  };

  const getStrengthLabel = (score) => {
    if (score === 0) return t('auth.strengthVeryWeak');
    if (score <= 25) return t('auth.strengthWeak');
    if (score <= 50) return t('auth.strengthMedium');
    if (score <= 75) return t('auth.strengthStrong');
    return t('auth.strengthVeryStrong');
  };

  const getStrengthColor = (score) => {
    if (score === 0) return 'bg-[#E8DDD1]';
    if (score <= 25) return 'bg-[#D8B67A]';
    if (score <= 50) return 'bg-[#C89B5A]';
    if (score <= 75) return 'bg-[#B8863B]';
    return 'bg-[#9E6C30]';
  };

  const passwordRuleItems = useMemo(
    () => [
      { key: 'length', label: t('auth.ruleMin8') },
      { key: 'uppercase', label: t('auth.ruleUppercase') },
      { key: 'lowercase', label: t('auth.ruleLowercase') },
      { key: 'number', label: t('auth.ruleNumber') },
    ],
    [t]
  );

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      const updatedUser = extractUserFromResponse(response);
      if (updatedUser) {
        updateUser(normalizeUser(updatedUser));
      } else {
        updateUser({ ...user, mustChangePassword: false, must_change_password: false });
      }

      showToast(t('auth.passwordUpdated'), 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.changePasswordError')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const inputClass = (hasError) =>
    `w-full h-[54px] ps-12 pe-12 rounded-[18px] border ${
      hasError ? 'border-rose-500' : 'border-[#E8DDD1]'
    } bg-white focus:border-[#B8863B] focus:ring-2 focus:ring-[#B8863B]/20 focus:outline-none transition-all duration-300 text-[#3D2F24] placeholder-[#B0A8A0] text-start`;

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter relative overflow-hidden" dir="rtl">
      <div className="absolute top-[-20%] end-[-10%] w-[500px] h-[500px] rounded-full bg-[#B8863B]/6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] start-[-10%] w-[500px] h-[500px] rounded-full bg-[#C89B5A]/8 blur-3xl pointer-events-none" />

      <motion.div
        className="w-full max-w-[1280px] bg-white/95 backdrop-blur-sm rounded-[22px] shadow-[0_30px_80px_rgba(61,47,36,0.1)] overflow-hidden flex flex-col lg:flex-row border border-[#E8DDD1]/50"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <AuthBrandPanel subtitle={isMandatory ? t('auth.mustChangePasswordSubtitle') : t('auth.changePasswordSubtitle')} />

        <div className="flex-1 p-8 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="flex justify-center mb-6 lg:hidden">
              <AuthLogoMark />
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B88646] to-[#9E6C30] flex items-center justify-center shadow-lg shadow-[#B88646]/25 flex-shrink-0">
                <FaShieldAlt className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#3D2F24]">{t('auth.changePassword')}</h1>
                <p className="text-sm text-[#6D6D6D] mt-1">
                  {isMandatory ? t('auth.mustChangePasswordMessage') : t('auth.changePasswordSubtitle')}
                </p>
              </div>
            </div>

            {isMandatory && (
              <div className="mt-4 mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm leading-relaxed">
                {t('auth.mustChangePasswordBanner')}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
              <div>
                <label className="block text-sm font-medium text-[#3D2F24] mb-1.5">{t('auth.currentPassword')}</label>
                <div className="relative">
                  <FaLock className="absolute start-4 top-1/2 -translate-y-1/2 text-[#B0A8A0] text-lg" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...register('currentPassword')}
                    placeholder={t('common.placeholders.currentPassword')}
                    className={inputClass(errors.currentPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-[#B0A8A0] hover:text-[#6D6D6D]"
                  >
                    {showCurrentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-rose-500 text-sm mt-1.5">{errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2F24] mb-1.5">{t('auth.newPassword')}</label>
                <div className="relative">
                  <FaLock className="absolute start-4 top-1/2 -translate-y-1/2 text-[#B0A8A0] text-lg" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    {...register('newPassword')}
                    placeholder={t('common.placeholders.newPassword')}
                    onChange={(e) => {
                      register('newPassword').onChange(e);
                      calculateStrength(e.target.value);
                    }}
                    className={inputClass(errors.newPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-[#B0A8A0] hover:text-[#6D6D6D]"
                  >
                    {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-rose-500 text-sm mt-1.5">{errors.newPassword.message}</p>
                )}

                {newPassword.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-[#3D2F24]">{t('auth.passwordStrength')}</span>
                      <span className="text-sm font-semibold text-[#B8863B]">{getStrengthLabel(passwordStrength)}</span>
                    </div>
                    <div className="h-2 bg-[#ECE8E1] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {passwordRuleItems.map((rule) => (
                        <div key={rule.key} className="flex items-center gap-2 text-sm">
                          {passwordRules[rule.key] ? (
                            <FaCheckCircle className="text-emerald-500 text-sm flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-[#D8D2C8] flex-shrink-0" />
                          )}
                          <span className={passwordRules[rule.key] ? 'text-emerald-600' : 'text-[#6D6D6D]'}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2F24] mb-1.5">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <FaLock className="absolute start-4 top-1/2 -translate-y-1/2 text-[#B0A8A0] text-lg" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    placeholder={t('common.placeholders.confirmNewPassword')}
                    className={inputClass(errors.confirmPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-[#B0A8A0] hover:text-[#6D6D6D]"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-rose-500 text-sm mt-1.5">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-[54px] rounded-[18px] bg-gradient-to-r from-[#B88646] to-[#9E6C30] text-white font-semibold shadow-lg shadow-[#B88646]/25 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? t('auth.updatingPassword') : t('auth.changePassword')}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 h-[54px] rounded-[18px] border-2 border-[#E8DDD1] text-[#3D2F24] font-semibold hover:bg-[#F8F7F4] transition-all flex items-center justify-center gap-2"
                >
                  <FaSignOutAlt />
                  {t('auth.logout')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
