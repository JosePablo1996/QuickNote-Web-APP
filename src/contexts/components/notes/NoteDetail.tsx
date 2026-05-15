// src/contexts/components/notes/NoteDetail.tsx
// ============================================================================
// DEPENDENCIAS
// ============================================================================
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Archive,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Tag as TagIcon,
  MoreVertical,
  AlertCircle,
  XCircle,
  Sparkles,
  GripVertical,
  Droplet,
  Shapes,
  Eye,
  Hash,
} from 'lucide-react';

// ============================================================================
// HOOKS Y UTILIDADES
// ============================================================================
import { Note } from '../../../models/Note';
import { formatDateTime, getInitials } from '../../../utils/noteUtils';
import { getNoteColorClasses, getNoteGradient, DEFAULT_COLOR } from '../../../utils/noteColors';
import { getColorWithOpacity } from '../../../models/Note';
import { useToast } from '../../../hooks/useToast';
import TagChip from '../tags/TagChip';
import NoteActionsMenu from './NoteActionsMenu';

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

const getShapeStyle = (shape: string, color: string, size: number = 32) => {
  let borderRadius = '0.75rem';
  let width = size;
  let height = size;
  
  switch (shape) {
    case 'square': borderRadius = '0'; break;
    case 'pill': borderRadius = '9999px'; break;
    case 'oval': borderRadius = '50%'; width = size; height = size * 0.6; break;
    default: borderRadius = '0.75rem'; break;
  }
  
  return {
    backgroundColor: `${color}20`,
    borderRadius,
    width: `${width}px`,
    height: `${height}px`,
  };
};

// ============================================================================
// COMPONENTES INTERNOS
// ============================================================================

// Header con navegación y badges
const DetailHeader: React.FC<{
  note: Note;
  noteColorHex: string;
  intensityConfig: { borderOpacity: number };
  noteIcon: NoteIcon;
  iconConfig: { label: string };
  noteSize: NoteSize;
  sizeConfig: { label: string };
  noteIntensity: ColorIntensity;
  intensityConfigFull: { label: string; bgOpacity: number };
  noteShape: string;
  onBack: () => void;
  onShare: () => void;
}> = ({ 
  note, noteColorHex, intensityConfig, noteIcon, iconConfig, 
  noteSize, sizeConfig, noteIntensity, intensityConfigFull, noteShape, 
  onBack, onShare 
}) => (
  <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Lado izquierdo */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900" />
          </motion.button>
          
          <div className="flex items-center gap-3">
            <div 
              className="w-2 h-8 rounded-full"
              style={{ background: `linear-gradient(to bottom, ${noteColorHex}, ${getColorWithOpacity(noteColorHex, intensityConfig.borderOpacity)})` }}
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Detalle de Nota
            </h1>
          </div>
        </div>

        {/* Lado derecho - Badges */}
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {note.is_favorite && (
              <StatusBadge icon={<Star className="w-3.5 h-3.5 fill-white" />} label="Favorita" color="from-yellow-400 to-amber-500" />
            )}
            {note.is_archived && (
              <StatusBadge icon={<Archive className="w-3.5 h-3.5" />} label="Archivada" color="from-purple-400 to-purple-600" />
            )}
            {noteIcon !== 'default' && (
              <CustomBadge icon={getNoteIcon(noteIcon, "w-3 h-3")} label={iconConfig.label} color={noteColorHex} />
            )}
            {noteSize !== 'normal' && (
              <CustomBadge icon={<GripVertical className="w-3 h-3" />} label={sizeConfig.label} color={noteColorHex} />
            )}
            {noteIntensity !== 'medium' && (
              <CustomBadge 
                icon={<Droplet className="w-3 h-3" />} 
                label={intensityConfigFull.label} 
                color={noteColorHex}
                tooltip={`Intensidad: ${intensityConfigFull.label} (${Math.round(intensityConfigFull.bgOpacity * 100)}% fondo)`}
              />
            )}
            {noteShape !== 'rounded' && (
              <CustomBadge icon={<Shapes className="w-3 h-3" />} label={getShapeLabel(noteShape)} color={noteColorHex} />
            )}
          </AnimatePresence>

          <NoteActionsMenu note={note} onShare={onShare} />
        </div>
      </div>
    </div>
  </div>
);

// Badge de estado
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

