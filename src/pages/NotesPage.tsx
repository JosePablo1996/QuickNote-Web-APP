import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useNotes } from '../hooks/useNotes';
import { SortOption, sortOptions } from '../utils/sortUtils';
import Header from '../components/layout/Header';
import LeftMenu from '../components/layout/LeftMenu';
import RightMenu from '../components/layout/RightMenu';
import ConnectionStatus from '../components/layout/ConnectionStatus';
import NoteCard from '../components/notes/NoteCard';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../hooks/useToast';
import { Note } from '../models/Note';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  X, 
  ChevronDown,
  Check,
  Trash2,
  RefreshCw,
  MoreVertical
} from 'lucide-react'; // Eliminados Grid3x3, Rows, Archive, Star, Upload que no se usan

const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme(); // Esto se usa en las clases CSS
  const { info, success, error: showError } = useToast();
  
  // Usar refs para controlar cargas iniciales y montaje
  const initialLoadRef = useRef(false);
  const isMountedRef = useRef(true);
  
  const {
    notes,
    isLoading,
    error,
    loadNotes,
    toggleFavorite,
    toggleArchive,
    deleteNote,
    searchNotes,
    getNotesByTag,
    syncNotes,
  } = useNotes();

  // Estados para los menús
  const [showLeftMenu, setShowLeftMenu] = useState(false);
  const [showRightMenu, setShowRightMenu] = useState(false);
  
  // Estados para el header y filtros
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Estados para selección múltiple
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Estado para el menú FAB
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const fabMenuRef = useRef<HTMLDivElement>(null);

  // Estados para operaciones
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentSortOption, setCurrentSortOption] = useState<SortOption>('newest');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para notas activas filtradas
  const [activeNotes, setActiveNotes] = useState<Note[]>([]);

  // Configurar ref de montaje
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cargar notas al montar SOLO UNA VEZ
  useEffect(() => {
    if (!initialLoadRef.current) {
      console.log('📝 NotesPage montado, cargando notas por primera vez...');
      initialLoadRef.current = true;
      loadNotes();
    }
  }, [loadNotes]);

  // Filtrar notas activas (no archivadas, no eliminadas)
  useEffect(() => {
    if (isMountedRef.current) {
      const active = notes.filter(note => !note.is_archived && !note.deleted_at);
      console.log('📝 Notas activas:', active.length);
      setActiveNotes(active);
    }
  }, [notes]);

  // Cargar preferencias guardadas
  useEffect(() => {
    const savedView = localStorage.getItem('notes_view') as 'grid' | 'list' | null;
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
      setCurrentView(savedView);
    }
    
    const savedSort = localStorage.getItem('notes_sort') as SortOption | null;
    if (savedSort && Object.keys(sortOptions).includes(savedSort)) {
      setCurrentSortOption(savedSort);
    }
  }, []);

  // Guardar preferencias cuando cambien
  useEffect(() => {
    localStorage.setItem('notes_view', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('notes_sort', currentSortOption);
  }, [currentSortOption]);

  // Cerrar menú FAB al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabMenuRef.current && !fabMenuRef.current.contains(event.target as Node)) {
        setIsFabMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar menú de ordenamiento al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSortMenu && !(event.target as Element).closest('.sort-menu-container')) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortMenu]);

  // Actualizar etiquetas disponibles (solo de notas activas)
  useEffect(() => {
    if (isMountedRef.current) {
      const tags = new Set<string>();
      activeNotes.forEach((note: Note) => {
        note.tags?.forEach(tag => tags.add(tag));
      });
      setAvailableTags(Array.from(tags).sort());
    }
  }, [activeNotes]);

  // Función para ordenar notas
  const sortNotes = useCallback((notesToSort: Note[], option: SortOption): Note[] => {
    const sorted = [...notesToSort];
    
    switch (option) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'favorites':
        return sorted.sort((a, b) => {
          if (a.is_favorite === b.is_favorite) return 0;
          return a.is_favorite ? -1 : 1;
        });
      case 'updated':
        return sorted.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
      default:
        return sorted;
    }
  }, []);

  // Función para eliminar múltiples notas
  const deleteMultipleNotes = useCallback(async (ids: string[]): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;
    
    for (const id of ids) {
      try {
        const result = await deleteNote(id);
        if (result) success++; else failed++;
      } catch {
        failed++;
      }
    }
    
    return { success, failed };
  }, [deleteNote]);

  // Función para importar notas
  const importNotes = useCallback(async (file: File): Promise<void> => {
    // Simular importación
    console.log('Importando archivo:', file.name);
    return new Promise((resolve) => {
      setTimeout(() => {
        info('📥 Importación completada (simulada)');
        resolve();
      }, 1500);
    });
  }, [info]);

  // Filtrar y ordenar notas
  const getFilteredAndSortedNotes = useCallback(() => {
    let filtered = activeNotes;

    if (selectedCategory !== 'Todas') {
      filtered = getNotesByTag(selectedCategory).filter((note: Note) => 
        !note.is_archived && !note.deleted_at
      );
    }

    if (searchQuery.trim()) {
      filtered = searchNotes(searchQuery).filter((note: Note) => 
        !note.is_archived && !note.deleted_at
      );
    }

    return sortNotes(filtered, currentSortOption);
  }, [activeNotes, selectedCategory, searchQuery, getNotesByTag, searchNotes, sortNotes, currentSortOption]);

  const displayNotes = getFilteredAndSortedNotes();

  const handleCreateNote = () => {
    navigate('/notes/new');
    setIsFabMenuOpen(false);
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
      const successResult = await deleteNote(id);
      if (successResult && isMountedRef.current) {
        if (isSelectionMode) {
          setSelectedNotes(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }
      }
    }
  };

  const handleToggleArchive = async (id: string) => {
    const successResult = await toggleArchive(id);
    if (successResult && isMountedRef.current) {
      if (isSelectionMode && selectedNotes.has(id)) {
        setSelectedNotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  const handleDeleteMultipleNotes = async () => {
    if (selectedNotes.size === 0) {
      showError('No hay notas seleccionadas');
      return;
    }

    const noteCount = selectedNotes.size;
    const confirmMessage = `¿Estás seguro de que quieres eliminar ${noteCount} nota${noteCount !== 1 ? 's' : ''}?`;
    
    if (window.confirm(confirmMessage)) {
      setIsDeletingMultiple(true);
      
      const ids = Array.from(selectedNotes);
      const result = await deleteMultipleNotes(ids);
      
      if (isMountedRef.current) {
        if (result.failed === 0) {
          success(`${result.success} nota${result.success !== 1 ? 's' : ''} eliminada${result.success !== 1 ? 's' : ''} correctamente`);
        } else if (result.success > 0) {
          info(`${result.success} nota${result.success !== 1 ? 's' : ''} eliminada${result.success !== 1 ? 's' : ''}, ${result.failed} fallaron`);
        }
        
        setSelectedNotes(new Set());
        setIsSelectionMode(false);
        setIsFabMenuOpen(false);
        setIsDeletingMultiple(false);
      }
    }
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
  };

  const handleViewList = () => {
    setCurrentView(prev => prev === 'grid' ? 'list' : 'grid');
    info(`Cambiado a vista ${currentView === 'grid' ? 'lista' : 'grid'}`);
    setShowRightMenu(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setShowRightMenu(false);
    setIsFabMenuOpen(false);
    
    await syncNotes();
    
    if (isMountedRef.current) {
      setIsSyncing(false);
    }
  };

  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setShowRightMenu(false);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSyncing(true);
    
    await importNotes(file);
    
    if (isMountedRef.current) {
      setIsSyncing(false);
      setIsFabMenuOpen(false);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    if (selectedNotes.size === displayNotes.length) {
      setSelectedNotes(new Set());
      setIsSelectionMode(false);
    } else {
      setSelectedNotes(new Set(displayNotes.map((n: Note) => n.id)));
      setIsSelectionMode(true);
    }
  };

  const clearSelection = () => {
    setSelectedNotes(new Set());
    setIsSelectionMode(false);
  };

  const selectedCount = selectedNotes.size;

  if (isLoading && activeNotes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando notas..." />
      </div>
    );
  }

  if (error && activeNotes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadNotes}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
      {/* Input oculto para importar archivos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".json,.txt,.md"
        className="hidden"
        aria-label="Importar notas"
      />

      {/* Menú lateral izquierdo */}
      <LeftMenu
        isOpen={showLeftMenu}
        onClose={() => setShowLeftMenu(false)}
        onNavigate={(path: string) => {
          navigate(path);
          setShowLeftMenu(false);
        }}
      />

      {/* Menú lateral derecho */}
      <RightMenu
        isOpen={showRightMenu}
        onClose={() => {
          setShowRightMenu(false);
          setShowSortMenu(false);
        }}
        onViewList={handleViewList}
        onSync={handleSync}
        onImport={handleImport}
      />

      {/* Estado de conexión */}
      <ConnectionStatus
        isOnline={true}
        onRefresh={handleSync}
        pendingSync={0}
      />

      {/* Header */}
      <Header
        selectedCategory={selectedCategory}
        onCategorySelected={setSelectedCategory}
        onLeftMenuTap={() => setShowLeftMenu(true)}
        onRightMenuTap={() => setShowRightMenu(true)}
        availableTags={availableTags}
      />

      {/* Barra de búsqueda y controles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2 items-center relative sort-menu-container">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </motion.button>
            )}
          </div>
          
          {/* Botón de ordenamiento */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="relative p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {currentSortOption !== 'newest' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </motion.button>

            {/* Menú de ordenamiento */}
            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden z-50"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
                    <h3 className="text-white font-semibold text-sm">Ordenar por</h3>
                  </div>
                  <div className="p-2">
                    {Object.entries(sortOptions).map(([key, { label }]) => (
                      <motion.button
                        key={key}
                        whileHover={{ x: 5 }}
                        onClick={() => {
                          setCurrentSortOption(key as SortOption);
                          setShowSortMenu(false);
                        }}
                        className={`
                          w-full px-4 py-3 rounded-lg text-left transition-all flex items-center justify-between
                          ${currentSortOption === key 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }
                        `}
                      >
                        <span className="text-sm">{label}</span>
                        {currentSortOption === key && (
                          <Check className="w-4 h-4" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Barra de selección múltiple */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-0 z-40 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <span className="font-medium flex items-center gap-2">
                <Check className="w-5 h-5" />
                {selectedCount} nota{selectedCount !== 1 ? 's' : ''} seleccionada{selectedCount !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="px-4 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
                >
                  {selectedCount === displayNotes.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de notas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {displayNotes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EmptyState
                type="notes"
                actionLabel="Crear primera nota"
                onAction={handleCreateNote}
              />
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                currentView === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4 max-w-4xl mx-auto'
              }
            >
              {displayNotes.map((note: Note, index: number) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NoteCard
                    note={note}
                    onClick={() => handleNoteClick(note.id)}
                    onEdit={() => handleEditNote(note.id)}
                    onDelete={() => handleDeleteNote(note.id)}
                    onToggleFavorite={() => handleToggleFavorite(note.id)}
                    onToggleArchive={() => handleToggleArchive(note.id)}
                    isSelected={selectedNotes.has(note.id)}
                    isGridMode={currentView === 'grid'}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB mejorado con menú de opciones */}
      <div className="fixed bottom-6 right-6 z-50" ref={fabMenuRef}>
        <AnimatePresence>
          {isFabMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute bottom-20 right-0 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <MoreVertical className="w-4 h-4" />
                  Acciones rápidas
                </h3>
              </div>

              <div className="p-2">
                {/* Opción Crear nota */}
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={handleCreateNote}
                  className="w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Crear nota
                  </span>
                </motion.button>

                {/* Opción Seleccionar múltiple */}
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => {
                    setIsSelectionMode(true);
                    setIsFabMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Seleccionar múltiple
                  </span>
                </motion.button>

                {/* Opción Eliminar seleccionadas */}
                {selectedNotes.size > 0 && (
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={handleDeleteMultipleNotes}
                    disabled={isDeletingMultiple}
                    className="w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 group disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                      {isDeletingMultiple ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        {isDeletingMultiple ? 'Eliminando...' : 'Eliminar seleccionadas'}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {selectedNotes.size} nota{selectedNotes.size !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón FAB principal */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          disabled={isDeletingMultiple || isSyncing}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl flex items-center justify-center relative disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? (
            <RefreshCw className="w-6 h-6 animate-spin" />
          ) : (
            <Plus className={`w-6 h-6 transition-transform duration-300 ${isFabMenuOpen ? 'rotate-45' : ''}`} />
          )}
        </motion.button>
      </div>

      {/* Indicador de sincronización */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">
              Sincronizando...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesPage;