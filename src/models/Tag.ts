// src/models/Tag.ts

export interface Tag {
  name: string;
  count?: number;
  color?: string;
  icon?: string;
  created_at?: string;
}

export interface TagStats {
  name: string;
  count: number;
  color: string;
  icon: string | null;
}

// Colores predefinidos para etiquetas comunes - CORREGIDO (eliminados duplicados)
export const TAG_COLORS: Record<string, string> = {
  personal: '#3B82F6', // blue
  trabajo: '#F59E0B',   // orange
  estudio: '#10B981',   // green
  compras: '#8B5CF6',   // purple
  ideas: '#EC4899',     // pink
  proyecto: '#14B8A6',  // teal
  urgente: '#EF4444',   // red
  salud: '#EC4899',     // pink
  viajes: '#6366F1',    // indigo
  hogar: '#8B5CF6',     // purple
  tecnología: '#3B82F6', // blue
  finanzas: '#10B981',   // green
  deportes: '#F59E0B',   // orange
  música: '#8B5CF6',     // purple
  lectura: '#6366F1',    // indigo
  universidad: '#8B5CF6', // purple
  recordatorio: '#EC4899', // pink
  cumpleaños: '#F59E0B', // orange
  reunión: '#6366F1',    // indigo
  tarea: '#10B981',      // green
};

// Iconos para etiquetas comunes - CORREGIDO (eliminados duplicados)
export const TAG_ICONS: Record<string, string> = {
  personal: '👤',
  trabajo: '💼',
  estudio: '📚',
  compras: '🛒',
  ideas: '💡',
  proyecto: '📊',
  urgente: '⚠️',
  salud: '❤️',
  viajes: '✈️',
  hogar: '🏠',
  tecnología: '💻',
  finanzas: '💰',
  deportes: '⚽',
  música: '🎵',
  lectura: '📖',
  universidad: '🎓',
  recordatorio: '⏰',
  cumpleaños: '🎂',
  reunión: '🤝',
  tarea: '✅',
};

// Colores por defecto para etiquetas no definidas
export const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // orange
  '#8B5CF6', // purple
  '#14B8A6', // teal
  '#EC4899', // pink
  '#6366F1', // indigo
  '#F97316', // orange
  '#06B6D4', // cyan
  '#D946EF', // fuchsia
  '#84CC16', // lime
];

export const TagUtils = {
  // Obtener color basado en el nombre de la etiqueta
  getColor: (tagName: string): string => {
    const lowerTag = tagName.toLowerCase();
    
    // Buscar en colores predefinidos
    if (TAG_COLORS[lowerTag]) {
      return TAG_COLORS[lowerTag];
    }
    
    // Si no está predefinido, generar color basado en hash
    const hash = lowerTag.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const index = Math.abs(hash) % DEFAULT_COLORS.length;
    return DEFAULT_COLORS[index];
  },

  // Obtener icono basado en el nombre de la etiqueta
  getIcon: (tagName: string): string | null => {
    const lowerTag = tagName.toLowerCase();
    return TAG_ICONS[lowerTag] || null;
  },

  // Extraer etiquetas del contenido (formato #etiqueta)
  extractFromContent: (content: string): string[] => {
    const regex = /#(\w+)/g;
    const matches = content.match(regex);
    return matches 
      ? matches.map(match => match.substring(1).toLowerCase())
      : [];
  },

  // Eliminar duplicados
  removeDuplicates: (tags: string[]): string[] => {
    return [...new Set(tags)];
  },

  // Ordenar alfabéticamente
  sortAlphabetically: (tags: string[]): string[] => {
    return tags.sort((a, b) => a.localeCompare(b));
  },

  // Ordenar por frecuencia (mayor a menor)
  sortByFrequency: (tags: string[], tagCounts: Record<string, number>): string[] => {
    return [...tags].sort((a, b) => {
      const countA = tagCounts[a] || 0;
      const countB = tagCounts[b] || 0;
      return countB - countA;
    });
  },

  // Obtener estadísticas de etiquetas desde una lista de notas
  getStatsFromNotes: (notes: Array<{ tags: string[] }>): TagStats[] => {
    const tagMap = new Map<string, number>();
    
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        color: TagUtils.getColor(name),
        icon: TagUtils.getIcon(name),
      }))
      .sort((a, b) => b.count - a.count);
  },

  // Sugerir etiquetas basadas en texto
  suggestTags: (text: string, existingTags: string[], limit: number = 5): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    const suggestions = new Set<string>();
    
    words.forEach(word => {
      // Buscar coincidencias con etiquetas existentes
      existingTags.forEach(tag => {
        if (tag.includes(word) || word.includes(tag)) {
          suggestions.add(tag);
        }
      });

      // Si la palabra parece una etiqueta potencial
      if (word.length > 2 && !existingTags.includes(word)) {
        suggestions.add(word);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  },

  // Obtener todas las etiquetas únicas de las notas
  getAllUniqueTags: (notes: Array<{ tags: string[] }>): string[] => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  },

  // Obtener nube de etiquetas con tamaños
  getTagCloud: (notes: Array<{ tags: string[] }>, maxTags: number = 30): Array<{ name: string; count: number; size: number; color: string }> => {
    const stats = TagUtils.getStatsFromNotes(notes);
    const maxCount = Math.max(...stats.map(s => s.count), 1);
    
    return stats
      .slice(0, maxTags)
      .map(stat => ({
        name: stat.name,
        count: stat.count,
        size: 12 + (stat.count / maxCount) * 12, // Tamaño entre 12 y 24px
        color: stat.color,
      }))
      .sort((a, b) => b.count - a.count);
  },
};

export default TagUtils;