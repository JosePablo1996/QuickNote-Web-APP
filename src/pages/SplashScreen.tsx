// src/pages/SplashScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, CheckCircle, Target, Calendar, Zap, Edit3, Star, Cloud, Shield, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, isLoading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const navigationTriggered = useRef(false);

  // Frases motivacionales para QuickNote
  const phrases = [
    'Organiza tus ideas, alcanza tus metas ✨',
    'Sincronización en tiempo real 🔄',
    'Tus notas siempre respaldadas 💾',
    'Cada tarea completada es un logro 🎯',
    'Tu productividad comienza aquí 🚀',
    'Convierte tus ideas en acciones 💡',
    'Seguridad y respaldo garantizados 🛡️',
    'El éxito está en los detalles 📋'
  ];

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(phraseInterval);
  }, [phrases.length]);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 6000;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isComplete && !isLoading && !navigationTriggered.current) {
      navigationTriggered.current = true;
      
      const completeTimer = setTimeout(() => {
        setFadeOut(true);
        
        const navigateTimer = setTimeout(() => {
          if (user) {
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        }, 500);
        
        return () => clearTimeout(navigateTimer);
      }, 300);
      
      return () => clearTimeout(completeTimer);
    }
  }, [isComplete, isLoading, user, navigate]);

  const floatingIcons = [
    { Icon: CheckCircle, delay: 0, x: '8%', y: '12%', size: 20 },
    { Icon: Target, delay: 2, x: '90%', y: '10%', size: 22 },
    { Icon: Calendar, delay: 4, x: '85%', y: '88%', size: 18 },
    { Icon: Zap, delay: 1, x: '12%', y: '85%', size: 20 },
    { Icon: Cloud, delay: 5, x: '50%', y: '8%', size: 18 },
    { Icon: Shield, delay: 3, x: '48%', y: '92%', size: 17 },
    { Icon: Save, delay: 6, x: '92%', y: '45%', size: 16 },
    { Icon: Sparkles, delay: 2.5, x: '5%', y: '50%', size: 15 },
  ];

  // ✅ MISMO FONDO que LoginPage: from-blue-600 via-purple-600 to-pink-500
  const backgroundClass = isDarkMode
    ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
    : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500';

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        transition-opacity duration-700 ${backgroundClass}
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Elementos decorativos de fondo - MISMOS que LoginPage */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-radial from-white to-transparent"
        />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.06 }}
          transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
          className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-radial from-white to-transparent"
        />

        {/* Burujas decorativas - MISMOS colores que LoginPage */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"></div>

        {floatingIcons.map(({ Icon, delay, x, y, size }, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: [0.15, 0.4, 0.15],
              y: [0, -15, 0],
            }}
            transition={{
              opacity: { duration: 4, delay, repeat: Infinity },
              y: { duration: 5, delay, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute text-white/20"
            style={{ left: x, top: y }}
          >
            <Icon size={size} />
          </motion.div>
        ))}

        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + (i % 2),
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 11) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* Contenido principal - CON ESTILOS DEL LOGIN */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 h-screen flex flex-col items-center justify-center">
        
        {/* SECCIÓN SUPERIOR: Logo y nombre */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Logo - MISMO que LoginPage */}
          <motion.div 
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(255,255,255,0.1)',
                '0 0 35px rgba(255,255,255,0.25)',
                '0 0 20px rgba(255,255,255,0.1)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative mb-6"
          >
            <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Edit3 size={36} className="text-white" />
              <Star className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
            </div>
          </motion.div>

          {/* Nombre de la app: QuickNote con gradientes iguales al Login */}
          <div className="flex flex-col items-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold drop-shadow-lg tracking-tight">
              <span className="bg-gradient-to-r from-amber-200 via-white to-blue-200 bg-clip-text text-transparent">
                Quick
              </span>
              <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Note
              </span>
            </h1>
            
            <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-blue-400 rounded-full mx-auto mt-3" />
            
            <span className="text-xs sm:text-sm bg-white/15 backdrop-blur-sm text-white px-4 py-1 rounded-full border border-white/20 mt-4">
              organiza tu día
            </span>
          </div>
          
          <p className="text-sm sm:text-base text-blue-100 font-light tracking-wide mt-3">
            Organiza • Sincroniza • Respaldada
          </p>
        </motion.div>

        {/* Espacio */}
        <div className="h-8 sm:h-10" />

        {/* SECCIÓN CENTRAL: Frase motivacional */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center w-full"
        >
          <motion.div
            key={currentPhrase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg max-w-[95%] sm:max-w-lg"
          >
            <p className="text-white text-base sm:text-lg font-medium text-center">
              {phrases[currentPhrase]}
            </p>
          </motion.div>
        </motion.div>

        {/* Espacio */}
        <div className="h-6 sm:h-8" />

        {/* SECCIÓN: Características */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3"
        >
          {[
            { icon: CheckCircle, text: 'Notas' },
            { icon: Cloud, text: 'Sync' },
            { icon: Save, text: 'Backup' },
            { icon: Calendar, text: 'Calendario' },
            { icon: Shield, text: 'Seguridad' },
            { icon: Zap, text: 'Productividad' }
          ].map(({ icon: Icon, text }, index) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.08 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <Icon size={14} className="sm:w-4 sm:h-4 text-white/80" />
              <span className="text-white text-xs sm:text-sm font-medium">{text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Espacio flexible */}
        <div className="flex-1 min-h-[20px] max-h-[60px]" />

        {/* SECCIÓN INFERIOR: Barra de carga y footer */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full flex flex-col items-center space-y-4 sm:space-y-5 pb-6"
        >
          {/* Barra de carga */}
          <div className="w-full max-w-xs sm:max-w-sm">
            <div className="flex justify-between mb-2">
              <span className="text-white/70 text-xs sm:text-sm font-light tracking-wide flex items-center gap-2">
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⚡
                </motion.span>
                {progress >= 100 ? '¡Listo!' : 'Cargando...'}
              </span>
              <motion.span 
                className="text-white text-sm sm:text-base font-bold"
                animate={{ scale: progress === 100 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(progress)}%
              </motion.span>
            </div>
            
            {/* Barra de progreso - MISMA que LoginPage (gradiente de green a blue) */}
            <div className="relative w-full h-2.5 bg-white/15 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: "linear" }}
              >
                {progress < 100 && (
                  <motion.div
                    className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '400%'] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </motion.div>
            </div>
          </div>

          {/* Badge de versión - MISMO estilo que LoginPage */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/25"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-white/80" />
              <span className="text-white/90 text-xs sm:text-sm font-semibold tracking-wider">
                VERSIÓN 2.6.0
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            </div>
          </motion.div>

          {/* Footer con créditos - MISMO que LoginPage */}
          <div className="pt-2">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="px-4 sm:px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
            >
              <div className="flex items-center gap-2 text-white/80">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span className="text-xs sm:text-sm font-light">
                  Desarrollado con <span className="text-amber-200">❤️</span> por José Pablo Miranda Quintanilla
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;