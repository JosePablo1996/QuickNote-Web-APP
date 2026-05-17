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
  HardDrive,
  Key,
  QrCode,
  Send,
  Bell,
  CheckCircle,
  History,
  Timer,
  LogOut,
  Eye,
  Smartphone,
  Palette,
  Grid,
  List,
  User,
  Settings,
  HelpCircle,
  FileCode,
  Terminal,
  Package,
  TrendingUp,
  Award,
  Users,
  MessageCircle,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Chrome,
  Apple,
  Database as DatabaseIcon,
  Box,
  Layers,
  Workflow,
  AlertCircle,
  CheckSquare,
  Trash2,
  Edit3,
  Archive,
  Bookmark
} from 'lucide-react';

// Importar el avatar local
import developerAvatar from '../assets/developer-avatar.png';

const DeveloperPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [isLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  // Tecnologías actualizadas con todas las implementaciones de v2.5.0 y v2.6.0
  const technologies = [
    // Frontend Core
    { name: 'React 18', icon: <Code2 className="w-5 h-5" />, color: 'blue', category: 'frontend', description: 'Framework UI con Hooks y Concurrent Features' },
    { name: 'TypeScript', icon: <Braces className="w-5 h-5" />, color: 'blue', category: 'frontend', description: 'Tipado estático y seguridad en tiempo de compilación' },
    { name: 'Tailwind CSS', icon: <Palette className="w-5 h-5" />, color: 'cyan', category: 'frontend', description: 'Utilidades CSS para diseño rápido y responsivo' },
    { name: 'Framer Motion', icon: <Sparkles className="w-5 h-5" />, color: 'pink', category: 'frontend', description: 'Animaciones fluidas y transiciones' },
    { name: 'Vite', icon: <Zap className="w-5 h-5" />, color: 'yellow', category: 'frontend', description: 'Build tool ultrarrápida con HMR' },
    { name: 'React Router v6', icon: <GitBranch className="w-5 h-5" />, color: 'red', category: 'frontend', description: 'Enrutamiento dinámico y protección de rutas' },
    { name: 'Lucide React', icon: <Heart className="w-5 h-5" />, color: 'red', category: 'frontend', description: 'Iconos modernos y consistentes' },
    
    // Backend & Database
    { name: 'FastAPI', icon: <Server className="w-5 h-5" />, color: 'green', category: 'backend', description: 'API REST asíncrona con Python' },
    { name: 'Supabase', icon: <DatabaseIcon className="w-5 h-5" />, color: 'green', category: 'backend', description: 'Backend como servicio con PostgreSQL' },
    { name: 'PostgreSQL', icon: <Database className="w-5 h-5" />, color: 'blue', category: 'backend', description: 'Base de datos relacional robusta' },
    { name: 'SQLAlchemy', icon: <Box className="w-5 h-5" />, color: 'blue', category: 'backend', description: 'ORM para Python' },
    { name: 'Pydantic', icon: <CheckSquare className="w-5 h-5" />, color: 'green', category: 'backend', description: 'Validación de datos y modelos' },
    { name: 'Uvicorn', icon: <Zap className="w-5 h-5" />, color: 'yellow', category: 'backend', description: 'Servidor ASGI de alto rendimiento' },
    
    // Seguridad y Autenticación (Nuevo en v2.5.0)
    { name: 'WebAuthn', icon: <Shield className="w-5 h-5" />, color: 'purple', category: 'security', description: 'Passkeys: huella digital, Face ID, Windows Hello' },
    { name: 'TOTP 2FA', icon: <Lock className="w-5 h-5" />, color: 'purple', category: 'security', description: 'Google Authenticator, Authy, Microsoft Authenticator' },
    { name: 'QR Code', icon: <QrCode className="w-5 h-5" />, color: 'purple', category: 'security', description: 'Generación de códigos QR para 2FA' },
    { name: 'OTP Email', icon: <Send className="w-5 h-5" />, color: 'blue', category: 'security', description: 'Verificación por código de 6 dígitos' },
    { name: 'SendGrid', icon: <Mail className="w-5 h-5" />, color: 'red', category: 'security', description: '100 emails/día gratis + respaldo SMTP' },
    { name: 'JWT Tokens', icon: <Key className="w-5 h-5" />, color: 'amber', category: 'security', description: 'HS256 + ES256 para autenticación dual' },
    { name: 'Password History', icon: <History className="w-5 h-5" />, color: 'amber', category: 'security', description: 'Últimas 5 contraseñas, sin reutilización' },
    { name: 'Session Invalidation', icon: <LogOut className="w-5 h-5" />, color: 'amber', category: 'security', description: 'Cierre de sesiones al cambiar contraseña' },
    { name: 'RLS Policies', icon: <Shield className="w-5 h-5" />, color: 'purple', category: 'security', description: 'Seguridad a nivel de filas en Supabase' },
    
    // Sistema de Backups (Nuevo en v2.6.0)
    { name: 'Cloud Backup', icon: <Cloud className="w-5 h-5" />, color: 'indigo', category: 'backup', description: 'Backup en Supabase con compresión' },
    { name: 'GZIP Compression', icon: <HardDrive className="w-5 h-5" />, color: 'teal', category: 'backup', description: 'Ahorro 65-80% de espacio' },
    { name: 'Auto Backup', icon: <RefreshCw className="w-5 h-5" />, color: 'green', category: 'backup', description: 'Detección automática con debounce 30s' },
    { name: 'Selective Backup', icon: <Filter className="w-5 h-5" />, color: 'orange', category: 'backup', description: 'Elegir qué notas respaldar' },
    { name: 'Scheduled Backup', icon: <Clock className="w-5 h-5" />, color: 'amber', category: 'backup', description: 'Automático diario/semanal' },
    { name: 'Multiple Selection', icon: <CheckSquare className="w-5 h-5" />, color: 'blue', category: 'backup', description: 'Eliminación masiva de backups' },
    { name: 'Bidirectional Sync', icon: <Workflow className="w-5 h-5" />, color: 'cyan', category: 'backup', description: 'Sincronización local ↔ nube' },
    { name: 'Backup Notifications', icon: <Bell className="w-5 h-5" />, color: 'pink', category: 'backup', description: 'Alertas de límite y estado' },
    
    // Exportación y Compartición
    { name: 'Export PDF', icon: <FileText className="w-5 h-5" />, color: 'red', category: 'export', description: 'Documentos profesionales con diseño' },
    { name: 'Export Markdown', icon: <FileText className="w-5 h-5" />, color: 'blue', category: 'export', description: 'Formato texto plano compatible' },
    { name: 'Export JSON', icon: <FileJson className="w-5 h-5" />, color: 'green', category: 'export', description: 'Backup completo de datos' },
    { name: 'Share Social', icon: <Share2 className="w-5 h-5" />, color: 'blue', category: 'export', description: 'Twitter, Facebook, LinkedIn, WhatsApp' },
    { name: 'Copy to Clipboard', icon: <FileCode className="w-5 h-5" />, color: 'gray', category: 'export', description: 'Copiar título + contenido' },
    { name: 'Print Note', icon: <FileText className="w-5 h-5" />, color: 'gray', category: 'export', description: 'Vista optimizada para impresión' },
    
    // Características de Notas
    { name: 'Grid/List View', icon: <Grid className="w-5 h-5" />, color: 'cyan', category: 'features', description: 'Alternancia entre vistas' },
    { name: 'Favorites', icon: <Star className="w-5 h-5" />, color: 'yellow', category: 'features', description: 'Marcar notas importantes' },
    { name: 'Archive', icon: <Archive className="w-5 h-5" />, color: 'gray', category: 'features', description: 'Archivar notas sin eliminar' },
    { name: 'Tags System', icon: <Bookmark className="w-5 h-5" />, color: 'purple', category: 'features', description: 'Organización por etiquetas' },
    { name: 'Custom Colors', icon: <Palette className="w-5 h-5" />, color: 'pink', category: 'features', description: 'Personalización visual de notas' },
    { name: 'Rich Text', icon: <Edit3 className="w-5 h-5" />, color: 'blue', category: 'features', description: 'Formato de texto enriquecido' },
    { name: 'Trash Bin', icon: <Trash2 className="w-5 h-5" />, color: 'red', category: 'features', description: 'Recuperación de notas eliminadas' },
    
    // UI/UX y Diseño
    { name: 'Dark Mode', icon: <Eye className="w-5 h-5" />, color: 'gray', category: 'design', description: 'Tema oscuro/claro automático' },
    { name: 'Responsive Design', icon: <Smartphone className="w-5 h-5" />, color: 'green', category: 'design', description: 'Adaptación a todos los dispositivos' },
    { name: 'Glassmorphism', icon: <Layers className="w-5 h-5" />, color: 'cyan', category: 'design', description: 'Efectos de vidrio y blur' },
    { name: 'Figma', icon: <Figma className="w-5 h-5" />, color: 'purple', category: 'design', description: 'Diseño UI/UX profesional' },
    { name: 'Animations', icon: <Sparkles className="w-5 h-5" />, color: 'pink', category: 'design', description: 'Transiciones suaves y micro-interacciones' },
    { name: 'Accessibility', icon: <Users className="w-5 h-5" />, color: 'blue', category: 'design', description: 'ARIA labels, keyboard navigation' },
    
    // Hosting y Despliegue
    { name: 'Render', icon: <Cloud className="w-5 h-5" />, color: 'blue', category: 'hosting', description: 'Hosting API FastAPI' },
    { name: 'Vercel', icon: <Globe className="w-5 h-5" />, color: 'black', category: 'hosting', description: 'Hosting frontend React' },
    { name: 'GitHub Actions', icon: <GitBranch className="w-5 h-5" />, color: 'gray', category: 'hosting', description: 'CI/CD automatizado' },
    
    // Estadísticas y Métricas
    { name: 'Total Technologies', icon: <Package className="w-5 h-5" />, color: 'purple', category: 'stats', description: '45+ tecnologías implementadas' },
    { name: 'Lines of Code', icon: <Code className="w-5 h-5" />, color: 'blue', category: 'stats', description: '15,000+ líneas de código' },
    { name: 'GitHub Commits', icon: <GitBranch className="w-5 h-5" />, color: 'green', category: 'stats', description: '200+ commits en el repositorio' },
  ];

  // Categorías únicas para filtrado
  const categories = {
    all: { name: 'Todas', icon: <Package className="w-4 h-4" />, color: 'gray' },
    frontend: { name: 'Frontend', icon: <Layout className="w-4 h-4" />, color: 'blue' },
    backend: { name: 'Backend', icon: <Server className="w-4 h-4" />, color: 'green' },
    security: { name: 'Seguridad', icon: <Shield className="w-4 h-4" />, color: 'purple' },
    backup: { name: 'Backups', icon: <Cloud className="w-4 h-4" />, color: 'indigo' },
    export: { name: 'Exportación', icon: <Download className="w-4 h-4" />, color: 'emerald' },
    features: { name: 'Características', icon: <Star className="w-4 h-4" />, color: 'yellow' },
    design: { name: 'Diseño', icon: <Palette className="w-4 h-4" />, color: 'pink' },
    hosting: { name: 'Hosting', icon: <Globe className="w-4 h-4" />, color: 'cyan' },
    stats: { name: 'Estadísticas', icon: <TrendingUp className="w-4 h-4" />, color: 'orange' },
  };

  // Filtrar tecnologías por categoría seleccionada
  const filteredTechnologies = selectedCategory === 'all' 
    ? technologies 
    : technologies.filter(tech => tech.category === selectedCategory);

  // Contar tecnologías por categoría
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return technologies.length;
    return technologies.filter(tech => tech.category === categoryId).length;
  };

  // Colores para las tarjetas
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      gray: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
      black: 'bg-gray-800/10 text-gray-800 dark:text-gray-300 border-gray-800/20 dark:border-gray-700/40',
    };
    return colorMap[color] || colorMap.gray;
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
      {/* Header con estilo glass - optimizado para móvil */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-3 md:gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/settings')}
                className="p-1.5 md:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              </motion.button>
              
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-1 h-6 md:w-1.5 md:h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full" />
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Desarrollador
                </h1>
              </div>
            </div>

            {isDeveloperMode && (
              <div className="px-2 py-0.5 md:px-3 md:py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full text-[10px] md:text-xs border border-purple-500/30">
                Modo Dev
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner principal con gradiente */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 md:mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 md:h-64 w-full overflow-hidden rounded-xl md:rounded-2xl shadow-xl"
        >
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            />
            
            <div className="relative z-10 flex flex-col items-center space-y-2 md:space-y-4 px-4">
              <h2 className="text-3xl md:text-6xl font-black text-white drop-shadow-2xl tracking-tight">
                Quick<span className="text-yellow-300">Note</span>
              </h2>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30 shadow-2xl"
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
                <span className="text-white font-medium text-xs md:text-base text-center">
                  Desarrollado con <span className="text-red-300 text-sm md:text-lg">❤️</span> por José Pablo Miranda Quintanilla
                </span>
              </motion.div>
            </div>

            <div className="absolute top-2 right-2 md:top-4 md:right-4">
              <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] md:text-sm font-medium border border-white/30 shadow-lg">
                v 2.6.0
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Avatar posicionado sobre el banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative -mt-12 md:-mt-16 flex justify-center"
        >
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white dark:bg-gray-800 p-1 shadow-xl">
              <img 
                src={developerAvatar} 
                alt="Avatar desarrollador"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            
            {isDeveloperMode && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 bg-yellow-400 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"
              >
                <Star className="w-3 h-3 md:w-4 md:h-4 text-white fill-white" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Información del desarrollador */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
            {DEMO_PROFILE.name}
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-3 md:mb-4">
            {DEMO_PROFILE.role || 'Desarrollador Full Stack'}
          </p>
          {DEMO_PROFILE.bio && (
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto px-2">
              {DEMO_PROFILE.bio}
            </p>
          )}
        </motion.div>
      </div>

      {/* Filtro de categorías - Nuevo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-center gap-1.5 md:gap-2"
        >
          {Object.entries(categories).map(([key, cat]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(key)}
              className={`
                px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-sm font-medium
                transition-all duration-200 flex items-center gap-1 md:gap-1.5
                ${selectedCategory === key 
                  ? `bg-${cat.color}-500 text-white shadow-md` 
                  : `bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-${cat.color}-100 dark:hover:bg-${cat.color}-900/30`
                }
              `}
            >
              <span className="w-3 h-3 md:w-3.5 md:h-3.5">{cat.icon}</span>
              <span>{cat.name}</span>
              <span className="text-[8px] md:text-[10px] opacity-75 ml-0.5 md:ml-1">
                ({getCategoryCount(key)})
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Tecnologías utilizadas - SECCIÓN PRINCIPAL CON FILTRO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500" />
              Stack Tecnológico
              <span className="text-[10px] md:text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">
                ({filteredTechnologies.length} tecnologías)
              </span>
            </h3>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-[10px] md:text-xs text-purple-500 hover:text-purple-600 dark:text-purple-400 transition-colors"
              >
                Ver todas
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
            {filteredTechnologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`p-2 md:p-3 rounded-lg md:rounded-xl border ${getColorClasses(tech.color)} flex flex-col items-center text-center group cursor-default transition-all duration-200`}
              >
                <div className="p-1.5 md:p-2 rounded-full mb-1 md:mb-2 group-hover:scale-110 transition-transform">
                  {tech.icon}
                </div>
                <span className="text-[10px] md:text-xs font-medium mb-0.5 md:mb-1">{tech.name}</span>
                <span className="text-[8px] md:text-[10px] opacity-70 hidden sm:block line-clamp-2">{tech.description}</span>
              </motion.div>
            ))}
          </div>

          {/* Mensaje si no hay resultados */}
          {filteredTechnologies.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                No hay tecnologías en esta categoría
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Sección de estadísticas y logros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-3 md:p-4 text-center">
            <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 mx-auto mb-1 md:mb-2" />
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">v2.6.0</div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Versión actual</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-3 md:p-4 text-center">
            <Package className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mx-auto mb-1 md:mb-2" />
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{technologies.length}</div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Tecnologías</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-3 md:p-4 text-center">
            <GitBranch className="w-6 h-6 md:w-8 md:h-8 text-green-500 mx-auto mb-1 md:mb-2" />
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">200+</div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Commits</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-3 md:p-4 text-center">
            <Code className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mx-auto mb-1 md:mb-2" />
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">15k+</div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Líneas de código</div>
          </div>
        </motion.div>
      </div>

      {/* Sección de características destacadas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl border border-purple-200/50 dark:border-purple-800/50 p-4 md:p-6"
        >
          <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 md:mb-4 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500" />
            Características Destacadas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {[
              { icon: <Shield />, text: 'Autenticación biométrica con WebAuthn', color: 'purple' },
              { icon: <Lock />, text: '2FA con Google Authenticator', color: 'blue' },
              { icon: <Cloud />, text: 'Backup automático en la nube', color: 'cyan' },
              { icon: <Download />, text: 'Exportación a PDF, MD y JSON', color: 'green' },
              { icon: <Share2 />, text: 'Compartir en redes sociales', color: 'pink' },
              { icon: <Smartphone />, text: 'Diseño totalmente responsivo', color: 'orange' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 md:p-2.5 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div className={`p-1 rounded-full bg-${feature.color}-500/20 text-${feature.color}-600 dark:text-${feature.color}-400`}>
                  {feature.icon}
                </div>
                <span className="text-[10px] md:text-xs text-gray-700 dark:text-gray-300">{feature.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sección "Conectar conmigo" */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="border-t border-gray-200 dark:border-gray-700 pt-6 md:pt-8"
        >
          <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 md:mb-4">
            Conectar conmigo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
            {/* GitHub */}
            <motion.button
              whileHover={{ scale: 1.01, x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => launchUrl(DEMO_PROFILE.github_url)}
              className="w-full px-3 py-3 md:px-4 md:py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 flex items-center gap-2 md:gap-3 group"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Github className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-medium text-sm md:text-base block text-gray-900 dark:text-white">GitHub</span>
                <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">@JosePablo1996</span>
              </div>
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Email */}
            <motion.button
              whileHover={{ scale: 1.01, x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = `mailto:${DEMO_PROFILE.email}`}
              className="w-full px-3 py-3 md:px-4 md:py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 flex items-center gap-2 md:gap-3 group"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-medium text-sm md:text-base block text-gray-900 dark:text-white">Email</span>
                <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{DEMO_PROFILE.email}</span>
              </div>
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Modo desarrollador */}
      {isDeveloperMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-8 pb-6 md:pb-8"
        >
          <button
            onClick={logoutDeveloper}
            className="w-full md:w-auto px-4 py-2.5 md:px-6 md:py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2 md:gap-3 mx-auto"
          >
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-500 flex items-center justify-center">
              <Shield className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            <span className="font-medium text-sm md:text-base text-red-600 dark:text-red-400">Modo Desarrollador Activo - Salir</span>
          </button>
        </motion.div>
      )}

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-8 pb-4 md:pb-6">
        <p className="text-center text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
          QuickNote v2.6.0 · Todos los derechos reservados · Desarrollado con React, FastAPI y Supabase
        </p>
      </div>
    </div>
  );
};

export default DeveloperPage;