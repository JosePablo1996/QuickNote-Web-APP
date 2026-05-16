// src/contexts/components/notes/NoteSimpleForm.tsx
// ============================================================================
// FORMULARIO SIMPLIFICADO PARA CREACIÓN/EDICIÓN DE NOTAS
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  X,
  Hash,
  Star,
  Type,
  AlignLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Plus,
  Sparkles,
  Palette,
} from 'lucide-react';
import { NoteCreate } from '../../../models/Note';
import { getColorWithOpacity } from '../../../models/Note';
import TagChip from '../tags/TagChip';

interface NoteSimpleFormProps {
  draft: NoteCreate;
  setDraft: React.Dispatch<React.SetStateAction<NoteCreate>>;
  onSubmit: (data: NoteCreate) => Promise<void>;
  onCancel: () => void;
  onCustomize: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

// Vista previa simplificada
const SimplePreview: React.FC<{
  title: string;
  content: string;
  color: string;
  tags: string[];
}> = ({ title, content, color, tags }) => {
  const safeTitle = title || 'Título de la nota';
  const safeContent = content || 'Sin contenido';
  const safeTags = tags || [];
  
  return (
    <div
      className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg transition-all"
      style={{
        backgroundColor: getColorWithOpacity(color, 0.15),
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}30` }}>
            <Sparkles className="w-3 h-3" style={{ color }} />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
            {safeTitle}
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {safeContent}
        </p>
        {safeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {safeTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${color}20`, color }}
              >
                #{tag}
              </span>
            ))}
            {safeTags.length > 3 && (
              <span className="text-xs text-gray-500">+{safeTags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Contador de estadísticas
const StatsRow: React.FC<{
  wordCount: number;
  charCount: number;
  tagsCount: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  color: string;
}> = ({ wordCount, charCount, tagsCount, isFavorite, onToggleFavorite, color }) => (
  <div className="grid grid-cols-4 gap-3">
    <StatCard icon={<Type className="w-4 h-4" />} label="Palabras" value={wordCount} color={color} />
    <StatCard icon={<AlignLeft className="w-4 h-4" />} label="Caracteres" value={charCount} color={color} />
    <StatCard icon={<Hash className="w-4 h-4" />} label="Etiquetas" value={tagsCount} color={color} />
    <button
      onClick={onToggleFavorite}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-200 dark:border-gray-700 transition-all hover:scale-105"
    >
      <Star className={`w-4 h-4 mx-auto mb-1 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
      <p className="text-xl font-bold text-gray-900 dark:text-white">{isFavorite ? 'Sí' : 'No'}</p>
      <p className="text-xs text-gray-500">Favorita</p>
    </button>
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-200 dark:border-gray-700">
    <div className="text-gray-400 mx-auto mb-1">{icon}</div>
    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

const ErrorText: React.FC<{ message: string }> = ({ message }) => (
  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-sm text-red-500 flex items-center gap-1">
    <AlertCircle className="w-4 h-4" />
    {message}
  </motion.p>
);

const NoteSimpleForm: React.FC<NoteSimpleFormProps> = ({
  draft,
  setDraft,
  onSubmit,
  onCancel,
  onCustomize,
  isSubmitting,
  isEditing,
}) => {
  // Asegurar que draft existe (fallback por si acaso)
  const safeDraft = draft || {
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
  };

  // Valores seguros
  const safeTitle = safeDraft.title || '';
  const safeContent = safeDraft.content || '';
  const safeColor = safeDraft.color || '#3B82F6';
  const safeTags: string[] = safeDraft.tags || [];
  const safeIsFavorite = safeDraft.is_favorite || false;

  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [showPreview, setShowPreview] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Actualizar contadores con valores seguros
  useEffect(() => {
    const words = safeContent.trim() ? safeContent.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(safeContent.length);
  }, [safeContent]);

  // Cargar tags recientes
  useEffect(() => {
    const saved = localStorage.getItem('recentTags');
    if (saved) {
      try {
        setRecentTags(JSON.parse(saved).slice(0, 5));
      } catch {
        setRecentTags([]);
      }
    }
    titleInputRef.current?.focus();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; content?: string } = {};
    if (!safeTitle.trim()) newErrors.title = 'El título es requerido';
    else if (safeTitle.length > 200) newErrors.title = 'Máximo 200 caracteres';
    if (safeContent.length > 10000) newErrors.content = 'Máximo 10,000 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const dataToSubmit: NoteCreate = {
      ...safeDraft,
      title: safeTitle,
      content: safeContent,
      color: safeColor,
      tags: safeTags,
      is_favorite: safeIsFavorite,
    };
    await onSubmit(dataToSubmit);
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (!tag) { setTagError('La etiqueta no puede estar vacía'); return; }
    if (tag.length > 30) { setTagError('Máximo 30 caracteres'); return; }
    if (safeTags.includes(tag)) { setTagError('Ya existe'); return; }
    if (safeTags.length >= 10) { setTagError('Máximo 10 etiquetas'); return; }
    
    setDraft({ ...safeDraft, tags: [...safeTags, tag] });
    setNewTag('');
    setTagError(null);
    
    const updatedRecent = [tag, ...recentTags.filter(t => t !== tag)].slice(0, 5);
    setRecentTags(updatedRecent);
    localStorage.setItem('recentTags', JSON.stringify(updatedRecent));
    tagInputRef.current?.focus();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setDraft({ ...safeDraft, tags: safeTags.filter(t => t !== tagToRemove) });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddRecentTag = (tag: string) => {
    if (!safeTags.includes(tag) && safeTags.length < 10) {
      setDraft({ ...safeDraft, tags: [...safeTags, tag] });
    }
  };

  const toggleFavorite = () => {
    setDraft({ ...safeDraft, is_favorite: !safeIsFavorite });
  };

  const updateTitle = (value: string) => {
    setDraft({ ...safeDraft, title: value });
  };

  const updateContent = (value: string) => {
    setDraft({ ...safeDraft, content: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {isEditing ? '✏️ Editar nota' : '✨ Crear nueva nota'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Completa los detalles básicos de tu nota
        </p>
      </div>

      {/* Campo de título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            <span>Título</span>
            <span className="ml-auto text-xs text-gray-500">{safeTitle.length}/200</span>
          </div>
        </label>
        <div className="relative">
          <input
            ref={titleInputRef}
            type="text"
            value={safeTitle}
            onChange={(e) => updateTitle(e.target.value)}
            className={`w-full px-5 py-4 rounded-xl border-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              errors.title ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
            }`}
            placeholder="¿Qué necesitas hacer?"
            disabled={isSubmitting}
            maxLength={200}
          />
          {safeTitle && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
        </div>
        {errors.title && <ErrorText message={errors.title} />}
      </div>

      {/* Campo de contenido */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4" />
            <span>Descripción</span>
            <span className="ml-auto text-xs text-gray-500">{wordCount} palabras · {charCount} caracteres</span>
          </div>
        </label>
        
        <div className="mb-2 flex justify-end">
          <button type="button" onClick={() => setShowPreview(!showPreview)} className="p-2 text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1">
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showPreview ? 'Ocultar vista previa' : 'Mostrar vista previa'}</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {showPreview ? (
            <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="min-h-[200px] p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 prose dark:prose-invert max-w-none">
              {safeContent ? <div className="whitespace-pre-wrap">{safeContent}</div> : <p className="text-gray-400 text-center py-8">Sin contenido</p>}
            </motion.div>
          ) : (
            <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <textarea
                value={safeContent}
                onChange={(e) => updateContent(e.target.value)}
                rows={6}
                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
                placeholder="Describe tu tarea en detalle..."
                disabled={isSubmitting}
                maxLength={10000}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {errors.content && <ErrorText message={errors.content} />}
      </div>

      {/* Etiquetas */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Hash className="w-5 h-5 text-purple-500" />
          <span className="font-bold text-gray-800 dark:text-gray-200">Etiquetas</span>
          <span className="ml-auto text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full">{safeTags.length}/10</span>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input
              ref={tagInputRef}
              type="text"
              value={newTag}
              onChange={(e) => { setNewTag(e.target.value); setTagError(null); }}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
              placeholder="ej: trabajo, personal, idea"
              disabled={isSubmitting || safeTags.length >= 10}
              maxLength={30}
            />
          </div>
          <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleAddTag} disabled={!newTag.trim() || isSubmitting || safeTags.length >= 10}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl disabled:opacity-50 font-medium shadow-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span>Agregar</span>
          </motion.button>
        </div>

        {tagError && <ErrorText message={tagError} />}

        {recentTags.length > 0 && safeTags.length < 10 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">📌 Recientes:</p>
            <div className="flex flex-wrap gap-2">
              {recentTags.map(tag => (
                <button key={tag} type="button" onClick={() => handleAddRecentTag(tag)}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 rounded-lg text-xs hover:bg-gray-200">
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {safeTags.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">🏷️ Etiquetas actuales:</p>
            <div className="flex flex-wrap gap-2">
              {safeTags.map(tag => (
                <TagChip key={tag} tagName={tag} onDelete={() => handleRemoveTag(tag)} showIcon />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <StatsRow
        wordCount={wordCount}
        charCount={charCount}
        tagsCount={safeTags.length}
        isFavorite={safeIsFavorite}
        onToggleFavorite={toggleFavorite}
        color={safeColor}
      />

      {/* Vista previa compacta */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vista previa</span>
        </div>
        <SimplePreview 
          title={safeTitle} 
          content={safeContent} 
          color={safeColor} 
          tags={safeTags} 
        />
      </div>

      {/* Botón de personalización */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCustomize}
        className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-3 font-semibold"
      >
        <Sparkles className="w-5 h-5" />
        <span>🎨 Personaliza tu experiencia</span>
      </motion.button>

      {/* Botones de acción */}
      <div className="flex gap-4 pt-4">
        <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={onCancel} disabled={isSubmitting}
          className="flex-1 py-4 px-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 rounded-xl shadow-lg flex items-center justify-center gap-3 font-bold">
          <X className="w-6 h-6" />
          <span>Cancelar</span>
        </motion.button>
        
        <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-xl flex items-center justify-center gap-3 font-bold relative overflow-hidden group">
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          {isSubmitting ? (
            <><div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /><span>Guardando...</span></>
          ) : (
            <><Save className="w-6 h-6" /><span>{isEditing ? 'Actualizar nota' : 'Crear nota'}</span></>
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default NoteSimpleForm;