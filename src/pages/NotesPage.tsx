import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useNotes } from '../hooks/useNotes';
import { SortOption, sortOptions } from '../utils/sortUtils';
import Header from '../contexts/components/layout/Header';
import LeftMenu from '../contexts/components/layout/LeftMenu';
import RightMenu from '../contexts/components/layout/RightMenu';
import ConnectionStatus from '../contexts/components/layout/ConnectionStatus';
import NoteCard from '../contexts/components/notes/NoteCard';
import EmptyState from '../contexts/components/ui/EmptyState';
import LoadingSpinner from '../contexts/components/ui/LoadingSpinner';
import ViewToggle from '../contexts/components/ui/ViewToggle';
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
  MoreVertical,
  Filter,
  Sparkles,
  GripVertical,
  Droplet,
  Shapes,
  LayoutGrid,
  List,
  Download
} from 'lucide-react';
import ExportButton from '../contexts/components/export/ExportButton';
import AutoBackupIndicator from '../contexts/components/backup/AutoBackupIndicator';
import { useAutoBackup } from '../hooks/useAutoBackup';

// ========== IMPORTACIONES DE NUEVAS PROPIEDADES ==========
import {
  NOTE_ICONS,
  NOTE_SIZES,
  COLOR_INTENSITIES,
  NoteIcon,
  NoteSize,
  ColorIntensity,
  getIconConfig,
  getSizeConfig,
  getIntensityConfig
} from '../models/Note';

