// src/pages/SplashScreen.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, isLoading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  // Tips motivacionales
  const tips = [
    "📝 Tus ideas, organizadas",
    "🔒 Seguridad de primer nivel",
    "🚀 Rápido y eficiente",
    "🎨 Diseño moderno",
    "💡 Creatividad sin límites",
    "🌟 Cada nota es única"
  ];

  useEffect(() => {
    // Rotar tips cada 800ms
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 800);

    // Animación de progreso
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    // Navegar después de 2.5 segundos
    const timer = setTimeout(() => {
      if (!isLoading) {
        setFadeOut(true);
        setTimeout(() => {
          navigate(user ? '/notes' : '/login');
        }, 500);
      }
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      clearInterval(tipInterval);
    };
  }, [navigate, user, isLoading, tips.length]);

  // Variantes de animación corregidas
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 0.8, staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.5 }
    }
  };

  // ✅ Corregido: ease usa valores válidos de Framer Motion
  const pulseVariants = {
    initial: { scale: 1, opacity: 0.6 },
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.6, 0.3, 0.6],
      transition: { 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          {/* Fondo con gradiente moderno */}
          <div
            className="absolute inset-0"
            style={{
              background: isDarkMode
                ? 'radial-gradient(ellipse at 50% 50%, #1e1b4b, #0f172a, #020617)'
                : 'radial-gradient(ellipse at 50% 50%, #6366f1, #8b5cf6, #ec4899)',
            }}
          />

          {/* Partículas de fondo animadas */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/10"
                style={{
                  width: Math.random() * 100 + 50,
                  height: Math.random() * 100 + 50,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, (Math.random() * 20) - 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: Math.random() * 5 + 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Círculos decorativos pulsantes - corregido */}
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
          />
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-3xl"
          />
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-3xl"
          />

          {/* Contenido principal */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between min-h-screen py-8 sm:py-12"
          >
            {/* Espacio superior */}
            <div className="flex-1 min-h-[10vh]" />

            {/* Logo y nombre */}
            <motion.div variants={itemVariants} className="flex flex-col items-center">
              {/* Logo animado */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 rounded-full blur-2xl bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 shadow-2xl flex items-center justify-center">
                  <motion.svg
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 sm:w-14 sm:h-14 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01"
                    />
                  </motion.svg>
                </div>
              </motion.div>

              {/* Título con efecto neón */}
              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
                style={{
                  textShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
                  letterSpacing: '-0.02em'
                }}
              >
                QuickNote
              </motion.h1>

              {/* Subtítulo */}
              <motion.p
                variants={itemVariants}
                className="mt-3 text-base sm:text-lg text-white/70 font-light tracking-wide"
              >
                Tus pensamientos, siempre contigo
              </motion.p>
            </motion.div>

            {/* Tips rotativos */}
            <motion.div
              variants={itemVariants}
              className="mt-8 sm:mt-12"
            >
              <div className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentTip}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-white text-sm sm:text-base font-medium"
                  >
                    {tips[currentTip]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Versión badge */}
            <motion.div
              variants={itemVariants}
              className="mt-6"
            >
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-md border border-white/30 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white text-xs sm:text-sm font-semibold tracking-wider">
                    VERSIÓN 2.4.0
                  </span>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
              </div>
            </motion.div>

            {/* Espacio central */}
            <div className="flex-1 min-h-[5vh]" />

            {/* Barra de progreso */}
            <motion.div
              variants={itemVariants}
              className="w-full max-w-md px-4"
            >
              <div className="flex justify-between mb-2">
                <span className="text-white/70 text-xs sm:text-sm font-light">Cargando...</span>
                <span className="text-white/70 text-xs sm:text-sm font-mono">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              variants={itemVariants}
              className="mt-8 sm:mt-12 pb-6"
            >
              <div className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="hidden xs:inline">Desarrollado con </span>
                  <span className="text-red-300 inline">❤️</span>
                  <span className="hidden xs:inline"> por José Pablo Miranda Quintanilla</span>
                  <span className="xs:hidden">José Pablo M.Q.</span>
                </div>
              </div>
            </motion.div>

            {/* Espacio inferior */}
            <div className="flex-1 min-h-[5vh]" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;