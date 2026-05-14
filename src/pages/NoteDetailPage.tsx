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
} from "lucide-react";
import ExportButton from "../contexts/components/export/ExportButton";
import { useExport } from "../hooks/useExport";
import { useToast } from "../hooks/useToast";

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

  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    if (showShareModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showShareModal]);

  const handleEdit = () => {
    navigate(`/notes/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!note) return;

    if (window.confirm("¿Estás seguro de que quieres eliminar esta nota?")) {
      const successResult = await deleteNote(note.id);
      if (successResult) {
        navigate("/notes");
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
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/tags/${encodeURIComponent(tag)}`);
  };

  // Manejar compartir nota - abre el modal
  const handleShare = () => {
    setShowShareModal(true);
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
    if (result?.success) success(result.message);
    setShowShareModal(false);
  };

  // Modal content
  const modalContent =
    showShareModal &&
    mounted &&
    createPortal(
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
                    `https://wa.me/?text=${encodeURIComponent(note?.title || "")}`,
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
                    `mailto:?subject=${encodeURIComponent(note?.title || "")}&body=${encodeURIComponent(note?.content || "")}`,
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
      document.body,
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
      {/* Botón flotante para volver */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 left-4 z-10"
      >
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/notes")}
          className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all"
          aria-label="Volver a notas"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </motion.button>
      </motion.div>

      {/* Botón flotante de compartir */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 right-4 z-10 flex gap-2"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all"
          title="Compartir nota"
          aria-label="Compartir nota"
        >
          <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </motion.button>

        <ExportButton
          variant="icon"
          size="md"
          notesToExport={[note]}
          onExportComplete={(result) => {
            if (result.success) {
              console.log("Exportación completada:", result.filename);
            }
          }}
        />
      </motion.div>

      <NoteDetail
        note={note}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onToggleArchive={handleToggleArchive}
        onTagClick={handleTagClick}
        onShare={handleShare} // ✅ Agregar esta línea
      />

      {/* Modal renderizado en body mediante Portal */}
      {modalContent}
    </div>
  );
};

export default NoteDetailPage;
