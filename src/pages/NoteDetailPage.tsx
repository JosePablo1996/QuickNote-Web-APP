import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { useTheme } from '../hooks/useTheme';
import NoteDetail from '../components/notes/NoteDetail';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Note } from '../models/Note';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const {
    notes,
    isLoading,
    toggleFavorite,
    toggleArchive,
    deleteNote,
  } = useNotes();

  const [note, setNote] = useState<Note | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Buscar la nota cuando cambien las notas o el ID
  useEffect(() => {
    if (id && notes.length > 0) {
      console.log('🔍 Buscando nota con ID:', id);
      const foundNote = notes.find(n => n.id === id);
      setNote(foundNote);
      setLoading(false);
    } else if (notes.length === 0) {
      setLoading(true);
    }
  }, [id, notes]);

  const handleEdit = () => {
    navigate(`/notes/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!note) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      const success = await deleteNote(note.id);
      if (success) {
        navigate('/notes');
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!note) return;
    const success = await toggleFavorite(note.id);
    if (success) {
      const updatedNote: Note = {
        ...note,
        is_favorite: !note.is_favorite
      };
      setNote(updatedNote);
    }
  };

  const handleToggleArchive = async () => {
    if (!note) return;
    const success = await toggleArchive(note.id);
    if (success) {
      const updatedNote: Note = {
        ...note,
        is_archived: !note.is_archived
      };
      setNote(updatedNote);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/tags/${encodeURIComponent(tag)}`);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando nota..." />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <EmptyState
          title="Nota no encontrada"
          message="La nota que buscas no existe o ha sido eliminada"
          actionLabel="Volver a notas"
          onAction={() => navigate('/notes')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Botón flotante para volver */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 left-4 z-10"
      >
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/notes')}
          className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all"
          aria-label="Volver a notas"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </motion.button>
      </motion.div>

      <NoteDetail
        note={note}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onToggleArchive={handleToggleArchive}
        onTagClick={handleTagClick}
      />
    </div>
  );
};

export default NoteDetailPage;