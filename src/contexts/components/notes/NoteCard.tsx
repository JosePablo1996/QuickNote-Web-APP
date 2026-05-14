import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Note, getColorWithOpacity, NoteShape } from '../../../models/Note';
import { useTheme } from '../../../hooks/useTheme';
import { getTagColor } from '../../../utils/tagUtils';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Star, 
  Archive, 
  Edit, 
  Trash2, 
  MoreVertical,
  Calendar,
  Tag as TagIcon,
  CheckCircle,
  X
} from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onToggleArchive: () => void;
  isSelected?: boolean;
  isGridMode?: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleArchive,
  isSelected = false,
  isGridMode = true,
}) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const getNoteColor = (): string => {
    return note.color || '#3B82F6';
  };

  // Obtener la forma de la nota (con valor por defecto si no existe)
  const getNoteShape = (): NoteShape => {
    return (note.shape as NoteShape) || 'rounded';
  };

  // Obtener clase de forma CSS
  const getShapeClass = (): string => {
    const shape = getNoteShape();
    switch (shape) {
      case 'square': return 'rounded-none';
      case 'rounded': return 'rounded-2xl';
      case 'oval': return 'rounded-full aspect-video';
      case 'pill': return 'rounded-full';
      default: return 'rounded-2xl';
    }
  };

  // Obtener estilos completos para la tarjeta (color tiñendo toda la nota)
  const getCardStyle = (): React.CSSProperties => {
    const color = getNoteColor();
    const opacity = isDarkMode ? 0.12 : 0.08;
    
    return {
      backgroundColor: getColorWithOpacity(color, opacity),
      borderLeft: `4px solid ${color}`,
      borderRight: isSelected ? `2px solid ${color}` : 'none',
      boxShadow: `0 4px 12px ${getColorWithOpacity(color, 0.2)}`,
      transition: 'all 0.3s ease',
    };
  };

  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return 'Fecha desconocida';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Hoy';
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
      return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
    } catch {
      return 'Fecha desconocida';
    }
  };

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/tags/${encodeURIComponent(tag)}`);
  };

  // Abrir menú
  const handleOpenMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMenu(true);
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMenu]);

  const renderTags = () => {
    if (!note.tags || note.tags.length === 0) return null;

    const maxTags = isGridMode ? 3 : 5;
    const visibleTags = note.tags.slice(0, maxTags);
    const remainingCount = note.tags.length - maxTags;

    return (
      <div className={`flex flex-wrap gap-1.5 mt-3 ${isGridMode ? 'justify-start' : ''}`}>
        {visibleTags.map((tag) => {
          const tagColor = getTagColor(tag);
          return (
            <motion.button
              key={tag}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleTagClick(tag, e)}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{
                backgroundColor: `${tagColor}20`,
                color: tagColor,
                border: `1px solid ${tagColor}40`,
                backdropFilter: 'blur(4px)',
              }}
              title={`Ver todas las notas con la etiqueta #${tag}`}
            >
              <TagIcon className="w-3 h-3 mr-1" />
              #{tag}
            </motion.button>
          );
        })}
        {remainingCount > 0 && (
          <span 
            className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs border border-gray-200 dark:border-gray-600"
            title={`${remainingCount} etiqueta${remainingCount !== 1 ? 's' : ''} más`}
          >
            +{remainingCount}
          </span>
        )}
      </div>
    );
  };

  const noteColor = getNoteColor();
  const noteShapeClass = getShapeClass();
  const formattedDate = formatDate(note.updated_at || note.created_at);

  // Opciones del menú circular
  const menuItems = [
    {
      icon: Star,
      label: note.is_favorite ? 'Quitar favorito' : 'Añadir favorito',
      color: '#f59e0b',
      action: onToggleFavorite,
      active: note.is_favorite,
    },
    {
      icon: Archive,
      label: note.is_archived ? 'Desarchivar' : 'Archivar',
      color: '#8b5cf6',
      action: onToggleArchive,
      active: note.is_archived,
    },
    {
      icon: Edit,
      label: 'Editar',
      color: '#3b82f6',
      action: onEdit,
      active: false,
    },
    {
      icon: Trash2,
      label: 'Eliminar',
      color: '#ef4444',
      action: onDelete,
      active: false,
    },
  ];

  const menuSize = 240;
  const itemCount = menuItems.length;

  const menuVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 20, 
        stiffness: 200,
        duration: 0.4 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.5,
      transition: { 
        duration: 0.2 
      }
    }
  };

  // Variantes para la tarjeta (corregido el error de whileHover)
  const cardVariants: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    hover: { 
      y: -4,
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover="hover"
        className={`
          relative group overflow-hidden transition-shadow duration-300
          ${noteShapeClass}
          ${isDarkMode ? 'backdrop-blur-sm' : ''}
          ${isSelected ? 'ring-2 ring-blue-500 scale-[1.02] shadow-2xl' : 'hover:shadow-2xl'}
          border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'}
          cursor-pointer
          ${!isGridMode ? 'flex items-start' : ''}
        `}
        style={getCardStyle()}
        onClick={onClick}
      >
        {isGridMode ? (
          /* VISTA GRID - Color ahora tiñe toda la tarjeta */
          <>
            {/* Barra decorativa superior con el color */}
            <div 
              className="h-1.5 w-full"
              style={{ 
                background: `linear-gradient(90deg, ${noteColor}, ${noteColor}CC, ${noteColor})`,
              }}
            />

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 
                  className={`font-bold text-lg truncate flex-1 pr-2 transition-colors duration-300`}
                  style={{ color: isDarkMode ? '#fff' : noteColor }}
                >
                  {note.title || 'Sin título'}
                </h3>
                
                {/* Botón de tres puntitos */}
                <motion.button
                  ref={buttonRef}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleOpenMenu}
                  className="relative z-10 p-2.5 rounded-xl transition-all duration-300 flex-shrink-0"
                  style={{
                    backgroundColor: `${noteColor}20`,
                    color: noteColor,
                    border: `2px solid ${noteColor}40`,
                    backdropFilter: 'blur(4px)',
                  }}
                  aria-label="Abrir menú de opciones"
                  title="Opciones"
                >
                  <MoreVertical className="w-5 h-5" />
                </motion.button>
              </div>

              <p className={`text-sm line-clamp-3 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {note.content || 'Sin contenido'}
              </p>

              {/* Etiquetas */}
              {renderTags()}

              {/* Fecha */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-1.5">
                  <Calendar className={`w-3.5 h-3.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* VISTA LISTA - Color ahora tiñe toda la tarjeta */
          <div className="flex items-start p-4 w-full">
            {/* Indicador de color - ahora más grande y visible */}
            <div 
              className="w-2 h-16 rounded-full mr-4 flex-shrink-0 transition-all duration-300"
              style={{ 
                background: `linear-gradient(to bottom, ${noteColor}, ${noteColor}CC)`,
                boxShadow: `0 2px 8px ${getColorWithOpacity(noteColor, 0.4)}`,
              }}
            />

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 
                  className={`font-semibold text-lg truncate transition-colors duration-300`}
                  style={{ color: isDarkMode ? '#fff' : noteColor }}
                >
                  {note.title || 'Sin título'}
                </h3>
                
                {/* Botón de tres puntitos */}
                <motion.button
                  ref={buttonRef}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleOpenMenu}
                  className="relative z-10 p-2 rounded-xl transition-all duration-300 flex-shrink-0"
                  style={{
                    backgroundColor: `${noteColor}20`,
                    color: noteColor,
                    border: `2px solid ${noteColor}40`,
                    backdropFilter: 'blur(4px)',
                  }}
                  aria-label="Abrir menú de opciones"
                  title="Opciones"
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>
              </div>

              <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {note.content || 'Sin contenido'}
              </p>

              {/* Etiquetas */}
              {renderTags()}

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className={`w-3.5 h-3.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de selección */}
        {isSelected && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 left-3 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg z-20"
          >
            <CheckCircle className="w-4 h-4 text-white" />
          </motion.div>
        )}

        {/* Badge de forma (opcional - muestra qué forma tiene la nota) */}
        {getNoteShape() !== 'rounded' && (
          <div 
            className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
            style={{
              backgroundColor: `${noteColor}30`,
              color: noteColor,
              border: `1px solid ${noteColor}50`,
            }}
            title={`Forma: ${getNoteShape() === 'square' ? 'Cuadrado' : getNoteShape() === 'oval' ? 'Ovalado' : 'Píldora'}`}
          >
            {getNoteShape() === 'square' && '⬛'}
            {getNoteShape() === 'oval' && '🥚'}
            {getNoteShape() === 'pill' && '💊'}
          </div>
        )}
      </motion.div>

      {/* Menú Circular Centrado */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setShowMenu(false)}
            />
            
            {/* Contenedor del menú centrado */}
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <motion.div
                ref={menuRef}
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative pointer-events-auto"
                style={{ width: menuSize, height: menuSize }}
              >
                {/* Botón central */}
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ delay: 0.1, type: "spring", damping: 15, stiffness: 200 }}
                  onClick={() => setShowMenu(false)}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer z-10"
                  style={{
                    background: `linear-gradient(135deg, ${noteColor}, ${noteColor}CC)`,
                    color: '#fff',
                    border: '3px solid rgba(255,255,255,0.8)',
                    boxShadow: `0 10px 25px -5px ${noteColor}`,
                  }}
                >
                  <X className="w-6 h-6" />
                </motion.button>

                {/* Ítems del menú circular */}
                {menuItems.map((item, index) => {
                  const angle = (index * 360) / itemCount - 90;
                  const radius = menuSize * 0.3;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  const Icon = item.icon;

                  return (
                    <motion.button
                      key={index}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{ 
                        scale: 1, 
                        x: x,
                        y: y,
                        transition: { 
                          delay: 0.1 + index * 0.03, 
                          type: 'spring', 
                          stiffness: 350,
                          damping: 18
                        }
                      }}
                      exit={{ scale: 0, x: 0, y: 0 }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        item.action();
                        setShowMenu(false);
                      }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-xl cursor-pointer transition-all z-20"
                      style={{
                        background: item.active ? item.color : '#fff',
                        color: item.active ? '#fff' : item.color,
                        border: item.active ? '3px solid rgba(255,255,255,0.8)' : `3px solid ${item.color}`,
                        boxShadow: `0 8px 20px -4px ${item.color}`,
                      }}
                      title={item.label}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NoteCard;