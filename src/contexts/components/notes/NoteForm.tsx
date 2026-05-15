// NoteForm.tsx
// ============================================================================
// DEPENDENCIAS
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Shapes,
  Square,
  Circle,
  Pill,
  LayoutGrid,
  Sparkles,
  GripVertical,
  Droplet,
  Image as ImageIcon,
} from 'lucide-react';

// ============================================================================
// MODELOS Y TIPOS
// ============================================================================
import {
  Note,
  NoteCreate,
  NoteUpdate,
  NOTE_SHAPES,
  PREDEFINED_COLORS,
  getColorWithOpacity,
  NoteShape,
  NOTE_ICONS,
  NOTE_SIZES,
  COLOR_INTENSITIES,
  NoteIcon,
  NoteSize,
  ColorIntensity,
  getIconConfig,
  getSizeConfig,
  getIntensityConfig,
  IconConfig,
  SizeConfig,
  IntensityConfig,
} from '../../../models/Note';

import TagChip from '../tags/TagChip';

// ============================================================================
// INTERFACES
// ============================================================================
interface NoteFormProps {
  note?: Note | null;
  onSubmit: (note: NoteCreate | NoteUpdate) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================
const colorOptions = PREDEFINED_COLORS.map(color => ({
  hex: color.value,
  name: color.name,
}));

// ============================================================================
// UTILIDADES
// ============================================================================
const getPreviewIcon = (iconConfig: IconConfig, size: string = "w-5 h-5") => {
  if (iconConfig.value === 'default') {
    return <Sparkles className={`${size} text-gray-400`} />;
  }
  return <span className={`${size} text-center`}>{iconConfig.iconName}</span>;
};

// ============================================================================
// COMPONENTE: HEADER CON MENÚ
// ============================================================================
const FormHeader: React.FC<{
  note?: Note | null;
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement>;
  isFavorite: boolean;
  setIsFavorite: (value: boolean) => void;
  isArchived: boolean;
  setIsArchived: (value: boolean) => void;
  onDelete?: () => void;
}> = ({ note, isMenuOpen, setIsMenuOpen, menuRef, isFavorite, setIsFavorite, isArchived, setIsArchived, onDelete }) => (
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      {note ? '✏️ Editar nota' : '✨ Crear nueva nota'}
    </h1>

    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`p-3 rounded-xl transition-all duration-300 transform ${
          isMenuOpen
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rotate-90 shadow-lg scale-110'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
        }`}
      >
        <MoreVertical className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MoreVertical className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Opciones de nota</h3>
                  <p className="text-white/80 text-xs">Personaliza tu experiencia</p>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-1">
              <MenuOptionButton
                icon={<Star className="w-6 h-6" />}
                iconBgClass={isFavorite ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-gray-100 to-gray-200'}
                title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                description={isFavorite ? 'Esta nota está en favoritos' : 'Destaca esta nota'}
                isActive={isFavorite}
                activeColorClass="text-amber-700"
                onClick={() => { setIsFavorite(!isFavorite); setIsMenuOpen(false); }}
              />
              <MenuOptionButton
                icon={<Archive className="w-6 h-6" />}
                iconBgClass={isArchived ? 'bg-gradient-to-br from-teal-400 to-cyan-500' : 'bg-gradient-to-br from-gray-100 to-gray-200'}
                title={isArchived ? 'Desarchivar nota' : 'Archivar nota'}
                description={isArchived ? 'Restaurar a notas activas' : 'Mover a archivadas'}
                isActive={isArchived}
                activeColorClass="text-teal-700"
                onClick={() => { setIsArchived(!isArchived); setIsMenuOpen(false); }}
              />
              {note && onDelete && (
                <>
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-red-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-white text-xs text-red-500">Peligro</span>
                    </div>
                  </div>
                  <MenuOptionButton
                    icon={<Trash2 className="w-6 h-6" />}
                    iconBgClass="bg-gradient-to-br from-red-100 to-rose-100"
                    title="Eliminar nota"
                    description="Esta acción no se puede deshacer"
                    isActive={false}
                    activeColorClass="text-red-600"
                    onClick={onDelete}
                    isDestructive
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

// ============================================================================
// COMPONENTE: MENU OPTION BUTTON
// ============================================================================
const MenuOptionButton: React.FC<{
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  description: string;
  isActive: boolean;
  activeColorClass: string;
  onClick: () => void;
  isDestructive?: boolean;
}> = ({ icon, iconBgClass, title, description, isActive, activeColorClass, onClick, isDestructive }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full px-4 py-4 rounded-xl flex items-center gap-4 transition-all duration-300 group ${
      isActive
        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200'
        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-transparent'
    }`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${iconBgClass} ${isActive ? 'text-white shadow-lg scale-110' : 'text-gray-500 group-hover:scale-110'}`}>
      {icon}
    </div>
    <div className="flex-1 text-left">
      <span className={`block font-semibold ${isActive ? activeColorClass : (isDestructive ? 'text-red-600' : 'text-gray-700')}`}>
        {title}
      </span>
      <span className="block text-xs text-gray-500 mt-0.5">{description}</span>
    </div>
  </button>
);

// ============================================================================
// COMPONENTE: TITLE FIELD
// ============================================================================
const TitleField: React.FC<{
  title: string;
  setTitle: (value: string) => void;
  error?: string;
  isSubmitting: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}> = ({ title, setTitle, error, isSubmitting, inputRef }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4" />
        <span>Título de la nota</span>
        <span className="ml-auto text-xs text-gray-500">{title.length}/200</span>
      </div>
    </label>
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={`w-full px-5 py-4 rounded-xl border-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg ${
          error
            ? 'border-red-300 dark:border-red-700'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
        }`}
        placeholder="📝 ¿Qué necesitas hacer?"
        disabled={isSubmitting}
        maxLength={200}
      />
      {title && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2">
          <CheckCircle className="w-5 h-5 text-green-500" />
        </motion.div>
      )}
    </div>
    {error && (
      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </motion.p>
    )}
  </div>
);

// ============================================================================
// COMPONENTE: CONTENT FIELD
// ============================================================================
const ContentField: React.FC<{
  content: string;
  setContent: (value: string) => void;
  error?: string;
  isSubmitting: boolean;
  wordCount: number;
  charCount: number;
  showPreview: boolean;
  setShowPreview: (value: boolean) => void;
}> = ({ content, setContent, error, isSubmitting, wordCount, charCount, showPreview, setShowPreview }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      <div className="flex items-center gap-2">
        <AlignLeft className="w-4 h-4" />
        <span>Descripción</span>
        <span className="ml-auto text-xs text-gray-500">{wordCount} palabras · {charCount} caracteres</span>
      </div>
    </label>

    <div className="mb-2 flex justify-end">
      <button
        type="button"
        onClick={() => setShowPreview(!showPreview)}
        className="p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 flex items-center gap-1"
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
            <p className="text-gray-400 text-center py-12">Sin contenido para previsualizar</p>
          )}
        </motion.div>
      ) : (
        <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all duration-200 text-lg resize-y"
            placeholder="📄 Describe tu tarea en detalle..."
            disabled={isSubmitting}
            maxLength={10000}
          />
        </motion.div>
      )}
    </AnimatePresence>

    {error && (
      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </motion.p>
    )}
  </div>
);

