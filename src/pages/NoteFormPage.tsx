// src/pages/NoteFormPage.tsx
// ============================================================================
// PÁGINA PRINCIPAL DE CREACIÓN/EDICIÓN DE NOTAS (SIMPLIFICADA)
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, Sparkles, LayoutGrid, CheckCircle } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import NoteSimpleForm from '../contexts/components/notes/NoteSimpleForm';
import LoadingSpinner from '../contexts/components/ui/LoadingSpinner';
import { Note, NoteCreate } from '../models/Note';

// Estado inicial por defecto
const getDefaultDraft = (): NoteCreate => ({
  title: '',
  content: '',
  color: '#3B82F6',
  shape: 'rounded',
  icon: 'default',
  size: 'normal',
  colorIntensity: 'medium',
  is_favorite: false,
  is_archived: false,
  tags: [],
});

const NoteFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { success, error: showError } = useToast();
  const { notes, getNoteById, createNote, updateNote, isLoading } = useNotes();
  
  const [draft, setDraft] = useState<NoteCreate>(getDefaultDraft());
  const [existingNote, setExistingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar nota existente si es modo edición o recuperar draft guardado
  useEffect(() => {
    const savedDraft = sessionStorage.getItem('noteDraft');
    const isEditMode = !!id;
    
    if (isEditMode && notes.length > 0) {
      const found = notes.find(n => n.id === id);
      if (found) {
        setExistingNote(found);
        setDraft({
          title: found.title || '',
          content: found.content || '',
          color: found.color || '#3B82F6',
          shape: (found.shape as any) || 'rounded',
          icon: (found.icon as any) || 'default',
          size: (found.size as any) || 'normal',
          colorIntensity: (found.colorIntensity as any) || 'medium',
          is_favorite: found.is_favorite || false,
          is_archived: found.is_archived || false,
          tags: found.tags || [],
        });
        setLoading(false);
      } else {
        setError(`No se encontró la nota con ID: ${id}`);
        setLoading(false);
      }
    } else if (savedDraft && !isEditMode) {
      try {
        const parsed = JSON.parse(savedDraft);
        setDraft({
          ...getDefaultDraft(),
          ...parsed,
          tags: parsed.tags || [],
        });
      } catch (e) {
        console.error('Error parsing draft:', e);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [id, notes]);

  // Navegar a la página de personalización
  const handleCustomize = () => {
    // Guardar borrador en sessionStorage para mantener los cambios
    sessionStorage.setItem('noteDraft', JSON.stringify(draft));
    if (id) {
      navigate(`/notes/${id}/edit/customize`);
    } else {
      navigate('/notes/new/customize');
    }
  };

  // Guardar nota
  const handleSubmit = async (noteData: NoteCreate) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (existingNote) {
        // Modo edición
        console.log('✏️ Actualizando nota ID:', id);
        console.log('📝 Datos recibidos:', noteData);
        
        const updated = await updateNote(existingNote.id, noteData);
        if (updated) {
          success('✅ Nota actualizada exitosamente');
          navigate(`/notes/${existingNote.id}`);
        } else {
          setError('Error al actualizar la nota');
        }
      } else {
        // Modo creación
        console.log('➕ Creando nueva nota:', noteData);
        
        const created = await createNote(noteData);
        if (created) {
          success('✅ Nota creada exitosamente');
          // Limpiar draft después de crear
          sessionStorage.removeItem('noteDraft');
          navigate(`/notes/${created.id}`);
        } else {
          setError('Error al crear la nota');
        }
      }
    } catch (err) {
      console.error('❌ Error en submit:', err);
      setError('Error al guardar la nota');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar y volver
  const handleCancel = () => {
    // Limpiar draft si existe
    sessionStorage.removeItem('noteDraft');
    if (id) {
      navigate(`/notes/${id}`);
    } else {
      navigate('/notes');
    }
  };

  // Mostrar loading
  if ((isLoading || loading) && id && !existingNote && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando nota..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {/* Botón flotante para volver */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-6 left-6 z-20"
      >
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCancel}
          className="group p-3 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform duration-300 group-hover:-translate-x-0.5" />
        </motion.button>
      </motion.div>

      {/* Badge flotante de estado */}
      {id && existingNote && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="fixed top-6 right-6 z-20"
        >
          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium shadow-lg backdrop-blur-sm flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Editando nota</span>
          </div>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Mensaje de error */}
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
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {id ? '✏️ Editar nota' : '✨ Crear nueva nota'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md mx-auto">
            {id 
              ? 'Modifica el contenido básico de tu nota' 
              : 'Completa los detalles básicos y personaliza tu experiencia'}
          </p>
        </motion.div>

        {/* Formulario simplificado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <NoteSimpleForm
            draft={draft}
            setDraft={setDraft}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onCustomize={handleCustomize}
            isSubmitting={isSubmitting}
            isEditing={!!existingNote}
          />
        </motion.div>

        {/* Mensaje de ayuda */}
        {!id && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Haz clic en "Personaliza tu experiencia" para configurar icono, color, forma y más
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NoteFormPage;