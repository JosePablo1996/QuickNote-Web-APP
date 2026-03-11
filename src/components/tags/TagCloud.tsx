import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TagChip from './TagChip';
import { getTagColor, getTagIcon } from '../../utils/tagUtils';
import { 
  Tag, 
  Hash, 
  Grid3x3, 
  Cloud, 
  Search,
  X,
  TrendingUp,
  Clock,
  Star,
  Filter
} from 'lucide-react';

interface TagCloudProps {
  tags: string[];
  tagCounts?: Record<string, number>;
  onTagTap?: (tag: string) => void;
  onTagDelete?: (tag: string) => void;
  selectedTag?: string | null;
  maxTags?: number;
  showCount?: boolean;
  layout?: 'grid' | 'cloud';
  className?: string;
  showSearch?: boolean;
  onClearSelection?: () => void;
}

// Clases para diferentes tamaños de fuente en modo cloud
const getFontSizeClass = (size: number): string => {
  if (size <= 12) return 'text-xs';
  if (size <= 14) return 'text-sm';
  if (size <= 16) return 'text-base';
  if (size <= 18) return 'text-lg';
  if (size <= 20) return 'text-xl';
  if (size <= 22) return 'text-2xl';
  return 'text-3xl';
};

// Clases para diferentes opacidades
const getOpacityClass = (opacity: number): string => {
  if (opacity >= 0.9) return 'opacity-100';
  if (opacity >= 0.8) return 'opacity-90';
  if (opacity >= 0.7) return 'opacity-80';
  if (opacity >= 0.6) return 'opacity-70';
  return 'opacity-60';
};

