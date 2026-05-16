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
  greetingColor: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  sunMoonIcon: 'sun' | 'moon';
  sunMoonColor: string;
  // Colores de fondo según hora
  bgGradient: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
}

const GreetingWidget: React.FC<GreetingWidgetProps> = ({ userName, userAvatar }) => {
  const [timeData, setTimeData] = useState<TimeBasedData>(getTimeBasedData());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Detectar ancho de pantalla para disposición responsive
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // Función para obtener datos basados en la hora con colores específicos
  function getTimeBasedData(): TimeBasedData {
    const hour = new Date().getHours();
    
    // Mañana (5:00 - 11:59) - Colores cálidos y energéticos (naranja/ámbar)
    if (hour >= 5 && hour < 12) {
      return {
        greeting: 'Buenos días',
        greetingColor: 'text-amber-100',
        timeOfDay: 'morning',
        sunMoonIcon: 'sun',
        sunMoonColor: 'text-amber-300',
        bgGradient: 'from-amber-600/90 to-orange-600/90',
        bgColor: 'bg-gradient-to-br from-amber-600 to-orange-600',
        accentColor: 'bg-amber-500',
        textColor: 'text-amber-50'
      };
    }
    // Tarde (12:00 - 17:59) - Colores brillantes (azul/celeste)
    else if (hour >= 12 && hour < 18) {
      return {
        greeting: 'Buenas tardes',
        greetingColor: 'text-sky-100',
        timeOfDay: 'afternoon',
        sunMoonIcon: 'sun',
        sunMoonColor: 'text-sky-300',
        bgGradient: 'from-sky-600/90 to-blue-600/90',
        bgColor: 'bg-gradient-to-br from-sky-600 to-blue-600',
        accentColor: 'bg-sky-500',
        textColor: 'text-sky-50'
      };
    }
    // Noche (18:00 - 21:59) - Colores suaves (índigo/violeta)
    else if (hour >= 18 && hour < 22) {
      return {
        greeting: 'Buenas noches',
        greetingColor: 'text-indigo-100',
        timeOfDay: 'evening',
        sunMoonIcon: 'moon',
        sunMoonColor: 'text-indigo-300',
        bgGradient: 'from-indigo-700/90 to-purple-700/90',
        bgColor: 'bg-gradient-to-br from-indigo-700 to-purple-700',
        accentColor: 'bg-indigo-500',
        textColor: 'text-indigo-50'
      };
    }
    // Madrugada (22:00 - 4:59) - Colores profundos (púrpura/rosa)
    else {
      return {
        greeting: 'Buenas noches',
        greetingColor: 'text-purple-100',
        timeOfDay: 'night',
        sunMoonIcon: 'moon',
        sunMoonColor: 'text-purple-300',
        bgGradient: 'from-purple-800/90 to-pink-800/90',
        bgColor: 'bg-gradient-to-br from-purple-800 to-pink-800',
        accentColor: 'bg-purple-500',
        textColor: 'text-purple-50'
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

  // Formatear hora
  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Formatear fecha - formato completo
  const formatCurrentDate = () => {
    return currentTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Formatear fecha abreviada para móvil
  const formatShortDate = () => {
    return currentTime.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
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

  // Obtener la primera letra del nombre para el avatar fallback
  const getInitial = () => {
    if (!userName) return 'U';
    return userName.charAt(0).toUpperCase();
  };

  // Determinar bordes según dispositivo
  const getBorderRadius = () => {
    if (isMobile) return 'rounded-lg';      // Móvil: más rectangular
    if (isTablet) return 'rounded-xl';      // Tablet: semi-rectangular
    return 'rounded-2xl';                    // Desktop: redondeado
  };

  // Animaciones simplificadas
  const iconVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: "spring", stiffness: 260, damping: 20 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className={`relative bg-gradient-to-r ${timeData.bgGradient} backdrop-blur-sm ${getBorderRadius()} shadow-xl border border-white/20 overflow-hidden`}>
        
        {/* Icono decorativo esquina superior izquierda */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10">
          <AnimatePresence mode="wait">
            {timeData.sunMoonIcon === 'sun' ? (
              <motion.div
                key="sun-icon"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-1.5 sm:p-2 rounded-full bg-white/20 backdrop-blur-sm cursor-pointer shadow-lg"
                >
                  <Sun className={`w-4 h-4 sm:w-5 sm:h-5 ${timeData.sunMoonColor}`} />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="moon-icon"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="p-1.5 sm:p-2 rounded-full bg-white/20 backdrop-blur-sm cursor-pointer shadow-lg"
                >
                  <Moon className={`w-4 h-4 sm:w-5 sm:h-5 ${timeData.sunMoonColor}`} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar en esquina superior derecha */}
        {userAvatar ? (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white/50 overflow-hidden shadow-lg bg-white/20 backdrop-blur-sm">
                <img src={userAvatar} alt={userName || 'Avatar'} className="w-full h-full object-cover" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"
              />
            </motion.div>
          </div>
        ) : userName ? (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white/50 overflow-hidden shadow-lg bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">{getInitial()}</span>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"
              />
            </motion.div>
          </div>
        ) : null}

        {/* ================================================================ */}
        {/* CONTENIDO PRINCIPAL - DISPOSICIÓN RESPONSIVA */}
        {/* ================================================================ */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          
          {/* Móvil: Layout vertical con más espacio y rectangular */}
          {isMobile ? (
            <>
              {/* Hora - Grande y visible */}
              <div className="mt-6 mb-1">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 inline-block">
                  <span className="text-2xl font-mono font-bold text-white tracking-wider">
                    {formatCurrentTime()}
                  </span>
                </div>
              </div>

              {/* Fecha */}
              <div className="mb-3">
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 inline-block">
                  <span className="text-sm font-medium text-white/90">
                    {capitalizeWords(formatShortDate())}
                  </span>
                </div>
              </div>

              {/* Saludo - Texto grande */}
              <h2 className={`text-3xl font-bold ${timeData.greetingColor} mb-2`}>
                {timeData.greeting}
              </h2>

              {/* Nombre del usuario */}
              {userName && (
                <div className="mb-5">
                  <div className="px-5 py-2 bg-white/20 backdrop-blur-sm rounded-lg inline-flex items-center gap-2 border border-white/30">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-base font-semibold text-white">
                      {getFullName()}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : isTablet ? (
            /* Tablet: Layout semi-rectangular con mejor distribución */
            <>
              {/* Hora y fecha en fila */}
              <div className="flex items-center justify-center gap-3 mt-5 mb-3">
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <span className="text-base font-mono font-bold text-white tracking-wide">
                    {formatCurrentTime()}
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <span className="text-sm font-medium text-white/90 capitalize">
                    {capitalizeWords(formatCurrentDate())}
                  </span>
                </div>
              </div>

              {/* Saludo */}
              <h2 className={`text-2xl font-bold ${timeData.greetingColor} mb-2`}>
                {timeData.greeting}
              </h2>

              {/* Nombre del usuario */}
              {userName && (
                <div className="mb-4">
                  <div className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg inline-flex items-center gap-2 border border-white/30">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {getFullName()}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Desktop: Layout horizontal redondeado */
            <>
              {/* Hora y fecha en fila */}
              <div className="flex items-center justify-center gap-3 mt-4 mb-3">
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                  <span className="text-sm font-mono font-bold text-white tracking-wide">
                    {formatCurrentTime()}
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                  <span className="text-sm font-medium text-white/90 capitalize">
                    {capitalizeWords(formatCurrentDate())}
                  </span>
                </div>
              </div>

              {/* Saludo */}
              <h2 className={`text-xl md:text-2xl font-bold ${timeData.greetingColor} mb-3`}>
                {timeData.greeting}
              </h2>

              {/* Nombre del usuario */}
              {userName && (
                <div className="mb-4">
                  <div className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full inline-flex items-center gap-2 border border-white/30">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {getFullName()}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Espaciado inferior responsivo */}
        <div className={isMobile ? "h-3" : isTablet ? "h-3" : "h-3"} />
      </div>
    </motion.div>
  );
};

export default GreetingWidget;