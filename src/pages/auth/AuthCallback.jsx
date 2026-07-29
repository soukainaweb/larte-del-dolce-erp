import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getUser } from '../../services/authService';
import { extractUserFromResponse, getApiErrorMessage } from '../../utils/apiHelpers';
import AuthBrandPanel from '../../components/auth/AuthBrandPanel';

const AuthCallback = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [message, setMessage] = useState(t('auth.oauthCompleting', { defaultValue: 'Finalisation de la connexion...' }));

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setMessage(error);
      showToast(error, 'error');
      const timer = setTimeout(() => navigate('/login', { replace: true }), 2500);
      return () => clearTimeout(timer);
    }

    if (!token) {
      setMessage(t('auth.oauthMissingToken', { defaultValue: 'Jeton de connexion manquant.' }));
      const timer = setTimeout(() => navigate('/login', { replace: true }), 2500);
      return () => clearTimeout(timer);
    }

    const completeLogin = async () => {
      try {
        localStorage.setItem('token', token);
        const response = await getUser();
        const userData = extractUserFromResponse(response);

        if (!userData) {
          throw new Error(t('auth.invalidLoginData'));
        }

        login(userData, token);
        showToast(t('auth.loginSuccess', { defaultValue: 'Connexion réussie' }), 'success');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const errorMessage = getApiErrorMessage(err, t('auth.loginError'));
        setMessage(errorMessage);
        showToast(errorMessage, 'error');
        setTimeout(() => navigate('/login', { replace: true }), 2500);
      }
    };

    completeLogin();
  }, [searchParams, login, navigate, showToast, t]);

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] flex items-center justify-center p-4 font-inter relative overflow-hidden">
      <div className="w-full max-w-[1200px] bg-white/90 backdrop-blur-sm rounded-[22px] shadow-[0_30px_80px_rgba(61,47,36,0.08)] overflow-hidden flex flex-col lg:flex-row border border-[#E8DDD1]/50 min-h-[480px]">
        <AuthBrandPanel subtitle={t('auth.loginSubtitle')} />

        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-12 h-12 border-2 border-[#B8863B]/30 border-t-[#B8863B] rounded-full animate-spin mb-6" />
          <p className="font-inter text-[#6B5E54] text-sm max-w-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
