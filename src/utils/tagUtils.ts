import { TAG_COLORS, TAG_ICONS, DEFAULT_COLORS } from './constants';
import { Note } from '../models/Note';

// ============================================
// COLORES DE ETIQUETAS
// ============================================

export const getTagColor = (tagName: string): string => {
  const lowerTag = tagName.toLowerCase();
  
  if (TAG_COLORS[lowerTag]) {
    return TAG_COLORS[lowerTag];
  }
  
  const hash = lowerTag.split('').reduce((acc: number, char: string) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const index = Math.abs(hash) % DEFAULT_COLORS.length;
  return DEFAULT_COLORS[index];
};

export const getTagBackgroundColor = (tagName: string, opacity: number = 0.1): string => {
  const color = getTagColor(tagName);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getTagGradient = (tagName: string): string => {
  const color = getTagColor(tagName);
  // Mapeo de colores a gradientes
  const gradientMap: Record<string, string> = {
    '#3B82F6': 'from-blue-500 to-blue-600',
    '#EF4444': 'from-red-500 to-red-600',
    '#10B981': 'from-green-500 to-green-600',
    '#F59E0B': 'from-orange-500 to-orange-600',
    '#8B5CF6': 'from-purple-500 to-purple-600',
    '#14B8A6': 'from-teal-500 to-teal-600',
    '#EC4899': 'from-pink-500 to-pink-600',
    '#6366F1': 'from-indigo-500 to-indigo-600',
  };
  return gradientMap[color] || 'from-gray-500 to-gray-600';
};

export const getTagIcon = (tagName: string): string | null => {
  const lowerTag = tagName.toLowerCase();
  return TAG_ICONS[lowerTag] || null;
};

// ============================================
// EXTRACCIÓN DE ETIQUETAS
// ============================================

export const extractTagsFromContent = (content: string): string[] => {
  const regex = /#(\w+)/g;
  const matches = content.match(regex);
  return matches 
    ? matches.map(match => match.substring(1).toLowerCase())
    : [];
};

export const extractTagsFromTitle = (title: string): string[] => {
  const regex = /#(\w+)/g;
  const matches = title.match(regex);
  return matches 
    ? matches.map(match => match.substring(1).toLowerCase())
    : [];
};

// ============================================
// MANIPULACIÓN DE ETIQUETAS
// ============================================

export const removeDuplicateTags = (tags: string[]): string[] => {
  return [...new Set(tags)];
};

export const sortTagsAlphabetically = (tags: string[]): string[] => {
  return tags.sort((a: string, b: string) => a.localeCompare(b));
};

export const sortTagsByFrequency = (
  tags: string[],
  tagCounts: Record<string, number>
): string[] => {
  return [...tags].sort((a: string, b: string) => {
    const countA = tagCounts[a] || 0;
    const countB = tagCounts[b] || 0;
    return countB - countA;
  });
};

export const normalizeTag = (tag: string): string => {
  return tag.trim().toLowerCase();
};

export const isValidTag = (tag: string): boolean => {
  const normalized = normalizeTag(tag);
  return normalized.length > 0 && normalized.length <= 30 && /^[a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ\s]+$/.test(normalized);
};

// ============================================
// ESTADÍSTICAS DE ETIQUETAS
// ============================================

export const getTagStatsFromNotes = (notes: Note[]): Array<{
  name: string;
  count: number;
  color: string;
  icon: string | null;
  gradient: string;
}> => {
  const tagMap = new Map<string, number>();
  
  notes.forEach((note: Note) => {
    const noteTags = note.tags || [];
    noteTags.forEach((tag: string) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      color: getTagColor(name),
      icon: getTagIcon(name),
      gradient: getTagGradient(name),
    }))
    .sort((a, b) => b.count - a.count);
};

export const getMostUsedTags = (
  notes: Note[],
  limit: number = 10
): Array<{ name: string; count: number }> => {
  const stats = getTagStatsFromNotes(notes);
  return stats.slice(0, limit).map(({ name, count }) => ({ name, count }));
};

export const getRelatedTags = (
  notes: Note[],
  targetTag: string,
  limit: number = 5
): Array<{ name: string; count: number }> => {
  const relatedMap = new Map<string, number>();
  
  notes.forEach((note: Note) => {
    const noteTags = note.tags || [];
    if (noteTags.includes(targetTag)) {
      noteTags.forEach((tag: string) => {
        if (tag !== targetTag) {
          relatedMap.set(tag, (relatedMap.get(tag) || 0) + 1);
        }
      });
    }
  });

  return Array.from(relatedMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const suggestTags = (
  text: string,
  existingTags: string[],
  limit: number = 5
): string[] => {
  const words = text.toLowerCase().split(/\s+/);
  const suggestions = new Set<string>();
  
  words.forEach((word: string) => {
    existingTags.forEach((tag: string) => {
      if (tag.includes(word) || word.includes(tag)) {
        suggestions.add(tag);
      }
    });

    if (word.length > 2 && !existingTags.includes(word) && isValidTag(word)) {
      suggestions.add(word);
    }
  });

  return Array.from(suggestions).slice(0, limit);
};

export const getPopularTags = (
  notes: Note[],
  limit: number = 10
): string[] => {
  const stats = getTagStatsFromNotes(notes);
  return stats.slice(0, limit).map(stat => stat.name);
};

// ============================================
// FORMATO PARA VISUALIZACIÓN
// ============================================

export const formatTagForDisplay = (tag: string): string => {
  return `#${tag}`;
};

export const formatTagsForDisplay = (tags: string[], limit?: number): string => {
  const displayTags = limit ? tags.slice(0, limit) : tags;
  const formatted = displayTags.map(t => `#${t}`).join(' ');
  
  if (limit && tags.length > limit) {
    return `${formatted} +${tags.length - limit}`;
  }
  
  return formatted;
};

export const getTagCloudData = (
  notes: Note[],
  maxTags: number = 30
): Array<{ name: string; count: number; size: number; color: string; icon: string | null }> => {
  const stats = getTagStatsFromNotes(notes);
  const maxCount = Math.max(...stats.map(s => s.count), 1);
  
  return stats
    .slice(0, maxTags)
    .map(stat => ({
      name: stat.name,
      count: stat.count,
      size: 12 + (stat.count / maxCount) * 12, // Tamaño entre 12 y 24px
      color: stat.color,
      icon: stat.icon,
    }))
    .sort((a, b) => b.count - a.count);
};

export default {
  getTagColor,
  getTagBackgroundColor,
  getTagGradient,
  getTagIcon,
  extractTagsFromContent,
  extractTagsFromTitle,
  removeDuplicateTags,
  sortTagsAlphabetically,
  sortTagsByFrequency,
  normalizeTag,
  isValidTag,
  getTagStatsFromNotes,
  getMostUsedTags,
  getRelatedTags,
  suggestTags,
  getPopularTags,
  formatTagForDisplay,
  formatTagsForDisplay,
  getTagCloudData,
};