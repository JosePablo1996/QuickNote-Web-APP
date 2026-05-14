import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { DEMO_PROFILE } from '../models/DeveloperProfile';
import LoadingSpinner from '../contexts/components/ui/LoadingSpinner';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Github, 
  Mail, 
  Code, 
  Star, 
  BookOpen, 
  Shield, 
  Sparkles, 
  Heart, 
  Globe, 
  Cpu, 
  Database, 
  Cloud, 
  Layout, 
  Zap, 
  GitBranch, 
  Code2, 
  Figma, 
  Braces, 
  Server,
  Lock,
  RefreshCw,
  Download,
  FileText,
  FileJson,
  Share2,
  Filter,
  Clock,
  Upload,
  HardDrive
} from 'lucide-react';

const DeveloperPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [isLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const devMode = localStorage.getItem('is_developer') === 'true';
      setIsDeveloperMode(devMode);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const logoutDeveloper = () => {
    localStorage.removeItem('is_developer');
    setIsDeveloperMode(false);
  };

  const launchUrl = (url: string) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };

  // Tecnologías actualizadas con las nuevas implementaciones
  const technologies = [
    { name: 'React 18', icon: <Code2 className="w-5 h-5" />, color: 'blue', description: 'Framework UI' },
    { name: 'TypeScript', icon: <Braces className="w-5 h-5" />, color: 'blue', description: 'Tipado estático' },
    { name: 'Tailwind CSS', icon: <Layout className="w-5 h-5" />, color: 'cyan', description: 'Estilos y diseño' },
    { name: 'Framer Motion', icon: <Sparkles className="w-5 h-5" />, color: 'pink', description: 'Animaciones' },
    { name: 'FastAPI', icon: <Server className="w-5 h-5" />, color: 'green', description: 'Backend API (Python)' },
    { name: 'Supabase', icon: <Database className="w-5 h-5" />, color: 'green', description: 'Base de datos + Auth' },
    { name: 'PostgreSQL', icon: <Database className="w-5 h-5" />, color: 'blue', description: 'Base de datos relacional' },
    { name: 'Vite', icon: <Zap className="w-5 h-5" />, color: 'yellow', description: 'Build tool' },
    { name: 'React Router v6', icon: <GitBranch className="w-5 h-5" />, color: 'red', description: 'Enrutamiento' },
    { name: 'Lucide React', icon: <Heart className="w-5 h-5" />, color: 'red', description: 'Iconos' },
    { name: 'WebAuthn', icon: <Shield className="w-5 h-5" />, color: 'purple', description: 'Autenticación biométrica' },
    { name: 'TOTP 2FA', icon: <Lock className="w-5 h-5" />, color: 'purple', description: 'Google Authenticator' },
    { name: 'OTP Email', icon: <Mail className="w-5 h-5" />, color: 'blue', description: 'Verificación por email' },
    { name: 'Cloud Backup', icon: <Cloud className="w-5 h-5" />, color: 'indigo', description: 'Backup en Supabase' },
    { name: 'Compresión GZIP', icon: <HardDrive className="w-5 h-5" />, color: 'teal', description: 'Ahorro 65-80% espacio' },
    { name: 'Exportación PDF', icon: <FileText className="w-5 h-5" />, color: 'red', description: 'Documentos profesionales' },
    { name: 'Exportación Markdown', icon: <FileText className="w-5 h-5" />, color: 'blue', description: 'Formato texto plano' },
    { name: 'Exportación JSON', icon: <FileJson className="w-5 h-5" />, color: 'green', description: 'Backup completo' },
    { name: 'Backup Selectivo', icon: <Filter className="w-5 h-5" />, color: 'orange', description: 'Elegir qué notas respaldar' },
    { name: 'Backup Programado', icon: <Clock className="w-5 h-5" />, color: 'amber', description: 'Automático diario/semanal' },
    { name: 'Restauración Auto', icon: <RefreshCw className="w-5 h-5" />, color: 'green', description: 'Sincronización al inicio' },
    { name: 'Compartir Redes', icon: <Share2 className="w-5 h-5" />, color: 'blue', description: 'Twitter/Facebook/WhatsApp' },
    { name: 'Render', icon: <Cloud className="w-5 h-5" />, color: 'blue', description: 'Hosting API' },
    { name: 'Vercel', icon: <Globe className="w-5 h-5" />, color: 'black', description: 'Hosting frontend' },
    { name: 'Figma', icon: <Figma className="w-5 h-5" />, color: 'purple', description: 'Diseño UI/UX' },
  ];

  // Agrupar tecnologías por categoría para mejor visualización
  const categories = {
    frontend: technologies.filter(t => ['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite', 'React Router v6', 'Lucide React'].includes(t.name)),
    backend: technologies.filter(t => ['FastAPI', 'Supabase', 'PostgreSQL', 'Render', 'Vercel'].includes(t.name)),
    seguridad: technologies.filter(t => ['WebAuthn', 'TOTP 2FA', 'OTP Email'].includes(t.name)),
    backups: technologies.filter(t => ['Cloud Backup', 'Compresión GZIP', 'Backup Selectivo', 'Backup Programado', 'Restauración Auto'].includes(t.name)),
    exportacion: technologies.filter(t => ['Exportación PDF', 'Exportación Markdown', 'Exportación JSON', 'Compartir Redes'].includes(t.name)),
    diseno: technologies.filter(t => ['Figma'].includes(t.name)),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando perfil..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header con estilo glass */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/settings')}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Desarrollador
                </h1>
              </div>
            </div>

            {isDeveloperMode && (
              <div className="px-3 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full text-xs border border-purple-500/30">
                Modo Dev
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner principal con gradiente */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-56 md:h-64 w-full overflow-hidden rounded-2xl shadow-xl"
        >
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            />
            
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <h2 className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl tracking-tight animate-pulse">
                Quick<span className="text-yellow-300">Note</span>
              </h2>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30 shadow-2xl"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-white font-medium text-sm md:text-base">
                  Desarrollado con <span className="text-red-300 text-lg">❤️</span> por José Pablo Miranda Quintanilla
                </span>
              </motion.div>
            </div>

            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30 shadow-lg">
                v 2.4.0
              </span>
            </div>

            <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 animate-pulse" />
          </div>
        </motion.div>
      </div>

      {/* Avatar posicionado sobre el banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative -mt-12 flex justify-center"
        >
          <div className="relative">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-xl">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-14 h-14 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" />
                </svg>
              </div>
            </div>
            
            {isDeveloperMode && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"
              >
                <Star className="w-4 h-4 text-white fill-white" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Información del desarrollador */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {DEMO_PROFILE.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {DEMO_PROFILE.role || 'Desarrollador Full Stack'}
          </p>
          {DEMO_PROFILE.bio && (
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              {DEMO_PROFILE.bio}
            </p>
          )}
        </motion.div>
      </div>

      {/* Tecnologías utilizadas - SECCIÓN PRINCIPAL CON CATEGORÍAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Frontend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            <Layout className="w-4 h-4 text-blue-500" />
            Frontend
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.frontend.map((tech, index) => {
              const colorClasses = {
                blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
                pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
                green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
                yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
                red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                black: 'bg-gray-800/10 text-gray-800 dark:text-gray-300 border-gray-800/20 dark:border-gray-700/40',
              };
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`p-3 rounded-xl border ${colorClasses[tech.color as keyof typeof colorClasses]} flex flex-col items-center text-center group cursor-default`}
                >
                  <div className="p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
                    {tech.icon}
                  </div>
                  <span className="text-xs font-medium mb-1">{tech.name}</span>
                  <span className="text-[10px] opacity-70">{tech.description}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Backend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-green-500" />
            Backend & Base de Datos
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.backend.map((tech, index) => {
              const colorClasses = {
                blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
                black: 'bg-gray-800/10 text-gray-800 dark:text-gray-300 border-gray-800/20 dark:border-gray-700/40',
              };
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`p-3 rounded-xl border ${colorClasses[tech.color as keyof typeof colorClasses]} flex flex-col items-center text-center group cursor-default`}
                >
                  <div className="p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
                    {tech.icon}
                  </div>
                  <span className="text-xs font-medium mb-1">{tech.name}</span>
                  <span className="text-[10px] opacity-70">{tech.description}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Seguridad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            Seguridad & Autenticación
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.seguridad.map((tech, index) => {
              const colorClasses = {
                purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
              };
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`p-3 rounded-xl border ${colorClasses[tech.color as keyof typeof colorClasses]} flex flex-col items-center text-center group cursor-default`}
                >
                  <div className="p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
                    {tech.icon}
                  </div>
                  <span className="text-xs font-medium mb-1">{tech.name}</span>
                  <span className="text-[10px] opacity-70">{tech.description}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Backups */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-indigo-500" />
            Sistema de Backups
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.backups.map((tech, index) => {
              const colorClasses = {
                indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
                teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
                orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
              };
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`p-3 rounded-xl border ${colorClasses[tech.color as keyof typeof colorClasses]} flex flex-col items-center text-center group cursor-default`}
                >
                  <div className="p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
                    {tech.icon}
                  </div>
                  <span className="text-xs font-medium mb-1">{tech.name}</span>
                  <span className="text-[10px] opacity-70">{tech.description}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Exportación y Compartición */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-500" />
            Exportación & Compartición
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.exportacion.map((tech, index) => {
              const colorClasses = {
                red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
              };
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`p-3 rounded-xl border ${colorClasses[tech.color as keyof typeof colorClasses]} flex flex-col items-center text-center group cursor-default`}
                >
                  <div className="p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
                    {tech.icon}
                  </div>
                  <span className="text-xs font-medium mb-1">{tech.name}</span>
                  <span className="text-[10px] opacity-70">{tech.description}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Diseño */}
        {categories.diseno.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
              <Figma className="w-4 h-4 text-purple-500" />
              Diseño & UI/UX
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.diseno.map((tech, index) => {
                const colorClasses = {
                  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                };
                
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`p-3 rounded-xl border ${colorClasses[tech.color as keyof typeof colorClasses]} flex flex-col items-center text-center group cursor-default`}
                  >
                    <div className="p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
                      {tech.icon}
                    </div>
                    <span className="text-xs font-medium mb-1">{tech.name}</span>
                    <span className="text-[10px] opacity-70">{tech.description}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Contador de tecnologías */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {technologies.length} tecnologías utilizadas en el desarrollo de QuickNote v2.4.0
          </p>
        </div>
      </div>

      {/* Sección "Conectar conmigo" - SIN LINKEDIN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border-t border-gray-200 dark:border-gray-700 pt-8"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Conectar conmigo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* GitHub */}
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => launchUrl(DEMO_PROFILE.github_url)}
              className="w-full px-4 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-medium block text-gray-900 dark:text-white">GitHub</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">@jose-pablo-miranda</span>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Email */}
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = `mailto:${DEMO_PROFILE.email}`}
              className="w-full px-4 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-medium block text-gray-900 dark:text-white">Email</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{DEMO_PROFILE.email}</span>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Modo desarrollador */}
      {isDeveloperMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-8"
        >
          <button
            onClick={logoutDeveloper}
            className="w-full md:w-auto px-6 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-3 mx-auto"
          >
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-red-600 dark:text-red-400">Modo Desarrollador Activo - Salir</span>
          </button>
        </motion.div>
      )}

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-6">
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          QuickNote v2.4.0 · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default DeveloperPage;