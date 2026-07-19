// src/pages/auth/ChangePassword.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaCheckCircle,
  FaTimes,
  FaArrowLeft,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Validation Schema - French
const schema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Le mot de passe actuel est requis'),
  newPassword: yup
    .string()
    .required('Le nouveau mot de passe est obligatoire')
    .min(8, 'Minimum 8 caractères')
    .matches(/[A-Z]/, 'Le nouveau mot de passe doit contenir au moins une lettre majuscule')
    .matches(/[a-z]/, 'Le nouveau mot de passe doit contenir au moins une lettre minuscule')
    .matches(/[0-9]/, 'Le nouveau mot de passe doit contenir au moins un chiffre')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Le nouveau mot de passe doit contenir au moins un caractère spécial'),
  confirmPassword: yup
    .string()
    .required('La confirmation du mot de passe est requise')
    .oneOf([yup.ref('newPassword'), null], 'Les mots de passe ne correspondent pas'),
});

const ChangePassword = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const newPassword = watch('newPassword', '');

  // Password Strength Calculator
  const calculateStrength = (password) => {
    let strength = 0;
    const rules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordRules(rules);

    Object.values(rules).forEach((rule) => {
      if (rule) strength += 20;
    });

    setPasswordStrength(strength);
  };

  const getStrengthLabel = (score) => {
    if (score === 0) return 'Très faible';
    if (score <= 20) return 'Faible';
    if (score <= 40) return 'Moyen';
    if (score <= 60) return 'Fort';
    return 'Très fort';
  };

  // Gold-themed password strength colors matching L'arte del dolce design system
  const getStrengthColor = (score) => {
    if (score === 0) return 'bg-[#E8DDD1]'; // Champagne/Border
    if (score <= 20) return 'bg-[#D8B67A]'; // Champagne Gold
    if (score <= 40) return 'bg-[#C89B5A]'; // Soft Gold
    if (score <= 60) return 'bg-[#B8863B]'; // Primary Gold
    return 'bg-[#9E6C30]'; // Dark Gold (full strength)
  };

  const onSubmit = (data) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      reset();
      setPasswordStrength(0);
      setPasswordRules({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
    }, 2000);
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B88646] to-[#9E6C30] flex items-center justify-center shadow-lg shadow-[#B88646]/25 flex-shrink-0">
              <FaShieldAlt className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Changer le mot de passe</h1>
              <p className="text-sm text-gray-500 mt-1">
                Pour protéger votre compte, choisissez un mot de passe fort et unique.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div variants={itemVariants} className="p-8">
          {!isSuccess ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...register('currentPassword')}
                    placeholder="Entrez votre mot de passe actuel"
                    className={`w-full h-[54px] pl-12 pr-12 rounded-xl border ${
                      errors.currentPassword ? 'border-red-500' : 'border-gray-200'
                    } bg-gray-50/50 focus:bg-white focus:border-[#B88646] focus:ring-2 focus:ring-[#B88646]/20 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 text-start`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showCurrentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1.5"
                  >
                    {errors.currentPassword.message}
                  </motion.p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    {...register('newPassword')}
                    placeholder="Entrez un nouveau mot de passe"
                    onChange={(e) => {
                      register('newPassword').onChange(e);
                      calculateStrength(e.target.value);
                    }}
                    className={`w-full h-[54px] pl-12 pr-12 rounded-xl border ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-200'
                    } bg-gray-50/50 focus:bg-white focus:border-[#B88646] focus:ring-2 focus:ring-[#B88646]/20 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 text-start`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1.5"
                  >
                    {errors.newPassword.message}
                  </motion.p>
                )}

                {/* Password Strength */}
                {newPassword.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Force du mot de passe:
                      </span>
                      <span className={`text-sm font-semibold ${
                        passwordStrength > 60 ? 'text-[#B8863B]' : 
                        passwordStrength > 40 ? 'text-[#C89B5A]' : 
                        passwordStrength > 20 ? 'text-[#D8B67A]' : 
                        'text-[#7A6855]'
                      }`}>
                        {getStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                      />
                    </div>

                    {/* Password Rules */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {[
                        { key: 'length', label: '✓ Minimum 8 caractères' },
                        { key: 'uppercase', label: '✓ Une lettre majuscule' },
                        { key: 'lowercase', label: '✓ Une lettre minuscule' },
                        { key: 'number', label: '✓ Un chiffre' },
                        { key: 'special', label: '✓ Un caractère spécial' },
                      ].map((rule) => (
                        <div key={rule.key} className="flex items-center gap-2 text-sm">
                          {passwordRules[rule.key] ? (
                            <FaCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                          )}
                          <span className={passwordRules[rule.key] ? 'text-green-600' : 'text-gray-500'}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    placeholder="Confirmez votre nouveau mot de passe"
                    className={`w-full h-[54px] pl-12 pr-12 rounded-xl border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                    } bg-gray-50/50 focus:bg-white focus:border-[#B88646] focus:ring-2 focus:ring-[#B88646]/20 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 text-start`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1.5"
                  >
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </div>

              {/* Buttons */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-[54px] rounded-xl bg-gradient-to-r from-[#B88646] to-[#9E6C30] text-white font-semibold text-lg shadow-lg shadow-[#B88646]/25 hover:shadow-xl hover:shadow-[#B88646]/35 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Modification en cours...
                    </>
                  ) : (
                    'Changer le mot de passe'
                  )}
                </motion.button>

                <Link
                  to="/profile"
                  className="flex-1 h-[54px] rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaTimes className="text-lg" />
                  Annuler
                </Link>
              </motion.div>
            </form>
          ) : (
            /* Success Message - French */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-green-500 text-4xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Votre mot de passe a été modifié avec succès.
              </h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
                Votre mot de passe a été mis à jour avec succès. Vous pouvez continuer à utiliser votre compte en toute sécurité.
              </p>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 text-[#B88646] hover:text-[#9E6C30] font-semibold transition-colors duration-200"
              >
                <FaArrowLeft className="text-sm" />
                Retour au profil
              </Link>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;