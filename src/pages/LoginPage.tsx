import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Eye, EyeOff, Lock, Mail, LogIn, Shield, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PasskeyLogin from '../components/auth/PasskeyLogin';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, login, isLoading, error: authError } = useAuth();
  const { success } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'passkey'>('email');
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);
  
  // 👇 IMPORTANTE: Flag para evitar redirecciones múltiples
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);

  useEffect(() => {
    setIsPasskeySupported(window.PublicKeyCredential !== undefined);
    console.log('🔍 Passkey supported:', window.PublicKeyCredential !== undefined);
  }, []);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength === 0) return '';
    if (strength < 40) return 'Débil';
    if (strength < 70) return 'Media';
    return 'Fuerte';
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor = getStrengthColor(passwordStrength);
  const strengthText = getStrengthText(passwordStrength);

  // 👇 MODIFICADO: useEffect para redirección con control de flag
  useEffect(() => {
    // Solo redirigir si:
    // 1. Hay un usuario autenticado
    // 2. No estamos ya en proceso de redirección
    // 3. No acabamos de hacer login (para evitar ciclo)
    if (user && !isRedirecting && !hasLoggedIn) {
      console.log('👤 Usuario ya autenticado, redirigiendo a notas');
      setIsRedirecting(true);
      navigate('/notes', { replace: true });
    }
  }, [user, navigate, isRedirecting, hasLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }

    setFormLoading(true);
    setError(null);

    try {
      const isSuccess = await login(email, password);
      
      if (isSuccess) {
        setHasLoggedIn(true); // 👈 Marcamos que hicimos login
        sessionStorage.setItem('justLoggedIn', 'true');
        success('✅ ¡Bienvenido de vuelta!');
        
        // 👈 Redirección explícita después de login exitoso
        console.log('🔄 Login exitoso, redirigiendo a /notes');
        navigate('/notes', { replace: true });
      } else {
        setError(authError || 'Error al iniciar sesión');
        setHasLoggedIn(false);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      setHasLoggedIn(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handlePasskeySuccess = () => {
    console.log('✅ Callback de éxito de PasskeyLogin ejecutándose');
    
    // 👇 IMPORTANTE: Prevenir redirecciones múltiples
    if (hasLoggedIn || isRedirecting) {
      console.log('⚠️ Ya se está procesando un login, ignorando');
      return;
    }
    
    setHasLoggedIn(true);
    setIsRedirecting(true);
    
    sessionStorage.setItem('justLoggedIn', 'true');
    success('✅ ¡Bienvenido con passkey!');
    
    console.log('🔄 Navegando a /notes ahora mismo');
    
    // 👇 Usar replace para evitar volver atrás al login
    navigate('/notes', { replace: true });
  };

  const loading = formLoading || isLoading;

  // Función para obtener las clases del botón de email
  const getEmailButtonClass = () => {
    return loginMethod === 'email'
      ? 'bg-white/30 text-white border border-white/50'
      : 'bg-white/10 text-blue-200 hover:bg-white/20 border border-white/20';
  };

  // Función para obtener las clases del botón de passkey
  const getPasskeyButtonClass = () => {
    return loginMethod === 'passkey'
      ? 'bg-white/30 text-white border border-white/50'
      : 'bg-white/10 text-blue-200 hover:bg-white/20 border border-white/20';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {loginMethod === 'email' ? (
              <motion.form
                key="email-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
              >
                {/* ... (todo el contenido del formulario de email se mantiene igual) ... */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Sección izquierda - Logo y título */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-center mb-6">
                        <motion.div 
                          className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-2xl relative"
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
                          <svg 
                            className="h-12 w-12 text-white relative z-10" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                            />
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M15 2v4h4" 
                            />
                          </svg>
                        </motion.div>
                      </div>
                      
                      <motion.div 
                        className="mb-4 text-center md:text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-2">
                          <span className="bg-gradient-to-r from-amber-200 via-white to-blue-200 bg-clip-text text-transparent drop-shadow-lg">
                            Quick
                          </span>
                          <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-lg">
                            Note
                          </span>
                        </h1>
                        <motion.div 
                          className="h-1 w-24 bg-gradient-to-r from-amber-400 to-blue-400 rounded-full mx-auto md:mx-auto mt-2"
                          initial={{ width: 0 }}
                          animate={{ width: 96 }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                        />
                      </motion.div>
                      
                      <motion.h2 
                        className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-4 tracking-tight text-center md:text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        Bienvenido de vuelta
                      </motion.h2>
                      
                      <motion.p 
                        className="text-blue-100 text-lg font-light max-w-md text-center md:text-center mx-auto md:mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        Ingresa tus credenciales para acceder a tu cuenta
                      </motion.p>
                      
                      <motion.div 
                        className="mt-6 flex justify-center md:justify-center gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <button
                          type="button"
                          onClick={() => setLoginMethod('email')}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${getEmailButtonClass()}`}
                        >
                          <Mail className="h-4 w-4 inline-block mr-2" />
                          Email
                        </button>
                        
                        {isPasskeySupported && (
                          <button
                            type="button"
                            onClick={() => setLoginMethod('passkey')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${getPasskeyButtonClass()}`}
                          >
                            <Fingerprint className="h-4 w-4 inline-block mr-2" />
                            Biometría
                          </button>
                        )}
                      </motion.div>
                      
                      <motion.div 
                        className="mt-8 text-center md:text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      >
                        <p className="text-blue-200 text-sm font-light">
                          Al iniciar sesión, aceptas nuestros{' '}
                          <button 
                            type="button"
                            className="text-white hover:text-blue-100 font-semibold transition-colors duration-200 hover:underline"
                          >
                            Términos de Servicio
                          </button>{' '}
                          y{' '}
                          <button 
                            type="button"
                            className="text-white hover:text-blue-100 font-semibold transition-colors duration-200 hover:underline"
                          >
                            Política de Privacidad
                          </button>
                        </p>
                      </motion.div>
                    </div>

                    {/* Sección derecha - Formulario de email */}
                    <div className="flex-1 w-full">
                      <AnimatePresence mode="wait">
                        {error && (
                          <motion.div
                            key="error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/25 border border-red-400/40 text-red-100 px-6 py-4 rounded-2xl mb-6 backdrop-blur-sm"
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">{error}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-6">
                        <div className="relative group">
                          <label className="block text-white text-sm font-semibold mb-3 tracking-wide" htmlFor="email">
                            CORREO ELECTRÓNICO
                          </label>
                          <div className="relative">
                            <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200 h-5 w-5 transition-colors duration-200 group-focus-within:text-white z-10" />
                            <input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={loading}
                              className="w-full bg-transparent border border-white/40 text-white placeholder-blue-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                              placeholder="tu@email.com"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="relative group">
                          <label className="block text-white text-sm font-semibold mb-3 tracking-wide" htmlFor="password">
                            CONTRASEÑA
                          </label>
                          <div className="relative">
                            <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/15 transition-all duration-300"></div>
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200 h-5 w-5 transition-colors duration-200 group-focus-within:text-white z-10" />
                            <input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              disabled={loading}
                              className="w-full bg-transparent border border-white/40 text-white placeholder-blue-200 rounded-2xl pl-12 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 relative z-10 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                              placeholder="••••••••"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={loading}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors duration-200 z-10 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>

                          {password.length > 0 && (
                            <motion.div 
                              className="mt-4 space-y-2"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <Shield className={`h-4 w-4 ${
                                    passwordStrength < 40 ? 'text-red-400' : 
                                    passwordStrength < 70 ? 'text-yellow-400' : 'text-green-400'
                                  }`} />
                                  <span className="text-xs text-blue-100 font-medium">SEGURIDAD</span>
                                </div>
                                <span className={`text-sm font-bold ${
                                  passwordStrength < 40 ? 'text-red-300' : 
                                  passwordStrength < 70 ? 'text-yellow-300' : 'text-green-300'
                                }`}>
                                  {strengthText}
                                </span>
                              </div>
                              <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm overflow-hidden">
                                <motion.div 
                                  className={`h-2 rounded-full transition-all duration-700 ease-out ${strengthColor} shadow-lg`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${passwordStrength}%` }}
                                  transition={{ duration: 0.7, ease: "easeOut" }}
                                ></motion.div>
                              </div>
                              <div className="text-xs text-blue-200 font-light">
                                {passwordStrength < 70 ? 
                                  'Usa mayúsculas, números y símbolos' : 
                                  '¡Contraseña segura!'
                                }
                              </div>
                            </motion.div>
                          )}
                          
                          <div className="mt-4 flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-blue-500 rounded border-white/40 bg-white/20 focus:ring-blue-500 focus:ring-offset-0"
                                disabled={loading}
                              />
                              <span className="text-sm text-blue-100">
                                Recordarme
                              </span>
                            </label>
                            
                            <motion.button 
                              type="button"
                              onClick={() => navigate('/forgot-password')}
                              className="text-blue-200 hover:text-white text-xs font-semibold transition-all duration-200 hover:underline tracking-wide disabled:opacity-50 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/20 hover:border-white/30 backdrop-blur-sm"
                              disabled={loading}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              ¿OLVIDASTE TU CONTRASEÑA?
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <motion.button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-3 relative overflow-hidden group"
                          whileHover={{ scale: loading ? 1 : 1.02 }}
                          whileTap={{ scale: loading ? 1 : 0.98 }}
                        >
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300"></div>
                          {loading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="rounded-full h-5 w-5 border-b-2 border-white relative z-10"
                              />
                              <span className="text-base font-semibold relative z-10">INICIANDO SESIÓN...</span>
                            </>
                          ) : (
                            <>
                              <LogIn className="h-5 w-5 relative z-10" />
                              <span className="text-base font-semibold relative z-10">INICIAR SESIÓN</span>
                            </>
                          )}
                        </motion.button>
                      </div>

                      <div className="text-center mt-6">
                        <Link
                          to="/register"
                          className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium hover:shadow-md transition-all duration-300 group backdrop-blur-sm border border-white/20"
                        >
                          <span>✨</span>
                          <span className="mx-2">¿No tienes cuenta? Regístrate aquí</span>
                          <svg
                            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Link>
                      </div>

                      <div className="text-center mt-8 pt-6 border-t border-white/10">
                        <p className="text-blue-200/60 text-sm">
                          QuickNote · Desarrollado con ❤️ por José Pablo Miranda Quintanilla
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="passkey-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <motion.div 
                      className="flex items-center justify-center mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                        <Fingerprint className="w-12 h-12 text-white" />
                      </div>
                    </motion.div>
                    
                    <motion.h2 
                      className="text-3xl font-bold text-white mb-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      Inicio con Passkey
                    </motion.h2>
                    
                    <motion.p 
                      className="text-blue-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Usa tu dispositivo biométrico para acceder
                    </motion.p>
                  </div>

                  <PasskeyLogin onSuccess={handlePasskeySuccess} mode="login" />

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('email')}
                      className="text-blue-200 hover:text-white text-sm font-medium transition-colors"
                    >
                      ← Volver a inicio con email
                    </button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-blue-200/60 text-xs">
                      Tus datos biométricos nunca salen de tu dispositivo
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;