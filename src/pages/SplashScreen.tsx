// src/pages/SplashScreen.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, isLoading } = useAuth(); // ✅ Obtener estado de autenticación
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Animación de progreso más suave
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    // ✅ Navegar después de 2.5 segundos, verificando autenticación
    const timer = setTimeout(() => {
      if (!isLoading) {
        setFadeOut(true);
        setTimeout(() => {
          if (user) {
            // Si ya hay sesión, va a notas
            navigate('/notes');
          } else {
            // Si no hay sesión, va a login
            navigate('/login');
          }
        }, 500);
      }
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate, user, isLoading]); // ✅ Dependencias actualizadas

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        transition-opacity duration-500
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
      `}
      style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #111827, #1E3A8A, #4C1D95)'
          : 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899)',
      }}
    >
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Círculo gigante superior derecho */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10 animate-pulse"
          style={{ background: 'radial-gradient(circle, white, transparent)' }}
        />
        
        {/* Círculo gigante inferior izquierdo */}
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-10 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, white, transparent)',
            animationDelay: '0.5s'
          }}
        />
        
        {/* Círculos decorativos adicionales */}
        <div
          className="absolute top-20 left-1/3 w-96 h-96 rounded-full opacity-5 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, white, transparent)',
            animationDelay: '1s'
          }}
        />
        <div
          className="absolute bottom-20 right-1/3 w-80 h-80 rounded-full opacity-5 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, white, transparent)',
            animationDelay: '1.5s'
          }}
        />
      </div>

      {/* Contenido principal - layout vertical con espaciado */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center justify-between h-screen py-12">
        
        {/* Espacio superior para balance */}
        <div className="flex-1" />

        {/* Logo más pequeño arriba del nombre */}
        <div className="flex flex-col items-center mb-8">
          {/* Logo pequeño */}
          <div className="relative mb-4">
            {/* Círculo exterior con glow sutil */}
            <div className="absolute inset-0 rounded-full blur-xl bg-white/20 animate-pulse" />
            
            {/* Círculo principal */}
            <div className="relative w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-xl flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
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
          </div>

          {/* Nombre de la app */}
          <h1
            className="text-5xl lg:text-6xl font-bold text-white"
            style={{
              textShadow: '0 8px 30px rgba(0,0,0,0.4)',
              letterSpacing: '-0.02em'
            }}
          >
            QuickNote
          </h1>
        </div>

        {/* Mensaje "Tus pensamientos siempre contigo" con badge de versión */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/30 shadow-lg">
            <p className="text-white text-lg lg:text-xl font-light">
              Tus pensamientos siempre contigo
            </p>
          </div>
          
          {/* Badge de versión 1.2.0 */}
          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-md border border-white/40 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-white text-sm font-semibold tracking-wider">
                VERSIÓN 1.4.0
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Espacio central para balance */}
        <div className="flex-1" />

        {/* Sección inferior - Barra de carga y footer */}
        <div className="w-full flex flex-col items-center space-y-8">
          {/* Barra de carga con porcentaje */}
          <div className="w-full max-w-md">
            <div className="flex justify-between mb-3">
              <span className="text-white/80 text-sm font-light tracking-wide">Iniciando...</span>
              <span className="text-white/80 text-sm font-medium">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Footer con badge de desarrollador */}
          <div className="pt-4">
            <div className="px-8 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/30 shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-3 text-white/90">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="text-base lg:text-lg font-light tracking-wide">
                  Desarrollado con <span className="text-red-300">❤️</span> por José Pablo Miranda
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Espacio inferior para balance */}
        <div className="flex-1" />
      </div>
    </div>
  );
};

export default SplashScreen;