// src/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, ArrowLeft, KeyRound, 
  CheckCircle, XCircle 
} from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { resetPassword, isLoading, error: authError } = useAuth();
  const { success, error: showError } = useToast();
  
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!email.trim()) {
      setLocalError('Por favor ingresa tu correo electrónico');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Por favor ingresa un correo electrónico válido');
      return;
    }

    const isSuccess = await resetPassword(email);

    if (isSuccess) {
      setIsEmailSent(true);
      success('✅ Se ha enviado un enlace de recuperación a tu correo');
      
      // Opcional: Redirigir después de 5 segundos
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } else {
      setLocalError(authError || 'Error al enviar el correo de recuperación');
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md mx-auto">
          <motion.form 
            onSubmit={handleSubmit} 
            className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Efectos de fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <motion.div 
                  className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-2xl relative"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.2 
                  }}
                >
                  <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
                  <KeyRound className="h-10 w-10 text-white relative z-10" />
                </motion.div>
              </div>

              {/* Títulos */}
              <motion.h2 
                className="text-2xl font-bold text-center text-white mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Recuperar contraseña
              </motion.h2>
              
              <motion.p 
                className="text-center text-blue-100 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Te enviaremos un enlace para restablecer tu contraseña
              </motion.p>

              {/* Mensajes de error */}
              <AnimatePresence>
                {(localError || authError) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/25 border border-red-400/40 text-red-100 px-4 py-3 rounded-xl mb-6 flex items-center backdrop-blur-sm"
                  >
                    <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{localError || authError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mensaje de éxito */}
              <AnimatePresence>
                {isEmailSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-green-500/25 border border-green-400/40 text-green-100 px-4 py-3 rounded-xl mb-6 flex items-center backdrop-blur-sm"
                  >
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        ✅ Se ha enviado un enlace de recuperación
                      </p>
                      <p className="text-xs mt-1 text-green-200">
                        Revisa tu bandeja de entrada y carpeta de spam
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5">
                {/* Email */}
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <label className="block text-white text-xs font-semibold mb-2 tracking-wide" htmlFor="email">
                    CORREO ELECTRÓNICO
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-4 w-4 z-10" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading || isEmailSent}
                      className="w-full bg-transparent border border-white/40 text-white placeholder-blue-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="tu@email.com"
                      required
                      aria-label="Correo electrónico"
                    />
                  </div>
                  <p className="text-xs text-blue-200/70 mt-1">
                    Te enviaremos un enlace válido por 1 hora
                  </p>
                </motion.div>

                {/* Botón de enviar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <button
                    type="submit"
                    disabled={isLoading || isEmailSent}
                    className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-3 relative overflow-hidden group mt-6"
                  >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300"></div>
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="rounded-full h-5 w-5 border-b-2 border-white relative z-10"
                        />
                        <span className="text-base font-semibold relative z-10">ENVIANDO...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-5 w-5 relative z-10" />
                        <span className="text-base font-semibold relative z-10">ENVIAR ENLACE</span>
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Enlace para volver al login */}
                <motion.div 
                  className="text-center mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="inline-flex items-center text-blue-200 hover:text-white text-sm font-medium transition-colors duration-200 group"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Volver al inicio de sesión
                  </button>
                </motion.div>

                {/* Footer */}
                <motion.div 
                  className="text-center mt-8 pt-6 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <p className="text-blue-200/60 text-sm">
                    QuickNote · Desarrollado con ❤️ por José Pablo Miranda Quintanilla
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;