const TagCloud: React.FC<TagCloudProps> = ({
  tags,
  tagCounts = {},
  onTagTap,
  onTagDelete,
  selectedTag = null,
  maxTags,
  showCount = true,
  layout = 'cloud',
  className = '',
  showSearch = false,
  onClearSelection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'recent'>('count');
  const [showFilters, setShowFilters] = useState(false);

  // Procesar y ordenar tags
  const processedTags = useMemo(() => {
    let filteredTags = [...tags];

    // Aplicar búsqueda
    if (searchTerm) {
      filteredTags = filteredTags.filter(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    if (sortBy === 'name') {
      filteredTags.sort((a, b) => a.localeCompare(b));
    } else if (sortBy === 'count') {
      filteredTags.sort((a, b) => {
        const countA = tagCounts[a] || 0;
        const countB = tagCounts[b] || 0;
        if (countB !== countA) return countB - countA;
        return a.localeCompare(b);
      });
    }

    // Limitar cantidad si es necesario
    if (maxTags) {
      filteredTags = filteredTags.slice(0, maxTags);
    }

    return filteredTags;
  }, [tags, tagCounts, searchTerm, sortBy, maxTags]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalTags = tags.length;
    const totalWithCounts = Object.keys(tagCounts).length;
    const mostUsed = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);
    
    return { totalTags, totalWithCounts, mostUsed };
  }, [tags, tagCounts]);

  // Calcular tamaño de fuente basado en frecuencia (para layout cloud)
  const getTagSize = (tag: string): number => {
    if (layout !== 'cloud') return 14;

    const count = tagCounts[tag] || 1;
    const maxCount = Math.max(...Object.values(tagCounts), 1);
    
    // Escalar entre 12px y 24px
    const minSize = 12;
    const maxSize = 24;
    const scale = (count / maxCount);
    return Math.round(minSize + (maxSize - minSize) * scale);
  };

  // Calcular opacidad basada en frecuencia
  const getTagOpacity = (tag: string): number => {
    if (layout !== 'cloud') return 1;

    const count = tagCounts[tag] || 1;
    const maxCount = Math.max(...Object.values(tagCounts), 1);
    
    // Opacidad entre 0.6 y 1
    const minOpacity = 0.6;
    const maxOpacity = 1;
    const scale = (count / maxCount);
    return minOpacity + (maxOpacity - minOpacity) * scale;
  };

  if (processedTags.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-20" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
            <Tag className="w-12 h-12 text-purple-500/60" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          No hay etiquetas
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
          {searchTerm 
            ? `No se encontraron etiquetas que coincidan con "${searchTerm}"`
            : 'Las etiquetas aparecerán aquí cuando las agregues a una nota desde el formulario de creación.'
          }
        </p>

        {searchTerm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSearchTerm('')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            <span>Limpiar búsqueda</span>
          </motion.button>
        )}
      </motion.div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estadísticas y filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl border border-white/20">
            <Hash className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {stats.totalTags} etiquetas
            </span>
          </div>
          
          {stats.mostUsed.length > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Más usada: #{stats.mostUsed[0]}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de layout */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortBy('count')}
              className={`p-2 rounded-lg transition-all ${
                sortBy === 'count'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              title="Ordenar por frecuencia"
            >
              <TrendingUp className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortBy('name')}
              className={`p-2 rounded-lg transition-all ${
                sortBy === 'name'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              title="Ordenar alfabéticamente"
            >
              <Filter className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Selector de layout */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => layout === 'cloud' ? null : null}
              className={`p-2 rounded-lg transition-all ${
                layout === 'cloud'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              title="Vista nube"
            >
              <Cloud className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => layout === 'grid' ? null : null}
              className={`p-2 rounded-lg transition-all ${
                layout === 'grid'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              title="Vista cuadrícula"
            >
              <Grid3x3 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar etiquetas..."
            className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-4 h-4 text-gray-400" />
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Etiqueta seleccionada */}
      {selectedTag && onClearSelection && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Filtrando por etiqueta:
            </span>
            <TagChip
              tagName={selectedTag}
              count={tagCounts[selectedTag]}
              size="sm"
              clickable={false}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearSelection}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Limpiar filtro"
          >
            <X className="w-4 h-4 text-gray-500" />
          </motion.button>
        </motion.div>
      )}

      {/* Layout tipo grid */}
      {layout === 'grid' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        >
          <AnimatePresence>
            {processedTags.map((tag, index) => {
              const tagIcon = getTagIcon(tag);
              
              return (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div
                    className="relative p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => onTagTap?.(tag)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <span className="text-lg">{tagIcon || '🏷️'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          #{tag}
                        </p>
                        {showCount && tagCounts[tag] !== undefined && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {tagCounts[tag]} nota{tagCounts[tag] !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {onTagDelete && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTagDelete(tag);
                        }}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar etiqueta"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Layout tipo nube */}
      {layout === 'cloud' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-3 justify-center items-center p-6 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 min-h-[200px]"
        >
          <AnimatePresence>
            {processedTags.map((tag, index) => {
              const fontSize = getTagSize(tag);
              const opacity = getTagOpacity(tag);
              const fontSizeClass = getFontSizeClass(fontSize);
              const opacityClass = getOpacityClass(opacity);
              
              return (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ 
                    delay: index * 0.03,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                  className={`${fontSizeClass} ${opacityClass} transition-all hover:scale-110 hover:z-10`}
                >
                  <TagChip
                    tagName={tag}
                    count={showCount ? tagCounts[tag] : undefined}
                    onTap={onTagTap ? () => onTagTap(tag) : undefined}
                    onDelete={onTagDelete ? () => onTagDelete(tag) : undefined}
                    isSelected={selectedTag === tag}
                    showIcon
                    size="md"
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Footer con resumen */}
      {processedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 pt-4 text-sm text-gray-500 dark:text-gray-400"
        >
          <div className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            <span>{processedTags.length} de {tags.length} etiquetas</span>
          </div>
          
          {Object.keys(tagCounts).length > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>Total: {Object.values(tagCounts).reduce((a, b) => a + b, 0)} usos</span>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TagCloud;