import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Mail, ArrowLeft, Shield, KeyRound, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OtpLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { loginWithToken } = useAuth();
  const { success, error: showError } = useToast();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Countdown para reenviar código
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al enviar el código');
      }

      setStep('code');
      setCountdown(60); // 60 segundos para reenviar
      success('📧 Código enviado a tu correo');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar el código';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length !== 6) {
      setError('Ingresa el código de 6 dígitos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Código inválido');
      }

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        setIsSuccess(true);
        success('✅ Inicio de sesión exitoso');
        
        setTimeout(() => {
          window.location.href = '/notes';
        }, 1000);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al verificar el código';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl" />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4"
                >
                  {isSuccess ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <Shield className="w-8 h-8 text-white" />
                  )}
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {step === 'email' ? 'Inicio con Código OTP' : 'Verificar Código'}
                </h2>
                <p className="text-blue-200 text-sm">
                  {step === 'email' 
                    ? 'Ingresa tu correo para recibir un código' 
                    : `Ingresa el código enviado a ${email}`}
                </p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl"
                  >
                    <p className="text-red-300 text-sm text-center">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {step === 'email' ? (
                /* Paso 1: Email */
                <div className="space-y-6">
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 text-white placeholder-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Mail className="w-5 h-5" />
                    )}
                    <span>{loading ? 'Enviando...' : 'Enviar código'}</span>
                  </motion.button>
                </div>
              ) : (
                /* Paso 2: Código */
                <div className="space-y-6">
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Código de 6 dígitos
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5" />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setCode(value);
                        }}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 text-white placeholder-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-3xl tracking-widest"
                        disabled={loading || isSuccess}
                        autoFocus
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerifyCode}
                    disabled={loading || isSuccess || code.length !== 6}
                    className="w-full py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isSuccess ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Shield className="w-5 h-5" />
                    )}
                    <span>
                      {loading ? 'Verificando...' : isSuccess ? '¡Verificado!' : 'Verificar código'}
                    </span>
                  </motion.button>

                  {/* Reenviar código */}
                  <div className="text-center">
                    <button
                      onClick={handleSendCode}
                      disabled={countdown > 0 || loading}
                      className="text-blue-200 hover:text-white text-sm disabled:opacity-50"
                    >
                      {countdown > 0 
                        ? `Reenviar en ${countdown}s` 
                        : 'Reenviar código'}
                    </button>
                  </div>

                  {/* Cambiar email */}
                  <div className="text-center">
                    <button
                      onClick={() => { setStep('email'); setCode(''); }}
                      className="text-blue-200/70 hover:text-white text-sm"
                    >
                      ← Usar otro correo
                    </button>
                  </div>
                </div>
              )}

              {/* Volver al login */}
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-blue-200 hover:text-white text-sm gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OtpLoginPage;