// ============================================================================
// TARJETA PRINCIPAL DE LA NOTA
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
            <h2 className={`font-bold mb-4 ${getTitleSizeClass(noteSize)}`} style={{ color: noteColorHex }}>
              {note.title}
            </h2>
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
// PANEL DE ACCIONES RÁPIDAS
// ============================================================================
const QuickActionsPanel: React.FC<{
  note: Note;
  noteColorHex: string;
  intensityConfig: { shadowIntensity: number };
  onToggleFavorite: () => void;
  onToggleArchive: () => void;
  onEdit: () => void;
  onDeleteClick: () => void;
}> = ({ note, noteColorHex, intensityConfig, onToggleFavorite, onToggleArchive, onEdit, onDeleteClick }) => {
  const actions = useMemo(() => [
    {
      id: 'favorite',
      label: note.is_favorite ? 'Quitar de favoritos' : 'Añadir a favoritos',
      description: note.is_favorite ? 'Eliminar de la lista de favoritos' : 'Marcar como nota favorita',
      icon: <Star className="w-5 h-5" />,
      active: note.is_favorite,
      activeColor: 'from-yellow-400 to-amber-500',
      activeTextColor: 'text-yellow-600 dark:text-yellow-400',
      hoverBg: 'hover:from-yellow-50 hover:to-amber-50 dark:hover:from-yellow-900/20 dark:hover:to-amber-900/20',
      hoverBorder: 'hover:border-yellow-200 dark:hover:border-yellow-800',
      onClick: onToggleFavorite,
    },
    {
      id: 'archive',
      label: note.is_archived ? 'Desarchivar nota' : 'Archivar nota',
      description: note.is_archived ? 'Restaurar a notas activas' : 'Mover a notas archivadas',
      icon: <Archive className="w-5 h-5" />,
      active: note.is_archived,
      activeColor: 'from-teal-400 to-cyan-500',
      activeTextColor: 'text-teal-600 dark:text-teal-400',
      hoverBg: 'hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20',
      hoverBorder: 'hover:border-teal-200 dark:hover:border-teal-800',
      onClick: onToggleArchive,
    },
    {
      id: 'edit',
      label: 'Editar nota',
      description: 'Modificar contenido y configuración',
      icon: <Edit className="w-5 h-5" />,
      active: false,
      activeColor: 'from-blue-400 to-indigo-500',
      activeTextColor: 'text-blue-600',
      hoverBg: 'hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20',
      hoverBorder: 'hover:border-blue-200 dark:hover:border-blue-800',
      onClick: onEdit,
      isPrimary: true,
    },
    {
      id: 'delete',
      label: 'Eliminar nota',
      description: 'Esta acción no se puede deshacer',
      icon: <Trash2 className="w-5 h-5" />,
      active: false,
      activeColor: 'from-red-400 to-rose-500',
      activeTextColor: 'text-red-600 dark:text-red-400',
      hoverBg: 'hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20',
      hoverBorder: 'hover:border-red-200 dark:hover:border-red-800',
      onClick: onDeleteClick,
      isDestructive: true,
    },
  ], [note.is_favorite, note.is_archived, onToggleFavorite, onToggleArchive, onEdit, onDeleteClick]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl"
      style={{ boxShadow: `0 20px 40px -15px ${getColorWithOpacity(noteColorHex, intensityConfig.shadowIntensity)}` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${noteColorHex}20, ${noteColorHex}05)`, border: `1px solid ${getColorWithOpacity(noteColorHex, 0.3)}` }}>
            <MoreVertical className="w-5 h-5" style={{ color: noteColorHex }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Acciones rápidas</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gestiona tu nota</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {actions.map((action) => (
            <ActionButton
              key={action.id}
              {...action}
              colorHex={noteColorHex}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Botón de acción individual
const ActionButton: React.FC<{
  label: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  activeColor: string;
  activeTextColor: string;
  hoverBg: string;
  hoverBorder: string;
  onClick: () => void;
  isDestructive?: boolean;
  isPrimary?: boolean;
  colorHex: string;
}> = ({ label, description, icon, active, activeColor, activeTextColor, hoverBg, hoverBorder, onClick, isDestructive, isPrimary, colorHex }) => (
  <motion.button
    whileHover={{ scale: 1.02, x: 5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group border border-transparent ${hoverBg} ${hoverBorder}`}
  >
    <div className={`p-3 rounded-xl transition-all duration-200 group-hover:scale-110 ${
      active ? `bg-gradient-to-br ${activeColor} text-white shadow-lg` :
      isPrimary ? `bg-gradient-to-br ${activeColor} text-white shadow-lg` :
      isDestructive ? 'bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-lg' :
      'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
    }`} style={!active && !isPrimary && !isDestructive ? { backgroundColor: `${colorHex}20`, color: colorHex } : undefined}>
      {icon}
    </div>
    <div className="flex-1 text-left">
      <p className={`font-semibold ${active ? activeTextColor : (isDestructive ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300')}`}>
        {label}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
    </div>
  </motion.button>
);

// ============================================================================
// PANEL DE PERSONALIZACIÓN
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
      rightContent: (
        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${noteColorHex}15`, color: noteColorHex }}>
          {iconConfig.label === 'Predeterminado' ? 'Nota estándar' : iconConfig.description}
        </span>
      ),
    },
    {
      id: 'size',
      label: 'Tamaño',
      value: sizeConfig.label,
      description: `${sizeConfig.minHeight} de altura`,
      icon: <GripVertical className="w-4 h-4" style={{ color: noteColorHex }} />,
      rightContent: (
        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${noteColorHex}15`, color: noteColorHex }}>
          {sizeConfig.minHeight}
        </span>
      ),
    },
    {
      id: 'intensity',
      label: 'Intensidad',
      value: intensityConfig.label,
      description: `${Math.round(intensityConfig.bgOpacity * 100)}% de opacidad`,
      icon: <Droplet className="w-4 h-4" style={{ color: noteColorHex }} />,
      rightContent: (
        <div className="flex gap-1">
          <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: noteColorHex, opacity: 0.3 }} />
          <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: noteColorHex, opacity: 0.6 }} />
          <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: noteColorHex, opacity: 1 }} />
        </div>
      ),
    },
    {
      id: 'shape',
      label: 'Forma',
      value: getShapeLabel(noteShape),
      description: noteShape === 'square' ? 'Bordes rectos' : noteShape === 'oval' ? 'Forma ovalada' : noteShape === 'pill' ? 'Forma de píldora' : 'Esquinas redondeadas',
      icon: <Shapes className="w-4 h-4" style={{ color: noteColorHex }} />,
      rightContent: <div style={getShapeStyle(noteShape, noteColorHex, 32)} />,
    },
  ], [noteIcon, iconConfig, sizeConfig, intensityConfig, noteShape, noteColorHex]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${noteColorHex}15` }}>
            <Eye className="w-4 h-4" style={{ color: noteColorHex }} />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-gray-200">Personalización actual</h3>
        </div>

        <div className="space-y-3">
          {personalizationItems.map((item) => (
            <PersonalizationItemRow key={item.id} item={item} colorHex={noteColorHex} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Fila de personalización
const PersonalizationItemRow: React.FC<{ item: PersonalizationItem; colorHex: string }> = ({ item, colorHex }) => (
  <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: `${colorHex}08` }}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colorHex}20` }}>
        {item.icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{item.value}</p>
      </div>
    </div>
    {item.rightContent || <span className="text-xs text-gray-400">{item.description}</span>}
  </div>
);

