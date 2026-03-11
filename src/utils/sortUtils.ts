import { Note } from '../models/Note';

export type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'favorites' | 'updated';

export interface SortConfig {
  option: SortOption;
  label: string;
  icon: React.ReactNode;
}

export const sortOptions: Record<SortOption, { label: string; compare: (a: Note, b: Note) => number }> = {
  newest: {
    label: 'Más recientes primero',
    compare: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  },
  oldest: {
    label: 'Más antiguas primero',
    compare: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  },
  'title-asc': {
    label: 'Título (A-Z)',
    compare: (a, b) => a.title.localeCompare(b.title)
  },
  'title-desc': {
    label: 'Título (Z-A)',
    compare: (a, b) => b.title.localeCompare(a.title)
  },
  favorites: {
    label: 'Favoritas primero',
    compare: (a, b) => {
      if (a.is_favorite === b.is_favorite) return 0;
      return a.is_favorite ? -1 : 1;
    }
  },
  updated: {
    label: 'Última actualización',
    compare: (a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
  }
};

export const getSortedNotes = (notes: Note[], sortOption: SortOption): Note[] => {
  const sorter = sortOptions[sortOption];
  if (!sorter) return notes;
  return [...notes].sort(sorter.compare);
};

// Función para obtener el icono según la opción de ordenamiento
export const getSortIcon = (option: SortOption): string => {
  switch (option) {
    case 'newest':
      return '⬇️';
    case 'oldest':
      return '⬆️';
    case 'title-asc':
      return '🔤';
    case 'title-desc':
      return '🔠';
    case 'favorites':
      return '⭐';
    case 'updated':
      return '🔄';
    default:
      return '📅';
  }
};