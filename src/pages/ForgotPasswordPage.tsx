// src/pages/ForgotPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, ArrowLeft, KeyRound, Lock, Eye, EyeOff, Shield,
  CheckCircle, XCircle, AlertCircle, Send, Hash
} from 'lucide-react';

// API base URL
const API_URL = 'http://localhost:8000';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { success, error: showError } = useToast();
  
  // Estados para el flujo de 4 pasos
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  // Estados para fortaleza de contraseña
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');

  // Timer para reenvío de código
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

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

  // Paso 2: Enviar OTP al email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    if (!email.trim()) {
      setLocalError('Por favor ingresa tu correo electronico');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Por favor ingresa un correo electronico valido');
      setIsLoading(false);
      return;
    }

    try {
      const url = `${API_URL}/api/v1/auth/forgot-password/send-otp`;
      console.log('Enviando a:', url);
      console.log('Email:', email);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      console.log('Respuesta status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Respuesta data:', data);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        throw new Error('Respuesta invalida del servidor');
      }

      if (response.ok && data.success) {
        setEmailSent(true);
        setTimer(60);
        setCanResend(false);
        setStep(3);
        success('Codigo enviado a tu correo electronico');
      } else {
        setLocalError(data.message || data.detail || 'Error al enviar el codigo');
        showError(data.message || data.detail || 'Error al enviar el codigo');
      }
    } catch (error) {
      console.error('Error enviando OTP:', error);
      setLocalError(`Error de conexion. Verifica que el backend este corriendo en ${API_URL}`);
      showError('No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 3: Verificar OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    if (!code || code.length !== 6) {
      setLocalError('Por favor ingresa el codigo de 6 digitos');
      setIsLoading(false);
      return;
    }

    try {
      const url = `${API_URL}/api/v1/auth/forgot-password/verify-otp`;
      console.log('Verificando en:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTempToken(data.temp_token || '');
        setStep(4);
        success('Codigo verificado correctamente');
      } else {
        setLocalError(data.message || data.detail || 'Codigo invalido o expirado');
        showError(data.message || 'Codigo invalido');
      }
    } catch (error) {
      console.error('Error verificando OTP:', error);
      setLocalError('Error de conexion. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setLocalError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTimer(60);
        setCanResend(false);
        success('Nuevo codigo enviado');
      } else {
        setLocalError(data.message || 'Error al reenviar el codigo');
      }
    } catch (error) {
      console.error('Error reenviando OTP:', error);
      setLocalError('Error de conexion');
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 4: Resetear contraseña con cierre de sesión forzado
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (newPassword.length < 8) {
      setLocalError('La contrasena debe tener al menos 8 caracteres');
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
      const response = await fetch(`${API_URL}/api/v1/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password: newPassword })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        success('Contrasena actualizada correctamente');
        
        // ============================================
        // FORZAR CIERRE DE SESION INMEDIATO
        // ============================================
        
        console.log('🔄 Forzando cierre de sesion...');
        
        // 1. Limpiar localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('refresh_token');
        
        // 2. Limpiar sessionStorage
        sessionStorage.clear();
        
        // 3. Forzar evento de storage para que otros tabs se enteren
        window.dispatchEvent(new Event('storage'));
        
        console.log('✅ Tokens limpiados, redirigiendo al login...');
        
        // 4. Redirigir forzadamente al login (recarga completa)
        // Esto garantiza que el estado de la app se reinicie completamente
        window.location.href = '/login?message=Contrasena+actualizada+correctamente.+Inicia+sesion+con+tu+nueva+contrasena';
        
      } else {
        if (data.detail?.errors) {
          setLocalError(data.detail.errors.join('. '));
        } else {
          setLocalError(data.message || data.detail || 'Error al actualizar la contrasena');
        }
      }
    } catch (error) {
      console.error('Error reseteando contrasena:', error);
      setLocalError('Error de conexion. Intenta nuevamente.');
      showError('Error de conexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // RENDERIZADO DE CADA PASO
  // ============================================

  // Paso 1: Pantalla de bienvenida
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="flex items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-md mx-auto">
            <motion.div 
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 text-center">
                <motion.h2 
                  className="text-2xl font-bold text-white mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  ¿Olvidaste tu contraseña?
                </motion.h2>
                
                <motion.p 
                  className="text-blue-100 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  No te preocupes, te ayudaremos a recuperar el acceso a tu cuenta.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3"
                  >
                    <span className="text-base font-semibold">CONTINUAR</span>
                  </button>
                </motion.div>

                <motion.div 
                  className="text-center mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <button
                    onClick={handleBackToLogin}
                    className="inline-flex items-center text-blue-200 hover:text-white text-sm font-medium transition-colors duration-200 group"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
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

  // Paso 2: Ingresar email
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="flex items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-md mx-auto">
            <motion.form 
              onSubmit={handleSendOtp}
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <motion.h2 
                  className="text-2xl font-bold text-center text-white mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Recuperar contraseña
                </motion.h2>
                
                <motion.p 
                  className="text-center text-blue-100 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Te enviaremos un codigo de verificacion a tu correo
                </motion.p>

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

                <div className="space-y-5">
                  <div className="relative group">
                    <label className="block text-white text-xs font-semibold mb-2 tracking-wide" htmlFor="email">
                      CORREO ELECTRONICO
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-4 w-4 z-10" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-transparent border border-white/40 text-white placeholder-blue-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-sm disabled:opacity-50"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3 mt-6"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="rounded-full h-5 w-5 border-b-2 border-white"
                        />
                        <span className="text-base font-semibold">ENVIANDO...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span className="text-base font-semibold">ENVIAR CODIGO</span>
                      </>
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center text-blue-200 hover:text-white text-sm font-medium transition-colors duration-200 group"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                      Volver
                    </button>
                  </div>
                </div>
              </div>
            </motion.form>
          </div>
        </div>
      </div>
    );
  }

  // Paso 3: Verificar codigo OTP
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="flex items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-md mx-auto">
            <motion.form 
              onSubmit={handleVerifyOtp}
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <motion.h2 
                  className="text-2xl font-bold text-center text-white mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Verifica tu identidad
                </motion.h2>
                
                <motion.p 
                  className="text-center text-blue-100 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Ingresa el codigo de 6 digitos que enviamos a {email}
                </motion.p>

                <AnimatePresence>
                  {localError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/25 border border-red-400/40 text-red-100 px-4 py-3 rounded-xl mb-6 flex items-center backdrop-blur-sm"
                    >
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">{localError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-5">
                  <div className="relative group">
                    <label className="block text-white text-xs font-semibold mb-2 tracking-wide" htmlFor="code">
                      CODIGO DE VERIFICACION
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-4 w-4 z-10" />
                      <input
                        id="code"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        disabled={isLoading}
                        className="w-full bg-transparent border border-white/40 text-white placeholder-blue-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-sm text-center tracking-[0.25em] font-mono text-lg disabled:opacity-50"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">
                      {timer > 0 ? (
                        `Reenviar en ${formatTime(timer)}`
                      ) : canResend ? (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-blue-300 hover:text-white underline transition-colors"
                        >
                          Reenviar codigo
                        </button>
                      ) : (
                        <span className="opacity-50">Espera para reenviar</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      Cambiar email
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3 mt-6"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="rounded-full h-5 w-5 border-b-2 border-white"
                        />
                        <span className="text-base font-semibold">VERIFICANDO...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-base font-semibold">VERIFICAR CODIGO</span>
                      </>
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center text-blue-200 hover:text-white text-sm font-medium transition-colors duration-200 group"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </motion.form>
          </div>
        </div>
      </div>
    );
  }

  // Paso 4: Nueva contraseña
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md mx-auto">
          <motion.form 
            onSubmit={handleResetPassword}
            className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <motion.h2 
                className="text-2xl font-bold text-center text-white mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Nueva contraseña
              </motion.h2>
              
              <motion.p 
                className="text-center text-blue-100 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Crea una contraseña segura para tu cuenta
              </motion.p>

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

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center text-blue-200 hover:text-white text-sm font-medium transition-colors duration-200 group"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;