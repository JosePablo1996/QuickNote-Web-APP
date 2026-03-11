import React from 'react';
import { motion } from 'framer-motion';
import { getTagColor, getTagIcon } from '../../utils/tagUtils';
import { X, Check, Tag as TagIcon } from 'lucide-react';

interface TagChipProps {
  tagName: string;
  count?: number;
  onTap?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  clickable?: boolean;
}

// Mapa de colores con estilos para el nuevo diseño
const getTagColorStyles = (tagName: string, isSelected: boolean = false) => {
  const baseColor = getTagColor(tagName);
  
  // Mapeo de colores a estilos con gradientes y efectos
  const colorStyleMap: Record<string, {
    bg: string;
    bgHover: string;
    border: string;
    text: string;
    ring: string;
    shadow: string;
    gradient: string;
    lightBg: string;
  }> = {
    '#EF4444': { // red-500
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      bgHover: 'hover:from-red-600 hover:to-red-700',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-600 dark:text-red-400',
      ring: 'ring-red-500',
      shadow: 'shadow-red-500/30',
      gradient: 'from-red-500 to-red-600',
      lightBg: 'bg-red-50 dark:bg-red-900/20'
    },
    '#F59E0B': { // amber-500
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      bgHover: 'hover:from-amber-600 hover:to-orange-600',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-600 dark:text-amber-400',
      ring: 'ring-amber-500',
      shadow: 'shadow-amber-500/30',
      gradient: 'from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50 dark:bg-amber-900/20'
    },
    '#10B981': { // emerald-500
      bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
      bgHover: 'hover:from-emerald-600 hover:to-green-600',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-600 dark:text-emerald-400',
      ring: 'ring-emerald-500',
      shadow: 'shadow-emerald-500/30',
      gradient: 'from-emerald-500 to-green-500',
      lightBg: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    '#3B82F6': { // blue-500
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      bgHover: 'hover:from-blue-600 hover:to-indigo-600',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      ring: 'ring-blue-500',
      shadow: 'shadow-blue-500/30',
      gradient: 'from-blue-500 to-indigo-500',
      lightBg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    '#8B5CF6': { // violet-500
      bg: 'bg-gradient-to-r from-violet-500 to-purple-500',
      bgHover: 'hover:from-violet-600 hover:to-purple-600',
      border: 'border-violet-200 dark:border-violet-800',
      text: 'text-violet-600 dark:text-violet-400',
      ring: 'ring-violet-500',
      shadow: 'shadow-violet-500/30',
      gradient: 'from-violet-500 to-purple-500',
      lightBg: 'bg-violet-50 dark:bg-violet-900/20'
    },
    '#EC4899': { // pink-500
      bg: 'bg-gradient-to-r from-pink-500 to-rose-500',
      bgHover: 'hover:from-pink-600 hover:to-rose-600',
      border: 'border-pink-200 dark:border-pink-800',
      text: 'text-pink-600 dark:text-pink-400',
      ring: 'ring-pink-500',
      shadow: 'shadow-pink-500/30',
      gradient: 'from-pink-500 to-rose-500',
      lightBg: 'bg-pink-50 dark:bg-pink-900/20'
    },
    '#6B7280': { // gray-500
      bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
      bgHover: 'hover:from-gray-600 hover:to-gray-700',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'text-gray-600 dark:text-gray-400',
      ring: 'ring-gray-500',
      shadow: 'shadow-gray-500/30',
      gradient: 'from-gray-500 to-gray-600',
      lightBg: 'bg-gray-50 dark:bg-gray-800'
    }
  };

  // Buscar el color en el mapa o usar el default (gray)
  const colorKey = Object.keys(colorStyleMap).find(key => key === baseColor) || '#6B7280';
  return colorStyleMap[colorKey];
};

const TagChip: React.FC<TagChipProps> = ({
  tagName,
  count,
  onTap,
  onDelete,
  isSelected = false,
  showIcon = true,
  size = 'md',
  className = '',
  clickable = true,
}) => {
  const tagIcon = getTagIcon(tagName);
  const styles = getTagColorStyles(tagName, isSelected);

  // Definir tamaños
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  // Si tiene contador, mostrar
  const displayName = count !== undefined ? `${tagName} (${count})` : tagName;

  // Componente base (puede ser botón o span)
  const ChipComponent = onTap && clickable ? motion.button : motion.span;

  const chipProps = onTap && clickable ? {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    onClick: onTap,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onTap();
      }
    },
    'aria-label': `Etiqueta: ${tagName}${count ? `, ${count} notas` : ''}${isSelected ? ', seleccionada' : ''}`,
    title: `Etiqueta: ${tagName}${count ? ` (${count} notas)` : ''}`,
  } : {};

  return (
    <ChipComponent
      className={`
        relative inline-flex items-center gap-1.5 rounded-full
        transition-all duration-200
        ${sizeClasses[size]}
        ${styles.lightBg}
        ${styles.text}
        border ${styles.border}
        ${onTap && clickable ? 'cursor-pointer hover:shadow-lg' : ''}
        ${isSelected ? `ring-2 ring-offset-2 ${styles.ring} shadow-lg ${styles.shadow}` : ''}
        ${className}
      `}
      {...chipProps}
    >
      {/* Efecto de gradiente en hover para tags clickeables */}
      {onTap && clickable && (
        <div className={`
          absolute inset-0 rounded-full opacity-0 
          bg-gradient-to-r ${styles.gradient} 
          group-hover:opacity-10 transition-opacity duration-300
        `} />
      )}

      {/* Icono de la etiqueta */}
      {showIcon && (
        <span className={`${styles.text} opacity-80`} aria-hidden="true">
          {tagIcon ? (
            <span className={iconSizeClasses[size]}>{tagIcon}</span>
          ) : (
            <TagIcon className={iconSizeClasses[size]} />
          )}
        </span>
      )}

      {/* Nombre de la etiqueta */}
      <span className="font-medium relative z-10">{displayName}</span>

      {/* Botón de eliminar (opcional) */}
      {onDelete && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`
            ml-1 p-0.5 rounded-full relative z-20
            hover:bg-black/10 dark:hover:bg-white/10 transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-1 ${styles.ring}
          `}
          aria-label={`Eliminar etiqueta: ${tagName}`}
          title={`Eliminar etiqueta: ${tagName}`}
        >
          <X className={iconSizeClasses[size]} />
        </motion.button>
      )}

      {/* Indicador de selección */}
      {isSelected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-1"
          aria-label="Seleccionada"
        >
          <Check className={iconSizeClasses[size]} />
        </motion.span>
      )}
    </ChipComponent>
  );
};

export default TagChip;