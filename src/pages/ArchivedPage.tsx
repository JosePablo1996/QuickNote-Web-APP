import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useNotes } from '../hooks/useNotes';
import { useToast } from '../hooks/useToast';
import { Note } from '../models/Note';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import NoteCard from '../components/notes/NoteCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Archive, 
  Grid3x3, 
  Rows, 
  ArrowLeft, 
  RotateCcw, 
  RefreshCw, 
  Inbox,
  Check,
  X,
  Tag,
  Info,
  Star,
  Trash2
} from 'lucide-react';

type ViewMode = 'grid' | 'list';

const ArchivedPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { success, error: showError, info } = useToast();
  const { 
    archivedNotes, 
    isLoading, 
    toggleArchive, 
    toggleFavorite,
    deleteNote,
    loadArchivedNotes,
    syncNotes 
  } = useNotes();
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedView = localStorage.getItem('archived_view') as ViewMode;
    return savedView || 'list';
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Usar ref para controlar montaje
  const isMountedRef = useRef(true);
  const previousArchivedLength = useRef(archivedNotes.length);

  // Configurar ref de montaje
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Guardar preferencia de vista
  useEffect(() => {
    localStorage.setItem('archived_view', viewMode);
  }, [viewMode]);

  // Cargar notas archivadas al montar
  useEffect(() => {
    loadArchivedNotes();
  }, [loadArchivedNotes]);

  // Limpiar selección cuando cambian las notas
  useEffect(() => {
    if (archivedNotes.length !== previousArchivedLength.current) {
      previousArchivedLength.current = archivedNotes.length;
      
      if (archivedNotes.length === 0) {
        setSelectedNotes(new Set());
        setIsSelectionMode(false);
      } else if (selectedNotes.size > 0) {
        const newSelected = new Set<string>();
        selectedNotes.forEach(id => {
          if (archivedNotes.some(note => note.id === id)) {
            newSelected.add(id);
          }
        });
        
        if (newSelected.size !== selectedNotes.size) {
          setSelectedNotes(newSelected);
          if (newSelected.size === 0) {
            setIsSelectionMode(false);
          }
        }
      }
    }
  }, [archivedNotes, selectedNotes]);

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    info(`Vista cambiada a ${viewMode === 'grid' ? 'lista' : 'cuadrícula'}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncNotes();
    if (isMountedRef.current) {
      setIsRefreshing(false);
      success('📦 Notas archivadas actualizadas');
    }
  };

  const handleNoteClick = (id: string) => {
    if (isSelectionMode) {
      toggleNoteSelection(id);
    } else {
      navigate(`/notes/${id}`);
    }
  };

  const handleEditNote = (id: string) => {
    navigate(`/notes/${id}/edit`);
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      setIsProcessing(true);
      const successResult = await deleteNote(id);
      if (successResult && isMountedRef.current) {
        success('🗑️ Nota movida a la papelera');
        
        if (selectedNotes.has(id)) {
          const newSelected = new Set(selectedNotes);
          newSelected.delete(id);
          setSelectedNotes(newSelected);
          if (newSelected.size === 0) {
            setIsSelectionMode(false);
          }
        }
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
    const successResult = await toggleArchive(id);
    if (successResult && isMountedRef.current) {
      success('📂 Nota desarchivada');
      
      if (selectedNotes.has(id)) {
        const newSelected = new Set(selectedNotes);
        newSelected.delete(id);
        setSelectedNotes(newSelected);
        if (newSelected.size === 0) {
          setIsSelectionMode(false);
        }
      }
    }
    if (isMountedRef.current) {
      setIsProcessing(false);
    }
  };

  const handleRestoreAll = async () => {
    if (archivedNotes.length === 0) return;
    
    if (window.confirm(`¿Restaurar todas las ${archivedNotes.length} notas archivadas?`)) {
      setIsProcessing(true);
      let successCount = 0;
      const failedIds: string[] = [];
      
      for (const note of archivedNotes) {
        const success = await toggleArchive(note.id);
        if (success) successCount++;
        else failedIds.push(note.id);
      }
      
      if (isMountedRef.current) {
        if (failedIds.length === 0) {
          success(`📦 ${successCount} notas restauradas correctamente`);
        } else if (successCount > 0) {
          info(`📦 ${successCount} notas restauradas, ${failedIds.length} fallaron`);
        } else {
          showError('No se pudo restaurar ninguna nota');
        }
        
        setSelectedNotes(new Set());
        setIsSelectionMode(false);
        setIsProcessing(false);
      }
    }
  };

  // Funciones para selección múltiple
  const toggleNoteSelection = (id: string) => {
    setSelectedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        if (newSet.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        newSet.add(id);
        setIsSelectionMode(true);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedNotes.size === archivedNotes.length) {
      setSelectedNotes(new Set());
      setIsSelectionMode(false);
    } else {
      setSelectedNotes(new Set(archivedNotes.map(n => n.id)));
      setIsSelectionMode(true);
    }
  };

  const clearSelection = () => {
    setSelectedNotes(new Set());
    setIsSelectionMode(false);
  };

  const handleRestoreSelected = async () => {
    if (selectedNotes.size === 0) return;
    
    setIsProcessing(true);
    let successCount = 0;
    const errors: string[] = [];
    const idsToRestore = Array.from(selectedNotes);
    
    for (const id of idsToRestore) {
      try {
        const success = await toggleArchive(id);
        if (success) successCount++;
        else errors.push(id);
      } catch {
        errors.push(id);
      }
    }
    
    if (isMountedRef.current) {
      if (errors.length === 0) {
        success(`📦 ${successCount} nota${successCount !== 1 ? 's' : ''} restaurada${successCount !== 1 ? 's' : ''}`);
      } else if (successCount > 0) {
        info(`${successCount} nota${successCount !== 1 ? 's' : ''} restaurada${successCount !== 1 ? 's' : ''}, ${errors.length} fallaron`);
      } else {
        showError('No se pudo restaurar ninguna nota');
      }
      
      setSelectedNotes(new Set());
      setIsSelectionMode(false);
      setIsProcessing(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotes.size === 0) return;
    
    const noteCount = selectedNotes.size;
    const confirmMessage = `¿Estás seguro de que quieres eliminar ${noteCount} nota${noteCount !== 1 ? 's' : ''}?`;
    
    if (window.confirm(confirmMessage)) {
      setIsProcessing(true);
      let successCount = 0;
      const errors: string[] = [];
      const idsToDelete = Array.from(selectedNotes);
      
      for (const id of idsToDelete) {
        try {
          const success = await deleteNote(id);
          if (success) successCount++;
          else errors.push(id);
        } catch {
          errors.push(id);
        }
      }
      
      if (isMountedRef.current) {
        if (errors.length === 0) {
          success(`🗑️ ${successCount} nota${successCount !== 1 ? 's' : ''} movida${successCount !== 1 ? 's' : ''} a la papelera`);
        } else if (successCount > 0) {
          info(`${successCount} nota${successCount !== 1 ? 's' : ''} movida${successCount !== 1 ? 's' : ''} a la papelera, ${errors.length} fallaron`);
        } else {
          showError('No se pudo mover ninguna nota a la papelera');
        }
        
        setSelectedNotes(new Set());
        setIsSelectionMode(false);
        setIsProcessing(false);
      }
    }
  };

  // Función para obtener el color de la nota
  const getNoteColor = (note: Note): string => {
    return note.color || '#3B82F6';
  };

  if (isLoading && archivedNotes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando notas archivadas..." />
      </div>
    );
  }

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
                <div className="w-1.5 h-8 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Notas Archivadas
                </h1>
              </div>
              
              {archivedNotes.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full text-sm border border-teal-500/20"
                >
                  {archivedNotes.length} nota{archivedNotes.length !== 1 ? 's' : ''}
                </motion.span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Botón de refrescar */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={isRefreshing || isProcessing}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Actualizar"
                title="Actualizar"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>

              {/* Botones según modo */}
              {archivedNotes.length > 0 && (
                <>
                  {!isSelectionMode ? (
                    <>
                      {/* Botón restaurar todas */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRestoreAll}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                        title="Restaurar todas"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="hidden sm:inline">Restaurar todas</span>
                      </motion.button>

                      {/* Botón de selección múltiple */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSelectionMode(true)}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Activar modo selección"
                        title="Seleccionar múltiple"
                      >
                        <Inbox className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRestoreSelected}
                        disabled={selectedNotes.size === 0 || isProcessing}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                        aria-label={`Restaurar ${selectedNotes.size} nota${selectedNotes.size !== 1 ? 's' : ''}`}
                        title="Restaurar seleccionadas"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="hidden sm:inline">Restaurar ({selectedNotes.size})</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDeleteSelected}
                        disabled={selectedNotes.size === 0 || isProcessing}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                        aria-label={`Eliminar ${selectedNotes.size} nota${selectedNotes.size !== 1 ? 's' : ''}`}
                        title="Eliminar seleccionadas"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Eliminar ({selectedNotes.size})</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearSelection}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        disabled={isProcessing}
                        aria-label="Cancelar selección"
                        title="Cancelar"
                      >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </motion.button>
                    </>
                  )}

                  {/* Botón de cambio de vista */}
                  {!isSelectionMode && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleViewMode}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      disabled={isProcessing}
                      aria-label={viewMode === 'grid' ? 'Cambiar a vista lista' : 'Cambiar a vista cuadrícula'}
                      title={viewMode === 'grid' ? 'Vista lista' : 'Vista cuadrícula'}
                    >
                      {viewMode === 'grid' ? (
                        <Rows className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <Grid3x3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </motion.button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Barra de selección múltiple */}
          {isSelectionMode && archivedNotes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between py-3"
            >
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedNotes.size} seleccionada{selectedNotes.size !== 1 ? 's' : ''}
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-sm text-teal-500 hover:text-teal-600 transition-colors"
                disabled={isProcessing}
                aria-label={selectedNotes.size === archivedNotes.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                title={selectedNotes.size === archivedNotes.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              >
                {selectedNotes.size === archivedNotes.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {archivedNotes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EmptyState
                type="archived"
                actionLabel="Ir a notas activas"
                onAction={() => navigate('/notes')}
              />
            </motion.div>
          ) : (
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
              {archivedNotes.map((note, index) => {
                const noteColor = getNoteColor(note);
                const isSelected = selectedNotes.has(note.id);

                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      relative cursor-pointer
                      ${isSelectionMode ? 'select-none' : ''}
                    `}
                    onClick={() => isSelectionMode && toggleNoteSelection(note.id)}
                  >
                    <NoteCard
                      note={note}
                      onClick={() => handleNoteClick(note.id)}
                      onEdit={() => handleEditNote(note.id)}
                      onDelete={() => handleDeleteNote(note.id)}
                      onToggleFavorite={() => handleToggleFavorite(note.id)}
                      onToggleArchive={() => handleToggleArchive(note.id)}
                      isSelected={isSelected}
                      isGridMode={viewMode === 'grid'}
                    />
                    
                    {/* Overlay de selección */}
                    {isSelectionMode && (
                      <div 
                        className={`absolute inset-0 rounded-xl transition-all pointer-events-none
                          ${isSelected 
                            ? 'ring-2 ring-teal-500 bg-teal-500/5' 
                            : 'hover:ring-2 hover:ring-teal-500/30'
                          }`}
                      />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mensaje informativo para notas archivadas */}
        {archivedNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 backdrop-blur-sm border border-teal-500/20 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-500/20 rounded-lg shrink-0">
                  <Info className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">📦 Notas archivadas</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Las notas archivadas están ocultas de tu lista principal pero no se eliminan. 
                    Puedes desarchivarlas en cualquier momento para que vuelvan a aparecer.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
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

      {/* Overlay de refresco */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">
              Actualizando...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArchivedPage;