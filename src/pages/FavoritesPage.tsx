import React, { useState, useEffect, useRef } from 'react';
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
  ArrowLeft, 
  Star, 
  Grid3x3, 
  Rows, 
  Heart,
  Sparkles,
  Zap
} from 'lucide-react';

type ViewMode = 'grid' | 'list';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { success, error: showError } = useToast();
  const { 
    notes, 
    isLoading, 
    toggleFavorite, 
    toggleArchive,
    deleteNote,
    loadNotes 
  } = useNotes();
  
  const [favoriteNotes, setFavoriteNotes] = useState<Note[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedView = localStorage.getItem('favorites_view') as ViewMode;
    return savedView || 'list';
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Usar ref para controlar montaje y carga inicial
  const isMountedRef = useRef(true);
  const initialLoadRef = useRef(false);

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
      console.log('⭐ FavoritesPage: Cargando notas por primera vez...');
      initialLoadRef.current = true;
      loadNotes();
    }
  }, [loadNotes]);

  // Guardar preferencia de vista
  useEffect(() => {
    localStorage.setItem('favorites_view', viewMode);
  }, [viewMode]);

  // Filtrar notas favoritas (activas, no archivadas, no eliminadas)
  useEffect(() => {
    if (isMountedRef.current) {
      const favorites = notes.filter(note => 
        note.is_favorite && !note.is_archived && !note.deleted_at
      );
      console.log('⭐ Notas favoritas:', favorites.length);
      setFavoriteNotes(favorites);
    }
  }, [notes]);

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    success(`Vista cambiada a ${viewMode === 'grid' ? 'lista' : 'cuadrícula'}`);
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
      const successResult = await deleteNote(id);
      if (successResult && isMountedRef.current) {
        success('🗑️ Nota movida a la papelera');
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
      success('📦 Nota archivada');
    }
    if (isMountedRef.current) {
      setIsProcessing(false);
    }
  };

  if (isLoading && favoriteNotes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando notas favoritas..." />
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
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Notas Favoritas
                </h1>
              </div>
              
              {favoriteNotes.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full text-sm border border-yellow-500/20 flex items-center gap-1"
                >
                  <Star className="w-3 h-3 fill-yellow-500" />
                  {favoriteNotes.length} nota{favoriteNotes.length !== 1 ? 's' : ''}
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Botón de cambio de vista */}
              {favoriteNotes.length > 0 && (
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

              {/* Botón de información */}
              {favoriteNotes.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="hidden sm:flex items-center gap-1 px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs border border-purple-500/20"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Tus notas destacadas</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {favoriteNotes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EmptyState
                type="favorites"
                actionLabel="Ir a todas las notas"
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
              {favoriteNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  {/* Efecto de brillo para favoritos */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Badge de favorito animado */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 z-10"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-500 rounded-full blur-md opacity-50" />
                      <div className="relative w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Star className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                  </motion.div>

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
          )}
        </AnimatePresence>

        {/* Mensaje inspirador si hay favoritas */}
        {favoriteNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-full border border-yellow-500/20">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {favoriteNotes.length} nota{favoriteNotes.length !== 1 ? 's' : ''} favorita{favoriteNotes.length !== 1 ? 's' : ''} · Sigue así
              </span>
              <Heart className="w-4 h-4 text-red-500" />
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
    </div>
  );
};

export default FavoritesPage;