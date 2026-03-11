import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useNotes } from '../hooks/useNotes';
import { useToast } from '../hooks/useToast';
import { Note } from '../models/Note';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Trash2,
  RotateCcw,
  X,
  Check,
  AlertTriangle,
  Tag,
  FileText,
  Grid3x3,
  Rows,
  RefreshCw,
  Clock,
  Info,
  Inbox
} from 'lucide-react';

type ViewMode = 'grid' | 'list';

const TrashPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { 
    deletedNotes, 
    isLoading, 
    restoreNote, 
    deletePermanently,
    loadDeletedNotes,
    syncNotes,
    loadNotes 
  } = useNotes();
  const { success, error: showError, info } = useToast();
  
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedView = localStorage.getItem('trash_view') as ViewMode;
    return savedView || 'list';
  });
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  
  // Usar ref para controlar la carga inicial
  const initialLoadRef = useRef(false);
  const isMountedRef = useRef(true);
  const previousDeletedNotesLength = useRef(deletedNotes.length);

  // Guardar preferencia de vista cuando cambie
  useEffect(() => {
    localStorage.setItem('trash_view', viewMode);
  }, [viewMode]);

  // Cargar notas solo una vez al montar
  useEffect(() => {
    isMountedRef.current = true;
    
    if (!initialLoadRef.current) {
      console.log('🗑️ TrashPage: Cargando notas eliminadas por primera vez...');
      initialLoadRef.current = true;
      loadDeletedNotes();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [loadDeletedNotes]);

  // ✅ CORREGIDO: Limpiar selección cuando cambian las notas (sin bucle infinito)
  useEffect(() => {
    // Solo actuar si el número de notas cambió
    if (deletedNotes.length !== previousDeletedNotesLength.current) {
      previousDeletedNotesLength.current = deletedNotes.length;
      
      if (deletedNotes.length === 0) {
        setSelectedNotes(new Set());
        setIsSelectionMode(false);
      } else if (selectedNotes.size > 0) {
        const newSelected = new Set<string>();
        selectedNotes.forEach(id => {
          if (deletedNotes.some(note => note.id === id)) {
            newSelected.add(id);
          }
        });
        
        // Solo actualizar si realmente cambió
        if (newSelected.size !== selectedNotes.size) {
          setSelectedNotes(newSelected);
          if (newSelected.size === 0) {
            setIsSelectionMode(false);
          }
        }
      }
    }
  }, [deletedNotes, selectedNotes]);

  // Función para cambiar vista
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    info(`Vista cambiada a ${viewMode === 'grid' ? 'lista' : 'cuadrícula'}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncNotes();
    if (isMountedRef.current) {
      setIsRefreshing(false);
      success('🗑️ Papelera actualizada');
    }
  };

  // ✅ CORREGIDO: handleRestore con recarga
  const handleRestore = async (id: string) => {
    setIsProcessing(true);
    try {
      const successResult = await restoreNote(id);
      if (successResult && isMountedRef.current) {
        await loadDeletedNotes();
        await loadNotes();
        success('✨ Nota restaurada');
        
        // Limpiar selección si estaba seleccionada
        if (selectedNotes.has(id)) {
          const newSelected = new Set(selectedNotes);
          newSelected.delete(id);
          setSelectedNotes(newSelected);
          if (newSelected.size === 0) {
            setIsSelectionMode(false);
          }
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        showError('Error al restaurar la nota');
      }
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  // ✅ CORREGIDO: handleDeletePermanently con recarga
  const handleDeletePermanently = async (id: string) => {
    setIsProcessing(true);
    try {
      const successResult = await deletePermanently(id);
      if (successResult && isMountedRef.current) {
        await loadDeletedNotes();
        success('🗑️ Nota eliminada permanentemente');
        
        // Limpiar selección si estaba seleccionada
        if (selectedNotes.has(id)) {
          const newSelected = new Set(selectedNotes);
          newSelected.delete(id);
          setSelectedNotes(newSelected);
          if (newSelected.size === 0) {
            setIsSelectionMode(false);
          }
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        showError('Error al eliminar la nota');
      }
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
        setShowDeleteConfirm(false);
        setNoteToDelete(null);
      }
    }
  };

  // ✅ CORREGIDO: handleRestoreSelected con recarga
  const handleRestoreSelected = async () => {
    if (selectedNotes.size === 0) return;
    
    setIsProcessing(true);
    let successCount = 0;
    const errors: string[] = [];
    const idsToRestore = Array.from(selectedNotes);
    
    for (const id of idsToRestore) {
      try {
        const successResult = await restoreNote(id);
        if (successResult) successCount++;
        else errors.push(id);
      } catch (err) {
        errors.push(id);
      }
    }
    
    if (isMountedRef.current) {
      await loadDeletedNotes();
      await loadNotes();
      
      if (errors.length === 0) {
        success(`✨ ${successCount} nota${successCount !== 1 ? 's' : ''} restaurada${successCount !== 1 ? 's' : ''}`);
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

  // ✅ CORREGIDO: handleDeleteSelected con recarga
  const handleDeleteSelected = async () => {
    if (selectedNotes.size === 0) return;
    
    setIsProcessing(true);
    let successCount = 0;
    const errors: string[] = [];
    const idsToDelete = Array.from(selectedNotes);
    
    for (const id of idsToDelete) {
      try {
        const successResult = await deletePermanently(id);
        if (successResult) successCount++;
        else errors.push(id);
      } catch (err) {
        errors.push(id);
      }
    }
    
    if (isMountedRef.current) {
      await loadDeletedNotes();
      
      if (errors.length === 0) {
        success(`🗑️ ${successCount} nota${successCount !== 1 ? 's' : ''} eliminada${successCount !== 1 ? 's' : ''} permanentemente`);
      } else if (successCount > 0) {
        info(`${successCount} nota${successCount !== 1 ? 's' : ''} eliminada${successCount !== 1 ? 's' : ''}, ${errors.length} fallaron`);
      } else {
        showError('No se pudo eliminar ninguna nota');
      }
      
      setSelectedNotes(new Set());
      setIsSelectionMode(false);
      setIsProcessing(false);
    }
  };

  // ✅ CORREGIDO: handleEmptyTrash con recarga
  const handleEmptyTrash = async () => {
    if (deletedNotes.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      let successCount = 0;
      const errors: string[] = [];
      const notesToDelete = [...deletedNotes];
      
      for (const note of notesToDelete) {
        try {
          const successResult = await deletePermanently(note.id);
          if (successResult) successCount++;
          else errors.push(note.id);
        } catch {
          errors.push(note.id);
        }
      }
      
      if (isMountedRef.current) {
        await loadDeletedNotes();
        
        if (errors.length === 0) {
          success(`🧹 Papelera vaciada (${successCount} notas eliminadas permanentemente)`);
        } else if (successCount > 0) {
          info(`🧹 ${successCount} notas eliminadas, ${errors.length} fallaron`);
        } else {
          showError('No se pudo vaciar la papelera');
        }
        
        setSelectedNotes(new Set());
        setIsSelectionMode(false);
        setShowEmptyConfirm(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        showError('Error al vaciar la papelera');
      }
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const toggleSelection = (id: string) => {
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
    if (selectedNotes.size === deletedNotes.length) {
      setSelectedNotes(new Set());
      setIsSelectionMode(false);
    } else {
      setSelectedNotes(new Set(deletedNotes.map(n => n.id)));
      setIsSelectionMode(true);
    }
  };

  const clearSelection = () => {
    setSelectedNotes(new Set());
    setIsSelectionMode(false);
  };

  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return 'Fecha desconocida';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Hoy';
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
      return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
    } catch {
      return 'Fecha desconocida';
    }
  };

  const getNoteColor = (note: Note): string => {
    return note.color || '#3B82F6';
  };

  // Calcular estadísticas de la papelera
  const trashStats = {
    total: deletedNotes.length,
    oldestNote: deletedNotes.length > 0
      ? new Date(Math.min(...deletedNotes.map(n => new Date(n.deleted_at || n.created_at).getTime()))).toLocaleDateString()
      : '-',
    newestNote: deletedNotes.length > 0
      ? new Date(Math.max(...deletedNotes.map(n => new Date(n.deleted_at || n.created_at).getTime()))).toLocaleDateString()
      : '-',
    totalSize: deletedNotes.reduce((acc, note) => acc + (note.content?.length || 0), 0),
  };

  if (isLoading && deletedNotes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando papelera..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
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
                <div className="w-1.5 h-8 bg-gradient-to-b from-red-500 to-rose-600 rounded-full" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Papelera
                </h1>
              </div>
              
              {deletedNotes.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm border border-red-500/20"
                >
                  {deletedNotes.length} nota{deletedNotes.length !== 1 ? 's' : ''}
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
              {deletedNotes.length > 0 && (
                <>
                  {!isSelectionMode ? (
                    <>
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
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowEmptyConfirm(true)}
                        className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500"
                        aria-label="Vaciar papelera"
                        title="Vaciar papelera"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRestoreSelected}
                        disabled={selectedNotes.size === 0 || isProcessing}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
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
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                        aria-label={`Eliminar permanentemente ${selectedNotes.size} nota${selectedNotes.size !== 1 ? 's' : ''}`}
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
          {isSelectionMode && deletedNotes.length > 0 && (
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
                className="text-sm text-red-500 hover:text-red-600 transition-colors"
                disabled={isProcessing}
                aria-label={selectedNotes.size === deletedNotes.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                title={selectedNotes.size === deletedNotes.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              >
                {selectedNotes.size === deletedNotes.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {deletedNotes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EmptyState
                type="trash"
                actionLabel="Ir a notas"
                onAction={() => navigate('/notes')}
              />
            </motion.div>
          ) : (
            <>
              {/* Panel de estadísticas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
              >
                {/* ... (estadísticas se mantienen igual) ... */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>Total notas</span>
                  </div>
                  <p className="text-2xl font-bold text-red-500">{trashStats.total}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Contenido</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-500">{trashStats.totalSize} chars</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>Más antigua</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{trashStats.oldestNote}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <RefreshCw className="w-4 h-4 text-green-500" />
                    <span>Más reciente</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{trashStats.newestNote}</p>
                </motion.div>
              </motion.div>

              {/* Lista de notas */}
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
                <AnimatePresence>
                  {deletedNotes.map((note, index) => {
                    const noteColor = getNoteColor(note);
                    const daysAgo = formatDate(note.deleted_at || note.created_at);
                    const isSelected = selectedNotes.has(note.id);

                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                          relative p-5 rounded-xl backdrop-blur-lg border-2 transition-all cursor-pointer
                          ${isDarkMode 
                            ? 'bg-gray-800/60 border-gray-700/40' 
                            : 'bg-white/80 border-white/90'
                          }
                          ${isSelected ? 'ring-2 ring-red-500' : 'hover:shadow-lg'}
                          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
                          ${viewMode === 'grid' ? 'flex flex-col' : ''}
                        `}
                        onClick={() => isSelectionMode && toggleSelection(note.id)}
                      >
                        <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-start'} gap-4`}>
                          {/* Checkbox para selección múltiple */}
                          {isSelectionMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelection(note.id);
                              }}
                              disabled={isProcessing}
                              className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                                ${isSelected 
                                  ? 'bg-red-500 border-red-500' 
                                  : isDarkMode 
                                    ? 'border-gray-600' 
                                    : 'border-gray-300'
                                }
                                disabled:opacity-50
                              `}
                              aria-label={isSelected ? 'Deseleccionar nota' : 'Seleccionar nota'}
                              title={isSelected ? 'Deseleccionar' : 'Seleccionar'}
                            >
                              {isSelected && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </button>
                          )}

                          {/* Icono decorativo */}
                          <div 
                            className={`p-3 rounded-xl ${viewMode === 'grid' ? 'self-center' : ''}`}
                            style={{ backgroundColor: `${noteColor}20` }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-5 h-5" style={{ color: noteColor }} />
                          </div>

                          {/* Contenido de la nota */}
                          <div 
                            className={`flex-1 ${viewMode === 'grid' ? 'text-center' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className={`flex items-start justify-between mb-2 ${viewMode === 'grid' ? 'flex-col items-center gap-2' : ''}`}>
                              <h3 className={`font-semibold text-gray-900 dark:text-white line-through ${viewMode === 'grid' ? 'text-center' : ''}`}>
                                {note.title || 'Sin título'}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span 
                                  className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                  style={{ 
                                    backgroundColor: `${noteColor}20`,
                                    color: noteColor,
                                    border: `1px solid ${noteColor}30`
                                  }}
                                >
                                  {daysAgo}
                                </span>
                              </div>
                            </div>

                            <p className={`text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 ${viewMode === 'grid' ? 'text-center' : ''}`}>
                              {note.content || 'Sin contenido'}
                            </p>

                            {note.tags && note.tags.length > 0 && (
                              <div className={`flex flex-wrap gap-1 mb-3 ${viewMode === 'grid' ? 'justify-center' : ''}`}>
                                {note.tags.slice(0, 3).map(tag => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 text-xs rounded-full flex items-center gap-1"
                                    style={{
                                      backgroundColor: `${noteColor}15`,
                                      color: noteColor,
                                      border: `1px solid ${noteColor}30`
                                    }}
                                  >
                                    <Tag className="w-3 h-3" />
                                    #{tag}
                                  </span>
                                ))}
                                {note.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{note.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Acciones */}
                            {!isSelectionMode && (
                              <div className={`flex gap-2 ${viewMode === 'grid' ? 'justify-center' : ''}`}>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestore(note.id);
                                  }}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-md transition-all text-sm flex items-center gap-1 disabled:opacity-50"
                                  title="Restaurar"
                                  aria-label="Restaurar nota"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  <span className={viewMode === 'grid' ? 'hidden sm:inline' : ''}>Restaurar</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNoteToDelete(note.id);
                                    setShowDeleteConfirm(true);
                                  }}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:shadow-md transition-all text-sm flex items-center gap-1 disabled:opacity-50"
                                  title="Eliminar permanentemente"
                                  aria-label="Eliminar permanentemente"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className={viewMode === 'grid' ? 'hidden sm:inline' : ''}>Eliminar</span>
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              {/* Mensaje informativo */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg shrink-0">
                      <Info className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">⏳ Información importante</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Las notas en la papelera se eliminarán automáticamente después de 30 días. 
                        Puedes restaurarlas en cualquier momento antes de ese plazo.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Modales y overlays (se mantienen igual) */}
      <AnimatePresence>
        {showEmptyConfirm && (
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
              onClick={() => setShowEmptyConfirm(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-white/30 shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Vaciar papelera
                </h3>
              </div>

              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500/20 to-rose-500/20 flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                </div>

                <p className="text-center text-gray-700 dark:text-gray-300 mb-2">
                  ¿Estás seguro de vaciar la papelera?
                </p>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Se eliminarán permanentemente <span className="font-bold text-red-500">{deletedNotes.length}</span> nota{deletedNotes.length !== 1 ? 's' : ''}. Esta acción no se puede deshacer.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEmptyConfirm(false)}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                    aria-label="Cancelar"
                    title="Cancelar"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEmptyTrash}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    aria-label="Vaciar papelera"
                    title="Vaciar"
                  >
                    {isProcessing ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        <span>Vaciar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && noteToDelete && (
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
              onClick={() => {
                setShowDeleteConfirm(false);
                setNoteToDelete(null);
              }}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-white/30 shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Eliminar permanentemente
                </h3>
              </div>

              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500/20 to-rose-500/20 flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                </div>

                <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
                  ¿Eliminar esta nota permanentemente? Esta acción no se puede deshacer.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setNoteToDelete(null);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                    aria-label="Cancelar"
                    title="Cancelar"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => noteToDelete && handleDeletePermanently(noteToDelete)}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    aria-label="Eliminar permanentemente"
                    title="Eliminar"
                  >
                    {isProcessing ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        <span>Eliminar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProcessing && !showDeleteConfirm && !showEmptyConfirm && (
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

      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
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

export default TrashPage;