import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useNotes } from '../../hooks/useNotes';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getTagStatsFromNotes } from '../../utils/tagUtils';
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
          .slice(0, 5)
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
  }, [notes, popularTags.length]);

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

  const menuSections: MenuSection[] = [
    {
      title: 'Calendario',
      items: [
        {
          label: 'Ver calendario',
          icon: <Calendar className="w-5 h-5" />,
          path: '/calendar',
          color: 'green',
        },
      ],
    },
    {
      title: 'Favoritos',
      items: [
        {
          label: 'Notas favoritas',
          icon: <Star className="w-5 h-5" />,
          path: '/favorites',
          color: 'yellow',
          badge: counters.favorites,
        },
      ],
    },
    {
      title: 'Etiquetas',
      items: [
        {
          label: 'Todas las etiquetas',
          icon: <Tag className="w-5 h-5" />,
          path: '/tags',
          color: 'purple',
          badge: counters.totalTags > 0 ? counters.totalTags : undefined,
        },
      ],
    },
    {
      title: 'Etiquetas populares',
      hidden: popularTags.length === 0,
      items: popularTags.map((tag) => ({
        label: `#${tag.name}`,
        icon: <Tag className="w-5 h-5" />,
        path: `/tags/${encodeURIComponent(tag.name)}`,
        color: tag.color,
        badge: tag.count,
      })),
    },
    {
      title: 'Archivar',
      items: [
        {
          label: 'Notas archivadas',
          icon: <Archive className="w-5 h-5" />,
          path: '/archived',
          color: 'teal',
          badge: counters.archived,
        },
      ],
    },
    {
      title: 'Papelera',
      items: [
        {
          label: 'Papelera',
          icon: <Trash2 className="w-5 h-5" />,
          path: '/trash',
          color: 'red',
          badge: counters.trash,
        },
      ],
    },
    {
      title: 'Sincronizar y respaldar',
      items: [
        {
          label: 'Respaldo manual',
          icon: <Download className="w-5 h-5" />,
          path: '/backup',
          color: 'blue',
        },
      ],
    },
    {
      title: 'Centro de ayuda',
      items: [
        {
          label: 'Ayuda y soporte',
          icon: <HelpCircle className="w-5 h-5" />,
          path: '/help',
          color: 'indigo',
        },
      ],
    },
    {
      title: 'Ajustes',
      items: [
        {
          label: 'Configuración',
          icon: <Settings className="w-5 h-5" />,
          path: '/settings',
          color: 'gray',
        },
      ],
    },
    // SECCIÓN DE CERRAR SESIÓN
    {
      title: 'Salir',
      items: [
        {
          label: 'Cerrar sesión',
          icon: <LogOut className="w-5 h-5" />,
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

  return (
    <>
      {/* Overlay con degradado y blur */}
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
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-purple-900/60 via-blue-900/40 to-indigo-900/60 backdrop-blur-md"
          style={{
            background: 'radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.4), rgba(59, 130, 246, 0.3) 50%, rgba(139, 92, 246, 0.4))'
          }}
        />
      </motion.div>
      
      {/* Menú lateral */}
      <motion.div
        initial={{ x: -400 }}
        animate={{ x: 0 }}
        exit={{ x: -400 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={`
          fixed top-0 left-0 h-full w-96 z-50 overflow-y-auto
          ${isDarkMode 
            ? 'bg-gray-900/95 backdrop-blur-xl' 
            : 'bg-white/95 backdrop-blur-xl'
          }
          shadow-2xl rounded-r-3xl border-r border-white/20
        `}
      >
        {/* Header del menú con gradiente estilo LoginForm */}
        <div className="sticky top-0 z-20 p-4">
          <div className="relative h-48 rounded-2xl overflow-hidden">
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
              className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/30 z-30"
              aria-label="Cerrar menú"
              title="Cerrar menú"
            >
              <X className="w-4 h-4 text-white" />
            </motion.button>

            {/* Contenido del header - ahora sin icono de notas y sin badge online */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Avatar clickeable - sin tooltip */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToProfile}
                className="relative group mb-2"
                aria-label="Ir a mi perfil"
              >
                <div className="w-20 h-20 rounded-full border-4 border-white/50 overflow-hidden shadow-xl">
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
                    <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-white text-2xl font-bold`}>
                      {getInitials()}
                    </div>
                  )}
                </div>
                {/* SIN badge de estado online y SIN tooltip */}
              </motion.button>

              {/* Nombre del usuario */}
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold text-white mb-1 drop-shadow-lg"
              >
                {user?.name || 'Usuario'}
              </motion.h2>

              {/* Email del usuario */}
              <motion.p 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-sm text-white/90 mb-2 drop-shadow"
              >
                {user?.email || ''}
              </motion.p>

              {/* SIN badge de estado online */}
            </div>
          </div>
        </div>

        {/* Contenido del menú */}
        <div className="px-4 pb-6 relative z-10">
          {/* Secciones del menú */}
          <AnimatePresence mode="wait">
            {menuSections.map((section, idx) => {
              if (section.hidden) return null;
              
              return (
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
                      const colors = getColorClasses(item.color);
                      const isHovered = hoveredItem === `${idx}-${itemIdx}`;
                      
                      return (
                        <motion.button
                          key={itemIdx}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onHoverStart={() => setHoveredItem(`${idx}-${itemIdx}`)}
                          onHoverEnd={() => setHoveredItem(null)}
                          onClick={() => handleNavigation(item.path)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-3 rounded-xl
                            transition-all duration-200 relative overflow-hidden group
                            ${isDarkMode 
                              ? 'hover:bg-white/5' 
                              : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                            }
                          `}
                          aria-label={`Ir a ${item.label}`}
                          title={item.label}
                        >
                          {/* Efecto de hover gradiente */}
                          {isHovered && (
                            <motion.div
                              layoutId="hoverBackground"
                              className={`absolute inset-0 bg-gradient-to-r ${colors.text.replace('text-', 'from-')} ${colors.text.replace('text-', 'to-')} opacity-10`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.1 }}
                              exit={{ opacity: 0 }}
                            />
                          )}
                          
                          {/* Icono con fondo */}
                          <div className={`
                            relative z-10 p-2 rounded-xl ${colors.bg}
                            transition-all duration-200 group-hover:scale-110
                          `}>
                            <span className={colors.text}>
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
                          
                          {/* Badge para contadores */}
                          {item.badge !== undefined && item.badge !== null && (
                            <>
                              {typeof item.badge === 'number' && item.badge > 0 && (
                                <span className={`
                                  relative z-10 px-2 py-0.5 rounded-lg text-xs font-medium
                                  ${colors.bg} ${colors.text} border ${colors.border}
                                `}>
                                  {item.badge}
                                </span>
                              )}
                              {typeof item.badge !== 'number' && item.badge}
                            </>
                          )}
                          
                          {/* Flecha decorativa */}
                          <ChevronRight className={`
                            relative z-10 w-4 h-4 transition-all duration-200
                            ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}
                            group-hover:translate-x-1 ${colors.text}
                          `} />
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800"
          >
            <p className="text-xs text-center text-gray-500 dark:text-gray-500">
              QuickNote · Tu espacio de notas seguro
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
                {/* Avatar centrado */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="p-0.5 bg-gradient-to-r from-red-400 to-red-500 rounded-full">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name || 'Avatar'} 
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-white text-2xl font-bold`}>
                          {getInitials()}
                        </div>
                      )}
                    </div>
                    {/* Mantenemos el badge online en el modal de logout */}
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                  </div>
                </div>

                {/* Mensaje de confirmación */}
                <div className="text-center mb-6">
                  <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ¿Cerrar sesión, {user?.name?.split(' ')[0] || 'usuario'}?
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

export default LeftMenu;