// ============================================================================
// PANEL DE INFORMACIÓN ADICIONAL
// ============================================================================
const InfoPanel: React.FC<{ noteId: string; colorHex: string }> = ({ noteId, colorHex }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: 0.3 }}
    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-6"
  >
    <div className="flex items-start gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID de la nota</p>
        <p className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">{noteId}</p>
      </div>
    </div>
  </motion.div>
);

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
  const navigate = useNavigate();
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

  const handleBack = () => navigate(-1);
  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const handleConfirmDelete = () => { onDelete(); setShowDeleteConfirm(false); };
  const handleCancelDelete = () => setShowDeleteConfirm(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <DetailHeader
        note={note}
        noteColorHex={noteColorHex}
        intensityConfig={intensityConfig}
        noteIcon={noteIcon}
        iconConfig={iconConfig}
        noteSize={noteSize}
        sizeConfig={sizeConfig}
        noteIntensity={noteIntensity}
        intensityConfigFull={intensityConfig}
        noteShape={noteShape}
        onBack={handleBack}
        onShare={onShare || (() => {})}
      />

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Columna izquierda */}
          <div className="lg:w-2/3 space-y-6">
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
            <ContentCard
              note={note}
              noteColorHex={noteColorHex}
              intensityConfig={intensityConfig}
              sizeConfig={sizeConfig}
              noteShape={noteShape}
              onTagClick={onTagClick}
            />
          </div>

          {/* Columna derecha */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-4">
              <QuickActionsPanel
                note={note}
                noteColorHex={noteColorHex}
                intensityConfig={intensityConfig}
                onToggleFavorite={onToggleFavorite}
                onToggleArchive={onToggleArchive}
                onEdit={onEdit}
                onDeleteClick={handleDeleteClick}
              />
              <PersonalizationPanel
                note={note}
                noteColorHex={noteColorHex}
                noteIcon={noteIcon}
                iconConfig={iconConfig}
                sizeConfig={sizeConfig}
                intensityConfig={intensityConfig}
                noteShape={noteShape}
              />
              <InfoPanel noteId={note.id} colorHex={noteColorHex} />
            </div>
          </div>
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