// ============================================================================
// COMPONENTE: TAGS SECTION
// ============================================================================
const TagsSection: React.FC<{
  tags: string[];
  setTags: (tags: string[]) => void;
  newTag: string;
  setNewTag: (value: string) => void;
  tagError: string | null;
  setTagError: (value: string | null) => void;
  recentTags: string[];
  isSubmitting: boolean;
  tagInputRef: React.RefObject<HTMLInputElement>;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onAddRecentTag: (tag: string) => void;
}> = ({ tags, newTag, setNewTag, tagError, setTagError, recentTags, isSubmitting, tagInputRef, onAddTag, onRemoveTag, onKeyPress, onAddRecentTag }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
    <div className="flex items-center gap-3 mb-4">
      <Hash className="w-5 h-5 text-purple-500" />
      <span className="text-base font-bold text-gray-800 dark:text-gray-200">Etiquetas</span>
      <span className="ml-auto text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full font-medium">
        {tags.length}/10
      </span>
    </div>

    <div className="flex gap-2 mb-4">
      <div className="relative flex-1">
        <input
          ref={tagInputRef}
          type="text"
          value={newTag}
          onChange={(e) => { setNewTag(e.target.value); setTagError(null); }}
          onKeyPress={onKeyPress}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          placeholder="🏷️ ej: trabajo, personal, idea, urgente"
          disabled={isSubmitting || tags.length >= 10}
          maxLength={30}
        />
        {newTag && (
          <button type="button" onClick={() => setNewTag('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddTag}
        disabled={!newTag.trim() || isSubmitting || tags.length >= 10}
        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>Agregar</span>
      </motion.button>
    </div>

    {tagError && (
      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {tagError}
      </motion.p>
    )}

    {recentTags.length > 0 && tags.length < 10 && (
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">📌 Recientes:</p>
        <div className="flex flex-wrap gap-2">
          {recentTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onAddRecentTag(tag)}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    )}

    {tags.length > 0 && (
      <div>
        <p className="text-xs text-gray-500 mb-2">🏷️ Etiquetas actuales:</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip key={tag} tagName={tag} onDelete={() => onRemoveTag(tag)} showIcon />
          ))}
        </div>
      </div>
    )}

    {tags.length === 0 && !tagError && (
      <p className="text-sm text-gray-500 text-center py-4">No hay etiquetas. Agrega algunas para organizar mejor tus notas.</p>
    )}
  </div>
);

// ============================================================================
// COMPONENTE: LIVE PREVIEW (Vista Previa Destacada)
// ============================================================================
const LivePreviewCard: React.FC<{
  title: string;
  content: string;
  color: string;
  shape: NoteShape;
  tags: string[];
  selectedIcon: IconConfig;
  selectedSize: SizeConfig;
  selectedIntensity: IntensityConfig;
}> = ({ title, content, color, shape, tags, selectedIcon, selectedSize, selectedIntensity }) => {
  const getPreviewStyle = (): React.CSSProperties => {
    let borderRadius = '1rem';
    if (shape === 'square') borderRadius = '0';
    if (shape === 'rounded') borderRadius = '1rem';
    if (shape === 'oval') borderRadius = '9999px';
    if (shape === 'pill') borderRadius = '9999px';

    return {
      backgroundColor: getColorWithOpacity(color, selectedIntensity.bgOpacity),
      borderLeft: `4px solid ${getColorWithOpacity(color, selectedIntensity.borderOpacity)}`,
      boxShadow: `0 8px 32px ${getColorWithOpacity(color, selectedIntensity.shadowIntensity)}`,
      borderRadius,
      transition: 'all 0.3s ease',
    };
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Eye className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-base font-bold text-gray-800 dark:text-gray-200">Vista previa</span>
        <span className="ml-auto text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
          {selectedIcon.label} · {selectedSize.label} · {selectedIntensity.label}
        </span>
      </div>

      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={getPreviewStyle()}
        className="transform transition-all duration-300 hover:scale-[1.02]"
      >
        <div className={selectedSize.padding}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}40`, backdropFilter: 'blur(4px)' }}>
              {getPreviewIcon(selectedIcon, "w-5 h-5")}
            </div>
            <h3 className={`font-bold truncate flex-1 ${selectedSize.titleSize}`} style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              {title || 'Título de la tarea'}
            </h3>
          </div>

          <p className={`text-sm line-clamp-${selectedSize.contentLines}`} style={{ color: 'rgba(255,255,255,0.9)' }}>
            {content || 'Sin descripción'}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                  style={{
                    backgroundColor: `${color}40`,
                    color: '#fff',
                    border: `1px solid ${color}80`,
                  }}
                >
                  #{tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-white/70">+{tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Indicadores rápidos */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded-lg transition-all hover:scale-105" style={{ backgroundColor: `${color}15` }}>
          <p className="text-xs font-medium" style={{ color }}>Icono</p>
          <p className="text-xs font-bold truncate" style={{ color }}>{selectedIcon.label}</p>
        </div>
        <div className="p-2 rounded-lg transition-all hover:scale-105" style={{ backgroundColor: `${color}15` }}>
          <p className="text-xs font-medium" style={{ color }}>Tamaño</p>
          <p className="text-xs font-bold" style={{ color }}>{selectedSize.label}</p>
        </div>
        <div className="p-2 rounded-lg transition-all hover:scale-105" style={{ backgroundColor: `${color}15` }}>
          <p className="text-xs font-medium" style={{ color }}>Intensidad</p>
          <p className="text-xs font-bold" style={{ color }}>{selectedIntensity.label}</p>
        </div>
        <div className="p-2 rounded-lg transition-all hover:scale-105" style={{ backgroundColor: `${color}15` }}>
          <p className="text-xs font-medium" style={{ color }}>Forma</p>
          <p className="text-xs font-bold" style={{ color }}>{shape === 'square' ? 'Cuadrada' : shape === 'rounded' ? 'Redondeada' : shape === 'oval' ? 'Ovalada' : 'Píldora'}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: COLOR SELECTOR (Tarjeta de Color)
// ============================================================================
const ColorSelectorCard: React.FC<{
  color: string;
  setColor: (value: string) => void;
  selectedColorOption: { hex: string; name: string };
}> = ({ color, setColor, selectedColorOption }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Palette className="w-4 h-4" style={{ color }} />
      </div>
      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Color</span>
      <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
        {selectedColorOption.name}
      </span>
    </div>
    <div className="grid grid-cols-5 gap-2">
      {colorOptions.map((option) => {
        const isSelected = color === option.hex;
        return (
          <motion.button
            key={option.hex}
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setColor(option.hex)}
            className={`relative aspect-square rounded-lg transition-all duration-300 ${
              isSelected ? 'ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-xl' : 'hover:scale-105 shadow-md'
            }`}
            style={{ backgroundColor: option.hex }}
            title={option.name}
          >
            {isSelected && <CheckCircle className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-lg" />}
          </motion.button>
        );
      })}
    </div>
  </div>
);

// ============================================================================
// COMPONENTE: SHAPE SELECTOR (Tarjeta de Forma)
// ============================================================================
const ShapeSelectorCard: React.FC<{
  shape: NoteShape;
  setShape: (value: NoteShape) => void;
  color: string;
  selectedShape: { value: NoteShape; label: string; icon: React.ReactNode };
}> = ({ shape, setShape, color, selectedShape }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Shapes className="w-4 h-4" style={{ color }} />
      </div>
      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Forma</span>
      <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
        {selectedShape.label}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {NOTE_SHAPES.map((shapeOption) => {
        const isSelected = shape === shapeOption.value;
        return (
          <motion.button
            key={shapeOption.value}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShape(shapeOption.value)}
            className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
              isSelected ? 'ring-2 ring-offset-2 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'
            }`}
            style={{ backgroundColor: isSelected ? `${color}15` : 'transparent', border: `1.5px solid ${isSelected ? color : `${color}30`}` }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color }}>
              {shapeOption.icon}
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm" style={{ color: isSelected ? color : undefined }}>
                {shapeOption.label}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  </div>
);

