// src/components/auth/WelcomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

interface WelcomeScreenProps {
  userName?: string;
  onComplete?: () => void;
  autoRedirect?: boolean;
  redirectDelay?: number;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userName = 'Usuario',
  onComplete,
  autoRedirect = true,
  redirectDelay = 5000
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    console.log('🎬 WelcomeScreen montado, autoRedirect:', autoRedirect, 'redirectDelay:', redirectDelay);
    
    if (autoRedirect) {
      console.log(`⏳ Iniciando redirección automática en ${redirectDelay}ms`);
      
      const timer = setTimeout(() => {
        console.log('🔄 Ejecutando redirección automática a /notes');
        handleContinue();
      }, redirectDelay);

      const interval = setInterval(() => {
        setCountdown(prev => {
          const newCount = Math.max(0, prev - 1);
          console.log(`⏱️ Contador: ${newCount} segundos restantes`);
          return newCount;
        });
      }, 1000);

      return () => {
        console.log('🧹 Limpiando timers de WelcomeScreen');
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [autoRedirect, redirectDelay]);

  const handleContinue = () => {
    console.log('🎯 handleContinue ejecutado');
    
    if (onComplete) {
      console.log('📞 Llamando a onComplete');
      onComplete();
    } else {
      console.log('➡️ Redirigiendo directamente a /notes');
      // Usar replace para evitar problemas con el historial
      navigate('/notes', { replace: true });
    }
  };

  const handleDashboard = () => {
    console.log('🎯 Botón de dashboard clickeado, redirigiendo a /notes');
    navigate('/notes', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-2xl mx-auto">
          <motion.div 
            className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Efecto de fondo decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-green-400/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 text-center">
              {/* Icono de éxito */}
              <motion.div 
                className="flex justify-center mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2 
                }}
              >
                <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full backdrop-blur-sm"></div>
                  <CheckCircle className="h-14 w-14 text-white relative z-10" />
                </div>
              </motion.div>

              {/* Título */}
              <motion.h1 
                className="text-5xl font-extrabold bg-gradient-to-r from-green-200 via-white to-blue-200 bg-clip-text text-transparent mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                ¡Sesión Iniciada Exitosamente!
              </motion.h1>

              {/* Mensaje de bienvenida */}
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <p className="text-3xl font-bold text-white mb-2">
                  Bienvenido de nuevo, <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">{userName}</span>
                </p>
                <p className="text-blue-100 text-lg">
                  Tu sesión ha sido iniciada correctamente. Ahora puedes acceder a todas las funcionalidades de QuickNote.
                </p>
              </motion.div>

              {/* Características */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Sparkles className="h-6 w-6 text-yellow-300 mx-auto mb-2" />
                  <p className="text-white text-sm">Notas ilimitadas</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Sparkles className="h-6 w-6 text-green-300 mx-auto mb-2" />
                  <p className="text-white text-sm">Acceso multidispositivo</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Sparkles className="h-6 w-6 text-blue-300 mx-auto mb-2" />
                  <p className="text-white text-sm">100% gratuito</p>
                </div>
              </motion.div>

              {/* Opciones de continuar */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="text-left bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                    <LogIn className="h-5 w-5 mr-2 text-green-300" />
                    Continuar al Sistema
                  </h3>
                  <p className="text-blue-100 text-sm mb-4">
                    Ahora puedes explorar todas las funciones disponibles en tu dashboard personalizado.
                  </p>
                  <motion.button
                    onClick={handleDashboard}
                    className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center space-x-2 relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300"></div>
                    <span className="relative z-10">Continuar al Dashboard</span>
                    <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>

                {autoRedirect && (
                  <p className="text-blue-200 text-sm">
                    Serás redirigido automáticamente en {countdown} segundos...
                  </p>
                )}
              </motion.div>

              {/* Footer */}
              <motion.div 
                className="mt-8 pt-6 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <p className="text-blue-200/60 text-sm">
                  QuickNote · Desarrollado con ❤️ por José Pablo Miranda Quintanilla
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;