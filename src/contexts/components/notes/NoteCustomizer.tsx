// src/contexts/components/notes/NoteCustomizer.tsx
// ============================================================================
// COMPONENTE PERSONALIZADOR DE NOTAS (COMPLETO Y RESPONSIVO)
// ============================================================================
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  GripVertical,
  Droplet,
  Palette,
  Shapes,
  Square,
  Circle,
  Pill,
  LayoutGrid,
  CheckCircle,
  Plus,
  X,
  Hash,
  AlertCircle,
} from 'lucide-react';
import { NoteCreate, getColorWithOpacity } from '../../../models/Note';
import {
  NOTE_ICONS,
  NOTE_SIZES,
  COLOR_INTENSITIES,
  NOTE_SHAPES,
  getIconConfig,
  getSizeConfig,
  getIntensityConfig,
  NoteIcon,
  NoteSize,
  ColorIntensity,
  NoteShape,
  IconConfig,
  SizeConfig,
  IntensityConfig,
} from '../../../models/Note';

// ============================================================================
// TIPOS
// ============================================================================
interface NoteCustomizerProps {
  draft: NoteCreate;
  setDraft: React.Dispatch<React.SetStateAction<NoteCreate>>;
  isSaving?: boolean;
}

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  color: string;
  disabled?: boolean;
}

// ============================================================================
// UTILIDADES
// ============================================================================
const getContentSizeClass = (sizeValue: string): string => {
  switch (sizeValue) {
    case 'compact': return 'text-xs sm:text-sm';
    case 'expanded': return 'text-base sm:text-lg';
    default: return 'text-sm sm:text-base';
  }
};

const getContentLinesClass = (sizeValue: string): string => {
  switch (sizeValue) {
    case 'compact': return 'line-clamp-2';
    case 'expanded': return 'line-clamp-6';
    default: return 'line-clamp-4';
  }
};

const getShapeStyleForPreview = (shape: NoteShape): string => {
  switch (shape) {
    case 'square': return 'rounded-none';
    case 'rounded': return 'rounded-xl sm:rounded-2xl';
    case 'oval': return 'rounded-2xl sm:rounded-3xl';
    case 'pill': return 'rounded-full';
    default: return 'rounded-xl sm:rounded-2xl';
  }
};

// ============================================================================
// COMPONENTE: INPUT DE ETIQUETAS
// ============================================================================
const TagInput: React.FC<TagInputProps> = ({ tags, onAddTag, onRemoveTag, color, disabled = false }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleAddTag = useCallback(() => {
    const trimmedTag = inputValue.trim().toLowerCase();
    
    if (!trimmedTag) {
      setError('El nombre de la etiqueta no puede estar vacío');
      return;
    }
    
    if (trimmedTag.length > 30) {
      setError('La etiqueta no puede tener más de 30 caracteres');
      return;
    }
    
    if (tags.includes(trimmedTag)) {
      setError('Esta etiqueta ya existe');
      return;
    }
    
    if (tags.length >= 10) {
      setError('Máximo 10 etiquetas por nota');
      return;
    }
    
    onAddTag(trimmedTag);
    setInputValue('');
    setError('');
  }, [inputValue, tags, onAddTag]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
          <Hash className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
        </div>
        <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">Etiquetas</span>
        <span className="ml-auto text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
          {tags.length}/10
        </span>
      </div>

      {/* Lista de etiquetas existentes */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 min-h-[40px]">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium"
              style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
            >
              #{tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="hover:scale-110 transition-transform"
                  aria-label={`Eliminar etiqueta ${tag}`}
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              )}
            </motion.span>
          ))}
        </AnimatePresence>
        {tags.length === 0 && (
          <span className="text-[10px] sm:text-xs text-gray-400 italic">Sin etiquetas</span>
        )}
      </div>

      {/* Input para nueva etiqueta */}
      <div className="flex flex-col xs:flex-row gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ej: importante, trabajo, personal..."
            disabled={disabled || tags.length >= 10}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
            style={{ focusRingColor: color, '--tw-ring-color': color } as React.CSSProperties}
          />
          {error && (
            <p className="absolute -bottom-5 left-0 text-[9px] sm:text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-2.5 h-2.5" />
              {error}
            </p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleAddTag}
          disabled={disabled || tags.length >= 10 || !inputValue.trim()}
          className="px-3 py-2 rounded-lg text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Añadir</span>
        </motion.button>
      </div>
      
      <p className="text-[9px] sm:text-xs text-gray-400 mt-3">
        Presiona Enter para añadir. Máximo 10 etiquetas.
      </p>
    </div>
  );
};

