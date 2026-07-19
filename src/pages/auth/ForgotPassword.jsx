// src/pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import Logo from '../../assets/images/logo.png';
import Dessert from '../../assets/images/dessert.png';
import Coffee from '../../assets/images/coffee.png';
import Leaves from '../../assets/images/leaves.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] flex items-center justify-center p-4 font-['Cairo'] relative overflow-hidden">
      {/* Decorations d'arrière-plan */}
      <div className="absolute top-[-150px] right-[-150px] w-[400px] h-[400px] rounded-full bg-[#B88646]/10 blur-3xl" />
      <div className="absolute bottom-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full bg-[#B88646]/10 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full border border-[#B88646]/10" />
      <div className="absolute bottom-1/3 left-1/4 w-[200px] h-[200px] rounded-full border border-[#B88646]/10" />
      
      <img 
        src={Leaves} 
        alt=""
        className="absolute top-10 right-10 opacity-20 w-20 h-20 rotate-45"
      />
      <img 
        src={Leaves} 
        alt=""
        className="absolute bottom-10 left-10 opacity-20 w-20 h-20 -rotate-45"
      />

      {/* Conteneur Principal */}
      <motion.div
        className="w-full max-w-[1200px] bg-white/80 backdrop-blur-sm rounded-[22px] shadow-[0_30px_80px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row border border-white/50"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Section Gauche */}
        <div className="hidden md:flex md:w-[50%] bg-gradient-to-br from-[#FAF7F2] to-[#F3EDE4] p-12 flex-col items-center justify-center relative overflow-hidden min-h-[600px]">
          <motion.div
            className="relative z-10 h-full flex flex-col items-center justify-center gap-8 w-full"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {/* Logo */}
            <motion.div 
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <img 
                src={Logo} 
                alt="L'arte del dolce Logo"
                className="w-28 h-28 object-contain"
              />
              <h1 className="text-3xl font-bold text-[#2D2D2D] leading-tight text-center">L'arte del dolce</h1>
              <p className="text-[#777777] text-sm tracking-wider text-center">DESSERT & COFFEE SHOP</p>
            </motion.div>

            {/* Dessert */}
            <motion.div 
              className="flex items-center justify-center relative w-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="relative flex items-center justify-center">
                <img 
                  src={Dessert} 
                  alt="Dessert"
                  className="w-[380px] h-[380px] object-contain rounded-full shadow-2xl"
                />
                <motion.div
                  className="absolute -bottom-6 -left-6"
                  animate={{
                    y: [0, -12, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <img 
                    src={Coffee} 
                    alt="Café"
                    className="w-28 h-28 object-contain rounded-full shadow-xl bg-white p-3 border-2 border-[#B88646]/20"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Texte */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-[#B88646]/10 text-[#B88646] text-xs font-semibold tracking-wider mb-3">
                RÉINITIALISATION DU MOT DE PASSE
              </span>
              <h2 className="text-2xl font-bold text-[#2D2D2D]">Mot de passe oublié ?</h2>
              <p className="text-[#777777] text-sm mt-2 leading-relaxed max-w-xs">
                Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Section Droite */}
        <div className="w-full md:w-[50%] p-8 md:p-12 flex flex-col justify-center">
          <motion.div
            className="max-w-sm mx-auto w-full"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {/* Logo pour petits écrans */}
            <div className="md:hidden flex flex-col items-center gap-2 mb-8">
              <img 
                src={Logo} 
                alt="L'arte del dolce Logo"
                className="w-16 h-16 object-contain"
              />
              <h1 className="text-xl font-bold text-[#2D2D2D] leading-tight text-center">L'arte del dolce</h1>
              <p className="text-[#777777] text-[10px] tracking-wider text-center">DESSERT & COFFEE SHOP</p>
            </div>

            {!isSubmitted ? (
              <>
                {/* En-tête */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-[#2D2D2D]">Mot de passe oublié ?</h2>
                  <p className="text-[#777777] text-sm mt-2">Entrez votre email pour recevoir un lien de réinitialisation</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Champ Email */}
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5 text-left">Adresse email</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777777] text-lg" />
                      <input
                        type="email"
                        placeholder="Entrez votre email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-[54px] pl-12 pr-4 rounded-[18px] border border-[#E9DDCF] bg-white/70 backdrop-blur-sm focus:border-[#B88646] focus:ring-2 focus:ring-[#B88646]/20 focus:outline-none transition-all duration-300 text-[#2D2D2D] placeholder-[#B0A8A0] text-left"
                        required
                      />
                    </div>
                  </div>

                  {/* Bouton Soumettre */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[56px] rounded-[18px] bg-gradient-to-r from-[#B88646] to-[#9E6C30] text-white font-semibold text-lg shadow-lg shadow-[#B88646]/30 hover:shadow-xl hover:shadow-[#B88646]/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      'Envoyer le lien de réinitialisation'
                    )}
                  </motion.button>

                  {/* Séparateur */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E9DDCF]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white/80 backdrop-blur-sm text-[#777777]">ou</span>
                    </div>
                  </div>

                  {/* Retour à la connexion */}
                  <Link to="/login" className="flex items-center justify-center gap-3 w-full text-[#B88646] hover:text-[#9E6C30] hover:bg-[#B88646]/5 transition-all duration-300 py-3 px-4 rounded-[12px] font-medium">
                    <FaArrowLeft className="text-lg" />
                    <span>Retour à la connexion</span>
                  </Link>
                </form>
              </>
            ) : (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-r from-[#B88646] to-[#9E6C30] flex items-center justify-center text-white text-4xl font-bold mx-auto mb-5 shadow-lg shadow-[#B88646]/30">
                  ✓
                </div>
                <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">Email envoyé !</h2>
                <p className="text-[#777777] text-sm leading-relaxed mb-6">
                  Un lien de réinitialisation a été envoyé à
                  <br />
                  <strong className="text-[#2D2D2D]">{email}</strong>
                </p>
                <Link to="/login" className="flex items-center justify-center gap-3 w-full text-[#B88646] hover:text-[#9E6C30] hover:bg-[#B88646]/5 transition-all duration-300 py-3 px-4 rounded-[12px] font-medium">
                  <FaArrowLeft className="text-lg" />
                  <span>Retour à la connexion</span>
                </Link>
              </motion.div>
            )}

            <div className="mt-8 text-center">
              <p className="text-[#B0A8A0] text-xs">
                © 2026 L'arte del dolce
                <br />
                Plateforme de gestion intégrée
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;