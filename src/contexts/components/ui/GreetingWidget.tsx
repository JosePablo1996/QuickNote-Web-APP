// src/contexts/components/ui/GreetingWidget.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Cloud, Star, Sparkles, Wind, Sunrise, Sunset } from 'lucide-react';

interface GreetingWidgetProps {
  userName?: string;
  userAvatar?: string;
}

interface TimeBasedData {
  greeting: string;
  icon: React.ReactNode;
  iconColor: string;
  gradient: string;
  message: string;
  emoji: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  secondaryIcon: React.ReactNode;
  quote: string;
}

const GreetingWidget: React.FC<GreetingWidgetProps> = ({ userName, userAvatar }) => {
  const [timeData, setTimeData] = useState<TimeBasedData>(getTimeBasedData());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Función para obtener datos basados en la hora
  function getTimeBasedData(): TimeBasedData {
    const hour = new Date().getHours();
    
    // Mañana (5:00 - 11:59)
    if (hour >= 5 && hour < 12) {
      return {
        greeting: '¡Buenos días!',
        icon: <Sun className="w-6 h-6" />,
        iconColor: 'text-amber-400',
        gradient: 'from-amber-500/20 to-orange-500/20',
        message: 'Comienza tu día con energía',
        emoji: '☀️',
        timeOfDay: 'morning',
        secondaryIcon: <Sunrise className="w-3 h-3" />,
        quote: '"Cada amanecer trae nuevas oportunidades"'
      };
    }
    // Tarde (12:00 - 17:59)
    else if (hour >= 12 && hour < 18) {
      return {
        greeting: '¡Buenas tardes!',
        icon: <Cloud className="w-6 h-6" />,
        iconColor: 'text-sky-400',
        gradient: 'from-sky-500/20 to-blue-500/20',
        message: 'Sigue productivo esta tarde',
        emoji: '🌤️',
        timeOfDay: 'afternoon',
        secondaryIcon: <Wind className="w-3 h-3" />,
        quote: '"La tarde es perfecta para lograr tus metas"'
      };
    }
    // Noche (18:00 - 21:59)
    else if (hour >= 18 && hour < 22) {
      return {
        greeting: '¡Buenas noches!',
        icon: <Moon className="w-6 h-6" />,
        iconColor: 'text-indigo-300',
        gradient: 'from-indigo-500/20 to-purple-600/20',
        message: 'Relájate y organiza tus pensamientos',
        emoji: '🌙',
        timeOfDay: 'evening',
        secondaryIcon: <Sunset className="w-3 h-3" />,
        quote: '"La noche es el mejor momento para reflexionar y soñar"'
      };
    }
    // Madrugada (22:00 - 4:59)
    else {
      return {
        greeting: '¡Hola, noctámbulo!',
        icon: <Star className="w-6 h-6" />,
        iconColor: 'text-purple-300',
        gradient: 'from-purple-600/20 to-pink-600/20',
        message: 'Las mejores ideas llegan de noche',
        emoji: '🌃',
        timeOfDay: 'night',
        secondaryIcon: <Sparkles className="w-3 h-3" />,
        quote: '"La inspiración nunca duerme"'
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

  // Formatear hora actual
  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Formatear fecha actual
  const formatCurrentDate = () => {
    return currentTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Obtener iniciales para avatar
  const getInitials = () => {
    if (!userName) return 'U';
    const nameParts = userName.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return 'U';
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return (nameParts[0][0] + (nameParts[1]?.[0] || '')).toUpperCase();
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Contenedor principal con efecto glassmorphism y altura reducida */}
      <div className={`relative bg-gradient-to-r ${timeData.gradient} backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/30`}>
        {/* Efectos decorativos de glassmorphism */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
        
        {/* Contenido principal - Centrado y compacto */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Fila de hora y fecha - compacta */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <span className="text-xs font-mono font-bold text-white">
                {formatCurrentTime()}
              </span>
            </div>
            <div className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <span className="text-xs font-medium text-white/90 capitalize">
                {capitalizeWords(formatCurrentDate())}
              </span>
            </div>
          </div>

          {/* Avatar del usuario - tamaño reducido */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group cursor-pointer mb-2"
          >
            <div className="w-14 h-14 rounded-full border-2 border-white/50 overflow-hidden shadow-lg bg-white/20 backdrop-blur-sm">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName || 'Avatar'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${timeData.gradient} flex items-center justify-center text-white text-lg font-bold backdrop-blur-sm`}>
                  {getInitials()}
                </div>
              )}
            </div>
            {/* Badge de estado online */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"
            />
          </motion.div>

          {/* Saludo y nombre - más compacto */}
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-xl">{timeData.emoji}</span>
            <h2 className="text-lg font-bold text-white">
              {timeData.greeting}
            </h2>
          </div>

          {/* Nombre del usuario */}
          {userName && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-2"
            >
              <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full inline-flex items-center gap-1.5 border border-white/30">
                <Sparkles className="w-3 h-3 text-white" />
                <span className="text-sm font-semibold text-white">
                  {getFullName()}
                </span>
              </div>
            </motion.div>
          )}

          {/* Mensaje motivacional - más compacto */}
          <p className="text-white/80 text-xs flex items-center justify-center gap-1 mb-2">
            <span className="text-white/60">{timeData.secondaryIcon}</span>
            <span>{timeData.message}</span>
          </p>

          {/* Cita motivacional - sin iconos de barra */}
          <div className="mt-2 text-center">
            <p className="text-[10px] text-white/50 italic">
              {timeData.quote}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GreetingWidget;