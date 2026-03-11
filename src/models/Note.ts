export interface Note {
  id: string; // UUID
  title: string;
  content: string;
  color: string; // Hex color
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
  is_favorite?: boolean;
  is_archived?: boolean;
  tags?: string[];
  user_id?: string;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  color?: string;
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
}

export const NoteUtils = {
  // Crear nota vacía
  createEmpty: (userId?: string): NoteCreate => ({
    title: '',
    content: '',
    color: '#3B82F6',
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

  // Obtener estadísticas
  getStats: (notes: Note[]): {
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
  },
};