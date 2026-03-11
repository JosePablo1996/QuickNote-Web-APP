import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { useTheme } from '../hooks/useTheme';
import NoteForm from '../components/notes/NoteForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Note, NoteCreate, NoteUpdate } from '../models/Note';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const NoteFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const {
    getNoteById,
    createNote,
    updateNote,
    isLoading,
  } = useNotes();

  const [note, setNote] = useState<Note | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar la nota si estamos en modo edición
  useEffect(() => {
    if (id) {
      setLoadingNote(true);
      setError(null);
      console.log('🔍 Cargando nota para edición, ID:', id);
      
      // Pequeño retraso para asegurar que las notas estén cargadas
      const timer = setTimeout(() => {
        try {
          const foundNote = getNoteById(id);
          console.log('📌 Nota encontrada:', foundNote);
          
          if (foundNote) {
            setNote(foundNote);
          } else {
            setError(`No se encontró la nota con ID: ${id}`);
          }
        } catch (err) {
          setError('Error al cargar la nota');
          console.error('Error loading note:', err);
        } finally {
          setLoadingNote(false);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setNote(undefined);
      setError(null);
    }
  }, [id, getNoteById]);

  const handleSubmit = async (noteData: NoteCreate | NoteUpdate) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (id && note) {
        // ✅ MODO EDICIÓN: Asegurar que NO se envíe user_id
        console.log('✏️ Actualizando nota ID:', id);
        console.log('📝 Datos recibidos del formulario:', noteData);
        
        // Crear un objeto limpio con SOLO los campos permitidos
        const cleanUpdateData: NoteUpdate = {
          title: noteData.title,
          content: noteData.content,
          color: noteData.color,
          is_favorite: noteData.is_favorite,
          is_archived: noteData.is_archived,
          tags: noteData.tags,
        };
        
        // Si hay deleted_at (para restauración), lo incluimos
        if ('deleted_at' in noteData && noteData.deleted_at) {
          cleanUpdateData.deleted_at = noteData.deleted_at;
        }
        
        console.log('✅ Datos limpios a actualizar (sin user_id):', cleanUpdateData);
        
        const updated = await updateNote(id, cleanUpdateData);
        if (updated) {
          console.log('✅ Nota actualizada exitosamente, redirigiendo a:', `/notes/${id}`);
          navigate(`/notes/${id}`);
        } else {
          setError('Error al actualizar la nota');
          setIsSubmitting(false);
        }
      } else {
        // ✅ MODO CREACIÓN: Asegurar que NO se envíe user_id
        console.log('➕ Creando nueva nota con datos:', noteData);
        
        // Extraer user_id si existe (por si acaso) y crear objeto limpio
        const { user_id, ...cleanCreateData } = noteData as any;
        
        console.log('✅ Datos limpios a crear (sin user_id):', cleanCreateData);
        
        const created = await createNote(cleanCreateData as NoteCreate);
        if (created) {
          console.log('✅ Nota creada exitosamente con ID:', created.id);
          navigate(`/notes/${created.id}`);
        } else {
          setError('Error al crear la nota');
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      console.error('❌ Error en submit:', err);
      setError('Error al guardar la nota');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/notes/${id}`);
    } else {
      navigate('/notes');
    }
  };

  // Mostrar loading mientras carga la nota en modo edición
  if ((isLoading || loadingNote) && id && !note && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando nota..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
      {/* Botón flotante para volver */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 left-4 z-10"
      >
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCancel}
          className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all"
          aria-label="Volver"
          title="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </motion.button>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Mensaje de error si no se encuentra la nota */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
              <p className="text-xs text-red-600/70 dark:text-red-500/70 mt-1">
                Puedes crear una nota nueva en su lugar.
              </p>
            </div>
            <button
              onClick={() => navigate('/notes/new')}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
            >
              Crear nueva nota
            </button>
          </motion.div>
        )}

        {/* Título de la página */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {id ? 'Editar nota' : 'Crear nueva nota'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {id 
              ? 'Modifica el contenido de tu nota' 
              : 'Escribe tus ideas, pensamientos o recordatorios'}
          </p>
        </motion.div>

        {/* Formulario de nota */}
        <NoteForm
          note={note}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default NoteFormPage;