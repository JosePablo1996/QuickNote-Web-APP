import React, { useState, useEffect } from 'react';
import { 
  startRegistration, 
  startAuthentication 
} from '@simplewebauthn/browser';
import { Fingerprint, Mail, Loader2, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';

interface PasskeyLoginProps {
  onSuccess?: (user: PasskeyUser) => void;
  mode?: 'login' | 'register';
  onError?: (error: string) => void;
  deviceName?: string;
}

interface PasskeyUser {
  id: string;
  email: string;
  name?: string;
}

export const PasskeyLogin: React.FC<PasskeyLoginProps> = ({ 
  onSuccess, 
  mode = 'login',
  onError,
  deviceName: customDeviceName
}) => {
  const { user: authUser, loginWithPasskey } = useAuth();
  const userEmail = authUser?.email || '';
  
  const [email, setEmail] = useState(userEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  useEffect(() => {
    if (userEmail && !email) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  const getDeviceName = (): string => {
    if (customDeviceName && customDeviceName.trim()) {
      return customDeviceName.trim();
    }
    
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    if (userAgent.includes('Windows')) {
      return 'Windows Hello';
    } else if (userAgent.includes('Mac')) {
      return 'Touch ID';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return 'Face ID / Touch ID';
    } else if (userAgent.includes('Android')) {
      return 'Biometria Android';
    } else {
      return `Dispositivo (${platform})`;
    }
  };

  const handleError = (errorMessage: string) => {
    console.error('Error:', errorMessage);
    setError(errorMessage);
    if (onError) onError(errorMessage);
  };

  const handleRegister = async (): Promise<void> => {
    if (!email) {
      handleError('Por favor ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      handleError('Por favor ingresa un email valido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[Register] Solicitando opciones de registro para:', email);

      const optionsResponse = await fetch('/api/v1/passkeys/register/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `Error ${optionsResponse.status}`);
      }

      const data = await optionsResponse.json();
      console.log('[Register] Opciones recibidas del servidor');
      
      setChallengeId(data.challenge_id);

      console.log('[Register] Iniciando registro biometrico...');
      const attResp = await startRegistration({ optionsJSON: data.options });
      console.log('[Register] Registro biometrico completado');

      console.log('[Register] Enviando verificacion al servidor...');
      const verifyResponse = await fetch('/api/v1/passkeys/register/complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email,
          credential: {
            ...attResp,
            challenge_id: data.challenge_id
          },
          device_name: getDeviceName()
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `Error ${verifyResponse.status}`);
      }

      const verification = await verifyResponse.json();
      console.log('[Register] Verificacion completada:', verification);

      if (verification.message || verification.verified) {
        if (onSuccess && authUser) {
          onSuccess({
            id: authUser.id,
            email: authUser.email,
            name: authUser.name
          });
        }
      } else {
        throw new Error('La verificacion del registro fallo');
      }
    } catch (err: unknown) {
      console.error('[Register] Error en registro:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar passkey';
      
      if (errorMessage.includes('not allowed')) {
        handleError('Registro cancelado por el usuario');
      } else if (errorMessage.includes('timeout')) {
        handleError('Tiempo de espera agotado. Intenta de nuevo');
      } else if (errorMessage.includes('network')) {
        handleError('Error de conexion. Verifica tu internet');
      } else {
        handleError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORREGIDO: handleLogin ahora usa los endpoints correctos del backend
  const handleLogin = async (): Promise<void> => {
    if (!email) {
      handleError('Por favor ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      handleError('Por favor ingresa un email valido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[Login] Solicitando opciones de autenticacion para:', email);

      // ✅ Paso 1: Obtener opciones de autenticación del backend
      const optionsResponse = await fetch('/api/v1/passkeys/login/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json().catch(() => ({}));
        
        if (optionsResponse.status === 404) {
          throw new Error('Usuario no encontrado o sin passkeys registradas');
        }
        
        throw new Error(errorData.detail || errorData.error || `Error ${optionsResponse.status}`);
      }

      const data = await optionsResponse.json();
      console.log('[Login] Opciones recibidas del servidor:', data);

      // ✅ Paso 2: Iniciar autenticación biométrica en el navegador
      console.log('[Login] Iniciando autenticacion biometrica...');
      const authResp = await startAuthentication({ optionsJSON: data.options });
      console.log('[Login] Autenticacion biometrica completada:', authResp);

      // ✅ Paso 3: Enviar la respuesta al backend para verificarla
      console.log('[Login] Enviando verificacion al servidor...');
      const verifyResponse = await fetch('/api/v1/passkeys/login/complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email,
          credential: {
            ...authResp,
            challenge_id: data.challenge_id
          }
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `Error ${verifyResponse.status}`);
      }

      const verifyData = await verifyResponse.json();
      console.log('[Login] Verificacion completada, token recibido');

      // ✅ Paso 4: Guardar el token y redirigir
      if (verifyData.access_token) {
        localStorage.setItem('auth_token', verifyData.access_token);
        
        if (verifyData.user) {
          localStorage.setItem('user', JSON.stringify(verifyData.user));
        }

        console.log('[Login] Login con passkey exitoso');
        
        if (onSuccess) {
          onSuccess(verifyData.user);
        }
      } else {
        throw new Error('No se recibio el token de acceso');
      }
      
    } catch (err: unknown) {
      console.error('[Login] Error en login:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Error al autenticar';
      
      if (errorMessage.includes('not allowed')) {
        handleError('Autenticacion cancelada por el usuario');
      } else if (errorMessage.includes('timeout')) {
        handleError('Tiempo de espera agotado. Intenta de nuevo');
      } else if (errorMessage.includes('network')) {
        handleError('Error de conexion. Verifica tu internet');
      } else if (errorMessage.includes('not found') || errorMessage.includes('no encontrada')) {
        handleError('Usuario no encontrado o sin passkeys registradas');
      } else {
        handleError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (mode === 'register') {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
              <Fingerprint className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {mode === 'register' ? 'Registrar Passkey' : 'Iniciar Sesion con Passkey'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              {mode === 'register' 
                ? 'Registra tu dispositivo biometrico' 
                : `Usa ${getDeviceName()} para acceder`
              }
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl"
            >
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correo electronico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !email}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-semibold relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>
                    {mode === 'register' 
                      ? `Registrar con ${getDeviceName()}` 
                      : `Iniciar con ${getDeviceName()}`}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Tus datos biometricos nunca salen de tu dispositivo</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PasskeyLogin;