// ============================================================================
// COMPONENTE: VISTA PREVIA EN VIVO (GRANDE)
// ============================================================================
const LivePreviewCard: React.FC<{
  title: string;
  content: string;
  color: string;
  shape: NoteShape;
  tags: string[];
  iconConfig: IconConfig;
  sizeConfig: SizeConfig;
  intensityConfig: IntensityConfig;
}> = ({ title, content, color, shape, tags, iconConfig, sizeConfig, intensityConfig }) => {
  const safeTitle = title || 'Título de la nota';
  const safeContent = content || 'Este es un ejemplo de cómo se verá tu nota con la personalización seleccionada.';
  const safeTags = tags || [];

  const previewStyle = useMemo((): React.CSSProperties => ({
    backgroundColor: getColorWithOpacity(color, intensityConfig.bgOpacity),
    borderLeft: `4px solid ${getColorWithOpacity(color, intensityConfig.borderOpacity)}`,
    boxShadow: `0 20px 40px -12px ${getColorWithOpacity(color, intensityConfig.shadowIntensity)}`,
    transition: 'all 0.3s ease',
  }), [color, intensityConfig]);

  const shapeClass = getShapeStyleForPreview(shape);
  const contentSizeClass = getContentSizeClass(sizeConfig.value);
  const contentLinesClass = getContentLinesClass(sizeConfig.value);

  const previewIcon = useMemo(() => {
    if (iconConfig.value === 'default') {
      return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" style={{ color: '#fff' }} />;
    }
    return <span className="text-xl sm:text-2xl md:text-3xl">{iconConfig.iconName}</span>;
  }, [iconConfig]);

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.01] ${shapeClass}`}
      style={previewStyle}
    >
      {/* Decoración de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-24 h-24 sm:w-32 sm:h-32 rounded-full blur-2xl pointer-events-none" style={{ backgroundColor: `${color}30` }} />
      
      <div className={`${sizeConfig.padding} relative z-10`}>
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}40`, backdropFilter: 'blur(4px)' }}
          >
            {previewIcon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 
              className={`font-bold ${sizeConfig.titleSize} truncate`} 
              style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
            >
              {safeTitle}
            </h3>
          </div>
        </div>
        
        <p className={`${contentSizeClass} ${contentLinesClass}`} style={{ color: 'rgba(255,255,255,0.9)' }}>
          {safeContent}
        </p>
        
        {safeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
            {safeTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium backdrop-blur-sm"
                style={{ backgroundColor: `${color}40`, color: '#fff', border: `1px solid ${color}80` }}
              >
                #{tag}
              </span>
            ))}
            {safeTags.length > 3 && (
              <span className="text-[9px] sm:text-xs text-white/70">+{safeTags.length - 3}</span>
            )}
          </div>
        )}
      </div>
      
      {/* Badges de configuración */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 flex gap-1">
        <div 
          className="px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] md:text-xs font-medium backdrop-blur-md"
          style={{ backgroundColor: `${color}60`, color: '#fff' }}
        >
          {iconConfig.label}
        </div>
        <div 
          className="px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] md:text-xs font-medium backdrop-blur-md"
          style={{ backgroundColor: `${color}60`, color: '#fff' }}
        >
          {sizeConfig.label}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// COMPONENTE: SELECTOR DE ICONO
// ============================================================================
const IconSelector: React.FC<{
  icon: NoteIcon;
  setIcon: (value: NoteIcon) => void;
  color: string;
  disabled?: boolean;
}> = ({ icon, setIcon, color, disabled = false }) => {
  const selectedIcon = getIconConfig(icon);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
        </div>
        <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">Icono</span>
        <span className="ml-auto text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
          {selectedIcon.label}
        </span>
      </div>
      
      <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2 max-h-48 overflow-y-auto p-1">
        {NOTE_ICONS.map((iconOption) => {
          const isSelected = icon === iconOption.value;
          const iconDisplay = iconOption.value === 'default'
            ? <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            : <span className="text-base sm:text-lg md:text-xl">{iconOption.iconName}</span>;

          return (
            <motion.button
              key={iconOption.value}
              type="button"
              whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              onClick={() => !disabled && setIcon(iconOption.value as NoteIcon)}
              disabled={disabled}
              className={`relative p-1.5 sm:p-2 rounded-lg transition-all duration-300 flex flex-col items-center gap-0.5 ${
                isSelected ? 'ring-2 ring-offset-1 shadow-md' : 'hover:scale-105 opacity-70 hover:opacity-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ 
                backgroundColor: isSelected ? `${color}15` : 'transparent', 
                border: `1px solid ${isSelected ? color : `${color}25`}` 
              }}
              title={iconOption.description}
            >
              <div style={{ color: isSelected ? color : undefined }}>{iconDisplay}</div>
              <span className={`text-[8px] sm:text-[10px] md:text-xs ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                {iconOption.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="text-[9px] sm:text-xs text-gray-500 text-center mt-2">{selectedIcon.description}</p>
    </div>
  );
};

// ============================================================================
// COMPONENTE: SELECTOR DE TAMAÑO
// ============================================================================
const SizeSelector: React.FC<{
  size: NoteSize;
  setSize: (value: NoteSize) => void;
  color: string;
  disabled?: boolean;
}> = ({ size, setSize, color, disabled = false }) => {
  const selectedSize = getSizeConfig(size);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
          <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
        </div>
        <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">Tamaño</span>
        <span className="ml-auto text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
          {selectedSize.label}
        </span>
      </div>
      
      <div className="flex flex-col xs:flex-row gap-2">
        {NOTE_SIZES.map((sizeOption) => {
          const isSelected = size === sizeOption.value;
          return (
            <motion.button
              key={sizeOption.value}
              type="button"
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              onClick={() => !disabled && setSize(sizeOption.value as NoteSize)}
              disabled={disabled}
              className={`flex-1 py-2 sm:py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                isSelected ? 'ring-2 ring-offset-1 shadow-md' : 'hover:scale-105 opacity-80 hover:opacity-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ 
                backgroundColor: isSelected ? `${color}20` : 'transparent', 
                border: `1.5px solid ${isSelected ? color : `${color}30`}` 
              }}
            >
              <span 
                className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`} 
                style={{ color: isSelected ? color : undefined }}
              >
                {sizeOption.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="text-[9px] sm:text-xs text-gray-500 text-center mt-2">{selectedSize.description}</p>
    </div>
  );
};

// ============================================================================
// COMPONENTE: SELECTOR DE INTENSIDAD
// ============================================================================
const IntensitySelector: React.FC<{
  intensity: ColorIntensity;
  setIntensity: (value: ColorIntensity) => void;
  color: string;
  disabled?: boolean;
}> = ({ intensity, setIntensity, color, disabled = false }) => {
  const selectedIntensity = getIntensityConfig(intensity);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
          <Droplet className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
        </div>
        <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">Intensidad</span>
        <span className="ml-auto text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
          {selectedIntensity.label}
        </span>
      </div>
      
      <div className="flex flex-col xs:flex-row gap-2">
        {COLOR_INTENSITIES.map((intensityOption) => {
          const isSelected = intensity === intensityOption.value;
          return (
            <motion.button
              key={intensityOption.value}
              type="button"
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              onClick={() => !disabled && setIntensity(intensityOption.value as ColorIntensity)}
              disabled={disabled}
              className={`flex-1 py-2 sm:py-3 rounded-xl transition-all duration-300 flex flex-col items-center gap-1 ${
                isSelected ? 'ring-2 ring-offset-1 shadow-md' : 'hover:scale-105 opacity-80 hover:opacity-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ 
                backgroundColor: isSelected ? `${color}20` : 'transparent', 
                border: `1.5px solid ${isSelected ? color : `${color}30`}` 
              }}
            >
              <div className="flex gap-0.5 sm:gap-1">
                <div className="w-3 sm:w-4 h-1 rounded-full" style={{ backgroundColor: color, opacity: 0.3 }} />
                <div className="w-3 sm:w-4 h-1 rounded-full" style={{ backgroundColor: color, opacity: 0.6 }} />
                <div className="w-3 sm:w-4 h-1 rounded-full" style={{ backgroundColor: color, opacity: 1 }} />
              </div>
              <span 
                className={`text-[10px] sm:text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`} 
                style={{ color: isSelected ? color : undefined }}
              >
                {intensityOption.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="text-[9px] sm:text-xs text-gray-500 text-center mt-2">{selectedIntensity.description}</p>
    </div>
  );
};

// ============================================================================
// COMPONENTE: SELECTOR DE COLOR
// ============================================================================
const ColorSelector: React.FC<{
  color: string;
  setColor: (value: string) => void;
  disabled?: boolean;
}> = ({ color, setColor, disabled = false }) => {
  const colorOptions = useMemo(() => [
    { hex: '#3B82F6', name: 'Azul' },
    { hex: '#EF4444', name: 'Rojo' },
    { hex: '#10B981', name: 'Verde' },
    { hex: '#F59E0B', name: 'Ámbar' },
    { hex: '#8B5CF6', name: 'Púrpura' },
    { hex: '#EC4899', name: 'Rosa' },
    { hex: '#06B6D4', name: 'Cian' },
    { hex: '#6B7280', name: 'Gris' },
    { hex: '#F97316', name: 'Naranja' },
    { hex: '#14B8A6', name: 'Turquesa' },
  ], []);

  const selectedColorName = useMemo(() => 
    colorOptions.find(c => c.hex === color)?.name || 'Personalizado',
  [color, colorOptions]);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
          <Palette className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
        </div>
        <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">Color</span>
        <span className="ml-auto text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
          {selectedColorName}
        </span>
      </div>
      
      <div className="grid grid-cols-5 xs:grid-cols-5 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 sm:gap-2">
        {colorOptions.map((option) => {
          const isSelected = color === option.hex;
          return (
            <motion.button
              key={option.hex}
              type="button"
              whileHover={!disabled ? { scale: 1.1 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              onClick={() => !disabled && setColor(option.hex)}
              disabled={disabled}
              className={`relative aspect-square rounded-lg transition-all duration-300 ${
                isSelected ? 'ring-2 ring-offset-1 ring-white scale-110 shadow-xl' : 'hover:scale-105 shadow-md'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ backgroundColor: option.hex }}
              title={option.name}
            >
              {isSelected && <CheckCircle className="absolute inset-0 m-auto w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white drop-shadow-lg" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: SELECTOR DE FORMA
// ============================================================================
const ShapeSelector: React.FC<{
  shape: NoteShape;
  setShape: (value: NoteShape) => void;
  color: string;
  disabled?: boolean;
}> = ({ shape, setShape, color, disabled = false }) => {
  const getShapeIcon = (shapeValue: NoteShape) => {
    switch (shapeValue) {
      case 'square': return <Square className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />;
      case 'rounded': return <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />;
      case 'oval': return <Circle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />;
      case 'pill': return <Pill className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />;
      default: return <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />;
    }
  };

  const getShapeDescription = (shapeValue: NoteShape): string => {
    switch (shapeValue) {
      case 'square': return 'Bordes rectos';
      case 'rounded': return 'Esquinas redondeadas';
      case 'oval': return 'Forma ovalada';
      case 'pill': return 'Forma de píldora';
      default: return '';
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
          <Shapes className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
        </div>
        <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">Forma</span>
        <span className="ml-auto text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
          {NOTE_SHAPES.find(s => s.value === shape)?.label || 'Redondeado'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 sm:gap-3">
        {NOTE_SHAPES.map((shapeOption) => {
          const isSelected = shape === shapeOption.value;
          return (
            <motion.button
              key={shapeOption.value}
              type="button"
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              onClick={() => !disabled && setShape(shapeOption.value as NoteShape)}
              disabled={disabled}
              className={`p-2 sm:p-3 rounded-xl transition-all duration-300 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 ${
                isSelected ? 'ring-2 ring-offset-1 shadow-md' : 'hover:scale-105 opacity-80 hover:opacity-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ 
                backgroundColor: isSelected ? `${color}15` : 'transparent', 
                border: `1.5px solid ${isSelected ? color : `${color}30`}` 
              }}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center" style={{ color }}>
                {getShapeIcon(shapeOption.value as NoteShape)}
              </div>
              <div className="text-center sm:text-left">
                <p className="font-semibold text-[10px] sm:text-xs md:text-sm" style={{ color: isSelected ? color : undefined }}>
                  {shapeOption.label}
                </p>
                <p className="text-[8px] sm:text-[9px] text-gray-500 hidden sm:block">{getShapeDescription(shapeOption.value as NoteShape)}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: BADGE RÁPIDO
// ============================================================================
const QuickBadge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium whitespace-nowrap"
    style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
  >
    {label}
  </motion.span>
);

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const NoteCustomizer: React.FC<NoteCustomizerProps> = ({ draft, setDraft, isSaving = false }) => {
  // Valores seguros
  const safeTitle = draft.title || '';
  const safeContent = draft.content || '';
  const safeColor = draft.color || '#3B82F6';
  const safeTags: string[] = draft.tags || [];
  const safeShape = (draft.shape as NoteShape) || 'rounded';
  const safeIcon = (draft.icon as NoteIcon) || 'default';
  const safeSize = (draft.size as NoteSize) || 'normal';
  const safeIntensity = (draft.colorIntensity as ColorIntensity) || 'medium';

  // Configuraciones derivadas
  const iconConfig = getIconConfig(safeIcon);
  const sizeConfig = getSizeConfig(safeSize);
  const intensityConfig = getIntensityConfig(safeIntensity);

  // Handlers optimizados con useCallback
  const setShape = useCallback((value: NoteShape) => setDraft(prev => ({ ...prev, shape: value })), [setDraft]);
  const setIcon = useCallback((value: NoteIcon) => setDraft(prev => ({ ...prev, icon: value })), [setDraft]);
  const setSize = useCallback((value: NoteSize) => setDraft(prev => ({ ...prev, size: value })), [setDraft]);
  const setIntensity = useCallback((value: ColorIntensity) => setDraft(prev => ({ ...prev, colorIntensity: value })), [setDraft]);
  const setColor = useCallback((value: string) => setDraft(prev => ({ ...prev, color: value })), [setDraft]);
  
  const handleAddTag = useCallback((tag: string) => {
    setDraft(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
  }, [setDraft]);
  
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setDraft(prev => ({ ...prev, tags: (prev.tags || []).filter(tag => tag !== tagToRemove) }));
  }, [setDraft]);

  // Información de configuración actual
  const currentShapeLabel = NOTE_SHAPES.find(s => s.value === safeShape)?.label || 'Redondeado';

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      {/* Vista previa destacada */}
      <div className="lg:sticky lg:top-20">
        <LivePreviewCard
          title={safeTitle}
          content={safeContent}
          color={safeColor}
          shape={safeShape}
          tags={safeTags}
          iconConfig={iconConfig}
          sizeConfig={sizeConfig}
          intensityConfig={intensityConfig}
        />
        
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          <QuickBadge label={iconConfig.label} color={safeColor} />
          <QuickBadge label={sizeConfig.label} color={safeColor} />
          <QuickBadge label={intensityConfig.label} color={safeColor} />
          <QuickBadge label={currentShapeLabel} color={safeColor} />
        </div>
      </div>

      {/* Panel de personalización */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Columna izquierda */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <IconSelector 
            icon={safeIcon} 
            setIcon={setIcon} 
            color={safeColor} 
            disabled={isSaving}
          />
          <SizeSelector 
            size={safeSize} 
            setSize={setSize} 
            color={safeColor} 
            disabled={isSaving}
          />
          <IntensitySelector 
            intensity={safeIntensity} 
            setIntensity={setIntensity} 
            color={safeColor} 
            disabled={isSaving}
          />
        </div>
        
        {/* Columna derecha */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <ColorSelector 
            color={safeColor} 
            setColor={setColor} 
            disabled={isSaving}
          />
          <ShapeSelector 
            shape={safeShape} 
            setShape={setShape} 
            color={safeColor} 
            disabled={isSaving}
          />
          <TagInput
            tags={safeTags}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            color={safeColor}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Indicador de estado */}
      <div className="text-center py-3 sm:py-4">
        {isSaving ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            Guardando cambios...
          </p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Los cambios se aplican en tiempo real
          </p>
        )}
      </div>
    </div>
  );
};

export default NoteCustomizer;