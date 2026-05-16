import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useNotes } from "../hooks/useNotes";
import { useTheme } from "../hooks/useTheme";
import NoteDetail from "../contexts/components/notes/NoteDetail";
import LoadingSpinner from "../contexts/components/ui/LoadingSpinner";
import EmptyState from "../contexts/components/ui/EmptyState";
import { Note } from "../models/Note";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  X,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Mail,
  Link2,
  FileJson,
  // ========== NUEVOS ICONOS ==========
  Sparkles,
  Eye,
  Palette,
  Shapes,
  GripVertical,
  Droplet
} from "lucide-react";
import { useExport } from "../hooks/useExport";
import { useToast } from "../hooks/useToast";

// ========== IMPORTACIONES DE NUEVAS PROPIEDADES ==========
import {
  getIconConfig,
  getSizeConfig,
  getIntensityConfig,
  NOTE_SHAPES
} from "../models/Note";

const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { success, error: showError, info } = useToast();
  const { notes, isLoading, toggleFavorite, toggleArchive, deleteNote } =
    useNotes();

  const [note, setNote] = useState<Note | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);

  // Hook de exportación
  const { shareNote, isExporting, exportNotes } = useExport();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Buscar la nota cuando cambien las notas o el ID
  useEffect(() => {
    if (id && notes.length > 0) {
      console.log("🔍 Buscando nota con ID:", id);
      const foundNote = notes.find((n) => n.id === id);
      setNote(foundNote);
      setLoading(false);
    } else if (notes.length === 0) {
      setLoading(true);
    }
  }, [id, notes]);

  // Prevenir scroll cuando los modales están abiertos
  useEffect(() => {
    if (showShareModal || showPersonalizationModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showShareModal, showPersonalizationModal]);

  const handleEdit = () => {
    navigate(`/notes/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!note) return;

    if (window.confirm("¿Estás seguro de que quieres eliminar esta nota?")) {
      const successResult = await deleteNote(note.id);
      if (successResult) {
        success("✅ Nota eliminada correctamente");
        navigate("/notes");
      } else {
        showError("❌ Error al eliminar la nota");
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!note) return;
    const successResult = await toggleFavorite(note.id);
    if (successResult) {
      const updatedNote: Note = {
        ...note,
        is_favorite: !note.is_favorite,
      };
      setNote(updatedNote);
      success(note.is_favorite ? "⭐ Nota eliminada de favoritos" : "⭐ Nota añadida a favoritos");
    }
  };

  const handleToggleArchive = async () => {
    if (!note) return;
    const successResult = await toggleArchive(note.id);
    if (successResult) {
      const updatedNote: Note = {
        ...note,
        is_archived: !note.is_archived,
      };
      setNote(updatedNote);
      success(note.is_archived ? "📦 Nota restaurada" : "📦 Nota archivada");
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/tags/${encodeURIComponent(tag)}`);
  };

  // Manejar compartir nota - abre el modal
  const handleShare = () => {
    setShowShareModal(true);
  };

  // Ver personalización
  const handleViewPersonalization = () => {
    setShowPersonalizationModal(true);
  };

  // Copiar enlace
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      success("✅ Enlace copiado al portapapeles");
    } catch {
      showError("No se pudo copiar el enlace");
    }
  };

  // Compartir en redes sociales
  const shareToSocial = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
    setShowShareModal(false);
  };

  // Exportar como JSON
  const handleExportJSON = async () => {
    if (!note) return;
    const result = await exportNotes([note], {
      format: "json",
      scope: "single",
      includeMetadata: true,
      includeTags: true,
      includeDates: true,
    });
    if (result?.success) {
      success(result.message);
      setShowShareModal(false);
    }
  };

  // Obtener información de personalización de la nota
  const getPersonalizationInfo = () => {
    if (!note) return null;
    
    const iconConfig = getIconConfig(note.icon as any);
    const sizeConfig = getSizeConfig(note.size as any);
    const intensityConfig = getIntensityConfig(note.colorIntensity as any);
    const shapeConfig = NOTE_SHAPES.find(s => s.value === note.shape);
    
    return {
      icon: iconConfig,
      size: sizeConfig,
      intensity: intensityConfig,
      shape: shapeConfig || NOTE_SHAPES[1]
    };
  };

  // Modal de personalización
  const personalizationModalContent = showPersonalizationModal && mounted && createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 99999,
      }}
      onClick={() => setShowPersonalizationModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="text-lg font-bold text-white">Personalización de la nota</h3>
            </div>
            <button
              onClick={() => setShowPersonalizationModal(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1 truncate">{note?.title}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {note && (
            <div className="space-y-4">
              {/* Icono */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${note.color}20` }}>
                  {getPersonalizationInfo()?.icon.value === 'default' ? (
                    <Sparkles className="w-6 h-6" style={{ color: note.color }} />
                  ) : (
                    <span className="text-2xl">{getPersonalizationInfo()?.icon.iconName}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Icono</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getPersonalizationInfo()?.icon.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{getPersonalizationInfo()?.icon.description}</p>
                </div>
              </div>

              {/* Tamaño */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${note.color}20` }}>
                  <GripVertical className="w-6 h-6" style={{ color: note.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Tamaño</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getPersonalizationInfo()?.size.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{getPersonalizationInfo()?.size.description}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${note.color}15`, color: note.color }}>
                  {getPersonalizationInfo()?.size.minHeight}
                </span>
              </div>

              {/* Intensidad */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${note.color}20` }}>
                  <Droplet className="w-6 h-6" style={{ color: note.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Intensidad</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getPersonalizationInfo()?.intensity.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{getPersonalizationInfo()?.intensity.description}</p>
                </div>
                <div className="flex gap-1">
                  <div className="w-6 h-2 rounded-full" style={{ backgroundColor: note.color, opacity: 0.3 }} />
                  <div className="w-6 h-2 rounded-full" style={{ backgroundColor: note.color, opacity: 0.6 }} />
                  <div className="w-6 h-2 rounded-full" style={{ backgroundColor: note.color, opacity: 1 }} />
                </div>
              </div>

              {/* Forma */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${note.color}20` }}>
                  <Shapes className="w-6 h-6" style={{ color: note.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Forma</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getPersonalizationInfo()?.shape.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {note.shape === 'square' && 'Bordes rectos, estilo minimalista'}
                    {note.shape === 'rounded' && 'Esquinas redondeadas, estilo moderno'}
                    {note.shape === 'oval' && 'Forma ovalada, estilo único'}
                    {note.shape === 'pill' && 'Forma de píldora, estilo llamativo'}
                  </p>
                </div>
                <div 
                  className="w-10 h-10"
                  style={{ 
                    backgroundColor: `${note.color}20`,
                    borderRadius: note.shape === 'square' ? '0' : 
                               note.shape === 'pill' ? '9999px' : 
                               note.shape === 'oval' ? '50%' : '0.75rem',
                    width: note.shape === 'oval' ? '40px' : '40px',
                    height: note.shape === 'oval' ? '24px' : '40px',
                  }}
                />
              </div>

              {/* Color */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${note.color}20` }}>
                  <Palette className="w-6 h-6" style={{ color: note.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Color</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{note.color}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Color principal de la nota</p>
                </div>
                <div 
                  className="w-10 h-10 rounded-full shadow-lg"
                  style={{ backgroundColor: note.color }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex gap-3">
          <button
            onClick={() => setShowPersonalizationModal(false)}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              setShowPersonalizationModal(false);
              handleEdit();
            }}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Editar personalización
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );

  // Modal content de compartir
  const shareModalContent = showShareModal && mounted && createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 99999,
      }}
      onClick={() => setShowShareModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-2xl"
        style={{ margin: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-white" />
              <h3 className="text-lg font-bold text-white">Compartir nota</h3>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1 truncate">{note?.title}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
            Comparte esta nota en tus redes sociales
          </p>

          {/* Grid de redes sociales - 2 columnas */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() =>
                shareToSocial(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(note?.title || "")}&url=${encodeURIComponent(window.location.href)}`,
                )
              }
              className="flex items-center gap-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all"
            >
              <div className="p-2 rounded-lg bg-sky-500/20">
                <Twitter className="w-5 h-5 text-sky-500" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Twitter
              </span>
            </button>

            <button
              onClick={() =>
                shareToSocial(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                )
              }
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
            >
              <div className="p-2 rounded-lg bg-blue-600/20">
                <Facebook className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Facebook
              </span>
            </button>

            <button
              onClick={() =>
                shareToSocial(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                )
              }
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
            >
              <div className="p-2 rounded-lg bg-blue-700/20">
                <Linkedin className="w-5 h-5 text-blue-700" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                LinkedIn
              </span>
            </button>

            <button
              onClick={() =>
                shareToSocial(
                  `https://wa.me/?text=${encodeURIComponent(note?.title || "")} ${encodeURIComponent(window.location.href)}`,
                )
              }
              className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all"
            >
              <div className="p-2 rounded-lg bg-green-500/20">
                <MessageCircle className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                WhatsApp
              </span>
            </button>

            <button
              onClick={() =>
                shareToSocial(
                  `mailto:?subject=${encodeURIComponent(note?.title || "")}&body=${encodeURIComponent(note?.content || "")}%0A%0A${encodeURIComponent(window.location.href)}`,
                )
              }
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/40 transition-all"
            >
              <div className="p-2 rounded-lg bg-gray-500/20">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo
              </span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all"
            >
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Link2 className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Copiar enlace
              </span>
            </button>
          </div>

          {/* Separador */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                O exporta como archivo
              </span>
            </div>
          </div>

          {/* Botón exportar JSON */}
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            <FileJson className="w-5 h-5" />
            <div className="flex-1 text-left">
              <span className="text-sm font-medium">Exportar como JSON</span>
              <p className="text-xs opacity-80">
                Descargar archivo para compartir
              </p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );

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
          onAction={() => navigate("/notes")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Botón flotante de regresar en esquina superior izquierda */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05, x: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/notes")}
        className="fixed top-4 left-4 z-50 p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
        title="Volver a notas"
        aria-label="Volver a notas"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </motion.button>

      {/* Botón flotante de compartir en esquina superior derecha */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
        className="fixed top-4 right-4 z-50 p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 backdrop-blur-xl border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all"
        title="Compartir nota"
        aria-label="Compartir nota"
      >
        <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </motion.button>

      {/* Botón flotante de personalización */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleViewPersonalization}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all"
        title="Ver personalización"
        aria-label="Ver personalización"
      >
        <Sparkles className="w-5 h-5" />
      </motion.button>

      <NoteDetail
        note={note}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onToggleArchive={handleToggleArchive}
        onTagClick={handleTagClick}
        onShare={handleShare}
      />

      {/* Modales renderizados en body mediante Portal */}
      {shareModalContent}
      {personalizationModalContent}
    </div>
  );
};

export default NoteDetailPage;