// ============================================================================
// COMPONENTE: INTENSITY SELECTOR (Tarjeta de Intensidad)
// ============================================================================
const IntensitySelectorCard: React.FC<{
  colorIntensity: ColorIntensity;
  setColorIntensity: (value: ColorIntensity) => void;
  color: string;
  selectedIntensity: IntensityConfig;
}> = ({ colorIntensity, setColorIntensity, color, selectedIntensity }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Droplet className="w-4 h-4" style={{ color }} />
      </div>
      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Intensidad</span>
      <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
        {selectedIntensity.label}
      </span>
    </div>
    <div className="flex gap-2">
      {COLOR_INTENSITIES.map((intensityOption) => {
        const isSelected = colorIntensity === intensityOption.value;
        return (
          <motion.button
            key={intensityOption.value}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setColorIntensity(intensityOption.value)}
            className={`flex-1 py-3 rounded-xl transition-all duration-300 flex flex-col items-center gap-1 ${
              isSelected ? 'ring-2 ring-offset-2 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'
            }`}
            style={{ backgroundColor: isSelected ? `${color}20` : 'transparent', border: `1.5px solid ${isSelected ? color : `${color}30`}` }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: getColorWithOpacity(color, intensityOption.bgOpacity) }}>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color, opacity: intensityOption.value === 'subtle' ? 0.3 : intensityOption.value === 'medium' ? 0.6 : 1 }} />
            </div>
            <span className={`text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
              {intensityOption.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  </div>
);

// ============================================================================
// COMPONENTE: SIZE SELECTOR (Tarjeta de Tamaño)
// ============================================================================
const SizeSelectorCard: React.FC<{
  size: NoteSize;
  setSize: (value: NoteSize) => void;
  color: string;
  selectedSize: SizeConfig;
}> = ({ size, setSize, color, selectedSize }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <GripVertical className="w-4 h-4" style={{ color }} />
      </div>
      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Tamaño</span>
      <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
        {selectedSize.label}
      </span>
    </div>
    <div className="flex gap-2">
      {NOTE_SIZES.map((sizeOption) => {
        const isSelected = size === sizeOption.value;
        return (
          <motion.button
            key={sizeOption.value}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSize(sizeOption.value)}
            className={`flex-1 py-3 rounded-xl transition-all duration-300 flex flex-col items-center gap-1 ${
              isSelected ? 'ring-2 ring-offset-2 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'
            }`}
            style={{ backgroundColor: isSelected ? `${color}20` : 'transparent', border: `1.5px solid ${isSelected ? color : `${color}30`}` }}
          >
            <span className="text-xs font-medium" style={{ color: isSelected ? color : undefined }}>
              {sizeOption.label}
            </span>
            <div className="w-full h-1 rounded-full" style={{ backgroundColor: color, opacity: isSelected ? 0.8 : 0.3 }} />
          </motion.button>
        );
      })}
    </div>
  </div>
);

// ============================================================================
// COMPONENTE: ICON SELECTOR (Grid de Iconos)
// ============================================================================
const IconSelectorGrid: React.FC<{
  icon: NoteIcon;
  setIcon: (value: NoteIcon) => void;
  color: string;
  selectedIcon: IconConfig;
}> = ({ icon, setIcon, color, selectedIcon }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <ImageIcon className="w-4 h-4" style={{ color }} />
      </div>
      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Icono</span>
      <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
        {selectedIcon.label}
      </span>
    </div>
    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
      {NOTE_ICONS.map((iconOption) => {
        const isSelected = icon === iconOption.value;
        const iconDisplay = iconOption.value === 'default'
          ? <Sparkles className="w-4 h-4" />
          : <span className="text-lg">{iconOption.iconName}</span>;

        return (
          <motion.button
            key={iconOption.value}
            type="button"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIcon(iconOption.value)}
            className={`relative p-2 rounded-lg transition-all duration-300 flex flex-col items-center gap-0.5 ${
              isSelected ? 'ring-2 ring-offset-1 shadow-md' : 'hover:scale-105 opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: isSelected ? `${color}15` : 'transparent', border: `1px solid ${isSelected ? color : `${color}25`}` }}
            title={iconOption.description}
          >
            <div style={{ color: isSelected ? color : undefined }}>{iconDisplay}</div>
            <span className={`text-xs ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {iconOption.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  </div>
);

// ============================================================================
// COMPONENTE: NOTE STATS
// ============================================================================
const NoteStatsCards: React.FC<{
  wordCount: number;
  charCount: number;
  tagsCount: number;
  isFavorite: boolean;
}> = ({ wordCount, charCount, tagsCount, isFavorite }) => (
  <div className="grid grid-cols-4 gap-3">
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-200">
      <Type className="w-4 h-4 text-gray-400 mx-auto mb-1" />
      <p className="text-xl font-bold text-gray-900">{wordCount}</p>
      <p className="text-xs text-gray-500">Palabras</p>
    </div>
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-200">
      <AlignLeft className="w-4 h-4 text-gray-400 mx-auto mb-1" />
      <p className="text-xl font-bold text-gray-900">{charCount}</p>
      <p className="text-xs text-gray-500">Caracteres</p>
    </div>
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-200">
      <Hash className="w-4 h-4 text-gray-400 mx-auto mb-1" />
      <p className="text-xl font-bold text-gray-900">{tagsCount}</p>
      <p className="text-xs text-gray-500">Etiquetas</p>
    </div>
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-200">
      <Star className={`w-4 h-4 mx-auto mb-1 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
      <p className="text-xl font-bold text-gray-900">{isFavorite ? 'Sí' : 'No'}</p>
      <p className="text-xs text-gray-500">Favorita</p>
    </div>
  </div>
);

// ============================================================================
// COMPONENTE: ACTION BUTTONS (Botones en la parte inferior derecha)
// ============================================================================
const ActionButtonsRow: React.FC<{
  isSubmitting: boolean;
  note?: Note | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}> = ({ isSubmitting, note, onSubmit, onCancel }) => (
  <div className="flex gap-4 pt-4">
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex-1 py-4 px-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 rounded-xl hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-bold text-lg"
    >
      <X className="w-6 h-6" />
      <span>Cancelar</span>
    </motion.button>

    <motion.button
      type="submit"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={isSubmitting}
      onClick={onSubmit}
      className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 font-bold text-lg relative overflow-hidden group"
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
          <span>{note ? 'Actualizar nota' : 'Crear tarea'}</span>
        </>
      )}
    </motion.button>
  </div>
);

// ============================================================================
// COMPONENTE PRINCIPAL: NoteForm
// ============================================================================
const NoteForm: React.FC<NoteFormProps> = ({
  note,
  onSubmit,
  onCancel,
  isSubmitting: externalIsSubmitting = false,
}) => {
  // Estados principales
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(PREDEFINED_COLORS[0].value);
  const [shape, setShape] = useState<NoteShape>('rounded');
  const [icon, setIcon] = useState<NoteIcon>('default');
  const [size, setSize] = useState<NoteSize>('normal');
  const [colorIntensity, setColorIntensity] = useState<ColorIntensity>('medium');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  // Estados de UI
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [tagError, setTagError] = useState<string | null>(null);
  const [recentTags, setRecentTags] = useState<string[]>([]);

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = externalIsSubmitting || internalIsSubmitting;
  const selectedColorOption = colorOptions.find(c => c.hex === color) || colorOptions[0];
  const selectedShape = NOTE_SHAPES.find(s => s.value === shape) || NOTE_SHAPES[1];
  const selectedIcon = getIconConfig(icon);
  const selectedSize = getSizeConfig(size);
  const selectedIntensity = getIntensityConfig(colorIntensity);

  // ============================================================================
  // EFECTOS
  // ============================================================================
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || PREDEFINED_COLORS[0].value);
      setShape((note.shape as NoteShape) || 'rounded');
      setIcon(note.icon || 'default');
      setSize(note.size || 'normal');
      setColorIntensity(note.colorIntensity || 'medium');
      setIsFavorite(note.is_favorite || false);
      setIsArchived(note.is_archived || false);
      setTags(Array.isArray(note.tags) ? note.tags : []);
    } else {
      setTitle('');
      setContent('');
      setColor(PREDEFINED_COLORS[0].value);
      setShape('rounded');
      setIcon('default');
      setSize('normal');
      setColorIntensity('medium');
      setIsFavorite(false);
      setIsArchived(false);
      setTags([]);
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }

    const savedRecentTags = localStorage.getItem('recentTags');
    if (savedRecentTags) {
      try {
        setRecentTags(JSON.parse(savedRecentTags).slice(0, 5));
      } catch {
        setRecentTags([]);
      }
    }
  }, [note]);

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(content.length);
  }, [content]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================================
  // MANEJADORES
  // ============================================================================
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

    const cleanTags = tags
      .filter(tag => tag && tag.trim() !== '')
      .map(tag => tag.trim().toLowerCase());

    if (cleanTags.length > 0) {
      const allRecentTags = [...new Set([...cleanTags, ...recentTags])].slice(0, 10);
      localStorage.setItem('recentTags', JSON.stringify(allRecentTags));
    }

    const cleanNoteData: NoteCreate = {
      title: title.trim(),
      content: content.trim(),
      color,
      shape,
      icon,
      size,
      colorIntensity,
      is_favorite: isFavorite,
      is_archived: isArchived,
      tags: cleanTags,
    };

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

    setTags([...tags, tag]);
    setNewTag('');
    setTagError(null);
    setTimeout(() => tagInputRef.current?.focus(), 10);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag) {
      e.preventDefault();
      handleAddTag();
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

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="max-w-7xl mx-auto px-4">
      <FormHeader
        note={note}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        menuRef={menuRef}
        isFavorite={isFavorite}
        setIsFavorite={setIsFavorite}
        isArchived={isArchived}
        setIsArchived={setIsArchived}
        onDelete={note ? handleDeleteNote : undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ==================== COLUMNA IZQUIERDA ==================== */}
        <div className="space-y-6">
          <form className="space-y-6">
            <TitleField
              title={title}
              setTitle={setTitle}
              error={errors.title}
              isSubmitting={isSubmitting}
              inputRef={titleInputRef}
            />

            <ContentField
              content={content}
              setContent={setContent}
              error={errors.content}
              isSubmitting={isSubmitting}
              wordCount={wordCount}
              charCount={charCount}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
            />

            <TagsSection
              tags={tags}
              setTags={setTags}
              newTag={newTag}
              setNewTag={setNewTag}
              tagError={tagError}
              setTagError={setTagError}
              recentTags={recentTags}
              isSubmitting={isSubmitting}
              tagInputRef={tagInputRef}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              onKeyPress={handleKeyPress}
              onAddRecentTag={handleAddRecentTag}
            />

            <NoteStatsCards
              wordCount={wordCount}
              charCount={charCount}
              tagsCount={tags.length}
              isFavorite={isFavorite}
            />
          </form>
        </div>

        {/* ==================== COLUMNA DERECHA ==================== */}
        <div className="space-y-4">
          {/* VISTA PREVIA DESTACADA */}
          <LivePreviewCard
            title={title}
            content={content}
            color={color}
            shape={shape}
            tags={tags}
            selectedIcon={selectedIcon}
            selectedSize={selectedSize}
            selectedIntensity={selectedIntensity}
          />

          {/* PANEL DE PERSONALIZACIÓN - Grid de 2 columnas */}
          <div className="grid grid-cols-2 gap-4">
            <ColorSelectorCard
              color={color}
              setColor={setColor}
              selectedColorOption={selectedColorOption}
            />

            <ShapeSelectorCard
              shape={shape}
              setShape={setShape}
              color={color}
              selectedShape={selectedShape}
            />

            <IntensitySelectorCard
              colorIntensity={colorIntensity}
              setColorIntensity={setColorIntensity}
              color={color}
              selectedIntensity={selectedIntensity}
            />

            <SizeSelectorCard
              size={size}
              setSize={setSize}
              color={color}
              selectedSize={selectedSize}
            />
          </div>

          {/* ICONOS - Ancho completo */}
          <IconSelectorGrid
            icon={icon}
            setIcon={setIcon}
            color={color}
            selectedIcon={selectedIcon}
          />

          {/* BOTONES DE ACCIÓN */}
          <ActionButtonsRow
            isSubmitting={isSubmitting}
            note={note}
            onSubmit={handleSubmit}
            onCancel={onCancel}
          />
        </div>
      </div>

      {note && (
        <div className="text-center text-xs text-gray-500 mt-6">
          <p>Última actualización: {new Date(note.updated_at || '').toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default NoteForm;