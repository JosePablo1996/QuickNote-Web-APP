// src/pages/SplashScreen.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos correctos para Framer Motion
import type { Easing } from 'framer-motion';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, isLoading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Tips motivacionales (inspirados en la versión móvil)
  const tips = [
    "📝 Organiza tus ideas",
    "🔒 Seguridad de primer nivel",
    "🚀 Rápido y eficiente",
    "🎨 Diseño moderno",
    "💡 Creatividad sin límites",
    "🌟 Cada nota es única",
    "☁️ Sincronización en la nube",
    "🔐 Autenticación biométrica"
  ];

  useEffect(() => {
    // Mostrar contenido después de la animación inicial
    const showTimer = setTimeout(() => setShowContent(true), 300);

    // Rotar tips cada 3 segundos (como en móvil)
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 3000);

    // Animación de progreso (3 segundos como en móvil)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    // Navegar después de 3 segundos (como en móvil)
    const timer = setTimeout(() => {
      if (!isLoading) {
        setFadeOut(true);
        setTimeout(() => {
          navigate(user ? '/notes' : '/login');
        }, 500);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      clearInterval(tipInterval);
      clearTimeout(showTimer);
    };
  }, [navigate, user, isLoading, tips.length]);

  // Variantes de animación corregidas
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 0.8, staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.5, ease: "easeOut" as Easing }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.5, opacity: 0, rotate: -10 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { 
        type: "spring" as const,
        stiffness: 200, 
        damping: 15,
        duration: 0.8 
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 0.8, opacity: 0.2 },
    animate: {
      scale: [0.8, 1.1, 0.8],
      opacity: [0.2, 0.4, 0.2],
      transition: { 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" as Easing
      }
    }
  };

  const tipVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
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
          {/* Fondo con gradiente inspirado en la versión móvil */}
          <div
            className="absolute inset-0"
            style={{
              background: isDarkMode
                ? 'linear-gradient(135deg, #1E3A8A 0%, #4C1D95 50%, #831843 100%)'
                : 'linear-gradient(135deg, #2563EB 0%, #7C3AED 50%, #EC4899 100%)',
            }}
          />

          {/* Círculos decorativos de fondo inspirados en móvil */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Círculo grande superior derecho */}
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="absolute top-[-100px] right-[-100px] w-[250px] h-[250px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, rgba(37,99,235,0) 70%)',
              }}
            />
            
            {/* Círculo medio inferior izquierdo */}
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="absolute bottom-[-50px] left-[-50px] w-[200px] h-[200px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(236,72,153,0) 70%)',
              }}
            />
            
            {/* Círculo pequeño medio izquierdo */}
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="absolute top-[40%] left-[-40px] w-[120px] h-[120px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(124,58,237,0) 70%)',
              }}
            />
            
            {/* Círculo pequeño inferior derecho */}
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="absolute bottom-[20%] right-[-30px] w-[100px] h-[100px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, rgba(6,182,212,0) 70%)',
              }}
            />
          </div>

          {/* Contenido principal */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col items-center justify-between min-h-screen py-12"
          >
            {/* Versión badge (superior derecha) */}
            <motion.div 
              variants={itemVariants}
              className="absolute top-4 right-4"
            >
              <div className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                <span className="text-white text-xs font-semibold tracking-wider">
                  v2.6.0
                </span>
              </div>
            </motion.div>

            {/* Espacio superior */}
            <div className="flex-1" />

            {/* Logo y nombre - Estilo idéntico a móvil */}
            <motion.div 
              variants={logoVariants}
              className="flex flex-col items-center"
            >
              {/* Logo con diseño de tarjeta inspirado en móvil */}
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" as Easing
                }}
                className="relative mb-8"
              >
                <div 
                  className="absolute inset-0 rounded-2xl blur-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                    opacity: 0.4
                  }}
                />
                <div 
                  className="relative w-32 h-32 rounded-2xl flex items-center justify-center shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                    boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <svg 
                    className="w-16 h-16 text-white"
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
                  </svg>
                </div>
              </motion.div>

              {/* Título "Quick" */}
              <motion.h1
                variants={itemVariants}
                className="text-6xl font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF, #FCD34D)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Quick
              </motion.h1>

              {/* Título "Note" */}
              <motion.h1
                variants={itemVariants}
                className="text-6xl font-bold tracking-tight -mt-2"
                style={{
                  background: 'linear-gradient(135deg, #FCD34D, #FBBF24)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Note
              </motion.h1>
            </motion.div>

            {/* Subtítulo con badge */}
            <motion.div
              variants={itemVariants}
              className="mt-6"
            >
              <div className="px-6 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25">
                <p className="text-white text-sm font-medium tracking-wide">
                  Tus pensamientos, siempre contigo
                </p>
              </div>
            </motion.div>

            {/* Tips rotativos (inspirado en móvil) */}
            <motion.div
              variants={itemVariants}
              className="mt-12"
            >
              <div className="px-8 py-3.5 rounded-full bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md border border-white/25 shadow-xl">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentTip}
                    variants={tipVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="text-white text-base font-semibold"
                  >
                    {tips[currentTip]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Barra de progreso (inspirada en móvil) */}
            <motion.div
              variants={itemVariants}
              className="absolute bottom-32 left-0 right-0 flex flex-col items-center"
            >
              <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #F59E0B, #EC4899)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 text-white/70 text-xs font-mono"
              >
                {progress}%
              </motion.p>
            </motion.div>

            {/* Créditos (inspirados en móvil) */}
            <motion.div
              variants={itemVariants}
              className="absolute bottom-8 left-0 right-0 text-center"
            >
              <p className="text-white/60 text-xs tracking-wide">
                Desarrollado con <span className="text-red-300">❤️</span> por
              </p>
              <p className="text-white/80 text-sm font-semibold mt-1 tracking-wide">
                José Pablo Miranda Quintanilla
              </p>
            </motion.div>

            {/* Espacio inferior */}
            <div className="flex-1" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;