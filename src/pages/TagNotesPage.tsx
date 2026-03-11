import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useNotes } from '../hooks/useNotes';
import { useToast } from '../hooks/useToast';
import { Note } from '../models/Note';
import { getTagColor, getTagIcon } from '../utils/tagUtils';
import NoteCard from '../components/notes/NoteCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Tag,
  Grid3x3,
  Rows,
  Hash,
  TrendingUp,
  Clock,
  Edit,
  Trash2,
  X,
  Check,
  Plus,
  Sparkles,
  Zap
} from 'lucide-react';

type ViewMode = 'grid' | 'list';

const TagNotesPage: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { success: showSuccess, error: showError } = useToast();
  const { 
    notes, 
    isLoading, 
    toggleFavorite, 
    toggleArchive,
    deleteNote 
  } = useNotes();
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedView = localStorage.getItem('tag_notes_view') as ViewMode;
    return savedView || 'grid';
  });
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [relatedTags, setRelatedTags] = useState<string[]>([]);
  
  // Usar ref para controlar el montaje
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Guardar preferencia de vista
  useEffect(() => {
    localStorage.setItem('tag_notes_view', viewMode);
  }, [viewMode]);

  // Filtrar notas por etiqueta y calcular etiquetas relacionadas
  useEffect(() => {
    if (tag && isMountedRef.current) {
      const decodedTag = decodeURIComponent(tag);
      console.log('🔍 Filtrando notas por etiqueta:', decodedTag);
      
      const filtered = notes.filter(note => 
        note.tags?.includes(decodedTag) && !note.is_archived && !note.deleted_at
      );
      
      // Calcular etiquetas relacionadas (otras etiquetas en estas notas)
      const related = new Set<string>();
      filtered.forEach(note => {
        note.tags?.forEach(t => {
          if (t !== decodedTag) related.add(t);
        });
      });
      
      console.log('📝 Notas encontradas:', filtered.length);
      console.log('🏷️ Etiquetas relacionadas:', Array.from(related));
      
      setFilteredNotes(filtered);
      setRelatedTags(Array.from(related).slice(0, 8)); // Limitar a 8 etiquetas relacionadas
    }
  }, [tag, notes]);

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  const handleNoteClick = (id: string) => {
    navigate(`/notes/${id}`);
  };

  const handleEditNote = (id: string) => {
    navigate(`/notes/${id}/edit`);
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      setIsProcessing(true);
      const success = await deleteNote(id);
      if (success && isMountedRef.current) {
        showSuccess('🗑️ Nota movida a la papelera');
      }
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const handleToggleFavorite = async (id: string) => {
    setIsProcessing(true);
    await toggleFavorite(id);
    if (isMountedRef.current) {
      setIsProcessing(false);
    }
  };

  const handleToggleArchive = async (id: string) => {
    setIsProcessing(true);
    const success = await toggleArchive(id);
    if (success && isMountedRef.current) {
      showSuccess('📦 Nota archivada/desarchivada');
    }
    if (isMountedRef.current) {
      setIsProcessing(false);
    }
  };

  const handleRelatedTagClick = (relatedTag: string) => {
    navigate(`/tags/${encodeURIComponent(relatedTag)}`);
  };

  if (isLoading && filteredNotes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando notas..." />
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <EmptyState
          title="Etiqueta no encontrada"
          message="La etiqueta que buscas no existe"
          actionLabel="Volver a etiquetas"
          onAction={() => navigate('/tags')}
        />
      </div>
    );
  }

  const decodedTag = decodeURIComponent(tag);
  const tagColor = getTagColor(decodedTag);
  const tagIcon = getTagIcon(decodedTag);

  // Calcular estadísticas de la etiqueta
  const tagStats = {
    totalNotes: filteredNotes.length,
    totalFavorites: filteredNotes.filter(n => n.is_favorite).length,
    oldestNote: filteredNotes.length > 0 
      ? new Date(Math.min(...filteredNotes.map(n => new Date(n.created_at).getTime()))).toLocaleDateString()
      : '-',
    newestNote: filteredNotes.length > 0
      ? new Date(Math.max(...filteredNotes.map(n => new Date(n.created_at).getTime()))).toLocaleDateString()
      : '-',
  };

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
                onClick={() => navigate('/tags')}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                disabled={isProcessing}
                aria-label="Volver a etiquetas"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${tagColor}20` }}
                >
                  <span className="text-xl">{tagIcon || '🏷️'}</span>
                </div>
                
                <div>
                  <h1 className="text-xl font-semibold flex items-center gap-2">
                    Notas con etiqueta
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ 
                        backgroundColor: `${tagColor}20`,
                        color: tagColor,
                        border: `1px solid ${tagColor}30`
                      }}
                    >
                      #{decodedTag}
                    </motion.span>
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {filteredNotes.length} nota{filteredNotes.length !== 1 ? 's' : ''} encontrada{filteredNotes.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Botón de estadísticas */}
              {filteredNotes.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowStats(!showStats)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={showStats ? 'Ocultar estadísticas' : 'Mostrar estadísticas'}
                >
                  <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              )}

              {/* Botón de cambio de vista */}
              {filteredNotes.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleViewMode}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={isProcessing}
                  aria-label={viewMode === 'grid' ? 'Cambiar a vista lista' : 'Cambiar a vista cuadrícula'}
                >
                  {viewMode === 'grid' ? (
                    <Rows className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Grid3x3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de estadísticas */}
      <AnimatePresence>
        {showStats && filteredNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Hash className="w-4 h-4" style={{ color: tagColor }} />
                    <span>Total notas</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: tagColor }}>{tagStats.totalNotes}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span>Favoritas</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-500">{tagStats.totalFavorites}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Más antigua</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{tagStats.oldestNote}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span>Más reciente</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{tagStats.newestNote}</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {filteredNotes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-2xl" />
                <div 
                  className="relative w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${tagColor}20` }}
                >
                  <span className="text-5xl">{tagIcon || '🏷️'}</span>
                </div>
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                No hay notas con esta etiqueta
              </h2>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <span 
                  className="px-4 py-2 rounded-full text-lg"
                  style={{ 
                    backgroundColor: `${tagColor}20`,
                    color: tagColor,
                    border: `1px solid ${tagColor}30`
                  }}
                >
                  #{decodedTag}
                </span>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/notes')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Ir a todas las notas
              </motion.button>
            </motion.div>
          ) : (
            <>
              <motion.div
                key="notes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4 max-w-4xl mx-auto'
                }
              >
                {filteredNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    {/* Efecto de borde con el color de la etiqueta */}
                    <div 
                      className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${tagColor}, ${tagColor}80)`,
                      }}
                    />
                    
                    <NoteCard
                      note={note}
                      onClick={() => handleNoteClick(note.id)}
                      onEdit={() => handleEditNote(note.id)}
                      onDelete={() => handleDeleteNote(note.id)}
                      onToggleFavorite={() => handleToggleFavorite(note.id)}
                      onToggleArchive={() => handleToggleArchive(note.id)}
                      isSelected={false}
                      isGridMode={viewMode === 'grid'}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Etiquetas relacionadas */}
              {relatedTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-12"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
                    
                    <div className="relative z-10">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Etiquetas relacionadas
                      </h3>
                      
                      <div className="flex flex-wrap gap-2">
                        {relatedTags.map((relatedTag, index) => {
                          const relatedColor = getTagColor(relatedTag);
                          const relatedIcon = getTagIcon(relatedTag);
                          
                          return (
                            <motion.button
                              key={relatedTag}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRelatedTagClick(relatedTag)}
                              className="group relative px-4 py-2 rounded-xl flex items-center gap-2 transition-all hover:shadow-lg"
                              style={{ 
                                backgroundColor: `${relatedColor}15`,
                                border: `1px solid ${relatedColor}30`,
                              }}
                            >
                              <span className="text-sm">{relatedIcon || '🏷️'}</span>
                              <span className="text-sm font-medium" style={{ color: relatedColor }}>
                                #{relatedTag}
                              </span>
                              
                              {/* Efecto de brillo en hover */}
                              <div 
                                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ boxShadow: `0 0 20px ${relatedColor}` }}
                              />
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Mensaje de resumen */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-full border border-purple-500/20">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredNotes.length} nota{filteredNotes.length !== 1 ? 's' : ''} con #{decodedTag}
                  </span>
                  {relatedTags.length > 0 && (
                    <>
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {relatedTags.length} etiqueta{relatedTags.length !== 1 ? 's' : ''} relacionada{relatedTags.length !== 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay de carga */}
      <AnimatePresence>
        {isProcessing && (
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
              <p className="text-gray-600 dark:text-gray-400">Procesando...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TagNotesPage;