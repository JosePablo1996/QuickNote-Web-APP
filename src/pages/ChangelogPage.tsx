// src/pages/ChangelogPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

interface ChangeItem {
  description: string;
  subItems?: string[];
}

interface ChangeCategory {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: ChangeItem[];
}

interface VersionData {
  version: string;
  date: string;
  title: string;
  gradientColors: string[];
  changes: ChangeCategory[];
  isLatest?: boolean;
  isInitial?: boolean;
}

const ChangelogPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set(['2.0.0']));

  const toggleVersion = (version: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  };

  // Versiones de la aplicación web - ACTUALIZADO con v2.0.0
  const versions: VersionData[] = [
    {
      version: '2.0.0',
      date: '11 Mar 2026',
      title: '🚀 Rediseño Completo y Autenticación Biométrica Mejorada',
      gradientColors: ['#8B5CF6', '#EC4899'],
      isLatest: true,
      changes: [
        {
          title: '✨ Rediseño Completo de UI/UX',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          ),
          color: '#8B5CF6',
          items: [
            {
              description: '🎨 Interfaz de usuario completamente rediseñada',
              subItems: [
                'Nuevo sistema de diseño con glassmorphism mejorado',
                'Animaciones suaves y transiciones optimizadas',
                'Componentes reutilizables con Tailwind CSS',
                'Experiencia de usuario fluida en todas las páginas',
              ],
            },
            {
              description: '📱 Diseño responsive mejorado',
              subItems: [
                'Adaptación perfecta a todos los tamaños de pantalla',
                'Menús colapsables en dispositivos móviles',
                'Gestos táctiles para navegación',
                'Optimización para tablets y smartphones',
              ],
            },
            {
              description: '🌙 Modo oscuro/claro mejorado',
              subItems: [
                'Transiciones suaves entre temas',
                'Persistencia de preferencia del usuario',
                'Colores optimizados para cada tema',
                'Soporte para tema del sistema',
              ],
            },
          ],
        },
        {
          title: '🔐 Sistema de Autenticación Dual',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          color: '#3B82F6',
          items: [
            {
              description: '🔑 Autenticación con Passkeys (WebAuthn)',
              subItems: [
                'Inicio de sesión con huella dactilar, Face ID y Windows Hello',
                'Registro de múltiples dispositivos biométricos por usuario',
                'Tokens JWT HS256 para sesiones biométricas',
                'Verificación criptográfica con @simplewebauthn/server',
              ],
            },
            {
              description: '📧 Autenticación tradicional con email/password',
              subItems: [
                'Login y registro con Supabase Auth',
                'Tokens ES256 generados por Supabase',
                'Mismo usuario ve sus notas sin importar el método',
                'Sincronización perfecta entre ambos métodos',
              ],
            },
            {
              description: '🔄 Middleware unificado de autenticación',
              subItems: [
                'Soporte para tokens HS256 (passkey) y ES256 (Supabase)',
                'Verificación dual con jwt.verify() y supabase.auth.getUser()',
                'Extracción consistente de userId del token',
                'Cliente Supabase unificado con el token del usuario',
              ],
            },
          ],
        },
        {
          title: '🛡️ Seguridad y Aislamiento de Datos',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
          color: '#10B981',
          items: [
            {
              description: '🔒 Políticas RLS implementadas correctamente',
              subItems: [
                'Aislamiento total de notas entre usuarios',
                'Usuario 1 no puede ver notas del Usuario 2 y viceversa',
                'Políticas para SELECT, INSERT, UPDATE y DELETE',
                'Verificación con auth.uid() = user_id',
              ],
            },
            {
              description: '🗑️ Soft delete con columna deleted_at',
              subItems: [
                'Mover notas a papelera sin eliminarlas permanentemente',
                'Restaurar notas desde la papelera',
                'Filtrado de notas activas vs eliminadas',
              ],
            },
            {
              description: '🔐 Manejo seguro de tokens',
              subItems: [
                'Tokens con expiración de 7 días',
                'Almacenamiento seguro en localStorage',
                'Limpieza automática al cerrar sesión',
                'Verificación de tokens en cada petición',
              ],
            },
          ],
        },
        {
          title: '⚙️ Backend y APIs Mejorados',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          ),
          color: '#F59E0B',
          items: [
            {
              description: '🌐 Servidor Express unificado',
              subItems: [
                'Middleware authenticateToken con soporte dual',
                'Cliente getSupabaseClient para operaciones CRUD',
                'Logs detallados de depuración',
                'Manejo robusto de errores',
              ],
            },
            {
              description: '🗄️ Integración con Supabase',
              subItems: [
                'Uso de service role key para operaciones admin',
                'Cliente autenticado para respetar RLS',
                'Buckets de storage para avatares y banners',
                'Políticas RLS configuradas correctamente',
              ],
            },
            {
              description: '📊 Logs de depuración mejorados',
              subItems: [
                'Logs detallados en servidor Node.js',
                'Logs en consola del navegador con colores',
                'Información de tokens y headers',
                'Tiempos de respuesta de API',
              ],
            },
          ],
        },
        {
          title: '🐛 Correcciones Críticas',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          ),
          color: '#EF4444',
          items: [
            {
              description: '🔧 Corrección de RLS para notas',
              subItems: [
                'Solución al error "new row violates row-level security policy"',
                'Implementación de políticas correctas para todas las operaciones',
                'Uso de cliente autenticado con token del usuario',
              ],
            },
            {
              description: '🔄 Unificación de tokens de autenticación',
              subItems: [
                'Tokens HS256 (passkey) y ES256 (Supabase) funcionando juntos',
                'Middleware que verifica ambos tipos de token',
                'Mismo usuario ve sus notas sin importar el método',
              ],
            },
            {
              description: '📝 Corrección en creación de notas',
              subItems: [
                'Asignación correcta de user_id desde el token',
                'Validación de datos antes de insertar',
                'Manejo de errores mejorado',
              ],
            },
            {
              description: '🎨 Mejoras en UI/UX',
              subItems: [
                'Pantalla de bienvenida después de login',
                'Redirecciones correctas en todos los flujos',
                'Mensajes de error más descriptivos',
                'Animaciones suaves sin conflictos',
              ],
            },
          ],
        },
        {
          title: '📦 Dependencias Actualizadas',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          ),
          color: '#6366F1',
          items: [
            {
              description: '📦 Backend',
              subItems: [
                '@supabase/supabase-js: ^2.99.0',
                '@simplewebauthn/server: ^13.2.3',
                'express: ^5.2.1',
                'jsonwebtoken: ^9.0.3',
              ],
            },
            {
              description: '📦 Frontend',
              subItems: [
                'react: ^18.2.0',
                '@simplewebauthn/browser: ^13.2.2',
                'framer-motion: ^12.35.1',
                'tailwindcss: ^3.4.1',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '1.4.0',
      date: '08 Mar 2026',
      title: '🔐 Autenticación Biométrica y Mejoras de Perfil',
      gradientColors: ['#3B82F6', '#10B981'],
      changes: [
        {
          title: '🔑 Autenticación Biométrica (WebAuthn)',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          ),
          color: '#3B82F6',
          items: [
            {
              description: '🖐️ Implementación inicial de WebAuthn',
              subItems: [
                'Soporte para huella dactilar y Face ID',
                'Registro de dispositivos biométricos',
                'Fallback a contraseña si no hay biometría',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '1.3.0',
      date: '07 Mar 2026',
      title: '🔐 Sistema de Autenticación y Recuperación de Contraseña',
      gradientColors: ['#3B82F6', '#EC4899'],
      changes: [
        {
          title: '🔐 Sistema de Autenticación Completo',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          color: '#3B82F6',
          items: [
            {
              description: '🔑 Flujo completo de autenticación con Supabase',
              subItems: [
                'Login con email y contraseña',
                'Registro de nuevos usuarios',
                'Recuperación de contraseña con email',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '1.2.0',
      date: '07 Mar 2026',
      title: '🔐 Autenticación y Perfiles de Usuario',
      gradientColors: ['#3B82F6', '#EC4899'],
      changes: [
        {
          title: '🔐 Sistema de Autenticación',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          color: '#3B82F6',
          items: [
            {
              description: '🔑 Autenticación básica con Supabase',
              subItems: [
                'Login con email y contraseña',
                'Registro de nuevos usuarios',
              ],
            },
          ],
        },
        {
          title: '👤 Perfil de Usuario',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          color: '#8B5CF6',
          items: [
            {
              description: '📱 Página de perfil básica',
              subItems: [
                'Banner de usuario',
                'Avatar circular',
                'Estadísticas de usuario',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '1.1.0',
      date: '05 Mar 2026',
      title: '🚀 Integración con Supabase y Mejoras Visuales',
      gradientColors: ['#3B82F6', '#8B5CF6'],
      changes: [
        {
          title: '📦 Base de datos y Backend',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          ),
          color: '#10B981',
          items: [
            {
              description: '🔄 Migración inicial a Supabase',
              subItems: [
                'Integración básica con Supabase',
                'Migración de IDs a UUIDs',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '1.0.0',
      date: '04 Mar 2026',
      title: '🎉 Lanzamiento Inicial - QuickNote Web',
      gradientColors: ['#3B82F6', '#10B981'],
      isInitial: true,
      changes: [
        {
          title: '🚀 Funcionalidades Principales',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          color: '#4CAF50',
          items: [
            {
              description: '📝 Gestión básica de notas',
              subItems: [
                'CRUD básico de notas',
                'Vista grid y lista',
              ],
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Volver a configuración"
              title="Volver"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Historial de cambios</h1>
          </div>
        </div>
      </div>

      {/* Lista de versiones */}
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {versions.map((version, index) => {
          const isExpanded = expandedVersions.has(version.version);
          const isLatest = version.isLatest || index === 0;
          const gradientStart = version.gradientColors[0];
          const gradientEnd = version.gradientColors[1];

          return (
            <div
              key={version.version}
              className={`
                relative overflow-hidden transition-all duration-500 ease-in-out transform
                ${isExpanded ? 'scale-100' : 'hover:scale-[1.02]'}
                rounded-2xl
                ${isDarkMode 
                  ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/80' 
                  : 'bg-gradient-to-br from-white/95 to-gray-50/90'
                }
                backdrop-blur-lg border-2
                ${isLatest 
                  ? 'border-purple-500/70 shadow-2xl' 
                  : isDarkMode 
                    ? 'border-gray-700/40' 
                    : 'border-gray-300/50'
                }
              `}
              style={{
                boxShadow: isLatest ? `0 20px 40px -15px ${gradientStart}60` : '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              {/* Efecto de brillo para la versión más reciente */}
              {isLatest && (
                <>
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-blue-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse" />
                </>
              )}

              {/* Header de la versión */}
              <div
                className="relative p-5 cursor-pointer"
                onClick={() => toggleVersion(version.version)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Badge de versión */}
                    <div
                      className={`
                        px-4 py-2 rounded-full text-white font-bold text-sm
                        transition-all duration-300
                        ${isExpanded ? 'scale-110 shadow-lg' : ''}
                      `}
                      style={{
                        background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                        boxShadow: isExpanded ? `0 8px 20px ${gradientStart}60` : 'none',
                      }}
                    >
                      v{version.version}
                    </div>

                    {/* Fecha */}
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-200/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-full border border-gray-300/30 dark:border-gray-600/30">
                      <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {version.date}
                      </span>
                    </div>

                    {/* Badge "Latest" para la versión más reciente */}
                    {isLatest && (
                      <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-bold shadow-lg animate-pulse">
                        ✨ Última versión
                      </div>
                    )}
                  </div>

                  {/* Icono de expandir */}
                  <div
                    className={`
                      p-2.5 rounded-full transition-all duration-500 cursor-pointer
                      ${isExpanded ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30' : 'bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'}
                    `}
                    style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <svg
                      className={`w-5 h-5 transition-colors duration-300 ${isExpanded ? 'text-white' : 'text-gray-500'}`}
                      style={{ color: isExpanded ? gradientStart : undefined }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Título de la versión */}
                <div
                  className={`
                    overflow-hidden transition-all duration-500
                    ${isExpanded ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl"
                    style={{
                      backgroundColor: `${gradientStart}15`,
                      border: `1px solid ${gradientStart}30`,
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <span className="text-base font-medium" style={{ color: gradientStart }}>
                      {version.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenido expandible */}
              <div
                className={`
                  overflow-hidden transition-all duration-500 ease-in-out
                  ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="px-5 pb-5 max-h-[700px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-6 pr-2">
                    {version.changes.map((category, catIndex) => (
                      <div
                        key={catIndex}
                        className="space-y-3 transform transition-all duration-300 hover:translate-x-1"
                        style={{
                          animation: `slideIn 0.5s ease-out ${catIndex * 0.1}s both`,
                        }}
                      >
                        {/* Título de categoría */}
                        <div className="flex items-center gap-2 group sticky top-0 bg-opacity-90 backdrop-blur-sm py-2 z-10"
                          style={{
                            backgroundColor: isDarkMode ? 'rgba(17,24,39,0.9)' : 'rgba(249,250,251,0.9)',
                          }}
                        >
                          <div
                            className={`
                              p-2.5 rounded-xl transition-all duration-300
                              group-hover:scale-110 group-hover:shadow-lg
                            `}
                            style={{
                              backgroundColor: `${category.color}20`,
                              boxShadow: `0 4px 12px ${category.color}30`,
                            }}
                          >
                            <span style={{ color: category.color }} className="transition-transform duration-300 group-hover:rotate-12 block">
                              {category.icon}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
                            {category.title}
                          </h3>
                          <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-700" />
                        </div>

                        {/* Items de la categoría */}
                        <div className="space-y-3 pl-4">
                          {category.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="p-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                              style={{
                                backgroundColor: isDarkMode ? 'rgba(31,41,55,0.5)' : 'rgba(255,255,255,0.7)',
                                border: `1px solid ${category.color}25`,
                                backdropFilter: 'blur(4px)',
                                boxShadow: `0 4px 12px ${category.color}15`,
                              }}
                            >
                              {/* Descripción principal */}
                              <div className="flex items-start gap-3">
                                <div
                                  className="p-1.5 rounded-lg mt-0.5 transition-transform duration-300 hover:scale-110"
                                  style={{ backgroundColor: `${category.color}25` }}
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    style={{ color: category.color }}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {item.description}
                                </span>
                              </div>

                              {/* Sub-items con viñetas */}
                              {item.subItems && item.subItems.length > 0 && (
                                <div className="mt-3 ml-10 space-y-2">
                                  {item.subItems.map((subItem, subIndex) => (
                                    <div
                                      key={subIndex}
                                      className="flex items-start gap-2 text-xs group/sub"
                                    >
                                      <span
                                        className="w-1.5 h-1.5 rounded-full mt-1.5 transition-all duration-300 group-hover/sub:scale-150 group-hover/sub:shadow-lg"
                                        style={{ backgroundColor: category.color }}
                                      />
                                      <span className="text-gray-600 dark:text-gray-400 group-hover/sub:text-gray-800 dark:group-hover/sub:text-gray-200 transition-colors duration-300">
                                        {subItem}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Badge de versión inicial */}
                    {version.isInitial && (
                      <div
                        className="mt-6 p-5 rounded-xl text-center transform transition-all duration-300 hover:scale-[1.02] animate-pulse"
                        style={{
                          background: `linear-gradient(135deg, ${gradientStart}15, ${gradientEnd}15)`,
                          border: `1px solid ${gradientStart}30`,
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <span className="text-base font-bold" style={{ color: gradientStart }}>
                          🎉 El comienzo de QuickNote Web 🎉
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estilos globales para animaciones y scrollbar personalizado */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #7C3AED, #DB2777);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #A78BFA, #F472B6);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
        }

        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #8B5CF6 transparent;
        }

        .dark .custom-scrollbar {
          scrollbar-color: #A78BFA transparent;
        }
      `}</style>
    </div>
  );
};

export default ChangelogPage;