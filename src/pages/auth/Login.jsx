// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaGoogle,
  FaApple,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
} from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Import des images
import Logo from '../../assets/images/logo.png';
import Dessert from '../../assets/images/dessert.png';
import Coffee from '../../assets/images/coffee.png';
import Leaves from '../../assets/images/leaves.png';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Utiliser la fonction login du contexte
    login(formData.email, formData.password);
    // Rediriger vers dashboard avec navigate au lieu de window.location
    navigate('/dashboard');
  };

  // Connexion rapide pour les tests
  const handleQuickLogin = () => {
    login('admin@larte.com', 'password');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] flex items-center justify-center p-4 font-['Cairo'] relative overflow-hidden">
      {/* Décorations */}
      <div className="absolute top-[-150px] right-[-150px] w-[400px] h-[400px] rounded-full bg-[#B88646]/10 blur-3xl" />
      <div className="absolute bottom-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full bg-[#B88646]/10 blur-3xl" />
      
      {/* Carte principale */}
      <motion.div
        className="w-full max-w-[1200px] bg-white/80 backdrop-blur-sm rounded-[22px] shadow-[0_30px_80px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row border border-white/50"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Côté gauche - Image */}
        <div className="hidden md:flex md:w-[50%] bg-gradient-to-br from-[#FAF7F2] to-[#F3EDE4] p-12 flex-col items-center justify-center relative overflow-hidden min-h-[600px]">
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-8 w-full">
            <div className="flex flex-col items-center gap-2">
              <img 
                src={Logo} 
                alt="L'arte del dolce Logo"
                className="w-28 h-28 object-contain"
              />
              <h1 className="text-3xl font-bold text-[#2D2D2D] leading-tight text-center">L'arte del dolce</h1>
              <p className="text-[#777777] text-sm tracking-wider text-center">DESSERT & COFFEE SHOP</p>
            </div>

            <div className="flex items-center justify-center relative w-full">
              <div className="relative flex items-center justify-center">
                <img 
                  src={Dessert} 
                  alt="Dessert"
                  className="w-[380px] h-[380px] object-contain rounded-full shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6">
                  <img 
                    src={Coffee} 
                    alt="Café"
                    className="w-28 h-28 object-contain rounded-full shadow-xl bg-white p-3 border-2 border-[#B88646]/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Côté droit - Formulaire */}
        <div className="w-full md:w-[50%] p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            {/* Logo pour mobile */}
            <div className="md:hidden flex flex-col items-center gap-2 mb-8">
              <img 
                src={Logo} 
                alt="L'arte del dolce Logo"
                className="w-16 h-16 object-contain"
              />
              <h1 className="text-xl font-bold text-[#2D2D2D] leading-tight text-center">L'arte del dolce</h1>
            </div>

            {/* En-tête */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[#2D2D2D]">Bon retour !</h2>
              <p className="text-[#777777] text-sm mt-2">Connectez-vous pour continuer</p>
            </div>

            {/* Bouton de connexion rapide pour les tests */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleQuickLogin}
              className="w-full h-[48px] rounded-[18px] bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 mb-6"
            >
              ⚡ Connexion rapide (Test)
            </motion.button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E9DDCF]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 backdrop-blur-sm text-[#777777]">ou connectez-vous</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5 text-left">Adresse email</label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777777] text-lg" />
                  <input
                    type="email"
                    name="email"
                    placeholder="exemple@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-[54px] pl-12 pr-4 rounded-[18px] border border-[#E9DDCF] bg-white/70 backdrop-blur-sm focus:border-[#B88646] focus:ring-2 focus:ring-[#B88646]/20 focus:outline-none transition-all duration-300 text-[#2D2D2D] placeholder-[#B0A8A0] text-left"
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5 text-left">Mot de passe</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777777] text-lg" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-[54px] pl-12 pr-12 rounded-[18px] border border-[#E9DDCF] bg-white/70 backdrop-blur-sm focus:border-[#B88646] focus:ring-2 focus:ring-[#B88646]/20 focus:outline-none transition-all duration-300 text-[#2D2D2D] placeholder-[#B0A8A0] text-left"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#B88646] transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-[#2D2D2D] cursor-pointer">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-[#E9DDCF] text-[#B88646] focus:ring-[#B88646]/20 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Se souvenir de moi</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-[#B88646] hover:text-[#9E6C30] transition-colors duration-200">
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Bouton de connexion */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full h-[56px] rounded-[18px] bg-gradient-to-r from-[#B88646] to-[#9E6C30] text-white font-semibold text-lg shadow-lg shadow-[#B88646]/30 hover:shadow-xl hover:shadow-[#B88646]/40 transition-all duration-300"
              >
                Se connecter
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

              {/* Google */}
              <button
                type="button"
                className="w-full h-[54px] flex items-center justify-center gap-3 rounded-[18px] border border-[#E9DDCF] bg-white/70 backdrop-blur-sm hover:bg-[#FAF7F2] hover:border-[#B88646] transition-all duration-300 text-[#2D2D2D] font-medium"
              >
                <FaGoogle className="text-[#EA4335] text-lg" />
                <span>Se connecter avec Google</span>
              </button>

              {/* Apple */}
              <button
                type="button"
                className="w-full h-[54px] flex items-center justify-center gap-3 rounded-[18px] border border-[#E9DDCF] bg-white/70 backdrop-blur-sm hover:bg-[#FAF7F2] hover:border-[#B88646] transition-all duration-300 text-[#2D2D2D] font-medium"
              >
                <FaApple className="text-[#2D2D2D] text-xl" />
                <span>Se connecter avec Apple</span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[#B0A8A0] text-xs">
                © 2026 L'arte del dolce
                <br />
                Plateforme de gestion intégrée
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;