// src/contexts/components/ui/GreetingWidget.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Cloud, Star, Sparkles } from 'lucide-react';

interface GreetingWidgetProps {
  userName?: string;
  userAvatar?: string;
}

interface TimeBasedData {
  greeting: string;
  icon: React.ReactNode;
  iconColor: string;
  greetingColor: string;
  gradient: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  sunMoonIcon: 'sun' | 'moon';
  sunMoonColor: string;
  glowColor: string;
}

const GreetingWidget: React.FC<GreetingWidgetProps> = ({ userName, userAvatar }) => {
  const [timeData, setTimeData] = useState<TimeBasedData>(getTimeBasedData());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Función para obtener datos basados en la hora
  function getTimeBasedData(): TimeBasedData {
    const hour = new Date().getHours();
    
    // Mañana (5:00 - 11:59) - Colores cálidos y energéticos
    if (hour >= 5 && hour < 12) {
      return {
        greeting: 'Buenos días',
        icon: <Sun className="w-6 h-6" />,
        iconColor: 'text-amber-400',
        greetingColor: 'text-amber-300',
        gradient: 'from-amber-500/30 to-orange-500/30',
        timeOfDay: 'morning',
        sunMoonIcon: 'sun',
        sunMoonColor: 'text-amber-400',
        glowColor: 'bg-amber-400'
      };
    }
    // Tarde (12:00 - 17:59) - Colores brillantes y energéticos
    else if (hour >= 12 && hour < 18) {
      return {
        greeting: 'Buenas tardes',
        icon: <Cloud className="w-6 h-6" />,
        iconColor: 'text-sky-400',
        greetingColor: 'text-sky-300',
        gradient: 'from-sky-500/30 to-blue-500/30',
        timeOfDay: 'afternoon',
        sunMoonIcon: 'sun',
        sunMoonColor: 'text-sky-400',
        glowColor: 'bg-sky-400'
      };
    }
    // Noche (18:00 - 21:59) - Colores suaves y relajantes
    else if (hour >= 18 && hour < 22) {
      return {
        greeting: 'Buenas noches',
        icon: <Moon className="w-6 h-6" />,
        iconColor: 'text-indigo-300',
        greetingColor: 'text-indigo-200',
        gradient: 'from-indigo-500/30 to-purple-600/30',
        timeOfDay: 'evening',
        sunMoonIcon: 'moon',
        sunMoonColor: 'text-indigo-300',
        glowColor: 'bg-indigo-400'
      };
    }
    // Madrugada (22:00 - 4:59) - Colores místicos y profundos
    else {
      return {
        greeting: 'Buenas noches',
        icon: <Star className="w-6 h-6" />,
        iconColor: 'text-purple-300',
        greetingColor: 'text-purple-200',
        gradient: 'from-purple-600/30 to-pink-600/30',
        timeOfDay: 'night',
        sunMoonIcon: 'moon',
        sunMoonColor: 'text-purple-300',
        glowColor: 'bg-purple-400'
      };
    }
  }

  // Actualizar cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = new Date();
      setCurrentTime(newTime);
      
      if (currentTime.getHours() !== newTime.getHours()) {
        setTimeData(getTimeBasedData());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentTime]);

  // Formatear hora en formato 12 horas (AM/PM)
  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Formatear fecha
  const formatCurrentDate = () => {
    return currentTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Obtener nombre completo
  const getFullName = () => {
    if (!userName) return 'Usuario';
    return userName;
  };

  // Capitalizar primera letra de cada palabra
  const capitalizeWords = (str: string) => {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Animación para el icono de sol/luna
  const sunMoonAnimation = {
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    exit: { scale: 0, rotate: 180, opacity: 0 },
    transition: { type: "spring", stiffness: 260, damping: 20, duration: 0.5 }
  };

  // Animación de brillo pulsante para el sol
  const sunGlowAnimation = {
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.3, 0.7, 0.3],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  };

  // Animación de brillo suave para la luna
  const moonGlowAnimation = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.2, 0.5, 0.2],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  };

  // Animación de rotación continua para el sol
  const sunRotateAnimation = {
    animate: {
      rotate: 360,
      transition: { duration: 20, repeat: Infinity, ease: "linear" }
    }
  };

  // Animación de flotación para la luna
  const moonFloatAnimation = {
    animate: {
      y: [0, -5, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  };

  // Animación de cambio de color para el saludo
  const greetingColorAnimation = {
    animate: {
      textShadow: [
        `0 0 8px ${timeData.sunMoonColor === 'text-amber-400' ? 'rgba(251, 191, 36, 0.5)' : 
          timeData.sunMoonColor === 'text-sky-400' ? 'rgba(56, 189, 248, 0.5)' :
          timeData.sunMoonColor === 'text-indigo-300' ? 'rgba(165, 180, 252, 0.5)' :
          'rgba(192, 132, 252, 0.5)'}`,
        `0 0 16px ${timeData.sunMoonColor === 'text-amber-400' ? 'rgba(251, 191, 36, 0.3)' : 
          timeData.sunMoonColor === 'text-sky-400' ? 'rgba(56, 189, 248, 0.3)' :
          timeData.sunMoonColor === 'text-indigo-300' ? 'rgba(165, 180, 252, 0.3)' :
          'rgba(192, 132, 252, 0.3)'}`,
        `0 0 8px ${timeData.sunMoonColor === 'text-amber-400' ? 'rgba(251, 191, 36, 0.5)' : 
          timeData.sunMoonColor === 'text-sky-400' ? 'rgba(56, 189, 248, 0.5)' :
          timeData.sunMoonColor === 'text-indigo-300' ? 'rgba(165, 180, 252, 0.5)' :
          'rgba(192, 132, 252, 0.5)'}`
      ]
    },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  };

  // Efectos de partículas para el sol
  const sunParticles = Array(6).fill(null);
  // Efectos de estrellas para la luna
  const moonStars = Array(8).fill(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className={`relative bg-gradient-to-r ${timeData.gradient} backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 overflow-hidden`}>
        
        {/* Icono de Sol/Luna decorativo en la esquina superior izquierda con animaciones mejoradas */}
        <div className="absolute top-4 left-4">
          <AnimatePresence mode="wait">
            {timeData.sunMoonIcon === 'sun' ? (
              <motion.div
                key="sun-icon"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, duration: 0.5 }}
                className="relative"
              >
                {/* Partículas de sol */}
                {sunParticles.map((_, i) => (
                  <motion.div
                    key={`sun-particle-${i}`}
                    className="absolute rounded-full bg-amber-400"
                    style={{
                      width: 4,
                      height: 4,
                      top: '50%',
                      left: '50%',
                      transformOrigin: 'center'
                    }}
                    animate={{
                      x: [0, Math.cos((i * 60) * Math.PI / 180) * 25],
                      y: [0, Math.sin((i * 60) * Math.PI / 180) * 25],
                      opacity: [0.6, 0],
                      scale: [1, 0]
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                ))}
                
                {/* Brillo pulsante */}
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.7, 0.3],
                    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className={`absolute inset-0 rounded-full ${timeData.glowColor} blur-xl`}
                  style={{ width: 40, height: 40 }}
                />
                
                {/* Rotación del sol */}
                <motion.div
                  animate={{
                    rotate: 360,
                    transition: { duration: 20, repeat: Infinity, ease: "linear" }
                  }}
                  className="relative z-10"
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.2,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-sm cursor-pointer shadow-lg"
                  >
                    <Sun className={`w-5 h-5 ${timeData.sunMoonColor} transition-all duration-300`} />
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="moon-icon"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, duration: 0.5 }}
                className="relative"
              >
                {/* Estrellas alrededor de la luna */}
                {moonStars.map((_, i) => (
                  <motion.div
                    key={`moon-star-${i}`}
                    className="absolute rounded-full"
                    style={{
                      width: Math.random() * 3 + 1,
                      height: Math.random() * 3 + 1,
                      backgroundColor: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0.2, 0.8, 0.2],
                      scale: [1, 1.3, 1],
                      transition: {
                        duration: Math.random() * 2 + 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  />
                ))}
                
                {/* Brillo suave */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.5, 0.2],
                    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className={`absolute inset-0 rounded-full ${timeData.glowColor} blur-lg`}
                  style={{ width: 40, height: 40 }}
                />
                
                {/* Flotación de la luna */}
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="relative z-10"
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.15,
                      rotate: [0, -10, 10, -10, 0],
                      transition: { duration: 0.5 }
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-sm cursor-pointer shadow-lg"
                  >
                    <Moon className={`w-5 h-5 ${timeData.sunMoonColor} transition-all duration-300`} />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar en esquina superior derecha (opcional) */}
        {userAvatar && (
          <div className="absolute top-4 right-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden shadow-lg bg-white/20 backdrop-blur-sm">
                <img 
                  src={userAvatar} 
                  alt={userName || 'Avatar'} 
                  className="w-full h-full object-cover"
                />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"
              />
            </motion.div>
          </div>
        )}

        {/* Contenido principal centrado */}
        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Fila: Hora y fecha (juntas en la misma línea) */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"
            >
              <span className="text-sm font-mono font-bold text-white tracking-wide">
                {formatCurrentTime()}
              </span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"
            >
              <span className="text-sm font-medium text-white/90 capitalize">
                {capitalizeWords(formatCurrentDate())}
              </span>
            </motion.div>
          </div>

          {/* Fila: Icono + Saludo con color dinámico */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className={`p-2 rounded-full bg-white/20 backdrop-blur-sm ${timeData.iconColor}`}
            >
              {timeData.icon}
            </motion.div>
            <motion.h2 
              animate={{
                textShadow: [
                  `0 0 8px ${timeData.sunMoonColor === 'text-amber-400' ? 'rgba(251, 191, 36, 0.5)' : 
                    timeData.sunMoonColor === 'text-sky-400' ? 'rgba(56, 189, 248, 0.5)' :
                    timeData.sunMoonColor === 'text-indigo-300' ? 'rgba(165, 180, 252, 0.5)' :
                    'rgba(192, 132, 252, 0.5)'}`,
                  `0 0 16px ${timeData.sunMoonColor === 'text-amber-400' ? 'rgba(251, 191, 36, 0.3)' : 
                    timeData.sunMoonColor === 'text-sky-400' ? 'rgba(56, 189, 248, 0.3)' :
                    timeData.sunMoonColor === 'text-indigo-300' ? 'rgba(165, 180, 252, 0.3)' :
                    'rgba(192, 132, 252, 0.3)'}`,
                  `0 0 8px ${timeData.sunMoonColor === 'text-amber-400' ? 'rgba(251, 191, 36, 0.5)' : 
                    timeData.sunMoonColor === 'text-sky-400' ? 'rgba(56, 189, 248, 0.5)' :
                    timeData.sunMoonColor === 'text-indigo-300' ? 'rgba(165, 180, 252, 0.5)' :
                    'rgba(192, 132, 252, 0.5)'}`
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`text-2xl font-bold ${timeData.greetingColor} transition-colors duration-500`}
            >
              {timeData.greeting}
            </motion.h2>
          </div>

          {/* Fila: Nombre completo del usuario */}
          {userName && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2"
            >
              <div className="px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full inline-flex items-center gap-2 border border-white/30">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
                <span className="text-base font-semibold text-white">
                  {getFullName()}
                </span>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  );
};

export default GreetingWidget;