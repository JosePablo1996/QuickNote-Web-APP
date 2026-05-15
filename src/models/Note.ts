// src/models/Note.ts

export type NoteShape = 'square' | 'rounded' | 'oval' | 'pill';

// ========== NUEVAS PROPIEDADES ==========
export type NoteIcon = 
  | 'default'
  | 'task'
  | 'meeting'
  | 'important'
  | 'idea'
  | 'shopping'
  | 'call'
  | 'email'
  | 'document'
  | 'travel'
  | 'health'
  | 'book'
  | 'code';

export type NoteSize = 'compact' | 'normal' | 'expanded';
export type ColorIntensity = 'subtle' | 'medium' | 'intense';
// ========================================

export interface Note {
  id: string; // UUID
  title: string;
  content: string;
  color: string; // Hex color (ej: #3B82F6)
  shape: NoteShape;
  // ========== NUEVAS PROPIEDADES ==========
  icon?: NoteIcon;
  size?: NoteSize;
  colorIntensity?: ColorIntensity;
  // ========================================
  is_favorite: boolean;
  is_archived: boolean;
  tags: string[];
  user_id?: string | null;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  deleted_at?: string | null;
}

export interface NoteCreate {
  title: string;
  content?: string;
  color?: string;
  shape?: NoteShape;
  // ========== NUEVAS PROPIEDADES ==========
  icon?: NoteIcon;
  size?: NoteSize;
  colorIntensity?: ColorIntensity;
  // ========================================
  is_favorite?: boolean;
  is_archived?: boolean;
  tags?: string[];
  user_id?: string;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  color?: string;
  shape?: NoteShape;
  // ========== NUEVAS PROPIEDADES ==========
  icon?: NoteIcon;
  size?: NoteSize;
  colorIntensity?: ColorIntensity;
  // ========================================
  is_favorite?: boolean;
  is_archived?: boolean;
  tags?: string[];
  deleted_at?: string | null;
}

export interface NoteFilters {
  archived?: boolean;
  favorite?: boolean;
  tag?: string;
  search?: string;
  deleted?: boolean;
  shape?: NoteShape;
  // ========== NUEVOS FILTROS ==========
  icon?: NoteIcon;
  size?: NoteSize;
  colorIntensity?: ColorIntensity;
  // ====================================
}

// ========== CONFIGURACIÓN DE ICONOS ==========
export interface IconConfig {
  value: NoteIcon;
  label: string;
  iconName: string;
  color: string;
  description: string;
}

export const NOTE_ICONS: IconConfig[] = [
  { value: 'default', label: 'Predeterminado', iconName: '📄', color: '#6B7280', description: 'Nota estándar' },
  { value: 'task', label: 'Tarea', iconName: '✅', color: '#EF4444', description: 'Pendientes por completar' },
  { value: 'meeting', label: 'Reunión', iconName: '👥', color: '#8B5CF6', description: 'Notas de reuniones' },
  { value: 'important', label: 'Importante', iconName: '⭐', color: '#F59E0B', description: 'Información crítica' },
  { value: 'idea', label: 'Idea', iconName: '💡', color: '#10B981', description: 'Inspiración y creatividad' },
  { value: 'shopping', label: 'Compra', iconName: '🛒', color: '#EC4899', description: 'Listas de compras' },
  { value: 'call', label: 'Llamada', iconName: '📞', color: '#06B6D4', description: 'Llamadas pendientes' },
  { value: 'email', label: 'Email', iconName: '📧', color: '#3B82F6', description: 'Correos importantes' },
  { value: 'document', label: 'Documento', iconName: '📄', color: '#6366F1', description: 'Documentación' },
  { value: 'travel', label: 'Viaje', iconName: '✈️', color: '#14B8A6', description: 'Planes de viaje' },
  { value: 'health', label: 'Salud', iconName: '❤️', color: '#84CC16', description: 'Salud y bienestar' },
  { value: 'book', label: 'Libro', iconName: '📚', color: '#A855F7', description: 'Lecturas y resúmenes' },
  { value: 'code', label: 'Código', iconName: '</>', color: '#1E293B', description: 'Notas de programación' },
];

// Función para obtener configuración de icono
export const getIconConfig = (iconValue?: NoteIcon): IconConfig => {
  if (!iconValue) return NOTE_ICONS[0];
  return NOTE_ICONS.find(icon => icon.value === iconValue) || NOTE_ICONS[0];
};

// ========== CONFIGURACIÓN DE TAMAÑOS ==========
export interface SizeConfig {
  value: NoteSize;
  label: string;
  description: string;
  minHeight: string;
  padding: string;
  titleSize: string;
  contentLines: number;
}

