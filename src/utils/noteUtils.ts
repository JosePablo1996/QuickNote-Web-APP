// src/utils/noteUtils.ts
import { Note } from '../models/Note';

// ========== IMPORTACIONES DE NUEVAS PROPIEDADES ==========
import {
  NoteIcon,
  NoteSize,
  ColorIntensity,
  NoteShape,
  NOTE_ICONS,
  NOTE_SIZES,
  COLOR_INTENSITIES,
  NOTE_SHAPES,
  getIconConfig,
  getSizeConfig,
  getIntensityConfig,
  getColorWithOpacity
} from '../models/Note';

// ========== FUNCIONES EXISTENTES ==========

/**
 * Formatea una fecha para mostrar en la UI
 */
export const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return 'Fecha desconocida';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha relativa (hoy, ayer, hace X días)
 */
export const formatRelativeDate = (dateStr?: string | null): string => {
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
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
    return `Hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Obtiene las iniciales de un título
 */
export const getInitials = (title?: string): string => {
  if (!title || title.trim().length === 0) return 'N';
  
  const words = title.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return (words[0][0] + words[1][0]).toUpperCase();
};

/**
 * Trunca un texto a una longitud máxima
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitaliza la primera letra de cada palabra
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

/**
 * Cuenta las palabras en un texto
 */
export const countWords = (text: string): number => {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).length;
};

/**
 * Cuenta los caracteres en un texto
 */
export const countCharacters = (text: string): number => {
  return text?.length || 0;
};

// ========== FUNCIONES PARA ICONOS (sin JSX) ==========

/**
 * Obtiene el nombre del icono para mostrar en UI (como string)
 */
export const getNoteIconName = (icon?: NoteIcon): string => {
  return getIconConfig(icon).iconName;
};

/**
 * Obtiene la etiqueta del icono de una nota
 */
export const getNoteIconLabel = (icon?: NoteIcon): string => {
  return getIconConfig(icon).label;
};

/**
 * Obtiene la descripción del icono de una nota
 */
export const getNoteIconDescription = (icon?: NoteIcon): string => {
  return getIconConfig(icon).description;
};

/**
 * Obtiene el color del icono en formato CSS
 */
export const getIconColorStyle = (noteColor: string, intensity: ColorIntensity = 'medium'): string => {
  const intensityConfig = getIntensityConfig(intensity);
  return getColorWithOpacity(noteColor, intensityConfig.borderOpacity + 0.2);
};

/**
 * Verifica si el icono es el predeterminado
 */
export const isDefaultIcon = (icon?: NoteIcon): boolean => {
  return !icon || icon === 'default';
};

/**
 * Obtiene el valor del icono o el valor por defecto
 */
export const getValidIcon = (icon?: string): NoteIcon => {
  return icon && NOTE_ICONS.some(i => i.value === icon) ? icon as NoteIcon : 'default';
};

// ========== FUNCIONES PARA TAMAÑOS ==========

/**
 * Obtiene la configuración de tamaño de una nota
 */
export const getNoteSizeConfig = (size?: NoteSize) => {
  return getSizeConfig(size);
};

/**
 * Obtiene la clase de padding según el tamaño de la nota
 */
export const getPaddingClassBySize = (size?: NoteSize): string => {
  return getSizeConfig(size).padding;
};

/**
 * Obtiene la clase de tamaño de título según el tamaño de la nota
 */
export const getTitleSizeClassBySize = (size?: NoteSize): string => {
  return getSizeConfig(size).titleSize;
};

/**
 * Obtiene el número de líneas de contenido según el tamaño de la nota
 */
export const getContentLinesBySize = (size?: NoteSize): number => {
  return getSizeConfig(size).contentLines;
};

/**
 * Obtiene la altura mínima según el tamaño de la nota
 */
export const getMinHeightBySize = (size?: NoteSize): string => {
  return getSizeConfig(size).minHeight;
};

/**
 * Obtiene la clase CSS para el número de líneas de contenido
 */
export const getLineClampClassBySize = (size?: NoteSize): string => {
  const lines = getContentLinesBySize(size);
  return `line-clamp-${lines}`;
};

/**
 * Obtiene el tamaño de fuente del título como clase Tailwind
 */
export const getTitleFontSizeClass = (size?: NoteSize): string => {
  const sizeConfig = getSizeConfig(size);
  return sizeConfig.titleSize;
};

// ========== FUNCIONES PARA INTENSIDAD ==========

/**
 * Obtiene la configuración de intensidad de una nota
 */
export const getNoteIntensityConfig = (intensity?: ColorIntensity) => {
  return getIntensityConfig(intensity);
};

/**
 * Obtiene la opacidad de fondo según intensidad
 */
export const getBackgroundOpacityByIntensity = (intensity?: ColorIntensity): number => {
  return getIntensityConfig(intensity).bgOpacity;
};

/**
 * Obtiene la opacidad de borde según intensidad
 */
export const getBorderOpacityByIntensity = (intensity?: ColorIntensity): number => {
  return getIntensityConfig(intensity).borderOpacity;
};

/**
 * Obtiene la intensidad de sombra según intensidad
 */
export const getShadowIntensityByIntensity = (intensity?: ColorIntensity): number => {
  return getIntensityConfig(intensity).shadowIntensity;
};

/**
 * Obtiene la etiqueta de la intensidad
 */
export const getIntensityLabel = (intensity?: ColorIntensity): string => {
  return getIntensityConfig(intensity).label;
};

// ========== FUNCIONES PARA FORMAS ==========

/**
 * Obtiene la configuración de forma de una nota
 */
export const getNoteShapeConfig = (shape?: NoteShape) => {
  return NOTE_SHAPES.find(s => s.value === shape) || NOTE_SHAPES[1];
};

/**
 * Obtiene la clase CSS para la forma de una nota
 */
export const getShapeClass = (shape?: NoteShape): string => {
  const config = getNoteShapeConfig(shape);
  return config.className;
};

/**
 * Obtiene el icono de la forma como string
 */
export const getShapeIconName = (shape?: NoteShape): string => {
  const config = getNoteShapeConfig(shape);
  return config.icon;
};

/**
 * Obtiene la etiqueta de la forma de una nota
 */
export const getShapeLabel = (shape?: NoteShape): string => {
  const config = getNoteShapeConfig(shape);
  return config.label;
};

/**
 * Obtiene el borderRadius en píxeles según la forma
 */
export const getBorderRadiusByShape = (shape?: NoteShape): string => {
  switch (shape) {
    case 'square': return '0';
    case 'rounded': return '0.75rem';
    case 'oval': return '9999px';
    case 'pill': return '9999px';
    default: return '0.75rem';
  }
};

// ========== FUNCIONES COMBINADAS ==========

/**
 * Obtiene todas las configuraciones de personalización de una nota
 */
export const getNotePersonalization = (note: Note) => {
  return {
    icon: getIconConfig(note.icon as NoteIcon),
    size: getSizeConfig(note.size as NoteSize),
    intensity: getIntensityConfig(note.colorIntensity as ColorIntensity),
    shape: getNoteShapeConfig(note.shape as NoteShape),
    color: note.color,
  };
};

/**
 * Obtiene un resumen de la personalización de una nota para mostrar en UI (como array de strings)
 */
export const getPersonalizationSummary = (note: Note): string[] => {
  const summary: string[] = [];
  
  if (note.icon && note.icon !== 'default') {
    summary.push(`✨ ${getNoteIconLabel(note.icon)}`);
  }
  if (note.size && note.size !== 'normal') {
    summary.push(`📐 ${getSizeConfig(note.size).label}`);
  }
  if (note.colorIntensity && note.colorIntensity !== 'medium') {
    summary.push(`💧 ${getIntensityConfig(note.colorIntensity).label}`);
  }
  if (note.shape && note.shape !== 'rounded') {
    summary.push(`⬛ ${getShapeLabel(note.shape)}`);
  }
  
  return summary;
};

/**
 * Obtiene estadísticas de personalización de una colección de notas
 */
export const getPersonalizationStats = (notes: Note[]) => {
  const activeNotes = notes.filter(n => !n.deleted_at && !n.is_archived);
  
  const iconsCount: Record<NoteIcon, number> = {
    default: 0,
    task: 0,
    meeting: 0,
    important: 0,
    idea: 0,
    shopping: 0,
    call: 0,
    email: 0,
    document: 0,
    travel: 0,
    health: 0,
    book: 0,
    code: 0,
  };
  
  const sizesCount: Record<NoteSize, number> = {
    compact: 0,
    normal: 0,
    expanded: 0,
  };
  
  const intensitiesCount: Record<ColorIntensity, number> = {
    subtle: 0,
    medium: 0,
    intense: 0,
  };
  
  const shapesCount: Record<NoteShape, number> = {
    square: 0,
    rounded: 0,
    oval: 0,
    pill: 0,
  };
  
  activeNotes.forEach(note => {
    if (note.icon) iconsCount[note.icon as NoteIcon]++;
    else iconsCount.default++;
    
    if (note.size) sizesCount[note.size as NoteSize]++;
    else sizesCount.normal++;
    
    if (note.colorIntensity) intensitiesCount[note.colorIntensity as ColorIntensity]++;
    else intensitiesCount.medium++;
    
    if (note.shape) shapesCount[note.shape as NoteShape]++;
    else shapesCount.rounded++;
  });
  
  return {
    icons: iconsCount,
    sizes: sizesCount,
    intensities: intensitiesCount,
    shapes: shapesCount,
  };
};

/**
 * Obtiene el estilo completo de una nota basado en todas sus propiedades (sin JSX)
 */
export const getNoteCompleteStyles = (
  note: {
    color: string;
    shape?: NoteShape;
    colorIntensity?: ColorIntensity;
    size?: NoteSize;
  }
): React.CSSProperties => {
  const shape = note.shape || 'rounded';
  const intensity = note.colorIntensity || 'medium';
  const intensityConfig = getIntensityConfig(intensity);
  
  let borderRadius = '0.75rem';
  if (shape === 'square') borderRadius = '0';
  if (shape === 'rounded') borderRadius = '0.75rem';
  if (shape === 'oval') borderRadius = '9999px';
  if (shape === 'pill') borderRadius = '9999px';
  
  return {
    backgroundColor: getColorWithOpacity(note.color, intensityConfig.bgOpacity),
    borderLeft: `4px solid ${getColorWithOpacity(note.color, intensityConfig.borderOpacity)}`,
    boxShadow: `0 4px 12px ${getColorWithOpacity(note.color, intensityConfig.shadowIntensity)}`,
    borderRadius,
    transition: 'all 0.3s ease',
  };
};

/**
 * Obtiene el estilo de hover para una nota
 */
export const getNoteHoverStyles = (
  color: string,
  intensity: ColorIntensity = 'medium'
): React.CSSProperties => {
  const intensityConfig = getIntensityConfig(intensity);
  return {
    boxShadow: `0 8px 24px ${getColorWithOpacity(color, intensityConfig.shadowIntensity + 0.1)}`,
    transform: 'translateY(-2px)',
  };
};

// ========== FUNCIONES DE VALIDACIÓN ==========

/**
 * Valida si un icono es válido
 */
export const isValidIcon = (icon: string): icon is NoteIcon => {
  return NOTE_ICONS.some(i => i.value === icon);
};

/**
 * Valida si un tamaño es válido
 */
export const isValidSize = (size: string): size is NoteSize => {
  return NOTE_SIZES.some(s => s.value === size);
};

/**
 * Valida si una intensidad es válida
 */
export const isValidIntensity = (intensity: string): intensity is ColorIntensity => {
  return COLOR_INTENSITIES.some(i => i.value === intensity);
};

/**
 * Valida si una forma es válida
 */
export const isValidShape = (shape: string): shape is NoteShape => {
  return NOTE_SHAPES.some(s => s.value === shape);
};

// ========== FUNCIONES DE NORMALIZACIÓN ==========

/**
 * Normaliza una nota asegurando que todas las propiedades tengan valores por defecto
 */
export const normalizeNote = <T extends Partial<Note>>(note: T): T => {
  return {
    ...note,
    icon: note.icon && isValidIcon(note.icon) ? note.icon : 'default',
    size: note.size && isValidSize(note.size) ? note.size : 'normal',
    colorIntensity: note.colorIntensity && isValidIntensity(note.colorIntensity) ? note.colorIntensity : 'medium',
    shape: note.shape && isValidShape(note.shape) ? note.shape : 'rounded',
  };
};

// ========== FUNCIONES PARA ESTADÍSTICAS ==========

/**
 * Obtiene estadísticas completas de notas incluyendo personalización
 */
export const getFullNoteStats = (notes: Note[]) => {
  const activeNotes = notes.filter(n => !n.deleted_at && !n.is_archived);
  const archivedNotes = notes.filter(n => n.is_archived && !n.deleted_at);
  const deletedNotes = notes.filter(n => n.deleted_at);
  const favoriteNotes = notes.filter(n => n.is_favorite && !n.is_archived && !n.deleted_at);
  
  return {
    total: notes.length,
    active: activeNotes.length,
    archived: archivedNotes.length,
    deleted: deletedNotes.length,
    favorite: favoriteNotes.length,
    withTags: notes.filter(n => n.tags && n.tags.length > 0).length,
    totalTags: new Set(notes.flatMap(n => n.tags || [])).size,
    personalization: getPersonalizationStats(notes),
  };
};

// ========== EXPORTAR UTILIDADES AGRUPADAS ==========

export const NoteUtilsExtended = {
  // Formato
  formatDateTime,
  formatRelativeDate,
  getInitials,
  truncateText,
  capitalizeWords,
  countWords,
  countCharacters,
  
  // Iconos
  getNoteIconName,
  getNoteIconLabel,
  getNoteIconDescription,
  getIconColorStyle,
  isDefaultIcon,
  getValidIcon,
  isValidIcon,
  
  // Tamaños
  getNoteSizeConfig,
  getPaddingClassBySize,
  getTitleSizeClassBySize,
  getContentLinesBySize,
  getMinHeightBySize,
  getLineClampClassBySize,
  getTitleFontSizeClass,
  isValidSize,
  
  // Intensidades
  getNoteIntensityConfig,
  getBackgroundOpacityByIntensity,
  getBorderOpacityByIntensity,
  getShadowIntensityByIntensity,
  getIntensityLabel,
  isValidIntensity,
  
  // Formas
  getNoteShapeConfig,
  getShapeClass,
  getShapeIconName,
  getShapeLabel,
  getBorderRadiusByShape,
  isValidShape,
  
  // Combinadas
  getNotePersonalization,
  getPersonalizationSummary,
  getPersonalizationStats,
  getNoteCompleteStyles,
  getNoteHoverStyles,
  normalizeNote,
  getFullNoteStats,
};