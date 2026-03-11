import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Note, NoteCreate, NoteUpdate } from '../../models/Note';
import TagChip from '../tags/TagChip';
import { DEFAULT_COLOR } from '../../utils/noteColors';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  X,
  Tag as TagIcon,
  Star,
  Archive,
  Palette,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Type,
  AlignLeft,
  Hash,
  MoreVertical,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';

interface NoteFormProps {
  note?: Note | null;
  onSubmit: (note: NoteCreate | NoteUpdate) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// Mapa de colores mejorado con más opciones (SIN DUPLICADOS)
const colorOptions = [
  { hex: '#3B82F6', name: 'Azul', class: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/30', text: 'text-blue-500' },
  { hex: '#EF4444', name: 'Rojo', class: 'bg-red-500', gradient: 'from-red-500 to-red-600', shadow: 'shadow-red-500/30', text: 'text-red-500' },
  { hex: '#10B981', name: 'Verde', class: 'bg-green-500', gradient: 'from-green-500 to-green-600', shadow: 'shadow-green-500/30', text: 'text-green-500' },
  { hex: '#F59E0B', name: 'Naranja', class: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/30', text: 'text-orange-500' },
  { hex: '#8B5CF6', name: 'Púrpura', class: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/30', text: 'text-purple-500' },
  { hex: '#14B8A6', name: 'Teal', class: 'bg-teal-500', gradient: 'from-teal-500 to-teal-600', shadow: 'shadow-teal-500/30', text: 'text-teal-500' },
  { hex: '#EC4899', name: 'Rosa', class: 'bg-pink-500', gradient: 'from-pink-500 to-pink-600', shadow: 'shadow-pink-500/30', text: 'text-pink-500' },
  { hex: '#6366F1', name: 'Índigo', class: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/30', text: 'text-indigo-500' },
  { hex: '#A855F7', name: 'Violeta', class: 'bg-violet-500', gradient: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/30', text: 'text-violet-500' },
  { hex: '#F97316', name: 'Naranja oscuro', class: 'bg-orange-600', gradient: 'from-orange-600 to-orange-700', shadow: 'shadow-orange-600/30', text: 'text-orange-600' },
  { hex: '#06B6D4', name: 'Cian', class: 'bg-cyan-500', gradient: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-500/30', text: 'text-cyan-500' },
  { hex: '#84CC16', name: 'Lima', class: 'bg-lime-500', gradient: 'from-lime-500 to-lime-600', shadow: 'shadow-lime-500/30', text: 'text-lime-500' },
];

const NoteForm: React.FC<NoteFormProps> = ({
  note,
  onSubmit,
  onCancel,
  isSubmitting: externalIsSubmitting = false,
}) => {
  const navigate = useNavigate();
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [tagError, setTagError] = useState<string | null>(null);
  const [recentTags, setRecentTags] = useState<string[]>([]);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = externalIsSubmitting || internalIsSubmitting;
  const selectedColorOption = colorOptions.find(c => c.hex === color) || colorOptions[0];

  // Cargar datos de la nota cuando existe
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || DEFAULT_COLOR);
      setIsFavorite(note.is_favorite || false);
      setIsArchived(note.is_archived || false);
      
      const noteTags = Array.isArray(note.tags) ? note.tags : [];
      setTags(noteTags);
      
      console.log('📋 Nota cargada con tags:', noteTags);
    } else {
      // Reset para nota nueva
      setTitle('');
      setContent('');
      setColor(DEFAULT_COLOR);
      setIsFavorite(false);
      setIsArchived(false);
      setTags([]);
      
      // Enfocar el campo de título para notas nuevas
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }

    // Cargar tags recientes del localStorage
    const savedRecentTags = localStorage.getItem('recentTags');
    if (savedRecentTags) {
      try {
        setRecentTags(JSON.parse(savedRecentTags).slice(0, 5));
      } catch {
        setRecentTags([]);
      }
    }
  }, [note]);

  // Actualizar contadores cuando cambia el contenido
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(content.length);
  }, [content]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; content?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (title.length > 200) {
      newErrors.title = 'El título no puede tener más de 200 caracteres';
    }
    
    if (content.length > 10000) {
      newErrors.content = 'El contenido no puede tener más de 10,000 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setInternalIsSubmitting(true);
    
    // Limpiar y normalizar tags
    const cleanTags = tags
      .filter(tag => tag && tag.trim() !== '')
      .map(tag => tag.trim().toLowerCase());
    
    console.log('🏷️ Etiquetas a guardar:', cleanTags);
    
    // Guardar tags recientes
    if (cleanTags.length > 0) {
      const allRecentTags = [...new Set([...cleanTags, ...recentTags])].slice(0, 10);
      localStorage.setItem('recentTags', JSON.stringify(allRecentTags));
    }
    
    // ✅ SEGURIDAD: Crear objeto limpio SIN ninguna propiedad extra
    // No usamos spread operator ni nada que pueda traer propiedades ocultas
    const cleanNoteData: NoteCreate = {
      title: title.trim(),
      content: content.trim(),
      color: color,
      is_favorite: isFavorite,
      is_archived: isArchived,
      tags: cleanTags,
    };
    
    console.log('📝 Enviando datos limpios (sin user_id):', cleanNoteData);
    
    try {
      await onSubmit(cleanNoteData);
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    
    // Validaciones
    if (!tag) {
      setTagError('La etiqueta no puede estar vacía');
      return;
    }
    
    if (tag.length > 30) {
      setTagError('La etiqueta no puede tener más de 30 caracteres');
      return;
    }
    
    if (tags.includes(tag)) {
      setTagError('Esta etiqueta ya existe');
      return;
    }
    
    if (tags.length >= 10) {
      setTagError('Máximo 10 etiquetas por nota');
      return;
    }
    
    // Agregar etiqueta
    setTags([...tags, tag]);
    setNewTag('');
    setTagError(null);
    
    // Enfocar el input de tags nuevamente
    setTimeout(() => {
      tagInputRef.current?.focus();
    }, 10);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newTag) {
        handleAddTag();
      }
    }
  };

  const handleAddRecentTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagError(null);
    }
  };

  const handleDeleteNote = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      onCancel();
    }
  };

  const getColorClasses = (colorHex: string) => {
    const option = colorOptions.find(c => c.hex === colorHex);
    return {
      bg: option?.class || 'bg-blue-500',
      gradient: option?.gradient || 'from-blue-500 to-blue-600',
      shadow: option?.shadow || 'shadow-blue-500/30',
      text: option?.text || 'text-blue-500',
    };
  };

  const currentColors = getColorClasses(color);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header con título y menú de tres puntos */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {note ? 'Editar nota' : 'Nueva nota'}
        </h1>
        
        {/* Botón de menú de tres puntos con animación */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`
              p-3 rounded-xl transition-all duration-300 transform
              ${isMenuOpen 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rotate-90 shadow-lg scale-110' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
              }
            `}
            aria-label="Abrir menú de opciones de la nota"
            title="Opciones de la nota"
          >
            <MoreVertical className="w-6 h-6" />
          </button>

          {/* Dropdown menu con animación mejorada - SOLO FAVORITOS Y ARCHIVAR */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
              >
                {/* Header del dropdown con gradiente animado */}
                <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-5 py-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/20 rounded-full blur-xl" />
                  <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-white/20 rounded-full blur-xl" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <MoreVertical className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">Opciones de nota</h3>
                        <p className="text-white/80 text-xs">Personaliza tu nota</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  {/* Añadir a favoritos */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsFavorite(!isFavorite);
                      setIsMenuOpen(false);
                    }}
                    className={`
                      w-full px-4 py-4 rounded-xl flex items-center gap-4 transition-all duration-300 group
                      ${isFavorite 
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800' 
                        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 border border-transparent'
                      }
                    `}
                    aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  >
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                      ${isFavorite 
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30 scale-110' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-500 dark:text-gray-400 group-hover:scale-110 group-hover:shadow-lg'
                      }
                    `}>
                      <Star className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className={`block font-semibold ${isFavorite ? 'text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {isFavorite ? 'Esta nota está en favoritos' : 'Destaca esta nota'}
                      </span>
                    </div>
                    {isFavorite && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </button>

                  {/* Archivar nota */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsArchived(!isArchived);
                      setIsMenuOpen(false);
                    }}
                    className={`
                      w-full px-4 py-4 rounded-xl flex items-center gap-4 transition-all duration-300 group
                      ${isArchived 
                        ? 'bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-800' 
                        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 border border-transparent'
                      }
                    `}
                    aria-label={isArchived ? 'Desarchivar nota' : 'Archivar nota'}
                    title={isArchived ? 'Desarchivar nota' : 'Archivar nota'}
                  >
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                      ${isArchived 
                        ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-lg shadow-teal-500/30 scale-110' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-500 dark:text-gray-400 group-hover:scale-110 group-hover:shadow-lg'
                      }
                    `}>
                      <Archive className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className={`block font-semibold ${isArchived ? 'text-teal-700 dark:text-teal-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {isArchived ? 'Desarchivar nota' : 'Archivar nota'}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {isArchived ? 'Restaurar a notas activas' : 'Mover a archivadas'}
                      </span>
                    </div>
                    {isArchived && (
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                    )}
                  </button>

                  {/* Eliminar nota - solo visible en modo edición */}
                  {note && (
                    <>
                      <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-red-200 dark:border-red-800"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-3 bg-white dark:bg-gray-800 text-xs text-red-500 dark:text-red-400">
                            Peligro
                          </span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleDeleteNote}
                        className="w-full px-4 py-4 rounded-xl flex items-center gap-4 transition-all duration-300 group hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800"
                        aria-label="Eliminar nota"
                        title="Eliminar nota"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-red-500/30 transition-all duration-300">
                          <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="block font-semibold text-red-600 dark:text-red-400">
                            Eliminar nota
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Esta acción no se puede deshacer
                          </span>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Formulario principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span>Título de la nota</span>
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                {title.length}/200
              </span>
            </div>
          </label>
          <div className="relative">
            <input
              ref={titleInputRef}
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`
                w-full px-5 py-4 rounded-xl border-2 bg-white dark:bg-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200 text-lg
                ${errors.title 
                  ? 'border-red-300 dark:border-red-700' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              placeholder="Título de la nota"
              disabled={isSubmitting}
              maxLength={200}
              aria-label="Título de la nota"
              title="Título de la nota"
            />
            {title && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
              </motion.div>
            )}
          </div>
          {errors.title && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-500 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.title}
            </motion.p>
          )}
        </div>

        {/* Contenido con vista previa */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <AlignLeft className="w-4 h-4" />
              <span>Contenido</span>
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                {wordCount} palabras · {charCount} caracteres
              </span>
            </div>
          </label>

          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
              aria-label={showPreview ? 'Ocultar vista previa' : 'Mostrar vista previa'}
              title={showPreview ? 'Ocultar vista previa' : 'Mostrar vista previa'}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPreview ? 'Ocultar vista previa' : 'Mostrar vista previa'}</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showPreview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[300px] p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 prose dark:prose-invert max-w-none"
              >
                {content ? (
                  <div className="whitespace-pre-wrap">{content}</div>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 text-center py-12">
                    Sin contenido para previsualizar
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 text-lg resize-y"
                  placeholder="Escribe tu nota aquí..."
                  disabled={isSubmitting}
                  maxLength={10000}
                  aria-label="Contenido de la nota"
                  title="Contenido de la nota"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {errors.content && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-500 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.content}
            </motion.p>
          )}
        </div>

        {/* Selector de color */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Palette className={`w-5 h-5 ${currentColors.text}`} />
            <span className="text-base font-bold text-gray-800 dark:text-gray-200">
              Color de la nota
            </span>
            <span className="ml-auto text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-medium">
              {selectedColorOption.name}
            </span>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {colorOptions.map((option) => {
              const isSelected = color === option.hex;
              
              return (
                <motion.button
                  key={option.hex}
                  type="button"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setColor(option.hex)}
                  className={`
                    relative aspect-square rounded-xl transition-all duration-300
                    bg-gradient-to-br ${option.gradient}
                    ${isSelected 
                      ? 'ring-4 ring-offset-4 ring-blue-500 scale-110 shadow-2xl' 
                      : 'hover:scale-105 shadow-lg hover:shadow-xl'
                    }
                    ${option.shadow}
                  `}
                  title={option.name}
                  aria-label={`Seleccionar color ${option.name}`}
                >
                  {isSelected && (
                    <CheckCircle className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-xl" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Etiquetas - AHORA FUERA DEL MENÚ, VISIBLE SIEMPRE */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Hash className={`w-5 h-5 ${currentColors.text}`} />
            <span className="text-base font-bold text-gray-800 dark:text-gray-200">
              Etiquetas
            </span>
            <span className="ml-auto text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-medium">
              {tags.length}/10
            </span>
          </div>

          {/* Input para nueva etiqueta */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <input
                ref={tagInputRef}
                type="text"
                value={newTag}
                onChange={(e) => {
                  setNewTag(e.target.value);
                  setTagError(null);
                }}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="ej: trabajo, personal, idea"
                disabled={isSubmitting || tags.length >= 10}
                maxLength={30}
                aria-label="Nueva etiqueta"
                title="Nueva etiqueta"
              />
              {newTag && (
                <button
                  type="button"
                  onClick={() => setNewTag('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  aria-label="Limpiar campo de etiqueta"
                  title="Limpiar"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddTag}
              disabled={!newTag.trim() || isSubmitting || tags.length >= 10}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
              aria-label="Agregar etiqueta"
              title="Agregar etiqueta"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar</span>
            </motion.button>
          </div>

          {tagError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 text-sm text-red-500 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {tagError}
            </motion.p>
          )}

          {/* Etiquetas recientes */}
          {recentTags.length > 0 && tags.length < 10 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Recientes:</p>
              <div className="flex flex-wrap gap-2">
                {recentTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddRecentTag(tag)}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label={`Agregar etiqueta reciente ${tag}`}
                    title={`Agregar etiqueta ${tag}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Etiquetas actuales */}
          {tags.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Etiquetas actuales:</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <TagChip
                    key={tag}
                    tagName={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    showIcon
                  />
                ))}
              </div>
            </div>
          )}

          {tags.length === 0 && !tagError && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No hay etiquetas. Agrega algunas para organizar mejor tus notas.
            </p>
          )}
        </div>

        {/* Estadísticas de la nota */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Clock className="w-4 h-4" />
              <span>Palabras</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{wordCount}</p>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Type className="w-4 h-4" />
              <span>Caracteres</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{charCount}</p>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Hash className="w-4 h-4" />
              <span>Etiquetas</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{tags.length}</p>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Star className="w-4 h-4" />
              <span>Favorita</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {isFavorite ? 'Sí' : 'No'}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 pt-6">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 font-bold text-lg relative overflow-hidden group"
            aria-label={note ? 'Actualizar nota' : 'Crear nota'}
            title={note ? 'Actualizar nota' : 'Crear nota'}
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            
            {isSubmitting ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                <span>{note ? 'Actualizar nota' : 'Crear nota'}</span>
              </>
            )}
          </motion.button>
          
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 rounded-xl hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-bold text-lg"
            aria-label="Cancelar"
            title="Cancelar"
          >
            <X className="w-6 h-6" />
            <span>Cancelar</span>
          </motion.button>
        </div>

        {/* Información adicional */}
        {note && (
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            <p>Última actualización: {new Date(note.updated_at || '').toLocaleString()}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default NoteForm;