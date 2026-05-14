import React, { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { Fingerprint, Loader2, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../hooks/useToast';

interface PasskeyLoginButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const PasskeyLoginButton: React.FC<PasskeyLoginButtonProps> = ({ 
  onSuccess, 
  onError,
  className = ''
}) => {
  const { success: showToast, error: showErrorToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError(null);
    setIsSuccess(false);
    setStatusMessage('Solicitando autenticación biométrica...');

    try {
      console.log('🔐 [PasskeyLogin] Paso 1: Solicitando opciones de autenticación...');
      
      // ✅ Paso 1: Obtener opciones de autenticación del backend
      const optionsResponse = await fetch('/api/v1/passkeys/login/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: null }), // Autodescubrimiento
      });

      console.log('📥 [PasskeyLogin] Respuesta del servidor:', optionsResponse.status);

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json().catch(() => ({}));
        
        if (optionsResponse.status === 404) {
          throw new Error('No se encontraron passkeys registradas. Registra una primero en Configuración > Seguridad.');
        }
        
        throw new Error(errorData.detail || errorData.error || `Error ${optionsResponse.status}`);
      }

      const data = await optionsResponse.json();
      console.log('✅ [PasskeyLogin] Opciones recibidas del servidor');

      setStatusMessage('Esperando verificación biométrica...');
      console.log('🔐 [PasskeyLogin] Paso 2: Iniciando autenticación biométrica...');

      // ✅ Paso 2: Iniciar autenticación biométrica en el navegador
      let authResp;
      try {
        authResp = await startAuthentication({ optionsJSON: data.options });
        console.log('✅ [PasskeyLogin] Autenticación biométrica completada');
      } catch (authError: any) {
        console.error('❌ [PasskeyLogin] Error en autenticación biométrica:', authError);
        
        if (authError.name === 'NotAllowedError') {
          throw new Error('Autenticación cancelada por el usuario o tiempo de espera agotado. Intenta de nuevo.');
        }
        throw new Error(authError.message || 'Error en la autenticación biométrica');
      }

      setStatusMessage('Verificando credenciales...');
      console.log('🔐 [PasskeyLogin] Paso 3: Enviando verificación al servidor...');

      // ✅ Paso 3: Enviar la respuesta al backend para verificarla
      const verifyResponse = await fetch('/api/v1/passkeys/login/complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: '', // El backend extrae el email de la passkey
          credential: {
            ...authResp,
            challenge_id: data.challenge_id
          }
        }),
      });

      console.log('📥 [PasskeyLogin] Respuesta de verificación:', verifyResponse.status);

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || 'Error al verificar la autenticación');
      }

      const verifyData = await verifyResponse.json();
      console.log('✅ [PasskeyLogin] Verificación exitosa, token recibido');

      // ✅ Paso 4: Guardar el token y los datos del usuario
      if (verifyData.access_token) {
        console.log('💾 [PasskeyLogin] Guardando token en localStorage...');
        localStorage.setItem('auth_token', verifyData.access_token);
        
        if (verifyData.user) {
          console.log('💾 [PasskeyLogin] Guardando usuario en localStorage:', verifyData.user.email);
          localStorage.setItem('user', JSON.stringify(verifyData.user));
        }

        // Mostrar mensaje de éxito
        setIsSuccess(true);
        setStatusMessage('✅ ¡Inicio de sesión exitoso!');
        showToast('✅ ¡Bienvenido de vuelta!');

        // ✅ Llamar al callback de éxito o redirigir
        if (onSuccess) {
          console.log('📞 [PasskeyLogin] Llamando a onSuccess...');
          // Pequeño retraso para que se vea el mensaje de éxito
          setTimeout(() => {
            onSuccess(verifyData.user);
          }, 800);
        } else {
          // Si no hay callback, redirigir directamente
          console.log('🔄 [PasskeyLogin] Redirigiendo a /notes...');
          setTimeout(() => {
            window.location.href = '/notes';
          }, 800);
        }
      } else {
        throw new Error('No se recibió el token de acceso del servidor');
      }
      
    } catch (err: unknown) {
      console.error('❌ [PasskeyLogin] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al autenticar';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      } else {
        showErrorToast(errorMessage);
      }
    } finally {
      setLoading(false);
      if (!isSuccess) {
        setStatusMessage('');
      }
    }
  };

  return (
    <div className={className}>
      {/* Mensaje de error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje de estado */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-4 p-4 backdrop-blur-sm border rounded-xl ${
              isSuccess 
                ? 'bg-green-500/20 border-green-400/30' 
                : 'bg-blue-500/20 border-blue-400/30'
            }`}
          >
            <p className={`text-sm text-center flex items-center justify-center gap-2 ${
              isSuccess ? 'text-green-300' : 'text-blue-200'
            }`}>
              {isSuccess ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {statusMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón de Windows Hello */}
      {!isSuccess && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePasskeyLogin}
          disabled={loading}
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
              <Fingerprint className="w-5 h-5" />
              <span>Iniciar sesión con Windows Hello</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>
      )}

      {/* Mensaje de seguridad */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-center gap-2 text-xs text-blue-200/60">
          <Shield className="w-3.5 h-3.5" />
          <span>Tus datos biométricos nunca salen de tu dispositivo</span>
        </div>
      </div>
    </div>
  );
};

export default PasskeyLoginButton;