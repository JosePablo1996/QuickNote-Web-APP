import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useNotes } from '../hooks/useNotes';
import { useToast } from '../hooks/useToast';
import { TagStats } from '../models/Tag';
import { getTagStatsFromNotes, getTagColor } from '../utils/tagUtils'; // Eliminado getTagIcon
import TagCloud from '../components/tags/TagCloud';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Tag,
  Search,
  X,
  Grid3x3,
  Cloud,
  Edit,
  Trash2,
  Check,
  Merge,
  Download,
  Hash,
  TrendingUp,
  Info
} from 'lucide-react'; // Eliminados Sparkles, Zap, AlertCircle

const TagsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { success, error: showError } = useToast();
  const { notes, updateNote } = useNotes();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<'lista' | 'nube'>('lista');
  const [tagStats, setTagStats] = useState<TagStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [targetMergeTag, setTargetMergeTag] = useState<string>('');
  
  // Usar ref para controlar el montaje
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadTagStats = useCallback(() => {
    setIsLoading(true);
    try {
      // Filtrar SOLO notas activas (no archivadas, no eliminadas)
      const activeNotes = notes.filter(note => 
        !note.is_archived && !note.deleted_at
      );
      
      console.log('📊 Notas activas para estadísticas:', activeNotes.length);
      
      const notesWithTags = activeNotes.filter(note => 
        note.tags && Array.isArray(note.tags) && note.tags.length > 0
      );
      
      console.log('🏷️ Notas con etiquetas:', notesWithTags.length);
      
      if (notesWithTags.length === 0) {
        setTagStats([]);
        setIsLoading(false);
        return;
      }

      const stats = getTagStatsFromNotes(activeNotes);
      console.log('📊 Estadísticas de etiquetas:', stats);
      setTagStats(stats);
    } catch (error) {
      console.error('Error cargando estadísticas de etiquetas:', error);
      setTagStats([]);
    } finally {
      setIsLoading(false);
    }
  }, [notes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        loadTagStats();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [loadTagStats, notes]);

  const filteredTags = tagStats.filter(stat =>
    stat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTagClick = (tagName: string) => {
    navigate(`/tags/${encodeURIComponent(tagName)}`);
  };

  const handleEditTag = async (oldName: string, newName: string) => {
    if (oldName === newName || !newName.trim()) {
      setEditingTag(null);
      setNewTagName('');
      return;
    }

    setIsProcessing(true);
    const trimmedNewName = newName.trim().toLowerCase();
    
    const activeNotes = notes.filter(note => !note.is_archived && !note.deleted_at);
    const notesWithTag = activeNotes.filter(note => 
      note.tags && Array.isArray(note.tags) && note.tags.includes(oldName)
    );
    
    try {
      let successCount = 0;
      for (const note of notesWithTag) {
        if (!note.tags) continue;
        
        const newTags = note.tags.map(t => t === oldName ? trimmedNewName : t);
        const updated = await updateNote(note.id, { tags: newTags });
        if (updated) successCount++;
      }

      if (isMountedRef.current) {
        if (successCount === notesWithTag.length) {
          success(`✅ Etiqueta renombrada: ${oldName} → ${trimmedNewName} (${successCount} notas)`);
        } else {
          showError(`⚠️ Solo se renombraron ${successCount} de ${notesWithTag.length} notas`);
        }
        setEditingTag(null);
        setNewTagName('');
        loadTagStats();
      }
    } catch (err) {
      if (isMountedRef.current) {
        showError('Error al renombrar la etiqueta');
      }
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const handleDeleteTag = async (tagName: string) => {
    const activeNotes = notes.filter(note => !note.is_archived && !note.deleted_at);
    const notesWithTag = activeNotes.filter(note => 
      note.tags && Array.isArray(note.tags) && note.tags.includes(tagName)
    );
    
    if (window.confirm(`¿Eliminar la etiqueta "${tagName}" de ${notesWithTag.length} notas?`)) {
      setIsProcessing(true);
      try {
        let successCount = 0;
        for (const note of notesWithTag) {
          if (!note.tags) continue;
          
          const newTags = note.tags.filter(t => t !== tagName);
          const updated = await updateNote(note.id, { tags: newTags });
          if (updated) successCount++;
        }

        if (isMountedRef.current) {
          if (successCount === notesWithTag.length) {
            success(`🗑️ Etiqueta "${tagName}" eliminada de ${successCount} notas`);
          } else {
            showError(`⚠️ Solo se eliminó de ${successCount} de ${notesWithTag.length} notas`);
          }
          loadTagStats();
        }
      } catch (err) {
        if (isMountedRef.current) {
          showError('Error al eliminar la etiqueta');
        }
      } finally {
        if (isMountedRef.current) {
          setIsProcessing(false);
        }
      }
    }
  };

  const handleMergeTags = async () => {
    if (selectedTags.size < 2) {
      showError('Selecciona al menos dos etiquetas para combinar');
      return;
    }

    setShowMergeDialog(true);
  };

  const handleConfirmMerge = async () => {
    if (!targetMergeTag) return;

    setIsProcessing(true);
    const sourceTags = Array.from(selectedTags).filter(t => t !== targetMergeTag);
    const activeNotes = notes.filter(note => !note.is_archived && !note.deleted_at);
    
    try {
      let successCount = 0;
      let totalNotesToUpdate = 0;

      for (const sourceTag of sourceTags) {
        const notesWithSource = activeNotes.filter(note => 
          note.tags && Array.isArray(note.tags) && note.tags.includes(sourceTag)
        );
        
        totalNotesToUpdate += notesWithSource.length;

        for (const note of notesWithSource) {
          if (!note.tags) continue;
          
          const newTags = [
            ...note.tags.filter(t => !sourceTags.includes(t) && t !== sourceTag),
            targetMergeTag
          ];
          const updated = await updateNote(note.id, { tags: newTags });
          if (updated) successCount++;
        }
      }

      if (isMountedRef.current) {
        success(`🔄 Etiquetas combinadas correctamente (${successCount} notas actualizadas)`);
        setSelectedTags(new Set());
        setIsSelectionMode(false);
        setShowMergeDialog(false);
        setTargetMergeTag('');
        loadTagStats();
      }
    } catch (err) {
      if (isMountedRef.current) {
        showError('Error al combinar etiquetas');
      }
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const toggleTagSelection = (tagName: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagName)) {
        newSet.delete(tagName);
        if (newSet.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        newSet.add(tagName);
        setIsSelectionMode(true);
      }
      return newSet;
    });
  };

  const handleExportTags = () => {
    const tagsData = tagStats.map(stat => ({
      name: stat.name,
      count: stat.count,
      color: stat.color,
      icon: stat.icon
    }));
    
    const dataStr = JSON.stringify(tagsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tags_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    success(`📥 Exportadas ${tagStats.length} etiquetas`);
  };

  if (isLoading && tagStats.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando etiquetas..." />
      </div>
    );
  }

  const totalUses = tagStats.reduce((acc, stat) => acc + stat.count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header con estilo glass */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/notes')}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                disabled={isProcessing}
                aria-label="Volver a notas"
                title="Volver a notas"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Gestión de Etiquetas
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Botón de exportar */}
              {tagStats.length > 0 && !isSelectionMode && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportTags}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={isProcessing}
                  aria-label="Exportar etiquetas"
                  title="Exportar etiquetas"
                >
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              )}

              {/* Botón de combinación en modo selección */}
              {isSelectionMode && selectedTags.size >= 2 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMergeTags}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  aria-label="Combinar etiquetas seleccionadas"
                  title="Combinar etiquetas"
                >
                  <Merge className="w-4 h-4" />
                  <span>Combinar ({selectedTags.size})</span>
                </motion.button>
              )}

              {/* Botón de selección múltiple */}
              {tagStats.length > 0 && !isSelectionMode && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSelectionMode(true)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Activar modo selección múltiple"
                  title="Seleccionar múltiple"
                >
                  <Check className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              )}

              {/* Botón de cancelar selección */}
              {isSelectionMode && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedTags(new Set());
                    setIsSelectionMode(false);
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Cancelar selección múltiple"
                  title="Cancelar selección"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              )}

              {/* Botón de cambio de vista */}
              {tagStats.length > 0 && !isSelectionMode && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedView(prev => prev === 'lista' ? 'nube' : 'lista')}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={selectedView === 'lista' ? 'Cambiar a vista nube' : 'Cambiar a vista lista'}
                  title={selectedView === 'lista' ? 'Vista nube' : 'Vista lista'}
                >
                  {selectedView === 'lista' ? (
                    <Cloud className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Grid3x3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y estadísticas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Barra de búsqueda */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar etiquetas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            disabled={isProcessing}
            aria-label="Buscar etiquetas"
            title="Buscar etiquetas"
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4 text-gray-500" />
            </motion.button>
          )}
        </div>

        {/* Estadísticas rápidas */}
        <div className="flex flex-wrap gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-full border border-purple-500/20"
          >
            <span className="text-sm font-medium flex items-center gap-1">
              <Hash className="w-4 h-4 text-purple-500" />
              {filteredTags.length} etiqueta{filteredTags.length !== 1 ? 's' : ''}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-full border border-blue-500/20"
          >
            <span className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              {totalUses} uso{totalUses !== 1 ? 's' : ''}
            </span>
          </motion.div>

          {isSelectionMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-full border border-green-500/20"
            >
              <span className="text-sm font-medium flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                {selectedTags.size} seleccionada{selectedTags.size !== 1 ? 's' : ''}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AnimatePresence mode="wait">
          {filteredTags.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Tag className="w-12 h-12 text-purple-500/40" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No hay etiquetas</h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                {searchQuery 
                  ? `No se encontraron etiquetas que coincidan con "${searchQuery}"`
                  : 'Las etiquetas aparecerán aquí cuando las agregues a notas activas.'}
              </p>
            </motion.div>
          ) : selectedView === 'lista' ? (
            <motion.div
              key="lista"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <AnimatePresence>
                {filteredTags.map((stat, index) => (
                  <motion.div
                    key={stat.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      relative p-4 rounded-xl backdrop-blur-lg border-2 transition-all hover:shadow-lg
                      ${isDarkMode ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/80 border-white/90'}
                      ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
                      ${selectedTags.has(stat.name) ? 'ring-2 ring-purple-500' : ''}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox para selección múltiple */}
                      {isSelectionMode && (
                        <button
                          onClick={() => toggleTagSelection(stat.name)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                            ${selectedTags.has(stat.name) 
                              ? 'bg-purple-500 border-purple-500' 
                              : 'border-gray-300 dark:border-gray-600'
                            }`}
                          aria-label={selectedTags.has(stat.name) ? `Deseleccionar ${stat.name}` : `Seleccionar ${stat.name}`}
                          title={selectedTags.has(stat.name) ? `Deseleccionar ${stat.name}` : `Seleccionar ${stat.name}`}
                        >
                          {selectedTags.has(stat.name) && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </button>
                      )}

                      {/* Icono de la etiqueta */}
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style={{ backgroundColor: `${stat.color}20` }}
                      >
                        {stat.icon || '🏷️'}
                      </div>

                      {/* Información de la etiqueta */}
                      <div className="flex-1">
                        {editingTag === stat.name ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              className="px-3 py-1 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Nuevo nombre"
                              autoFocus
                              disabled={isProcessing}
                              aria-label="Nuevo nombre de la etiqueta"
                              title="Nuevo nombre"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditTag(stat.name, newTagName);
                                } else if (e.key === 'Escape') {
                                  setEditingTag(null);
                                  setNewTagName('');
                                }
                              }}
                            />
                            <button
                              onClick={() => handleEditTag(stat.name, newTagName)}
                              disabled={isProcessing}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                              aria-label="Guardar cambio"
                              title="Guardar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingTag(null);
                                setNewTagName('');
                              }}
                              disabled={isProcessing}
                              className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                              aria-label="Cancelar edición"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold" style={{ color: stat.color }}>
                              {stat.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-500">
                                {stat.count} nota{stat.count !== 1 ? 's' : ''}
                              </span>
                              <span className="w-1 h-1 bg-gray-400 rounded-full" />
                              <span className="text-xs text-gray-500">
                                {stat.icon || 'sin icono'}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Acciones */}
                      {!isSelectionMode && editingTag !== stat.name && (
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setEditingTag(stat.name);
                              setNewTagName(stat.name);
                            }}
                            disabled={isProcessing}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            style={{ color: stat.color }}
                            aria-label={`Editar etiqueta ${stat.name}`}
                            title={`Editar ${stat.name}`}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteTag(stat.name)}
                            disabled={isProcessing}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-500"
                            aria-label={`Eliminar etiqueta ${stat.name}`}
                            title={`Eliminar ${stat.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleTagClick(stat.name)}
                            disabled={isProcessing}
                            className="p-2 rounded-lg transition-colors"
                            style={{ backgroundColor: `${stat.color}20` }}
                            aria-label={`Ver notas con etiqueta ${stat.name}`}
                            title={`Ver notas con #${stat.name}`}
                          >
                            <svg className="w-4 h-4" style={{ color: stat.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="nube"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
              <div className="relative z-10">
                <TagCloud
                  tags={filteredTags.map(t => t.name)}
                  tagCounts={filteredTags.reduce((acc, stat) => ({ ...acc, [stat.name]: stat.count }), {})}
                  onTagTap={handleTagClick}
                  onTagDelete={handleDeleteTag}
                  layout="cloud"
                  showSearch={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Consejos y tips */}
        {tagStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                  <Info className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">💡 Pro Tips</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Haz clic en una etiqueta para ver todas las notas asociadas</li>
                    <li>• Puedes renombrar etiquetas y se actualizarán en todas las notas</li>
                    <li>• Usa el modo selección para combinar varias etiquetas en una</li>
                    <li>• Las etiquetas más usadas aparecen más grandes en la vista nube</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal de combinación de etiquetas */}
      <AnimatePresence>
        {showMergeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowMergeDialog(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-white/30 shadow-2xl"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Merge className="w-6 h-6" />
                  Combinar etiquetas
                </h3>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Selecciona la etiqueta destino. Las otras {selectedTags.size - 1} etiquetas se combinarán en ella.
                </p>

                <div className="space-y-2 mb-6">
                  {Array.from(selectedTags).map(tag => {
                    const tagColor = getTagColor(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => setTargetMergeTag(tag)}
                        className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                          targetMergeTag === tag
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500'
                            : 'bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-label={`Seleccionar ${tag} como destino`}
                        title={`Combinar en ${tag}`}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${tagColor}20` }}
                        >
                          <span style={{ color: tagColor }}>🏷️</span>
                        </div>
                        <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">
                          #{tag}
                        </span>
                        {targetMergeTag === tag && (
                          <Check className="w-5 h-5 text-purple-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowMergeDialog(false)}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                    aria-label="Cancelar"
                    title="Cancelar"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmMerge}
                    disabled={!targetMergeTag || isProcessing}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    aria-label="Confirmar combinación"
                    title="Combinar"
                  >
                    {isProcessing ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Merge className="w-5 h-5" />
                        <span>Combinar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay de carga */}
      <AnimatePresence>
        {isProcessing && !showMergeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30 flex flex-col items-center gap-4"
            >
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 dark:text-gray-400">Procesando etiquetas...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TagsPage;