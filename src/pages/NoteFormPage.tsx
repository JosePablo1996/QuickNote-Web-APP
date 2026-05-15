import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { useTheme } from '../hooks/useTheme';
import NoteForm from '../contexts/components/notes/NoteForm';
import LoadingSpinner from '../contexts/components/ui/LoadingSpinner';
import { Note, NoteCreate, NoteUpdate } from '../models/Note';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, Sparkles, LayoutGrid, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';

// ========== IMPORTACIONES DE NUEVAS PROPIEDADES ==========
import {
  NOTE_ICONS,
  NOTE_SIZES,
  COLOR_INTENSITIES,
  getIconConfig,
  getSizeConfig,
  getIntensityConfig
} from '../models/Note';

const NoteFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { success, error: showError, info } = useToast();
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
      
      const timer = setTimeout(() => {
        try {
          const foundNote = getNoteById(id);
          console.log('📌 Nota encontrada:', foundNote);
          console.log('🎨 Propiedades de personalización:', {
            icon: foundNote?.icon,
            size: foundNote?.size,
            colorIntensity: foundNote?.colorIntensity,
            shape: foundNote?.shape,
            color: foundNote?.color
          });
          
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
        // MODO EDICIÓN - Incluir todas las nuevas propiedades
        console.log('✏️ Actualizando nota ID:', id);
        console.log('📝 Datos recibidos del formulario:', noteData);
        console.log('🎨 Nuevas propiedades a actualizar:', {
          icon: noteData.icon,
          size: noteData.size,
          colorIntensity: noteData.colorIntensity,
          shape: noteData.shape
        });
        
        // Crear un objeto limpio con TODOS los campos incluyendo las nuevas propiedades
        const cleanUpdateData: NoteUpdate = {
          title: noteData.title,
          content: noteData.content,
          color: noteData.color,
          shape: noteData.shape,
          icon: noteData.icon,
          size: noteData.size,
          colorIntensity: noteData.colorIntensity,
          is_favorite: noteData.is_favorite,
          is_archived: noteData.is_archived,
          tags: noteData.tags,
        };
        
        // Si hay deleted_at (para restauración), lo incluimos
        if ('deleted_at' in noteData && noteData.deleted_at) {
          cleanUpdateData.deleted_at = noteData.deleted_at;
        }
        
        console.log('✅ Datos limpios a actualizar (con todas las propiedades):', cleanUpdateData);
        
        const updated = await updateNote(id, cleanUpdateData);
        if (updated) {
          // Mostrar mensaje con los cambios aplicados
          const changes = [];
          if (noteData.icon !== note.icon) changes.push(`icono a ${getIconConfig(noteData.icon as any).label}`);
          if (noteData.size !== note.size) changes.push(`tamaño a ${getSizeConfig(noteData.size as any).label}`);
          if (noteData.colorIntensity !== note.colorIntensity) changes.push(`intensidad a ${getIntensityConfig(noteData.colorIntensity as any).label}`);
          if (noteData.shape !== note.shape) changes.push(`forma a ${noteData.shape}`);
          if (noteData.color !== note.color) changes.push(`color`);
          
          if (changes.length > 0) {
            success(`✅ Nota actualizada exitosamente (${changes.join(', ')})`);
          } else {
            success('✅ Nota actualizada exitosamente');
          }
          
          console.log('✅ Nota actualizada exitosamente, redirigiendo a:', `/notes/${id}`);
          navigate(`/notes/${id}`);
        } else {
          setError('Error al actualizar la nota');
          setIsSubmitting(false);
        }
      } else {
        // MODO CREACIÓN - Incluir todas las nuevas propiedades
        console.log('➕ Creando nueva nota con datos:', noteData);
        console.log('🎨 Nuevas propiedades a crear:', {
          icon: noteData.icon,
          size: noteData.size,
          colorIntensity: noteData.colorIntensity,
          shape: noteData.shape
        });
        
        // Extraer user_id si existe y crear objeto limpio con todas las propiedades
        const { user_id, ...cleanCreateData } = noteData as any;
        
        // Asegurar que todas las propiedades tengan valores por defecto si no vienen
        const createDataWithDefaults = {
          ...cleanCreateData,
          shape: cleanCreateData.shape || 'rounded',
          icon: cleanCreateData.icon || 'default',
          size: cleanCreateData.size || 'normal',
          colorIntensity: cleanCreateData.colorIntensity || 'medium',
        };
        
        console.log('✅ Datos limpios a crear (con todas las propiedades):', createDataWithDefaults);
        
        const created = await createNote(createDataWithDefaults as NoteCreate);
        if (created) {
          success(`✅ Nota creada exitosamente con ${getIconConfig(created.icon as any).label} icono, ${getSizeConfig(created.size as any).label} tamaño y ${getIntensityConfig(created.colorIntensity as any).label} intensidad`);
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

  // Obtener información de personalización para mostrar en la UI (si existe la nota)
  const getPersonalizationBadges = () => {
    if (!note) return null;
    
    const iconConfig = getIconConfig(note.icon as any);
    const sizeConfig = getSizeConfig(note.size as any);
    const intensityConfig = getIntensityConfig(note.colorIntensity as any);
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {note.icon && note.icon !== 'default' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <span className="text-sm">{iconConfig.iconName}</span>
            {iconConfig.label}
          </span>
        )}
        {note.size && note.size !== 'normal' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            📐 {sizeConfig.label}
          </span>
        )}
        {note.colorIntensity && note.colorIntensity !== 'medium' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            💧 {intensityConfig.label}
          </span>
        )}
        {note.shape && note.shape !== 'rounded' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
            ⬛ {note.shape === 'square' ? 'Cuadrado' : note.shape === 'oval' ? 'Ovalado' : 'Píldora'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {/* Botón flotante para volver - Mejorado */}
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
          title="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform duration-300 group-hover:-translate-x-0.5" />
        </motion.button>
      </motion.div>

      {/* Badge flotante de estado - Mejorado */}
      {id && note && (
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Mensaje de error mejorado */}
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

        {/* Título de la página - Rediseñado */}
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
            {id ? 'Editar nota' : 'Crear nueva nota'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md mx-auto">
            {id 
              ? 'Modifica el contenido, color, forma y personalización de tu nota' 
              : 'Personaliza tu nota con colores, formas, iconos, tamaños y etiquetas'}
          </p>
          
          {/* Mostrar badges de personalización actual */}
          {id && note && getPersonalizationBadges()}
        </motion.div>

        {/* Formulario de nota - Ahora con layout de 2 columnas incluido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <NoteForm
            note={note}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </motion.div>

        {/* Mensaje de ayuda - Actualizado con nuevas características */}
        {!id && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 <span className="font-medium">Tip:</span> Puedes personalizar tu nota con:
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span className="inline-flex items-center gap-1">🎨 <span>Colores</span></span>
              <span className="inline-flex items-center gap-1">⬛ <span>Formas</span></span>
              <span className="inline-flex items-center gap-1">✨ <span>Iconos</span></span>
              <span className="inline-flex items-center gap-1">📐 <span>Tamaños</span></span>
              <span className="inline-flex items-center gap-1">💧 <span>Intensidad de color</span></span>
            </div>
          </motion.div>
        )}

        {/* Información de características - Actualizada para notas existentes */}
        {id && note && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
          >
            <div className="text-center p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                🎨 <span className="font-medium">Color:</span> {note.color}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ⬛ <span className="font-medium">Forma:</span> {note.shape || 'rounded'}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ✨ <span className="font-medium">Icono:</span> {getIconConfig(note.icon as any).label}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                📐 <span className="font-medium">Tamaño:</span> {getSizeConfig(note.size as any).label}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💧 <span className="font-medium">Intensidad:</span> {getIntensityConfig(note.colorIntensity as any).label}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                🏷️ <span className="font-medium">Etiquetas:</span> {note.tags?.length || 0}
              </p>
            </div>
          </motion.div>
        )}

        {/* Preview de cómo se verá la nota - Solo en creación */}
        {!id && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Todas las opciones de personalización están disponibles en el panel derecho
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NoteFormPage;