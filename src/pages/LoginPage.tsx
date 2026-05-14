// src/pages/LoginPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { 
  Eye, EyeOff, Lock, Mail, LogIn, Shield, 
  Fingerprint, ChevronDown, ChevronUp,
  CheckCircle, ArrowRight, Smartphone, ShieldCheck,
  Key, Hash, WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PasskeyLoginButton } from '../contexts/components/auth/PasskeyLoginButton';
import { TwoFactorVerify } from '../contexts/components/auth/TwoFactorVerify';

// Interfaz para la respuesta de login
interface LoginResponse {
  success: boolean;
  requires_2fa?: boolean;
  requires2FA?: boolean;
  temp_token?: string;
  tempToken?: string;
  message?: string;
  user_id?: string;
  access_token?: string;
  user?: {
    id: string;
    email: string;
    username?: string;
    full_name?: string;
    avatar?: string;
  } | null;
}

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
  
  // Estados para métodos alternativos
  const [showAlternativeMethods, setShowAlternativeMethods] = useState(false);
  const [passkeySuccessMessage, setPasskeySuccessMessage] = useState('');
  
  // Estados para control de redirección
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);

  // ✅ Estados para 2FA con sistema de pasos
  const [loginStep, setLoginStep] = useState<'credentials' | '2fa'>('credentials');
  const [tempToken, setTempToken] = useState('');
  const [twoFactorEmail, setTwoFactorEmail] = useState('');

  // ✅ Detectar si estamos en producción (Render) o desarrollo
  const isProduction = window.location.hostname !== 'localhost' && 
                      !window.location.hostname.includes('127.0.0.1') &&
                      !window.location.hostname.includes('192.168');
  
  // ✅ Mostrar u ocultar Passkey según el entorno
  const showPasskeyOption = !isProduction;

  // ✅ Restaurar flujo 2FA si hay datos en sessionStorage
  useEffect(() => {
    const storedToken = sessionStorage.getItem('temp_2fa_token');
    const storedEmail = sessionStorage.getItem('temp_user_email');
    
    console.log('🔍 LoginPage mounted - Verificando sessionStorage:');
    console.log('   storedToken:', storedToken);
    console.log('   storedEmail:', storedEmail);
    
    if (storedToken && storedEmail && loginStep === 'credentials') {
      console.log('🔄 Restaurando flujo 2FA desde sessionStorage');
      setTempToken(storedToken);
      setTwoFactorEmail(storedEmail);
      setLoginStep('2fa');
    }
    
    // Limpiar datos residuales SOLO si no hay flujo 2FA
    if (!storedToken) {
      sessionStorage.removeItem('login_in_progress');
      sessionStorage.removeItem('temp_user_email');
      sessionStorage.removeItem('temp_user_name');
      sessionStorage.removeItem('temp_user_avatar');
      sessionStorage.removeItem('2fa_user_data');
    }
  }, []);

  // ✅ NO redirigir si estamos en flujo 2FA
  useEffect(() => {
    if (user && loginStep !== '2fa' && !isRedirecting && !hasLoggedIn) {
      console.log('👤 Usuario ya autenticado, redirigiendo a notas');
      setIsRedirecting(true);
      navigate('/notes', { replace: true });
    }
  }, [user, loginStep, navigate, isRedirecting, hasLoggedIn]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }

    setFormLoading(true);
    setError(null);

    try {
      const loginResult = await login(email, password) as LoginResponse;
      
      console.log('🔑 Login result:', JSON.stringify(loginResult, null, 2));
      console.log('🔑 requires_2fa:', loginResult?.requires_2fa);
      console.log('🔑 requires2FA:', loginResult?.requires2FA);
      console.log('🔑 temp_token:', loginResult?.temp_token);
      console.log('🔑 tempToken:', loginResult?.tempToken);
      
      const requires2FA = loginResult?.requires_2fa === true || loginResult?.requires2FA === true;
      
      if (requires2FA) {
        console.log('🔐 2FA requerido, cambiando a paso 2FA');
        
        const token = loginResult.temp_token || loginResult.tempToken || loginResult.user_id || '';
        
        console.log('🎫 TempToken obtenido:', token);
        console.log('📧 Email:', email);
        
        if (!token) {
          console.error('❌ No se recibió tempToken en la respuesta:', loginResult);
          setError('Error: No se recibió token temporal para 2FA. Intenta de nuevo o contacta al soporte.');
          setFormLoading(false);
          return;
        }
        
        // ✅ Guardar datos en sessionStorage
        sessionStorage.setItem('temp_2fa_token', token);
        sessionStorage.setItem('temp_user_email', email);
        sessionStorage.setItem('login_in_progress', 'true');
        
        if (loginResult.user) {
          sessionStorage.setItem('2fa_user_data', JSON.stringify(loginResult.user));
          console.log('👤 Datos de usuario guardados para 2FA:', loginResult.user);
          
          // ✅ Guardar nombre completo y avatar por separado
          if (loginResult.user.full_name) {
            sessionStorage.setItem('temp_user_name', loginResult.user.full_name);
            console.log('👤 Nombre guardado:', loginResult.user.full_name);
          }
          if (loginResult.user.avatar) {
            sessionStorage.setItem('temp_user_avatar', loginResult.user.avatar);
            console.log('🖼️ Avatar guardado:', loginResult.user.avatar);
          }
        }
        
        setTempToken(token);
        setTwoFactorEmail(email);
        setLoginStep('2fa');
        setFormLoading(false);
        return;
      }
      
      // Login exitoso sin 2FA
      if (loginResult?.success) {
        setHasLoggedIn(true);
        sessionStorage.setItem('justLoggedIn', 'true');
        success('✅ ¡Bienvenido de vuelta!');
        
        console.log('🔄 Redirigiendo a /notes');
        setTimeout(() => {
          navigate('/notes', { replace: true });
        }, 300);
      } else {
        setError(authError || 'Error al iniciar sesión. Verifica tus credenciales.');
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      console.error('❌ Error en login:', errorMessage);
      setError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ Manejar éxito de verificación 2FA con redirección forzada
  const handleTwoFactorSuccess = () => {
    console.log('✅ 2FA verificado exitosamente');
    
    // Limpiar datos temporales de 2FA
    sessionStorage.removeItem('temp_2fa_token');
    sessionStorage.removeItem('login_in_progress');
    sessionStorage.removeItem('temp_user_email');
    sessionStorage.removeItem('temp_user_name');
    sessionStorage.removeItem('temp_user_avatar');
    sessionStorage.removeItem('2fa_user_data');
    
    setLoginStep('credentials');
    setTempToken('');
    setTwoFactorEmail('');
    setHasLoggedIn(true);
    setIsRedirecting(true);
    sessionStorage.setItem('justLoggedIn', 'true');
    success('✅ ¡Bienvenido de vuelta!');
    
    // ✅ Forzar redirección inmediata
    console.log('🔄 Redirigiendo a /notes...');
    navigate('/notes', { replace: true });
    
    // Backup: Si navigate no funciona en 500ms, usar window.location
    setTimeout(() => {
      if (window.location.pathname !== '/notes') {
        console.log('⚠️ Navigate no funcionó, usando window.location');
        window.location.href = '/notes';
      }
    }, 500);
  };

  // ✅ Manejar volver atrás desde 2FA
  const handleTwoFactorBack = () => {
    console.log('⬅️ Volviendo desde pantalla 2FA');
    
    setLoginStep('credentials');
    setTempToken('');
    setTwoFactorEmail('');
    setError(null);
    
    // Limpiar datos temporales de 2FA
    sessionStorage.removeItem('temp_2fa_token');
    sessionStorage.removeItem('login_in_progress');
    sessionStorage.removeItem('temp_user_email');
    sessionStorage.removeItem('temp_user_name');
    sessionStorage.removeItem('temp_user_avatar');
    sessionStorage.removeItem('2fa_user_data');
  };

  // ✅ Manejar error de 2FA
  const handleTwoFactorError = (errorMsg: string) => {
    console.error('❌ Error 2FA:', errorMsg);
    setError(errorMsg);
  };

  // ✅ Callback para login con passkey (solo desarrollo)
  const handlePasskeyLoginSuccess = () => {
    console.log('✅ Login con passkey exitoso');
    
    sessionStorage.setItem('justLoggedIn', 'true');
    setPasskeySuccessMessage('✅ Inicio de sesión exitoso. Redirigiendo...');
    setHasLoggedIn(true);
    setIsRedirecting(true);
    success('✅ ¡Bienvenido con biometría!');
    
    setShowAlternativeMethods(false);
    
    console.log('🔄 Redirigiendo a /notes...');
    setTimeout(() => {
      window.location.href = '/notes';
    }, 800);
  };

  const loading = formLoading || isLoading;

  // ============================================
  // ✅ PANTALLA 2FA
  // ============================================
  if (loginStep === '2fa' && tempToken) {
    console.log('🔐 Renderizando TwoFactorVerify - Paso 2FA');
    console.log('   tempToken:', tempToken);
    console.log('   email:', twoFactorEmail);
    
    // ✅ Obtener datos del usuario desde sessionStorage
    const userName = sessionStorage.getItem('temp_user_name');
    const userAvatar = sessionStorage.getItem('temp_user_avatar');
    
    console.log('   userName:', userName);
    console.log('   userAvatar:', userAvatar);
    
    return (
      <TwoFactorVerify
        email={twoFactorEmail}
        tempToken={tempToken}
        userFullName={userName || undefined}
        userAvatar={userAvatar || undefined}
        onSuccess={handleTwoFactorSuccess}
        onError={handleTwoFactorError}
        onBack={handleTwoFactorBack}
      />
    );
  }

  // ============================================
  // PANTALLA DE CREDENCIALES
  // ============================================
  console.log('📧 Renderizando formulario de login - Paso credentials');
  console.log('🌍 Entorno de producción:', isProduction);
  console.log('🔐 Mostrar opción Passkey:', showPasskeyOption);
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-4xl mx-auto">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
          >
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
                        aria-hidden="true"
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
                    className="mt-6 flex items-center justify-center gap-3 flex-wrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs text-blue-100 border border-white/20">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      2FA disponible
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs text-blue-100 border border-white/20">
                      <Smartphone className="w-3.5 h-3.5 text-green-400" />
                      OTP
                    </span>
                    {/* ✅ Badge de Passkey solo en desarrollo */}
                    {showPasskeyOption && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs text-blue-100 border border-white/20">
                        <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
                        Passkey
                      </span>
                    )}
                    {/* ✅ Badge de producción */}
                    {isProduction && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/30 rounded-full text-xs text-emerald-100 border border-emerald-400/50">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                        Producción
                      </span>
                    )}
                  </motion.div>
                </div>

                {/* Sección derecha - Formulario */}
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
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">{error}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {passkeySuccessMessage && (
                      <motion.div
                        key="passkey-success"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-green-500/25 border border-green-400/40 text-green-100 px-6 py-4 rounded-2xl mb-6 backdrop-blur-sm flex items-center"
                      >
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <p className="text-sm font-medium">{passkeySuccessMessage}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-6">
                    <div className="relative group">
                      <label className="block text-white text-sm font-semibold mb-3 tracking-wide" htmlFor="email">
                        CORREO ELECTRÓNICO
                      </label>
                      <div className="relative">
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
                          title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
                          <span className="text-sm text-blue-100">Recordarme</span>
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
                  
                  {/* Botón INICIAR SESIÓN */}
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

                  {/* Botón de métodos alternativos */}
                  <div className="mt-4">
                    <motion.button
                      type="button"
                      onClick={() => setShowAlternativeMethods(!showAlternativeMethods)}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                        showAlternativeMethods
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                          : 'bg-white/10 hover:bg-white/20 text-white border-2 border-purple-300/50 hover:border-purple-400/70'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Fingerprint className="w-5 h-5" />
                      <span>Inicia sesión de otras formas</span>
                      {showAlternativeMethods ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </motion.button>

                    <AnimatePresence>
                      {showAlternativeMethods && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 p-6 bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 space-y-4">
                            <div className="text-center mb-4">
                              <h3 className="text-white font-semibold text-base">
                                Métodos alternativos de inicio de sesión
                              </h3>
                              <p className="text-blue-200 text-sm mt-1">
                                Elige tu método preferido para acceder
                              </p>
                              {isProduction && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/30 rounded-full text-xs text-amber-100 border border-amber-400/50">
                                  <WifiOff className="w-3.5 h-3.5" />
                                  <span>En producción, Passkey está deshabilitado</span>
                                </div>
                              )}
                            </div>

                            {/* ✅ Sección de Passkey - solo visible en desarrollo */}
                            {showPasskeyOption && (
                              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <div className="text-center mb-4">
                                  <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-3">
                                    <Fingerprint className="w-8 h-8 text-white" />
                                  </div>
                                  <h4 className="text-white font-semibold text-sm">Acceso Biométrico</h4>
                                  <p className="text-blue-200 text-xs mt-1">
                                    Usa Windows Hello, Touch ID o Face ID
                                  </p>
                                </div>
                                <PasskeyLoginButton
                                  onSuccess={handlePasskeyLoginSuccess}
                                  onError={(errorMsg: string) => setError(errorMsg)}
                                />
                              </div>
                            )}

                            {/* ✅ Sección de OTP - siempre visible */}
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setShowAlternativeMethods(false);
                                navigate('/otp-login');
                              }}
                              className="w-full flex items-center gap-3 p-4 rounded-xl transition-all bg-white/10 hover:bg-white/20 border-2 border-green-300/50 hover:border-green-400/70 group"
                            >
                              <div className="p-2.5 rounded-xl bg-green-500/20 group-hover:bg-green-500/30 transition-all">
                                <Smartphone size={20} className="text-green-300" />
                              </div>
                              <div className="flex-1 text-left">
                                <span className="font-semibold text-sm text-white">Código OTP</span>
                                <p className="text-xs text-blue-200 mt-0.5">Recibe un código por email</p>
                              </div>
                              <ArrowRight size={16} className="text-green-300 group-hover:translate-x-1 transition-transform" />
                            </motion.button>

                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                              <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                                  <span className="text-sm text-blue-100">
                                    Si tienes 2FA activado, se te pedirá el código después de iniciar sesión
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-transparent text-blue-200">
                        ¿Nuevo en QuickNote?
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <Link
                      to="/register"
                      className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium hover:shadow-md transition-all duration-300 group backdrop-blur-sm border border-white/20"
                    >
                      <span>✨</span>
                      <span className="mx-2">Crear una cuenta nueva</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;