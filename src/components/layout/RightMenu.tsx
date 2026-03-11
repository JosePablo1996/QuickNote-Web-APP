import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useNotes } from '../../hooks/useNotes';
import LoadingSpinner from '../ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Upload,
  LogOut,
  X,
  Download,
  Share2,
  Printer,
  Eye,
  Grid3x3,
  Rows,
  Clock,
  Sparkles,
  Cloud,
  Wifi,
  WifiOff,
  Maximize2,
  Minimize2,
  Folder,
  Mail,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
  Copy,
  ExternalLink,
  HelpCircle,
  Users,
  Bell,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface RightMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onViewList?: () => void;
  onSync?: () => void;
  onImport?: () => void;
}

// Definir tipos para los items del menú
interface MenuItem {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  color: string;
  action?: 'toggle';
  badge?: React.ReactNode;
}

interface MenuSection {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

const RightMenu: React.FC<RightMenuProps> = ({
  isOpen,
  onClose,
  onViewList,
  onSync,
  onImport,
}) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth(); // Eliminado 'user' que no se usaba
  const { success, error: showError, info } = useToast();
  const { notes, syncNotes } = useNotes(); // Eliminado 'isLoading' que no se usaba
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Detectar cambios en fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      success('👋 Sesión cerrada correctamente');
      setShowLogoutModal(false);
      onClose();
      navigate('/login');
    } catch (err) {
      showError('Error al cerrar sesión');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      success('🔍 Modo pantalla completa activado');
    } else {
      document.exitFullscreen();
      info('📱 Modo normal restaurado');
    }
  };

  const handleSync = async () => {
    if (onSync) {
      onSync();
    } else {
      setSyncStatus('syncing');
      try {
        await syncNotes();
        setSyncStatus('success');
        success('✅ Notas sincronizadas correctamente');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (err) {
        setSyncStatus('error');
        showError('Error al sincronizar');
        setTimeout(() => setSyncStatus('idle'), 2000);
      }
    }
  };

  const handleViewModeToggle = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    info(`Vista ${newMode === 'grid' ? 'cuadrícula' : 'lista'} activada`);
    if (onViewList) {
      onViewList();
    }
  };

  const handleImport = () => {
    if (onImport) {
      onImport();
    } else {
      info('📤 Función de importación próximamente');
    }
  };

  const handleExport = () => {
    info('📥 Función de exportación próximamente');
  };

  const handlePrint = () => {
    window.print();
    success('🖨️ Preparando para imprimir...');
  };

  const handleShare = (method: string) => {
    setShowShareMenu(false);
    
    switch (method) {
      case 'copy':
        success('📋 Enlace copiado al portapapeles');
        break;
      case 'email':
        window.location.href = 'mailto:?subject=QuickNote&body=Mira esta nota en QuickNote';
        break;
      case 'twitter':
        window.open('https://twitter.com/intent/tweet?text=Mira esta nota en QuickNote', '_blank');
        break;
      case 'facebook':
        window.open('https://www.facebook.com/sharer/sharer.php?u=https://quicknote.app', '_blank');
        break;
      default:
        info('🔗 Función de compartir próximamente');
    }
  };

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    info(showNotifications ? '🔔 Notificaciones silenciadas' : '🔔 Notificaciones activadas');
  };

  const handleToggleAutoSync = () => {
    setAutoSync(!autoSync);
    success(autoSync ? '🔄 Sincronización automática desactivada' : '🔄 Sincronización automática activada');
  };

  const handleToggleCompactMode = () => {
    setCompactMode(!compactMode);
    info(compactMode ? '📏 Modo normal' : '📏 Modo compacto');
  };

  // Obtener color de gradiente para items
  const getItemGradient = (color: string) => {
    const gradients: Record<string, string> = {
      blue: 'from-blue-400 to-blue-600',
      purple: 'from-purple-400 to-purple-600',
      green: 'from-green-400 to-green-600',
      yellow: 'from-yellow-400 to-yellow-600',
      red: 'from-red-400 to-red-600',
      indigo: 'from-indigo-400 to-indigo-600',
      pink: 'from-pink-400 to-pink-600',
      teal: 'from-teal-400 to-teal-600',
      gray: 'from-gray-400 to-gray-600',
      orange: 'from-orange-400 to-orange-600',
      cyan: 'from-cyan-400 to-cyan-600',
      emerald: 'from-emerald-400 to-emerald-600',
    };
    return gradients[color] || 'from-blue-400 to-purple-500';
  };

  // Obtener color de fondo para iconos
  const getIconBgColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500/20',
      purple: 'bg-purple-500/20',
      green: 'bg-green-500/20',
      yellow: 'bg-yellow-500/20',
      red: 'bg-red-500/20',
      indigo: 'bg-indigo-500/20',
      pink: 'bg-pink-500/20',
      teal: 'bg-teal-500/20',
      gray: 'bg-gray-500/20',
      orange: 'bg-orange-500/20',
      cyan: 'bg-cyan-500/20',
      emerald: 'bg-emerald-500/20',
    };
    return colors[color] || 'bg-blue-500/20';
  };

  // Secciones del menú derecho - SIN PERSONALIZACIÓN
  const menuSections: MenuSection[] = [
    {
      title: 'Vista',
      icon: <Eye className="w-4 h-4" />,
      items: [
        {
          icon: viewMode === 'grid' ? <Grid3x3 className="w-5 h-5" /> : <Rows className="w-5 h-5" />,
          label: viewMode === 'grid' ? 'Vista cuadrícula' : 'Vista lista',
          description: `Cambiar a vista ${viewMode === 'grid' ? 'lista' : 'cuadrícula'}`,
          onClick: handleViewModeToggle,
          color: 'blue',
          action: 'toggle',
        },
        {
          icon: compactMode ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />,
          label: compactMode ? 'Modo normal' : 'Modo compacto',
          description: compactMode ? 'Desactivar vista compacta' : 'Activar vista compacta',
          onClick: handleToggleCompactMode,
          color: 'purple',
          action: 'toggle',
        },
        {
          icon: isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />,
          label: isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa',
          description: isFullscreen ? 'Volver al modo normal' : 'Ver en pantalla completa',
          onClick: handleToggleFullscreen,
          color: 'green',
        },
      ],
    },
    {
      title: 'Archivo',
      icon: <Folder className="w-4 h-4" />,
      items: [
        {
          icon: <Upload className="w-5 h-5" />,
          label: 'Importar notas',
          description: 'Importar desde archivo',
          onClick: handleImport,
          color: 'green',
        },
        {
          icon: <Download className="w-5 h-5" />,
          label: 'Exportar notas',
          description: 'Exportar como JSON',
          onClick: handleExport,
          color: 'blue',
        },
        {
          icon: <Printer className="w-5 h-5" />,
          label: 'Imprimir',
          description: 'Imprimir notas seleccionadas',
          onClick: handlePrint,
          color: 'purple',
        },
        {
          icon: <Share2 className="w-5 h-5" />,
          label: 'Compartir nota',
          description: 'Compartir a redes sociales',
          onClick: () => setShowShareMenu(!showShareMenu),
          color: 'teal',
          badge: showShareMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'Sincronización',
      icon: <RefreshCw className="w-4 h-4" />,
      items: [
        {
          icon: syncStatus === 'syncing' ? <RefreshCw className="w-5 h-5 animate-spin" /> : 
                syncStatus === 'success' ? <Sparkles className="w-5 h-5" /> : 
                syncStatus === 'error' ? <WifiOff className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />,
          label: syncStatus === 'syncing' ? 'Sincronizando...' : 
                 syncStatus === 'success' ? '¡Sincronizado!' : 
                 syncStatus === 'error' ? 'Error al sincronizar' : 'Sincronizar ahora',
          description: `${notes.length} notas · ${notes.filter(n => !n.deleted_at).length} activas`,
          onClick: handleSync,
          color: syncStatus === 'error' ? 'red' : 'cyan',
          badge: syncStatus === 'syncing' ? <LoadingSpinner size="sm" /> : 
                 syncStatus === 'success' ? <span className="text-xs">✓</span> : undefined,
        },
        {
          icon: autoSync ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />,
          label: autoSync ? 'Sincronización automática' : 'Sin sincronización automática',
          description: autoSync ? 'Activada' : 'Desactivada',
          onClick: handleToggleAutoSync,
          color: autoSync ? 'emerald' : 'gray',
          action: 'toggle',
        },
      ],
    },
    {
      title: 'Notificaciones',
      icon: <Bell className="w-4 h-4" />,
      items: [
        {
          icon: showNotifications ? <Bell className="w-5 h-5" /> : <Bell className="w-5 h-5 opacity-50" />,
          label: showNotifications ? 'Notificaciones activadas' : 'Notificaciones silenciadas',
          description: showNotifications ? 'Recibir alertas' : 'Sin alertas',
          onClick: handleToggleNotifications,
          color: showNotifications ? 'amber' : 'gray',
          action: 'toggle',
        },
      ],
    },
    {
      title: 'Ayuda',
      icon: <HelpCircle className="w-4 h-4" />,
      items: [
        {
          icon: <HelpCircle className="w-5 h-5" />,
          label: 'Centro de ayuda',
          description: 'Guías y soporte',
          onClick: () => navigate('/help'),
          color: 'blue',
        },
        {
          icon: <Users className="w-5 h-5" />,
          label: 'Desarrollador',
          description: 'Información técnica',
          onClick: () => navigate('/developer'),
          color: 'purple',
        },
        {
          icon: <Clock className="w-5 h-5" />,
          label: 'Cambios recientes',
          description: 'v1.4.0 · 10 cambios',
          onClick: () => navigate('/changelog'),
          color: 'gray',
        },
      ],
    },
    {
      title: 'Sesión',
      icon: <LogOut className="w-4 h-4" />,
      items: [
        {
          icon: <LogOut className="w-5 h-5" />,
          label: 'Cerrar sesión',
          description: 'Salir de tu cuenta',
          onClick: handleLogoutClick,
          color: 'red',
        },
      ],
    },
  ];

  // Submenú de compartir
  const shareItems = [
    { icon: <Copy className="w-4 h-4" />, label: 'Copiar', onClick: () => handleShare('copy'), color: 'blue' },
    { icon: <Mail className="w-4 h-4" />, label: 'Email', onClick: () => handleShare('email'), color: 'green' },
    { icon: <MessageCircle className="w-4 h-4" />, label: 'WhatsApp', onClick: () => handleShare('whatsapp'), color: 'green' },
    { icon: <Twitter className="w-4 h-4" />, label: 'Twitter', onClick: () => handleShare('twitter'), color: 'cyan' },
    { icon: <Facebook className="w-4 h-4" />, label: 'Facebook', onClick: () => handleShare('facebook'), color: 'indigo' },
    { icon: <Instagram className="w-4 h-4" />, label: 'Instagram', onClick: () => handleShare('instagram'), color: 'pink' },
    { icon: <ExternalLink className="w-4 h-4" />, label: 'Más', onClick: () => handleShare('more'), color: 'gray' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay con efecto glass */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-900/60 via-blue-900/40 to-indigo-900/60 backdrop-blur-md" />
      </motion.div>

      {/* Menú lateral derecho */}
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={`
          fixed top-0 right-0 h-full w-96 z-50 overflow-y-auto
          ${isDarkMode 
            ? 'bg-gray-900/95 backdrop-blur-xl' 
            : 'bg-white/95 backdrop-blur-xl'
          }
          shadow-2xl rounded-l-3xl border-l border-white/20
        `}
      >
        {/* Header del menú con gradiente */}
        <div className="sticky top-0 z-20 p-4">
          <div className="relative h-32 rounded-2xl overflow-hidden">
            {/* Fondo con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
            
            {/* Efectos decorativos */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
            
            {/* Botón de cerrar */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-3 left-3 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/30 z-30"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4 text-white" />
            </motion.button>

            {/* Contenido del header */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-white mb-1 drop-shadow-lg"
              >
                Opciones rápidas
              </motion.h2>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full border border-white/50"
              >
                <span className="text-xs font-semibold text-white">Personaliza tu experiencia</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Contenido del menú */}
        <div className="px-4 pb-6">
          {/* Información rápida */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <Cloud className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Estado</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {navigator.onLine ? 'Conectado' : 'Sin conexión'}
                  </p>
                </div>
              </div>
              <div className="px-2 py-1 bg-blue-500/20 rounded-lg">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {notes.length} notas
                </span>
              </div>
            </div>
          </motion.div>

          {/* Secciones del menú */}
          <AnimatePresence mode="wait">
            {menuSections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="mb-6"
              >
                {/* Título de sección */}
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full" />
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {section.title}
                  </span>
                  {section.icon && (
                    <span className="text-gray-500 dark:text-gray-500">
                      {section.icon}
                    </span>
                  )}
                </div>

                {/* Items de la sección */}
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => {
                    const gradient = getItemGradient(item.color);
                    const iconBg = getIconBgColor(item.color);
                    const isHovered = hoveredItem === `right-${idx}-${itemIdx}`;
                    
                    return (
                      <motion.button
                        key={itemIdx}
                        whileHover={{ scale: 1.02, x: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onHoverStart={() => setHoveredItem(`right-${idx}-${itemIdx}`)}
                        onHoverEnd={() => setHoveredItem(null)}
                        onClick={item.onClick}
                        className={`
                          w-full flex items-center gap-3 px-3 py-3 rounded-xl
                          transition-all duration-200 relative overflow-hidden group
                          ${isDarkMode 
                            ? 'hover:bg-white/5' 
                            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                          }
                        `}
                      >
                        {/* Efecto de hover gradiente */}
                        {isHovered && (
                          <motion.div
                            layoutId="rightHoverBackground"
                            className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                        
                        {/* Icono con fondo */}
                        <div className={`
                          relative z-10 p-2 rounded-xl ${iconBg}
                          transition-all duration-200 group-hover:scale-110
                        `}>
                          <span className={`text-${item.color}-500 dark:text-${item.color}-400`}>
                            {item.icon}
                          </span>
                        </div>
                        
                        {/* Label y descripción */}
                        <div className="flex-1 text-left relative z-10">
                          <span className={`block text-sm font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            {item.label}
                          </span>
                          {item.description && (
                            <span className={`block text-xs mt-0.5 ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              {item.description}
                            </span>
                          )}
                        </div>
                        
                        {/* Badge o indicador de estado */}
                        {item.badge && (
                          <span className={`
                            relative z-10 px-2 py-0.5 rounded-lg text-xs font-medium
                            ${iconBg} text-${item.color}-600 dark:text-${item.color}-400
                          `}>
                            {item.badge}
                          </span>
                        )}
                        
                        {/* Indicador de toggle */}
                        {item.action === 'toggle' && (
                          <div className={`
                            relative z-10 w-8 h-4 rounded-full transition-colors duration-200
                            ${item.color === 'gray' 
                              ? 'bg-gray-400' 
                              : `bg-${item.color}-500`
                            }
                          `}>
                            <motion.div
                              className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-md"
                              animate={{ x: item.color === 'gray' ? 4 : 16 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Submenú de compartir */}
                {section.title === 'Archivo' && showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-2"
                  >
                    <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                        Compartir a través de:
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {shareItems.map((item, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={item.onClick}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex flex-col items-center gap-1"
                            title={item.label}
                          >
                            <div className={`p-1.5 rounded-full bg-${item.color}-500/20 text-${item.color}-500`}>
                              {item.icon}
                            </div>
                            <span className="text-[10px] text-gray-600 dark:text-gray-400">{item.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-xs text-center text-gray-500 dark:text-gray-500">
              QuickNote v2.0.0 · {new Date().toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Modal de confirmación de cierre de sesión */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            {/* Overlay del modal */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCancelLogout}
            />
            
            {/* Contenido del modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`
                relative w-full max-w-md rounded-2xl overflow-hidden
                ${isDarkMode 
                  ? 'bg-gray-800/95 backdrop-blur-xl' 
                  : 'bg-white/95 backdrop-blur-xl'
                }
                border-2 border-white/30 shadow-2xl
              `}
            >
              {/* Header con gradiente */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <LogOut className="w-6 h-6" />
                  Cerrar sesión
                </h3>
              </div>

              <div className="p-6">
                {/* Icono de advertencia */}
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <LogOut className="w-8 h-8 text-red-500" />
                  </div>
                </div>

                {/* Mensaje de confirmación */}
                <div className="text-center mb-6">
                  <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ¿Estás seguro de cerrar sesión?
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Podrás volver a iniciar sesión cuando quieras
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelLogout}
                    disabled={isLoggingOut}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50 font-medium"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmLogout}
                    disabled={isLoggingOut}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    {isLoggingOut ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Cerrando...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar sesión</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RightMenu;