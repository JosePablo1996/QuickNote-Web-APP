// src/pages/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Eye, EyeOff, Shield, KeyRound, 
  CheckCircle, XCircle, ArrowLeft, AlertCircle, Info
} from 'lucide-react';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || '';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { success, error: showError } = useToast();
  const [searchParams] = useSearchParams();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // Verificar si hay token en la URL (fallback para enlace tradicional)
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const type = searchParams.get('type');
    
    if (accessToken && type === 'recovery') {
      setToken(accessToken);
      console.log('Token de recuperacion encontrado');
    } else {
      // Sin token, mostrar mensaje informativo
      console.log('Sin token de recuperacion - usa el flujo de OTP');
    }
  }, [searchParams]);

  // Calcular fortaleza de la contraseña
  useEffect(() => {
    let strength = 0;
    if (newPassword.length >= 8) strength += 25;
    if (/[a-z]/.test(newPassword)) strength += 25;
    if (/[A-Z]/.test(newPassword)) strength += 25;
    if (/[0-9]/.test(newPassword)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(newPassword)) strength += 25;
    
    setPasswordStrength(Math.min(strength, 100));
    
    if (strength < 40) setStrengthText('Debil');
    else if (strength < 70) setStrengthText('Media');
    else setStrengthText('Fuerte');
  }, [newPassword]);

  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (newPassword.length < 8) {
      setLocalError('La contrasena debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword.length > 50) {
      setLocalError('La contrasena no puede tener mas de 50 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Las contrasenas no coinciden');
      return;
    }

    if (passwordStrength < 40) {
      setLocalError('La contrasena es demasiado debil. Usa mayusculas, numeros y simbolos');
      return;
    }

    setIsLoading(true);

    try {
      // Si tenemos token, usar el endpoint tradicional
      if (token) {
        const response = await fetch(`${API_URL}/api/v1/auth/update-password`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ new_password: newPassword })
        });

        if (response.ok) {
          setIsSuccess(true);
          success('Contrasena actualizada correctamente');
          setTimeout(() => {
            navigate('/login', { 
              state: { message: 'Contrasena actualizada. Inicia sesion con tu nueva contrasena.' }
            });
          }, 3000);
        } else {
          const data = await response.json();
          setLocalError(data.detail || 'Error al actualizar la contrasena');
        }
      } else {
        // Sin token, redirigir al flujo OTP
        setLocalError('Para mayor seguridad, usa la opcion "Olvide mi contrasena" en el login');
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      }
    } catch (error) {
      console.error('Error reseteando contrasena:', error);
      setLocalError('Error de conexion. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Pantalla de exito
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="flex items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-md mx-auto">
            <motion.div 
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-600/10 rounded-3xl"></div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-green-400/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 text-center">
                <motion.div 
                  className="flex justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                    <div className="absolute inset-0 bg-white/10 rounded-full backdrop-blur-sm"></div>
                    <CheckCircle className="h-12 w-12 text-white relative z-10" />
                  </div>
                </motion.div>

                <motion.h2 
                  className="text-3xl font-bold text-white mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  ¡Contraseña actualizada!
                </motion.h2>
                
                <motion.p 
                  className="text-blue-100 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Tu contraseña ha sido cambiada exitosamente. Serás redirigido al login.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={handleBackToLogin}
                    className="inline-flex items-center text-blue-200 hover:text-white transition-colors group"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Volver al inicio de sesión
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla principal del formulario
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
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <motion.div 
                  className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-2xl relative"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                >
                  <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
                  <KeyRound className="h-10 w-10 text-white relative z-10" />
                </motion.div>
              </div>

              <motion.h2 
                className="text-2xl font-bold text-center text-white mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Restablecer contraseña
              </motion.h2>
              
              <motion.p 
                className="text-center text-blue-100 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {token 
                  ? "Ingresa tu nueva contraseña"
                  : "Para mayor seguridad, usa la opcion de recuperacion"
                }
              </motion.p>

              {!token && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mb-6 p-3 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl flex items-center gap-2"
                >
                  <Info className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                  <p className="text-xs text-yellow-200">
                    No se encontro un token valido. Usa la opcion "Olvide mi contraseña"
                  </p>
                </motion.div>
              )}

              <AnimatePresence>
                {localError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/25 border border-red-400/40 text-red-100 px-4 py-3 rounded-xl mb-6 flex items-center backdrop-blur-sm"
                  >
                    <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{localError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {token && (
                <div className="space-y-5">
                  <div className="relative group">
                    <label className="block text-white text-xs font-semibold mb-2 tracking-wide" htmlFor="newPassword">
                      NUEVA CONTRASEÑA
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-4 w-4 z-10" />
                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-transparent border border-white/40 text-white placeholder-blue-200 rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-sm"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors duration-200 z-10"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {newPassword.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-1">
                            <Shield className={`h-3 w-3 ${
                              passwordStrength < 40 ? 'text-red-400' : 
                              passwordStrength < 70 ? 'text-yellow-400' : 'text-green-400'
                            }`} />
                            <span className="text-xs text-blue-100">SEGURIDAD</span>
                          </div>
                          <span className={`text-xs font-bold ${
                            passwordStrength < 40 ? 'text-red-300' : 
                            passwordStrength < 70 ? 'text-yellow-300' : 'text-green-300'
                          }`}>
                            {strengthText}
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-1.5 backdrop-blur-sm overflow-hidden">
                          <motion.div 
                            className={`h-1.5 rounded-full transition-all duration-700 ease-out ${getStrengthColor()}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength}%` }}
                            transition={{ duration: 0.7 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative group">
                    <label className="block text-white text-xs font-semibold mb-2 tracking-wide" htmlFor="confirmPassword">
                      CONFIRMAR CONTRASEÑA
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-4 w-4 z-10" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full bg-transparent border ${
                          confirmPassword && newPassword !== confirmPassword ? 'border-red-400' : 'border-white/40'
                        } text-white placeholder-blue-200 rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-sm`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors duration-200 z-10"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-300 mt-1">Las contraseñas no coinciden</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3 mt-6"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="rounded-full h-5 w-5 border-b-2 border-white"
                        />
                        <span className="text-base font-semibold">ACTUALIZANDO...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-5 w-5" />
                        <span className="text-base font-semibold">ACTUALIZAR CONTRASEÑA</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="inline-flex items-center text-blue-200 hover:text-white text-sm font-medium transition-colors duration-200 group"
                >
                  <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                  Volver al inicio de sesión
                </button>
              </div>

              <div className="text-center mt-8 pt-6 border-t border-white/10">
                <p className="text-blue-200/60 text-sm">
                  QuickNote · Desarrollado con ❤️ por José Pablo Miranda Quintanilla
                </p>
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;