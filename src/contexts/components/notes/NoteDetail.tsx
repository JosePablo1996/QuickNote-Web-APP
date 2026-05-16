// src/contexts/components/notes/NoteDetail.tsx
// ============================================================================
// DEPENDENCIAS
// ============================================================================
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Archive,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Tag as TagIcon,
  XCircle,
  Sparkles,
  GripVertical,
  Droplet,
  Shapes,
  Eye,
  Hash,
  Copy,
  Check,
  Palette
} from 'lucide-react';
// ============================================================================
// HOOKS Y UTILIDADES
// ============================================================================
import { Note } from '../../../models/Note';
import { formatDateTime, getInitials } from '../../../utils/noteUtils';
import { getNoteColorClasses, getNoteGradient, DEFAULT_COLOR } from '../../../utils/noteColors';
import { getColorWithOpacity } from '../../../models/Note';
import TagChip from '../tags/TagChip';
// ============================================================================
// MODELOS Y CONFIGURACIONES
// ============================================================================
import {
  NOTE_ICONS,
  NOTE_SIZES,
  COLOR_INTENSITIES,
  getIconConfig,
  getSizeConfig,
  getIntensityConfig,
  NoteIcon,
  NoteSize,
  ColorIntensity,
} from '../../../models/Note';
// ============================================================================
// TIPOS
// ============================================================================
interface NoteDetailProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onToggleArchive: () => void;
  onTagClick?: (tag: string) => void;
  onShare?: () => void;
}

interface PersonalizationItem {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  rightContent?: React.ReactNode;
}

// ============================================================================
// UTILIDADES
// ============================================================================
const getNoteIcon = (icon?: NoteIcon, size: string = "w-6 h-6") => {
  const iconConfig = getIconConfig(icon);
  if (iconConfig.value === 'default') {
    return <Sparkles className={`${size} text-current`} />;
  }
  return <span className={`${size} text-center`}>{iconConfig.iconName}</span>;
};

const getTitleSizeClass = (size?: NoteSize): string => {
  const sizeConfig = getSizeConfig(size);
  if (sizeConfig.value === 'compact') return 'text-2xl md:text-3xl';
  if (sizeConfig.value === 'expanded') return 'text-4xl md:text-5xl';
  return 'text-3xl md:text-4xl';
};

const getShapeLabel = (shape: string): string => {
  switch (shape) {
    case 'square': return 'Cuadrado';
    case 'oval': return 'Ovalado';
    case 'pill': return 'Píldora';
    default: return 'Redondeado';
  }
};

// ============================================================================
// COMPONENTES INTERNOS
// ============================================================================

// Badge de estado (Favorita/Archivada)
const StatusBadge: React.FC<{ icon: React.ReactNode; label: string; color: string }> = ({ icon, label, color }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0, opacity: 0 }}
    className={`px-3 py-1.5 bg-gradient-to-r ${color} text-white rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg`}
  >
    {icon}
    <span>{label}</span>
  </motion.div>
);

// Badge de personalización
const CustomBadge: React.FC<{ icon: React.ReactNode; label: string; color: string; tooltip?: string }> = ({ icon, label, color, tooltip }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0, opacity: 0 }}
    className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg"
    style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
    title={tooltip || label}
  >
    {icon}
    <span>{label}</span>
  </motion.div>
);

// Badge de fecha
const DateBadge: React.FC<{ icon: React.ReactNode; label: string; date: string; color: string }> = ({ icon, label, date, color }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: `${color}10` }}>
    {React.cloneElement(icon as React.ReactElement, { style: { color } })}
    <span className="text-sm text-gray-600 dark:text-gray-400">
      {label}: <span className="font-medium text-gray-900 dark:text-gray-200">{formatDateTime(date)}</span>
    </span>
  </div>
);

