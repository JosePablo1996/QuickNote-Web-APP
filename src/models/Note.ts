// src/models/Note.ts

export type NoteShape = 'square' | 'rounded' | 'oval' | 'pill';

export interface Note {
  id: string; // UUID
  title: string;
  content: string;
  color: string; // Hex color (ej: #3B82F6)
  shape: NoteShape; // Nueva propiedad para la forma de la nota
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
  shape?: NoteShape; // Nueva propiedad
  is_favorite?: boolean;
  is_archived?: boolean;
  tags?: string[];
  user_id?: string;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  color?: string;
  shape?: NoteShape; // Nueva propiedad
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
  shape?: NoteShape; // Filtrar por forma
}

// Configuración de formas disponibles
export const NOTE_SHAPES: { value: NoteShape; label: string; icon: string; className: string }[] = [
  { 
    value: 'square', 
    label: 'Cuadrado', 
    icon: '⬛', 
    className: 'rounded-none' 
  },
  { 
    value: 'rounded', 
    label: 'Esquinas redondas', 
    icon: '🟫', 
    className: 'rounded-xl' 
  },
  { 
    value: 'oval', 
    label: 'Ovalado', 
    icon: '🥚', 
    className: 'rounded-full aspect-video' 
  },
  { 
    value: 'pill', 
    label: 'Píldora', 
    icon: '💊', 
    className: 'rounded-full' 
  },
];

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

// Función para obtener color con opacidad (para fondos suaves)
export const getColorWithOpacity = (color: string, opacity: number = 0.15): string => {
  // Convertir hex a RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Función para obtener clase de forma CSS
export const getShapeClassName = (shape: NoteShape): string => {
  const shapeConfig = NOTE_SHAPES.find(s => s.value === shape);
  return shapeConfig?.className || NOTE_SHAPES[1].className; // Por defecto 'rounded'
};

// Función para obtener estilos completos de la nota (color + forma)
export const getNoteStyle = (color: string, shape: NoteShape): React.CSSProperties => {
  return {
    backgroundColor: getColorWithOpacity(color, 0.15),
    borderLeft: `4px solid ${color}`,
    boxShadow: `0 4px 12px ${getColorWithOpacity(color, 0.3)}`,
    transition: 'all 0.3s ease',
  };
};

// Función para obtener estilos en hover
export const getNoteHoverStyle = (color: string): React.CSSProperties => {
  return {
    boxShadow: `0 8px 24px ${getColorWithOpacity(color, 0.4)}`,
    transform: 'translateY(-2px)',
  };
};

export const NoteUtils = {
  // Crear nota vacía (ahora con forma por defecto)
  createEmpty: (userId?: string): NoteCreate => ({
    title: '',
    content: '',
    color: '#3B82F6',
    shape: 'rounded', // Forma por defecto: esquinas redondas
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

  // Obtener título truncado
  getTruncatedTitle: (note: Note, maxLength: number = 50): string => {
    if (note.title.length <= maxLength) return note.title;
    return note.title.substring(0, maxLength) + '...';
  },

  // Obtener contenido truncado
  getTruncatedContent: (note: Note, maxLength: number = 100): string => {
    if (!note.content) return 'Sin contenido';
    if (note.content.length <= maxLength) return note.content;
    return note.content.substring(0, maxLength) + '...';
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

  // Obtener estadísticas (actualizado con forma)
  getStats: (notes: Note[]): {
    total: number;
    active: number;
    archived: number;
    favorite: number;
    deleted: number;
    withTags: number;
    totalTags: number;
    shapesCount: Record<NoteShape, number>;
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

    return {
      total: notes.length,
      active,
      archived,
      favorite,
      deleted,
      withTags,
      totalTags,
      shapesCount,
    };
  },

  // Obtener color de texto contrastante (blanco o negro según fondo)
  getContrastColor: (hexColor: string): string => {
    // Convertir hex a RGB
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Calcular luminancia
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  },
};