export const NOTE_SIZES: SizeConfig[] = [
  { 
    value: 'compact', 
    label: 'Compacto', 
    description: 'Máxima densidad de información',
    minHeight: '100px',
    padding: 'p-3',
    titleSize: 'text-sm',
    contentLines: 2
  },
  { 
    value: 'normal', 
    label: 'Normal', 
    description: 'Equilibrio entre información y espacio',
    minHeight: '160px',
    padding: 'p-4',
    titleSize: 'text-base',
    contentLines: 3
  },
  { 
    value: 'expanded', 
    label: 'Expandido', 
    description: 'Más espacio para contenido',
    minHeight: '220px',
    padding: 'p-5',
    titleSize: 'text-lg',
    contentLines: 4
  },
];

// Función para obtener configuración de tamaño
export const getSizeConfig = (sizeValue?: NoteSize): SizeConfig => {
  if (!sizeValue) return NOTE_SIZES[1]; // Normal por defecto
  return NOTE_SIZES.find(size => size.value === sizeValue) || NOTE_SIZES[1];
};

// ========== CONFIGURACIÓN DE INTENSIDAD DE COLOR ==========
export interface IntensityConfig {
  value: ColorIntensity;
  label: string;
  bgOpacity: number;
  borderOpacity: number;
  shadowIntensity: number;
  description: string;
}

export const COLOR_INTENSITIES: IntensityConfig[] = [
  { 
    value: 'subtle', 
    label: 'Sutil', 
    bgOpacity: 0.05, 
    borderOpacity: 0.2,
    shadowIntensity: 0.1,
    description: 'Fondo muy suave'
  },
  { 
    value: 'medium', 
    label: 'Medio', 
    bgOpacity: 0.12, 
    borderOpacity: 0.4,
    shadowIntensity: 0.2,
    description: 'Equilibrio perfecto'
  },
  { 
    value: 'intense', 
    label: 'Intenso', 
    bgOpacity: 0.2, 
    borderOpacity: 0.6,
    shadowIntensity: 0.3,
    description: 'Color bien marcado'
  },
];

// Función para obtener configuración de intensidad
export const getIntensityConfig = (intensityValue?: ColorIntensity): IntensityConfig => {
  if (!intensityValue) return COLOR_INTENSITIES[1]; // Medio por defecto
  return COLOR_INTENSITIES.find(intensity => intensity.value === intensityValue) || COLOR_INTENSITIES[1];
};

// ========== FUNCIONES ACTUALIZADAS CON NUEVAS PROPIEDADES ==========

// Función para obtener color con opacidad según intensidad
export const getColorWithOpacity = (color: string, opacity: number = 0.15): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Función para obtener opacidad según intensidad de color
export const getIntensityOpacity = (intensity: ColorIntensity, type: 'bg' | 'border'): number => {
  const config = getIntensityConfig(intensity);
  return type === 'bg' ? config.bgOpacity : config.borderOpacity;
};

// Configuración de formas disponibles
export const NOTE_SHAPES: { value: NoteShape; label: string; icon: string; className: string }[] = [
  { value: 'square', label: 'Cuadrado', icon: '⬛', className: 'rounded-none' },
  { value: 'rounded', label: 'Esquinas redondas', icon: '🟫', className: 'rounded-xl' },
  { value: 'oval', label: 'Ovalado', icon: '🥚', className: 'rounded-full aspect-video' },
  { value: 'pill', label: 'Píldora', icon: '💊', className: 'rounded-full' },
];

// Función para obtener clase de forma CSS (actualizada para soportar todas las formas)
export const getShapeClassName = (shape: NoteShape): string => {
  const shapeConfig = NOTE_SHAPES.find(s => s.value === shape);
  return shapeConfig?.className || NOTE_SHAPES[1].className;
};

// Función para obtener estilos completos de la nota (color + forma + intensidad)
export const getNoteStyle = (
  color: string, 
  shape: NoteShape, 
  intensity: ColorIntensity = 'medium'
): React.CSSProperties => {
  const intensityConfig = getIntensityConfig(intensity);
  const shapeClass = getShapeClassName(shape);
  
  let borderRadius = '0.75rem'; // rounded-xl
  if (shape === 'square') borderRadius = '0';
  if (shape === 'rounded') borderRadius = '0.75rem';
  if (shape === 'oval') borderRadius = '9999px';
  if (shape === 'pill') borderRadius = '9999px';
  
  return {
    backgroundColor: getColorWithOpacity(color, intensityConfig.bgOpacity),
    borderLeft: `4px solid ${getColorWithOpacity(color, intensityConfig.borderOpacity)}`,
    boxShadow: `0 4px 12px ${getColorWithOpacity(color, intensityConfig.shadowIntensity)}`,
    borderRadius,
    transition: 'all 0.3s ease',
  };
};

// Función para obtener estilos en hover (actualizada con intensidad)
export const getNoteHoverStyle = (color: string, intensity: ColorIntensity = 'medium'): React.CSSProperties => {
  const intensityConfig = getIntensityConfig(intensity);
  return {
    boxShadow: `0 8px 24px ${getColorWithOpacity(color, intensityConfig.shadowIntensity + 0.1)}`,
    transform: 'translateY(-2px)',
  };
};

// Colores predefinidos para notas
export const PREDEFINED_COLORS = [
  { name: 'Azul', value: '#3B82F6', bgClass: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-950/30', borderColor: 'border-blue-500' },
  { name: 'Verde', value: '#10B981', bgClass: 'bg-green-500', bgLight: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-green-500' },
  { name: 'Rojo', value: '#EF4444', bgClass: 'bg-red-500', bgLight: 'bg-red-50 dark:bg-red-950/30', borderColor: 'border-red-500' },
  { name: 'Amarillo', value: '#F59E0B', bgClass: 'bg-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-950/30', borderColor: 'border-amber-500' },
  { name: 'Púrpura', value: '#8B5CF6', bgClass: 'bg-purple-500', bgLight: 'bg-purple-50 dark:bg-purple-950/30', borderColor: 'border-purple-500' },
  { name: 'Rosa', value: '#EC4899', bgClass: 'bg-pink-500', bgLight: 'bg-pink-50 dark:bg-pink-950/30', borderColor: 'border-pink-500' },
  { name: 'Celeste', value: '#06B6D4', bgClass: 'bg-cyan-500', bgLight: 'bg-cyan-50 dark:bg-cyan-950/30', borderColor: 'border-cyan-500' },
  { name: 'Naranja', value: '#F97316', bgClass: 'bg-orange-500', bgLight: 'bg-orange-50 dark:bg-orange-950/30', borderColor: 'border-orange-500' },
  { name: 'Gris', value: '#6B7280', bgClass: 'bg-gray-500', bgLight: 'bg-gray-50 dark:bg-gray-800', borderColor: 'border-gray-500' },
  { name: 'Índigo', value: '#6366F1', bgClass: 'bg-indigo-500', bgLight: 'bg-indigo-50 dark:bg-indigo-950/30', borderColor: 'border-indigo-500' },
];

export const NoteUtils = {
  // Crear nota vacía (con valores por defecto de las nuevas propiedades)
  createEmpty: (userId?: string): NoteCreate => ({
    title: '',
    content: '',
    color: '#3B82F6',
    shape: 'rounded',
    icon: 'default',
    size: 'normal',
    colorIntensity: 'medium',
    is_favorite: false,
    is_archived: false,
    tags: [],
    user_id: userId,
  }),

  // Validar nota
  isValid: (note: Partial<Note>): boolean => {
    return !!(note.title && note.title.trim().length > 0);
  },

  // Formatear fecha
  formatDate: (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
  },

  // Obtener título truncado según tamaño
  getTruncatedTitle: (note: Note, maxLength?: number): string => {
    const sizeConfig = getSizeConfig(note.size);
    const limit = maxLength || (note.size === 'compact' ? 30 : note.size === 'normal' ? 50 : 70);
    if (note.title.length <= limit) return note.title;
    return note.title.substring(0, limit) + '...';
  },

  // Obtener contenido truncado según tamaño
  getTruncatedContent: (note: Note, maxLength?: number): string => {
    if (!note.content) return 'Sin contenido';
    const sizeConfig = getSizeConfig(note.size);
    const limit = maxLength || (note.size === 'compact' ? 60 : note.size === 'normal' ? 100 : 150);
    if (note.content.length <= limit) return note.content;
    return note.content.substring(0, limit) + '...';
  },

  // Filtrar notas activas (no eliminadas)
  getActiveNotes: (notes: Note[]): Note[] => {
    return notes.filter(note => !note.deleted_at);
  },

  // Filtrar notas archivadas
  getArchivedNotes: (notes: Note[]): Note[] => {
    return notes.filter(note => note.is_archived && !note.deleted_at);
  },

  // Filtrar notas favoritas
  getFavoriteNotes: (notes: Note[]): Note[] => {
    return notes.filter(note => note.is_favorite && !note.is_archived && !note.deleted_at);
  },

  // Filtrar notas eliminadas
  getDeletedNotes: (notes: Note[]): Note[] => {
    return notes.filter(note => note.deleted_at);
  },

  // Filtrar por forma
  getNotesByShape: (notes: Note[], shape: NoteShape): Note[] => {
    return notes.filter(note => note.shape === shape && !note.deleted_at);
  },

  // Filtrar por icono
  getNotesByIcon: (notes: Note[], icon: NoteIcon): Note[] => {
    return notes.filter(note => note.icon === icon && !note.deleted_at);
  },

  // Filtrar por tamaño
  getNotesBySize: (notes: Note[], size: NoteSize): Note[] => {
    return notes.filter(note => note.size === size && !note.deleted_at);
  },

  // Ordenar por fecha (más reciente primero)
  sortByDate: (notes: Note[]): Note[] => {
    return [...notes].sort((a, b) => 
      new Date(b.updated_at || b.created_at).getTime() - 
      new Date(a.updated_at || a.created_at).getTime()
    );
  },

  // Ordenar por título
  sortByTitle: (notes: Note[]): Note[] => {
    return [...notes].sort((a, b) => a.title.localeCompare(b.title));
  },

  // Buscar notas por texto
  search: (notes: Note[], query: string): Note[] => {
    const lowerQuery = query.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  // Obtener estadísticas (actualizado con nuevas propiedades)
  getStats: (notes: Note[]): {
    total: number;
    active: number;
    archived: number;
    favorite: number;
    deleted: number;
    withTags: number;
    totalTags: number;
    shapesCount: Record<NoteShape, number>;
    iconsCount: Record<NoteIcon, number>;
    sizesCount: Record<NoteSize, number>;
  } => {
    const active = notes.filter(n => !n.deleted_at && !n.is_archived).length;
    const archived = notes.filter(n => n.is_archived && !n.deleted_at).length;
    const favorite = notes.filter(n => n.is_favorite && !n.is_archived && !n.deleted_at).length;
    const deleted = notes.filter(n => n.deleted_at).length;
    const withTags = notes.filter(n => n.tags && n.tags.length > 0).length;
    const totalTags = new Set(notes.flatMap(n => n.tags || [])).size;
    
    // Contar por forma
    const shapesCount = {
      square: notes.filter(n => n.shape === 'square' && !n.deleted_at).length,
      rounded: notes.filter(n => n.shape === 'rounded' && !n.deleted_at).length,
      oval: notes.filter(n => n.shape === 'oval' && !n.deleted_at).length,
      pill: notes.filter(n => n.shape === 'pill' && !n.deleted_at).length,
    };

    // Contar por icono
    const iconsCount = {
      default: notes.filter(n => n.icon === 'default' && !n.deleted_at).length,
      task: notes.filter(n => n.icon === 'task' && !n.deleted_at).length,
      meeting: notes.filter(n => n.icon === 'meeting' && !n.deleted_at).length,
      important: notes.filter(n => n.icon === 'important' && !n.deleted_at).length,
      idea: notes.filter(n => n.icon === 'idea' && !n.deleted_at).length,
      shopping: notes.filter(n => n.icon === 'shopping' && !n.deleted_at).length,
      call: notes.filter(n => n.icon === 'call' && !n.deleted_at).length,
      email: notes.filter(n => n.icon === 'email' && !n.deleted_at).length,
      document: notes.filter(n => n.icon === 'document' && !n.deleted_at).length,
      travel: notes.filter(n => n.icon === 'travel' && !n.deleted_at).length,
      health: notes.filter(n => n.icon === 'health' && !n.deleted_at).length,
      book: notes.filter(n => n.icon === 'book' && !n.deleted_at).length,
      code: notes.filter(n => n.icon === 'code' && !n.deleted_at).length,
    };

    // Contar por tamaño
    const sizesCount = {
      compact: notes.filter(n => n.size === 'compact' && !n.deleted_at).length,
      normal: notes.filter(n => n.size === 'normal' && !n.deleted_at).length,
      expanded: notes.filter(n => n.size === 'expanded' && !n.deleted_at).length,
    };

    return {
      total: notes.length,
      active,
      archived,
      favorite,
      deleted,
      withTags,
      totalTags,
      shapesCount,
      iconsCount,
      sizesCount,
    };
  },

  // Obtener color de texto contrastante (blanco o negro según fondo)
  getContrastColor: (hexColor: string): string => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  },
};