// ============================================================================
// TARJETA PRINCIPAL DE LA NOTA (CON BADGES INTEGRADOS)
// ============================================================================
const MainNoteCard: React.FC<{
  note: Note;
  noteColorHex: string;
  noteIcon: NoteIcon;
  noteSize: NoteSize;
  intensityConfig: { bgOpacity: number; shadowIntensity: number };
  sizeConfig: { padding: string };
  gradient: string;
  initials: string;
}> = ({ note, noteColorHex, noteIcon, noteSize, intensityConfig, sizeConfig, gradient, initials }) => {
  const getShapeClass = () => {
    const shape = note.shape;
    switch (shape) {
      case 'square': return 'rounded-xl';
      case 'rounded': return 'rounded-2xl';
      case 'oval': return 'rounded-3xl';
      case 'pill': return 'rounded-full';
      default: return 'rounded-2xl';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl ${getShapeClass()}`}
      style={{
        backgroundColor: getColorWithOpacity(noteColorHex, intensityConfig.bgOpacity),
        boxShadow: `0 25px 50px -12px ${getColorWithOpacity(noteColorHex, intensityConfig.shadowIntensity)}`,
      }}
    >
      {/* Decoración de fondo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at 0% 0%, ${noteColorHex}, transparent 70%)` }} />
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${noteColorHex}20` }} />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${noteColorHex}20` }} />

      <div className={`relative z-10 ${sizeConfig.padding}`}>
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative"
          >
            <div
              className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center shadow-2xl bg-gradient-to-br ${gradient}`}
              style={{ boxShadow: `0 20px 30px -10px ${getColorWithOpacity(noteColorHex, intensityConfig.shadowIntensity)}` }}
            >
              {noteIcon === 'default' ? (
                <span className="text-white font-bold text-3xl md:text-4xl">{initials}</span>
              ) : (
                <div className="text-white text-4xl md:text-5xl">{getNoteIcon(noteIcon, "w-12 h-12 md:w-14 md:h-14")}</div>
              )}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
              style={{ backgroundColor: noteColorHex }}
            />
          </motion.div>

          {/* Título y metadata */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className={`font-bold ${getTitleSizeClass(noteSize)}`} style={{ color: noteColorHex }}>
                {note.title}
              </h2>
              {/* Badges de estado integrados aquí */}
              <div className="flex flex-wrap items-center gap-2">
                <AnimatePresence>
                  {note.is_favorite && (
                    <StatusBadge icon={<Star className="w-3.5 h-3.5 fill-white" />} label="Favorita" color="from-yellow-400 to-amber-500" />
                  )}
                  {note.is_archived && (
                    <StatusBadge icon={<Archive className="w-3.5 h-3.5" />} label="Archivada" color="from-purple-400 to-purple-600" />
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <DateBadge icon={<Calendar className="w-4 h-4" />} label="Creada" date={note.created_at} color={noteColorHex} />
              {note.updated_at && note.updated_at !== note.created_at && (
                <DateBadge icon={<Clock className="w-4 h-4" />} label="Actualizada" date={note.updated_at} color={noteColorHex} />
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// TARJETA DE CONTENIDO
// ============================================================================
const ContentCard: React.FC<{
  note: Note;
  noteColorHex: string;
  intensityConfig: { bgOpacity: number; borderOpacity: number };
  sizeConfig: { padding: string; value: string };
  noteShape: string;
  onTagClick?: (tag: string) => void;
}> = ({ note, noteColorHex, intensityConfig, sizeConfig, noteShape, onTagClick }) => {
  const getShapeClass = () => {
    switch (noteShape) {
      case 'square': return 'rounded-xl';
      case 'rounded': return 'rounded-2xl';
      case 'oval': return 'rounded-3xl';
      case 'pill': return 'rounded-full';
      default: return 'rounded-2xl';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={`relative overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl ${getShapeClass()}`}
      style={{ backgroundColor: getColorWithOpacity(noteColorHex, intensityConfig.bgOpacity * 0.5) }}
    >
      <div className={`relative z-10 ${sizeConfig.padding}`}>
        {/* Header del contenido */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 rounded-full" style={{ background: `linear-gradient(to bottom, ${noteColorHex}, ${getColorWithOpacity(noteColorHex, intensityConfig.borderOpacity)})` }} />
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Contenido</h3>
          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${noteColorHex}15`, color: noteColorHex }}>
            {sizeConfig.value === 'compact' ? 'Compacto' : sizeConfig.value === 'expanded' ? 'Expandido' : 'Normal'}
          </span>
        </div>

        {/* Body del contenido */}
        <div className="min-h-[250px] p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner" style={{ backgroundColor: `${noteColorHex}05` }}>
          <p className={`whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed ${
            sizeConfig.value === 'compact' ? 'text-base' : sizeConfig.value === 'expanded' ? 'text-xl' : 'text-lg'
          }`}>
            {note.content || 'Sin contenido'}
          </p>
        </div>

        {/* Etiquetas */}
        {note.tags && note.tags.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <TagIcon className="w-5 h-5" style={{ color: noteColorHex }} />
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Etiquetas</h4>
              <span className="ml-auto text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600">
                {note.tags.length} {note.tags.length === 1 ? 'etiqueta' : 'etiquetas'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag, index) => (
                <motion.div key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
                  <TagChip tagName={tag} onTap={onTagClick ? () => onTagClick(tag) : undefined} showIcon />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// PANEL DE INFORMACIÓN (ID de Nota)
// ============================================================================
const InfoPanel: React.FC<{
  note: Note;
  noteColorHex: string;
  onTagClick?: (tag: string) => void;
}> = ({ note, noteColorHex, onTagClick }) => {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(note.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      <div className="relative z-10">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
          Información
        </h3>

        {/* ID de la Nota */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">ID de la Nota</p>
          <div 
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 group hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
            onClick={handleCopyId}
          >
            <Hash className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <code className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate flex-1 select-all">
              {note.id}
            </code>
            {copiedId ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// PANEL DE ACCIONES RÁPIDAS
// ============================================================================
const QuickActionsPanel: React.FC<{
  note: Note;
  noteColorHex: string;
  onToggleFavorite: () => void;
  onToggleArchive: () => void;
  onEdit: () => void;
  onDeleteClick: () => void;
}> = ({ note, noteColorHex, onToggleFavorite, onToggleArchive, onEdit, onDeleteClick }) => {
  const actions = useMemo(() => [
    {
      id: 'edit',
      label: 'Editar',
      icon: <Edit className="w-6 h-6" />,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-blue-100 dark:border-blue-800',
      onClick: onEdit
    },
    {
      id: 'favorite',
      label: note.is_favorite ? 'Quitar Favorito' : 'Marcar Favorito',
      icon: <Star className={`w-6 h-6 ${note.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />,
      color: note.is_favorite 
        ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800' 
        : 'text-gray-500 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-700',
      onClick: onToggleFavorite
    },
    {
      id: 'archive',
      label: note.is_archived ? 'Restaurar' : 'Archivar',
      icon: <Archive className="w-6 h-6" />,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 border-purple-100 dark:border-purple-800',
      onClick: onToggleArchive
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: <Trash2 className="w-6 h-6" />,
      color: 'text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border-red-100 dark:border-red-800',
      onClick: onDeleteClick
    }
  ], [note.is_favorite, note.is_archived, onToggleFavorite, onToggleArchive, onEdit, onDeleteClick]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      <div className="relative z-10">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
          Acciones Rápidas
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 border ${action.color}`}
            >
              {action.icon}
              <span className="text-xs font-semibold">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// PANEL DE PERSONALIZACIÓN (Horizontal)
// ============================================================================
const PersonalizationPanel: React.FC<{
  note: Note;
  noteColorHex: string;
  noteIcon: NoteIcon;
  iconConfig: { label: string; description: string };
  sizeConfig: { label: string; minHeight: string };
  intensityConfig: { label: string; bgOpacity: number };
  noteShape: string;
}> = ({ note, noteColorHex, noteIcon, iconConfig, sizeConfig, intensityConfig, noteShape }) => {
  
  const personalizationItems = useMemo((): PersonalizationItem[] => [
    {
      id: 'icon',
      label: 'Icono',
      value: iconConfig.label,
      description: iconConfig.description,
      icon: getNoteIcon(noteIcon, "w-4 h-4"),
    },
    {
      id: 'size',
      label: 'Tamaño',
      value: sizeConfig.label,
      description: `${sizeConfig.minHeight} de altura`,
      icon: <GripVertical className="w-4 h-4" style={{ color: noteColorHex }} />,
    },
    {
      id: 'intensity',
      label: 'Intensidad',
      value: intensityConfig.label,
      description: `${Math.round(intensityConfig.bgOpacity * 100)}%`,
      icon: <Droplet className="w-4 h-4" style={{ color: noteColorHex }} />,
    },
    {
      id: 'shape',
      label: 'Forma',
      value: getShapeLabel(noteShape),
      description: 'Estilo visual',
      icon: <Shapes className="w-4 h-4" style={{ color: noteColorHex }} />,
    },
    {
      id: 'color',
      label: 'Color',
      value: noteColorHex,
      description: 'Hexadecimal',
      icon: <Palette className="w-4 h-4" style={{ color: noteColorHex }} />,
      rightContent: <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: noteColorHex }} />
    },
  ], [noteIcon, iconConfig, sizeConfig, intensityConfig, noteShape, noteColorHex]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Personalización Actual
          </h3>
          <span className="text-xs text-blue-500 dark:text-blue-400 font-medium flex items-center gap-1 cursor-pointer hover:underline">
            Ver detalles <Eye className="w-3 h-3" />
          </span>
        </div>

        {/* Grid Horizontal de Items */}
        <div className="flex flex-wrap items-center gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {personalizationItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 min-w-[150px] border border-gray-100 dark:border-gray-700/50 shrink-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${noteColorHex}20` }}>
                {item.icon}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">{item.label}</p>
                <div className="flex items-center gap-2">
                   <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{item.value}</p>
                   {item.rightContent}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
// ============================================================================
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  noteTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, noteTitle, onConfirm, onCancel }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-red-500/30 shadow-2xl"
        >
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              Eliminar nota
            </h3>
          </div>

          <div className="p-6">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¿Estás seguro?</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Esta acción eliminará permanentemente la nota</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                "{noteTitle}"
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                <span>Eliminar</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const NoteDetail: React.FC<NoteDetailProps> = ({
  note,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleArchive,
  onTagClick,
  onShare,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const colors = getNoteColorClasses(note.color);
  const gradient = getNoteGradient(note.color);
  const noteColorHex = note.color || DEFAULT_COLOR;
  const initials = getInitials(note.title);
  
  const noteIcon = (note.icon as NoteIcon) || 'default';
  const noteSize = (note.size as NoteSize) || 'normal';
  const noteIntensity = (note.colorIntensity as ColorIntensity) || 'medium';
  const noteShape = note.shape || 'rounded';
  
  const iconConfig = getIconConfig(noteIcon);
  const sizeConfig = getSizeConfig(noteSize);
  const intensityConfig = getIntensityConfig(noteIntensity);

  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const handleConfirmDelete = () => { onDelete(); setShowDeleteConfirm(false); };
  const handleCancelDelete = () => setShowDeleteConfirm(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-12">
      {/* Contenido principal - SIN HEADER DUPLICADO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Columna Única para el contenido principal de la nota */}
        <div className="space-y-6">
          {/* Tarjeta Principal con Badges integrados (Favorita/Archivada) */}
          <MainNoteCard
            note={note}
            noteColorHex={noteColorHex}
            noteIcon={noteIcon}
            noteSize={noteSize}
            intensityConfig={intensityConfig}
            sizeConfig={sizeConfig}
            gradient={gradient}
            initials={initials}
          />
          
          {/* Tarjeta de Contenido */}
          <ContentCard
            note={note}
            noteColorHex={noteColorHex}
            intensityConfig={intensityConfig}
            sizeConfig={sizeConfig}
            noteShape={noteShape}
            onTagClick={onTagClick}
          />

          {/* Fila Superior: Información (Izq) y Acciones (Der) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfoPanel 
              note={note} 
              noteColorHex={noteColorHex} 
              onTagClick={onTagClick} 
            />
            
            <QuickActionsPanel
              note={note}
              noteColorHex={noteColorHex}
              onToggleFavorite={onToggleFavorite}
              onToggleArchive={onToggleArchive}
              onEdit={onEdit}
              onDeleteClick={handleDeleteClick}
            />
          </div>

          {/* Fila Inferior: Personalización Horizontal */}
          <PersonalizationPanel
            note={note}
            noteColorHex={noteColorHex}
            noteIcon={noteIcon}
            iconConfig={iconConfig}
            sizeConfig={sizeConfig}
            intensityConfig={intensityConfig}
            noteShape={noteShape}
          />

        </div>
      </div>

      {/* Modal de confirmación */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        noteTitle={note.title}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default NoteDetail;