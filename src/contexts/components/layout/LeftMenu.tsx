import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';
import { useNotes } from '../../../hooks/useNotes';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { getTagStatsFromNotes } from '../../../utils/tagUtils';
import LoadingSpinner from '../ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Star,
  Archive,
  Trash2,
  Tag,
  Calendar,
  Settings,
  HelpCircle,
  Users,
  Clock,
  FileText,
  LogOut,
  User,
  ChevronRight,
  X,
  Bookmark,
  Shield,
  Download,
  Globe,
  Bell,
  Palette,
  Layers,
  Menu
} from 'lucide-react';

interface LeftMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  badge?: number | string | React.ReactNode;
  description?: string;
}

interface MenuSection {
  title: string;
  icon?: React.ReactNode;
  hidden?: boolean;
  items: MenuItem[];
}

interface PopularTag {
  name: string;
  count: number;
  color: string;
}

const LeftMenu: React.FC<LeftMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { notes } = useNotes();
  const { user, logout } = useAuth();
  const { success, error: showError } = useToast();
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Detectar ancho de pantalla
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 768;
  
  // Usar ref para evitar cálculos innecesarios
  const prevNotesLengthRef = useRef(notes.length);

  // Calcular etiquetas populares solo cuando cambien las notas
  useEffect(() => {
    if (prevNotesLengthRef.current !== notes.length || popularTags.length === 0) {
      prevNotesLengthRef.current = notes.length;
      
      try {
        const notesWithTags = notes.filter((note) => note.tags && Array.isArray(note.tags) && note.tags.length > 0);
        
        if (notesWithTags.length === 0) {
          setPopularTags([]);
          return;
        }

        const tagStats = getTagStatsFromNotes(notes);
        
        const topTags = tagStats
          .sort((a, b) => b.count - a.count)
          .slice(0, isMobile ? 3 : 5)
          .map((stat) => ({
            name: stat.name,
            count: stat.count,
            color: stat.color
          }));
        
        setPopularTags(topTags);
      } catch (error) {
        console.error('Error calculando etiquetas populares:', error);
        setPopularTags([]);
      }
    }
  }, [notes, popularTags.length, isMobile]);

  // Memoizar contadores para evitar recálculos
  const counters = useMemo(() => {
    try {
      return {
        total: notes.filter((n) => !n.deleted_at).length,
        favorites: notes.filter((n) => n.is_favorite && !n.is_archived && !n.deleted_at).length,
        archived: notes.filter((n) => n.is_archived && !n.deleted_at).length,
        trash: notes.filter((n) => n.deleted_at).length,
        totalTags: popularTags.length,
        withTags: notes.filter((n) => n.tags && n.tags.length > 0).length,
      };
    } catch (error) {
      console.error('Error calculando contadores:', error);
      return { total: 0, favorites: 0, archived: 0, trash: 0, totalTags: 0, withTags: 0 };
    }
  }, [notes, popularTags.length]);

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

  // Obtener iniciales para avatar por defecto
  const getInitials = (): string => {
    if (!user?.name) return 'U';
    
    const nameParts = user.name.split(' ').filter(part => part.length > 0);
    
    if (nameParts.length === 0) return 'U';
    
    if (nameParts.length === 1) {
      const singleName = nameParts[0];
      return singleName.substring(0, Math.min(2, singleName.length)).toUpperCase();
    }
    
    return (nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '')).toUpperCase();
  };

  // Obtener color de fondo basado en el nombre del usuario
  const getAvatarColor = (): string => {
    if (!user?.name) return 'from-blue-500 to-purple-600';
    
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
      'from-purple-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-cyan-500 to-blue-600',
      'from-emerald-500 to-green-600',
      'from-violet-500 to-purple-600'
    ];
    
    const charCodeSum = user.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const gradientIndex = charCodeSum % gradients.length;
    
    return gradients[gradientIndex];
  };

  // Función para ir al perfil
  const goToProfile = () => {
    onNavigate('/profile');
    onClose();
  };

  // Menú sections con responsive (ocultar algunas en móvil)
  const menuSections: MenuSection[] = [
    {
      title: 'Calendario',
      items: [
        {
          label: isMobile ? 'Calendario' : 'Ver calendario',
          icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />,
          path: '/calendar',
          color: 'green',
        },
      ],
    },
    {
      title: 'Favoritos',
      items: [
        {
          label: isMobile ? 'Favoritos' : 'Notas favoritas',
          icon: <Star className="w-4 h-4 sm:w-5 sm:h-5" />,
          path: '/favorites',
          color: 'yellow',
          badge: counters.favorites > 0 ? counters.favorites : undefined,
        },
      ],
    },
    {
      title: 'Etiquetas',
      hidden: isMobile && counters.totalTags === 0,
      items: [
        {
          label: isMobile ? 'Todas' : 'Todas las etiquetas',
          icon: <Tag className="w-4 h-4 sm:w-5 sm:h-5" />,
          path: '/tags',
          color: 'purple',
          badge: counters.totalTags > 0 ? counters.totalTags : undefined,
        },
      ],
    },
    {
      title: 'Populares',
      hidden: popularTags.length === 0,
      items: popularTags.map((tag) => ({
        label: isMobile ? `#${tag.name}` : `#${tag.name}`,
        icon: <Tag className="w-4 h-4 sm:w-5 sm:h-5" />,
        path: `/tags/${encodeURIComponent(tag.name)}`,
        color: tag.color,
        badge: tag.count,
      })),
    },
    {
      title: 'Archivar',
      items: [
        {
          label: isMobile ? 'Archivadas' : 'Notas archivadas',
          icon: <Archive className="w-4 h-4 sm:w-5 sm:h-5" />,
          path: '/archived',
          color: 'teal',
          badge: counters.archived > 0 ? counters.archived : undefined,
        },
      ],
    },
    {
      title: 'Papelera',
      items: [
        {
          label: isMobile ? 'Papelera' : 'Papelera',
          icon: <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />,
          path: '/trash',
          color: 'red',
          badge: counters.trash > 0 ? counters.trash : undefined,
        },
      ],
    },
    {
      title: 'Respaldos',
      hidden: isMobile,
      items: [
        {
          label: 'Respaldo manual',
          icon: <Download className="w-4 h-4 sm:w-5 sm:h-5" />,
          path: '/backup',
          color: 'blue',
        },
      ],
    },
    {
      title: 'Ayuda',
      hidden: isMobile,
      items: [
        {
          label: 'Ayuda y soporte',
          icon: <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
          path: '/help',
          color: 'indigo',
        },
      ],
    },
    {
      title: 'Ajustes',
      items: [
        {
          label: isMobile ? 'Ajustes' : 'Configuración',
          icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" />,
          path: '/settings',
          color: 'gray',
        },
      ],
    },
    {
      title: 'Salir',
      items: [
        {
          label: isMobile ? 'Salir' : 'Cerrar sesión',
          icon: <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />,
          path: '#',
          color: 'red',
        },
      ],
    },
  ];

  const getColorClasses = (color: string): { bg: string; hover: string; text: string; border: string } => {
    const colors: Record<string, { bg: string; hover: string; text: string; border: string }> = {
      green: { bg: 'bg-green-500/10', hover: 'hover:bg-green-500/20', text: 'text-green-500', border: 'border-green-500/20' },
      yellow: { bg: 'bg-yellow-500/10', hover: 'hover:bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500/20' },
      purple: { bg: 'bg-purple-500/10', hover: 'hover:bg-purple-500/20', text: 'text-purple-500', border: 'border-purple-500/20' },
      teal: { bg: 'bg-teal-500/10', hover: 'hover:bg-teal-500/20', text: 'text-teal-500', border: 'border-teal-500/20' },
      red: { bg: 'bg-red-500/10', hover: 'hover:bg-red-500/20', text: 'text-red-500', border: 'border-red-500/20' },
      blue: { bg: 'bg-blue-500/10', hover: 'hover:bg-blue-500/20', text: 'text-blue-500', border: 'border-blue-500/20' },
      indigo: { bg: 'bg-indigo-500/10', hover: 'hover:bg-indigo-500/20', text: 'text-indigo-500', border: 'border-indigo-500/20' },
      gray: { bg: 'bg-gray-500/10', hover: 'hover:bg-gray-500/20', text: 'text-gray-500', border: 'border-gray-500/20' },
    };
    return colors[color] || colors.blue;
  };

  if (!isOpen) return null;

  const handleNavigation = (path: string) => {
    if (path === '#') {
      handleLogoutClick();
    } else {
      onNavigate(path);
      onClose();
    }
  };

  // Ancho del menú responsivo
  const menuWidth = isMobile ? 'w-full max-w-[280px]' : isTablet ? 'w-80' : 'w-96';

  return (
    <>
      {/* Overlay más sutil en móvil */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-label="Cerrar menú"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            onClose();
          }
        }}
      >
        <div className="absolute inset-0 bg-black/40 md:bg-black/50" />
      </motion.div>
      
      {/* Menú lateral responsivo */}
      <motion.div
        initial={{ x: -400 }}
        animate={{ x: 0 }}
        exit={{ x: -400 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={`
          fixed top-0 left-0 h-full ${menuWidth} z-50 overflow-y-auto
          ${isDarkMode ? 'bg-gray-900' : 'bg-white'}
          shadow-2xl rounded-r-xl sm:rounded-r-2xl md:rounded-r-3xl
        `}
      >
        {/* Header del menú responsivo */}
        <div className="sticky top-0 z-20 p-3 sm:p-4">
          <div className={`relative ${isMobile ? 'h-36' : 'h-48'} rounded-xl sm:rounded-2xl overflow-hidden`}>
            {/* Fondo con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
            
            {/* Efectos decorativos reducidos en móvil */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-24 -right-24 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-32 sm:w-48 h-32 sm:h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
            
            {/* Botón de cerrar más pequeño en móvil */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl transition-all duration-200 border border-white/30 z-30"
              aria-label="Cerrar menú"
              title="Cerrar menú"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </motion.button>

            {/* Contenido del header centrado */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Avatar clickeable - más pequeño en móvil */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToProfile}
                className="relative group mb-1 sm:mb-2"
                aria-label="Ir a mi perfil"
              >
                <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} rounded-full border-2 sm:border-4 border-white/50 overflow-hidden shadow-xl`}>
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name || 'Avatar'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-white ${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
                      {getInitials()}
                    </div>
                  )}
                </div>
              </motion.button>

              {/* Nombre del usuario - más pequeño en móvil */}
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`${isMobile ? 'text-sm' : 'text-xl'} font-bold text-white mb-0.5 sm:mb-1 drop-shadow-lg truncate max-w-[180px] sm:max-w-none`}
              >
                {user?.name || 'Usuario'}
              </motion.h2>

              {/* Email del usuario - oculto en móvil muy pequeño */}
              {!isMobile && (
                <motion.p 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-xs sm:text-sm text-white/90 mb-2 drop-shadow truncate max-w-[200px]"
                >
                  {user?.email || ''}
                </motion.p>
              )}
            </div>
          </div>
        </div>

        {/* Contenido del menú con padding responsivo */}
        <div className={`px-2 sm:px-4 pb-4 sm:pb-6 relative z-10`}>
          <AnimatePresence mode="wait">
            {menuSections.map((section, idx) => {
              if (section.hidden) return null;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(0.05 * idx, 0.3) }}
                  className={`mb-4 sm:mb-6 ${idx === menuSections.length - 1 ? 'mb-0' : ''}`}
                >
                  {/* Título de sección - más pequeño en móvil */}
                  {section.title !== 'Salir' && (
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 px-1.5 sm:px-2">
                      <div className="w-0.5 sm:w-1 h-3 sm:h-4 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full" />
                      <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {section.title}
                      </span>
                    </div>
                  )}

                  {/* Items de la sección */}
                  <div className="space-y-0.5 sm:space-y-1">
                    {section.items.map((item, itemIdx) => {
                      const colors = getColorClasses(item.color);
                      const isHovered = hoveredItem === `${idx}-${itemIdx}`;
                      
                      return (
                        <motion.button
                          key={itemIdx}
                          whileTap={{ scale: 0.98 }}
                          onHoverStart={() => setHoveredItem(`${idx}-${itemIdx}`)}
                          onHoverEnd={() => setHoveredItem(null)}
                          onClick={() => handleNavigation(item.path)}
                          className={`
                            w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5
                            rounded-lg sm:rounded-xl transition-all duration-200 relative overflow-hidden group
                            ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'}
                          `}
                          aria-label={`Ir a ${item.label}`}
                          title={item.label}
                        >
                          {/* Efecto de hover solo en desktop */}
                          {!isMobile && isHovered && (
                            <motion.div
                              layoutId="hoverBackground"
                              className={`absolute inset-0 bg-gradient-to-r ${colors.text.replace('text-', 'from-')} ${colors.text.replace('text-', 'to-')} opacity-10`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.1 }}
                              exit={{ opacity: 0 }}
                            />
                          )}
                          
                          {/* Icono más pequeño en móvil */}
                          <div className={`
                            relative z-10 p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${colors.bg}
                            transition-all duration-200 group-hover:scale-105 sm:group-hover:scale-110
                          `}>
                            <span className={`${colors.text} text-xs sm:text-base`}>
                              {item.icon}
                            </span>
                          </div>
                          
                          {/* Label */}
                          <div className="flex-1 text-left relative z-10">
                            <span className={`block text-xs sm:text-sm font-medium truncate ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {item.label}
                            </span>
                          </div>
                          
                          {/* Badge para contadores más pequeño */}
                          {item.badge !== undefined && item.badge !== null && (
                            <>
                              {typeof item.badge === 'number' && item.badge > 0 && (
                                <span className={`
                                  relative z-10 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium
                                  ${colors.bg} ${colors.text} border ${colors.border}
                                `}>
                                  {item.badge > 99 ? '99+' : item.badge}
                                </span>
                              )}
                              {typeof item.badge !== 'number' && item.badge}
                            </>
                          )}
                          
                          {/* Flecha decorativa - oculta en móvil muy pequeño */}
                          {!isMobile && (
                            <ChevronRight className={`
                              relative z-10 w-3 h-3 sm:w-4 sm:h-4 transition-all duration-200
                              ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}
                              group-hover:translate-x-0.5 sm:group-hover:translate-x-1 ${colors.text}
                            `} />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Footer más pequeño en móvil */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-800"
          >
            <p className="text-[10px] sm:text-xs text-center text-gray-400 dark:text-gray-600">
              QuickNote v.2.4.0
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Modal de confirmación de cierre de sesión responsivo */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCancelLogout}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`
                relative w-full max-w-[300px] sm:max-w-md rounded-xl sm:rounded-2xl overflow-hidden
                ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                border-2 border-white/30 shadow-2xl
              `}
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 py-3 sm:py-4">
                <h3 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                  <LogOut className="w-4 h-4 sm:w-6 sm:h-6" />
                  Cerrar sesión
                </h3>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative">
                    <div className={`p-0.5 bg-gradient-to-r from-red-400 to-red-500 rounded-full ${isMobile ? 'w-14 h-14' : ''}`}>
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name || 'Avatar'} 
                          className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} rounded-full object-cover`}
                        />
                      ) : (
                        <div className={`${isMobile ? 'w-14 h-14 text-sm' : 'w-20 h-20 text-2xl'} rounded-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-white font-bold`}>
                          {getInitials()}
                        </div>
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                  </div>
                </div>

                <div className="text-center mb-4 sm:mb-6">
                  <p className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ¿Cerrar sesión?
                  </p>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Podrás volver a iniciar sesión cuando quieras
                  </p>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelLogout}
                    disabled={isLoggingOut}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-500 text-white rounded-lg sm:rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50 font-medium text-sm sm:text-base"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmLogout}
                    disabled={isLoggingOut}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 font-medium text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2"
                  >
                    {isLoggingOut ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Cerrando...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-3 h-3 sm:w-5 sm:h-5" />
                        <span>Salir</span>
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

export default LeftMenu;