const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { info, success, error: showError } = useToast();
  
  // Refs para controlar cargas
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

  // ✅ Estado del auto-backup para saber si hay cambios pendientes
  const { pendingChanges } = useAutoBackup({ enabled: true });

  // Estados para los menús
  const [showLeftMenu, setShowLeftMenu] = useState(false);
  const [showRightMenu, setShowRightMenu] = useState(false);
  
  // Estados para el header y filtros
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // ========== NUEVOS FILTROS ==========
  const [selectedIcon, setSelectedIcon] = useState<NoteIcon | 'all'>('all');
  const [selectedSize, setSelectedSize] = useState<NoteSize | 'all'>('all');
  const [selectedIntensity, setSelectedIntensity] = useState<ColorIntensity | 'all'>('all');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  // ===================================
  
  // Estados para selección múltiple
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Estado para el menú FAB
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const fabMenuRef = useRef<HTMLDivElement>(null);

  // Estados para operaciones
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
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

  // Cargar notas SOLO UNA VEZ al montar
  useEffect(() => {
    if (!initialLoadRef.current) {
      console.log('📝 NotesPage montado, cargando notas por primera vez...');
      initialLoadRef.current = true;
      loadNotes();
    }
  }, []);

  // Filtrar notas activas (no archivadas, no eliminadas)
  useEffect(() => {
    if (isMountedRef.current) {
      const active = notes.filter(note => !note.is_archived && !note.deleted_at);
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
    
    // Cargar filtros guardados
    const savedIcon = localStorage.getItem('notes_filter_icon') as NoteIcon | 'all' | null;
    const savedSize = localStorage.getItem('notes_filter_size') as NoteSize | 'all' | null;
    const savedIntensity = localStorage.getItem('notes_filter_intensity') as ColorIntensity | 'all' | null;
    
    if (savedIcon) setSelectedIcon(savedIcon);
    if (savedSize) setSelectedSize(savedSize);
    if (savedIntensity) setSelectedIntensity(savedIntensity);
  }, []);

  // Guardar preferencias cuando cambien
  useEffect(() => {
    localStorage.setItem('notes_view', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('notes_sort', currentSortOption);
  }, [currentSortOption]);

  // Guardar filtros
  useEffect(() => {
    localStorage.setItem('notes_filter_icon', selectedIcon);
    localStorage.setItem('notes_filter_size', selectedSize);
    localStorage.setItem('notes_filter_intensity', selectedIntensity);
    
    // Contar filtros activos
    let count = 0;
    if (selectedIcon !== 'all') count++;
    if (selectedSize !== 'all') count++;
    if (selectedIntensity !== 'all') count++;
    setActiveFiltersCount(count);
  }, [selectedIcon, selectedSize, selectedIntensity]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabMenuRef.current && !fabMenuRef.current.contains(event.target as Node)) {
        setIsFabMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // ========== NUEVAS FUNCIONES DE FILTRADO ==========
  const filterByIcon = useCallback((notesToFilter: Note[]): Note[] => {
    if (selectedIcon === 'all') return notesToFilter;
    return notesToFilter.filter(note => (note.icon as NoteIcon) === selectedIcon);
  }, [selectedIcon]);

  const filterBySize = useCallback((notesToFilter: Note[]): Note[] => {
    if (selectedSize === 'all') return notesToFilter;
    return notesToFilter.filter(note => (note.size as NoteSize) === selectedSize);
  }, [selectedSize]);

  const filterByIntensity = useCallback((notesToFilter: Note[]): Note[] => {
    if (selectedIntensity === 'all') return notesToFilter;
    return notesToFilter.filter(note => (note.colorIntensity as ColorIntensity) === selectedIntensity);
  }, [selectedIntensity]);
  // ================================================

  // Limpiar todos los filtros
  const clearAllFilters = useCallback(() => {
    setSelectedIcon('all');
    setSelectedSize('all');
    setSelectedIntensity('all');
    setCurrentSortOption('newest');
    info('🧹 Filtros eliminados');
  }, [info]);

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
    console.log('Importando archivo:', file.name);
    return new Promise((resolve) => {
      setTimeout(() => {
        info('📥 Importación completada (simulada)');
        resolve();
      }, 1500);
    });
  }, [info]);

  // Filtrar y ordenar notas (actualizado con nuevos filtros)
  const getFilteredAndSortedNotes = useCallback(() => {
    let filtered = activeNotes;

    // Filtro por categoría/etiqueta
    if (selectedCategory !== 'Todas') {
      filtered = getNotesByTag(selectedCategory).filter((note: Note) => 
        !note.is_archived && !note.deleted_at
      );
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      filtered = searchNotes(searchQuery).filter((note: Note) => 
        !note.is_archived && !note.deleted_at
      );
    }

    // ========== NUEVOS FILTROS ==========
    filtered = filterByIcon(filtered);
    filtered = filterBySize(filtered);
    filtered = filterByIntensity(filtered);
    // ====================================

    return sortNotes(filtered, currentSortOption);
  }, [activeNotes, selectedCategory, searchQuery, getNotesByTag, searchNotes, sortNotes, currentSortOption, filterByIcon, filterBySize, filterByIntensity]);

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
        success('✅ Nota eliminada correctamente');
        if (isSelectionMode) {
          setSelectedNotes(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }
      } else {
        showError('❌ Error al eliminar la nota');
      }
    }
  };

  const handleToggleArchive = async (id: string) => {
    const successResult = await toggleArchive(id);
    if (successResult && isMountedRef.current) {
      const note = activeNotes.find(n => n.id === id);
      success(note?.is_archived ? '📦 Nota archivada' : '📦 Nota restaurada');
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
    const successResult = await toggleFavorite(id);
    if (successResult) {
      const note = activeNotes.find(n => n.id === id);
      success(note?.is_favorite ? '⭐ Nota añadida a favoritos' : '⭐ Nota eliminada de favoritos');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setShowRightMenu(false);
    setIsFabMenuOpen(false);
    
    await syncNotes();
    
    if (isMountedRef.current) {
      setIsSyncing(false);
      success('🔄 Notas sincronizadas correctamente');
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

  // Obtener estadísticas de filtros
  const getFilterStats = () => {
    const iconCount = filterByIcon(activeNotes).length;
    const sizeCount = filterBySize(activeNotes).length;
    const intensityCount = filterByIntensity(activeNotes).length;
    return { iconCount, sizeCount, intensityCount };
  };

  const filterStats = getFilterStats();

  // Componente Selector responsivo
  const FilterSelect = ({ 
    label, 
    value, 
    onChange, 
    options, 
    icon: Icon,
    getOptionLabel,
    getOptionIcon
  }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm cursor-pointer hover:bg-white dark:hover:bg-gray-800 min-h-[44px]"
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {getOptionLabel ? getOptionLabel(option) : option.label}
          </option>
        ))}
      </select>
    </div>
  );

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
        }}
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

      {/* Barra de búsqueda y filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Búsqueda */}
        <div className="relative mb-4">
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
              exit={{ scale: 0 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </motion.button>
          )}
        </div>

        {/* Filtros - Grid responsivo */}
        {/* Móvil: grid 2 columnas, Tablet: grid 3 columnas, Desktop: flex row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-3 lg:gap-4">
          {/* Filtro por Icono */}
          <FilterSelect
            label="Icono"
            value={selectedIcon}
            onChange={setSelectedIcon}
            icon={Sparkles}
            options={[
              { value: 'all', label: `Todos (${activeNotes.length})` },
              ...NOTE_ICONS.map(icon => ({ 
                value: icon.value, 
                label: `${icon.iconName} ${icon.label}` 
              }))
            ]}
            getOptionLabel={(option: any) => option.label}
          />

          {/* Filtro por Tamaño */}
          <FilterSelect
            label="Tamaño"
            value={selectedSize}
            onChange={setSelectedSize}
            icon={GripVertical}
            options={[
              { value: 'all', label: `Todos (${activeNotes.length})` },
              ...NOTE_SIZES.map(size => ({ 
                value: size.value, 
                label: size.label 
              }))
            ]}
            getOptionLabel={(option: any) => option.label}
          />

          {/* Filtro por Intensidad */}
          <FilterSelect
            label="Intensidad"
            value={selectedIntensity}
            onChange={setSelectedIntensity}
            icon={Droplet}
            options={[
              { value: 'all', label: `Todos (${activeNotes.length})` },
              ...COLOR_INTENSITIES.map(intensity => ({ 
                value: intensity.value, 
                label: intensity.label 
              }))
            ]}
            getOptionLabel={(option: any) => option.label}
          />

          {/* Ordenar por */}
          <FilterSelect
            label="Ordenar por"
            value={currentSortOption}
            onChange={(value: SortOption) => setCurrentSortOption(value)}
            icon={ChevronDown}
            options={Object.entries(sortOptions).map(([key, { label }]) => ({
              value: key,
              label
            }))}
            getOptionLabel={(option: any) => option.label}
          />

          {/* Vista - Toggle entre Grid y Lista */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5" />
              Vista
            </label>
            <div className="flex gap-2 min-h-[44px]">
              <button
                onClick={() => setCurrentView('grid')}
                className={`flex-1 px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  currentView === 'grid'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setCurrentView('list')}
                className={`flex-1 px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  currentView === 'list'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Lista</span>
              </button>
            </div>
          </div>

          {/* Exportar */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Exportar
            </label>
            <div className="min-h-[44px]">
              <ExportButton 
                variant="secondary" 
                size="md" 
                selectedNoteIds={Array.from(selectedNotes)}
                className="w-full h-full min-h-[44px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Indicador de filtros activos */}
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-4 flex-wrap"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">Filtros activos:</span>
            {selectedIcon !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-3 h-3" />
                {getIconConfig(selectedIcon).label}
                <button onClick={() => setSelectedIcon('all')} className="ml-1 hover:text-blue-800">×</button>
              </span>
            )}
            {selectedSize !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <GripVertical className="w-3 h-3" />
                {getSizeConfig(selectedSize).label}
                <button onClick={() => setSelectedSize('all')} className="ml-1 hover:text-green-800">×</button>
              </span>
            )}
            {selectedIntensity !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Droplet className="w-3 h-3" />
                {getIntensityConfig(selectedIntensity).label}
                <button onClick={() => setSelectedIntensity('all')} className="ml-1 hover:text-purple-800">×</button>
              </span>
            )}
            {currentSortOption !== 'newest' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                <ChevronDown className="w-3 h-3" />
                {sortOptions[currentSortOption].label}
                <button onClick={() => setCurrentSortOption('newest')} className="ml-1 hover:text-orange-800">×</button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Limpiar todos
            </button>
          </motion.div>
        )}
      </div>

      {/* Barra de selección múltiple */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="sticky top-0 z-40 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <motion.span 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="font-medium flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                {selectedCount} nota{selectedCount !== 1 ? 's' : ''} seleccionada{selectedCount !== 1 ? 's' : ''}
              </motion.span>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleSelectAll}
                  className="px-4 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
                >
                  {selectedCount === displayNotes.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearSelection}
                  className="px-4 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
                >
                  Cancelar
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de notas con transición suave entre vistas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {displayNotes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <EmptyState
                type="notes"
                actionLabel="Crear primera nota"
                onAction={handleCreateNote}
              />
              {activeFiltersCount > 0 && (
                <div className="text-center mt-4">
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Limpiar filtros para ver todas las notas
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {/* Contador de resultados con widget de auto-backup integrado */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Mostrando {displayNotes.length} nota{displayNotes.length !== 1 ? 's' : ''}
                  {activeFiltersCount > 0 && ' (filtradas)'}
                </div>
                
                {/* ✅ Widget de Auto-Backup - Solo aparece cuando hay cambios pendientes */}
                {pendingChanges && (
                  <div className="flex-shrink-0">
                    <AutoBackupIndicator position="inline" />
                  </div>
                )}
              </div>
              
              <motion.div
                key={`${currentView}-${displayNotes.length}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
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
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    layout
                    layoutId={`note-${note.id}`}
                    className={currentView === 'list' ? 'w-full' : ''}
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
            </>
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
              transition={{ duration: 0.2 }}
              className="absolute bottom-20 right-0 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <MoreVertical className="w-4 h-4" />
                  Acciones rápidas
                </h3>
              </div>

              <div className="p-2">
                <motion.button
                  whileHover={{ x: 5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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

                <motion.button
                  whileHover={{ x: 5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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

                {selectedNotes.size > 0 && (
                  <motion.button
                    whileHover={{ x: 5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotate: isFabMenuOpen ? 45 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Plus className="w-6 h-6" />
            </motion.div>
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
            transition={{ duration: 0.2 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            <span className="text-sm font-medium">Sincronizando...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesPage;