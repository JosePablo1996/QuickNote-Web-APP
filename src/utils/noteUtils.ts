import { Note } from '../models/Note';

// Formatear fecha para mostrar
export const formatDateTime = (date: string | Date | undefined): string => {
  if (!date) return 'Fecha desconocida';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Obtener color de la nota (con fallback)
export const getNoteColorValue = (note: Note): string => {
  return note.color || '#3B82F6';
};

// Obtener iniciales del título
export const getInitials = (title: string): string => {
  if (!title) return '?';
  
  const words = title.trim().split(' ');
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Truncar texto con límite de caracteres
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Obtener fecha formateada para comparación
export const getISODateString = (date: string | Date | undefined): string => {
  if (!date) return new Date().toISOString();
  if (typeof date === 'string') return date;
  return date.toISOString();
};

// Verificar si una nota está en la papelera
export const isNoteInTrash = (note: Note): boolean => {
  return !!note.deleted_at;
};

// Verificar si una nota está archivada
export const isNoteArchived = (note: Note): boolean => {
  return !!note.is_archived;
};

// Verificar si una nota es favorita
export const isNoteFavorite = (note: Note): boolean => {
  return !!note.is_favorite;
};

// Obtener color de fondo según el color de la nota
export const getNoteBackgroundColor = (note: Note, opacity: number = 0.1): string => {
  const color = getNoteColorValue(note);
  // Convertir color hex a rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Convertir string hex a número para operaciones aritméticas
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Obtener color de texto contrastante (blanco o negro) según el color de fondo
export const getContrastTextColor = (backgroundColor: string): string => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#000000';
  
  // Calcular luminancia (fórmula W3C)
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Ordenar notas por fecha (más recientes primero)
export const sortNotesByDate = (notes: Note[]): Note[] => {
  return [...notes].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at || '').getTime();
    const dateB = new Date(b.updated_at || b.created_at || '').getTime();
    return dateB - dateA;
  });
};

// Ordenar notas por fecha (más antiguas primero)
export const sortNotesByDateAsc = (notes: Note[]): Note[] => {
  return [...notes].sort((a, b) => {
    const dateA = new Date(a.created_at || '').getTime();
    const dateB = new Date(b.created_at || '').getTime();
    return dateA - dateB;
  });
};

// Ordenar notas por título
export const sortNotesByTitle = (notes: Note[], ascending: boolean = true): Note[] => {
  return [...notes].sort((a, b) => {
    const comparison = a.title.localeCompare(b.title);
    return ascending ? comparison : -comparison;
  });
};

// Ordenar notas por favoritos primero
export const sortNotesByFavorite = (notes: Note[]): Note[] => {
  return [...notes].sort((a, b) => {
    if (a.is_favorite === b.is_favorite) return 0;
    return a.is_favorite ? -1 : 1;
  });
};

// Ordenar notas por última actualización
export const sortNotesByUpdated = (notes: Note[]): Note[] => {
  return [...notes].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at || '').getTime();
    const dateB = new Date(b.updated_at || b.created_at || '').getTime();
    return dateB - dateA;
  });
};

// Filtrar notas por etiqueta
export const filterNotesByTag = (notes: Note[], tag: string): Note[] => {
  if (!tag) return notes;
  return notes.filter(note => note.tags?.includes(tag));
};

// Filtrar notas activas (no eliminadas, no archivadas)
export const filterActiveNotes = (notes: Note[]): Note[] => {
  return notes.filter(note => !note.deleted_at && !note.is_archived);
};

// Filtrar notas archivadas
export const filterArchivedNotes = (notes: Note[]): Note[] => {
  return notes.filter(note => note.is_archived && !note.deleted_at);
};

// Filtrar notas favoritas
export const filterFavoriteNotes = (notes: Note[]): Note[] => {
  return notes.filter(note => note.is_favorite && !note.deleted_at && !note.is_archived);
};

// Filtrar notas eliminadas
export const filterDeletedNotes = (notes: Note[]): Note[] => {
  return notes.filter(note => note.deleted_at);
};

// Buscar notas por término
export const searchNotesByTerm = (notes: Note[], term: string): Note[] => {
  if (!term.trim()) return notes;
  
  const lowerTerm = term.toLowerCase();
  return notes.filter(note => 
    note.title.toLowerCase().includes(lowerTerm) ||
    note.content.toLowerCase().includes(lowerTerm) ||
    note.tags?.some(tag => tag.toLowerCase().includes(lowerTerm))
  );
};

// Obtener estadísticas de notas
export const getNotesStats = (notes: Note[]): {
  total: number;
  active: number;
  archived: number;
  favorite: number;
  deleted: number;
  withTags: number;
  totalTags: number;
} => {
  const active = notes.filter(n => !n.deleted_at && !n.is_archived).length;
  const archived = notes.filter(n => n.is_archived && !n.deleted_at).length;
  const favorite = notes.filter(n => n.is_favorite && !n.is_archived && !n.deleted_at).length;
  const deleted = notes.filter(n => n.deleted_at).length;
  const withTags = notes.filter(n => n.tags && n.tags.length > 0).length;
  const totalTags = new Set(notes.flatMap(n => n.tags || [])).size;

  return {
    total: notes.length,
    active,
    archived,
    favorite,
    deleted,
    withTags,
    totalTags,
  };
};