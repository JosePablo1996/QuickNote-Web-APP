import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Note } from '../../models/Note';
import { formatDateTime, getInitials } from '../../utils/noteUtils';
import { getNoteColorClasses, getNoteGradient, DEFAULT_COLOR } from '../../utils/noteColors';
import TagChip from '../tags/TagChip';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
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
  Share2,
  Copy,
  Printer,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Facebook,
  Twitter,
  Mail,
  Link2,
  Linkedin,
  MessageCircle
} from 'lucide-react';

interface NoteDetailProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onToggleArchive: () => void;
  onTagClick?: (tag: string) => void;
}

const NoteDetail: React.FC<NoteDetailProps> = ({
  note,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleArchive,
  onTagClick,
}) => {
  const navigate = useNavigate();
  const { success, error: showError, info } = useToast();
  const [showActions, setShowActions] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  // Obtener las clases de color del sistema centralizado
  const colors = getNoteColorClasses(note.color);
  const gradient = getNoteGradient(note.color);
  const noteColorHex = note.color || DEFAULT_COLOR;
  const initials = getInitials(note.title);

  const handleBack = () => {
    navigate(-1);
  };

  // ============== FUNCIONALIDADES IMPLEMENTADAS ==============

  /**
   * Compartir vía Web Share API (si está disponible)
   */
  const handleShare = async () => {
    const shareData = {
      title: note.title,
      text: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
      url: window.location.href,
    };

    if (navigator.share && window.innerWidth < 768) {
      try {
        await navigator.share(shareData);
        success('✅ Compartido exitosamente');
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          showError('Error al compartir');
        }
      }
    } else {
      // Si no hay Web Share API, mostrar opciones de compartir
      setShowShareOptions(true);
    }
    setShowShareMenu(false);
  };

  /**
   * Compartir por correo
   */
  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Nota: ${note.title}`);
    const body = encodeURIComponent(
      `${note.title}\n\n${note.content}\n\n---\nCompartido desde QuickNote`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    setShowShareOptions(false);
    success('✅ Cliente de correo abierto');
  };

  /**
   * Compartir por WhatsApp
   */
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `${note.title}\n\n${note.content.substring(0, 200)}${note.content.length > 200 ? '...' : ''}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareOptions(false);
    success('✅ WhatsApp abierto');
  };

  /**
   * Compartir por Twitter/X
   */
  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${note.title} - ${note.content.substring(0, 100)}...`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShowShareOptions(false);
    success('✅ Twitter abierto');
  };

  /**
   * Compartir por Facebook
   */
  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setShowShareOptions(false);
    success('✅ Facebook abierto');
  };

  /**
   * Compartir por LinkedIn
   */
  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(note.title);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
    setShowShareOptions(false);
    success('✅ LinkedIn abierto');
  };

  /**
   * Copiar al portapapeles
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
      success('✅ Copiado al portapapeles');
    } catch (err) {
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = `${note.title}\n\n${note.content}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      success('✅ Copiado al portapapeles');
    }
    setShowShareMenu(false);
  };

  /**
   * Copiar enlace de la nota
   */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    success('✅ Enlace copiado al portapapeles');
    setShowShareOptions(false);
  };

  /**
   * Imprimir nota
   */
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${note.title} - QuickNote</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
            }
            h1 {
              color: ${noteColorHex};
              border-bottom: 2px solid ${noteColorHex}40;
              padding-bottom: 10px;
            }
            .metadata {
              color: #666;
              font-size: 0.9em;
              margin-bottom: 30px;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 8px;
            }
            .content {
              white-space: pre-wrap;
            }
            .tags {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            .tag {
              display: inline-block;
              background: ${noteColorHex}20;
              color: ${noteColorHex};
              padding: 4px 8px;
              border-radius: 4px;
              margin-right: 8px;
              font-size: 0.9em;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #999;
              font-size: 0.8em;
            }
          </style>
        </head>
        <body>
          <h1>${note.title}</h1>
          <div class="metadata">
            <div>📅 Creada: ${new Date(note.created_at).toLocaleString()}</div>
            ${note.updated_at && note.updated_at !== note.created_at ? 
              `<div>🕒 Actualizada: ${new Date(note.updated_at).toLocaleString()}</div>` : ''}
            ${note.is_favorite ? '<div>⭐ Favorita</div>' : ''}
            ${note.is_archived ? '<div>📦 Archivada</div>' : ''}
          </div>
          <div class="content">
            ${note.content.replace(/\n/g, '<br>')}
          </div>
          ${note.tags && note.tags.length > 0 ? `
            <div class="tags">
              <strong>Etiquetas:</strong><br>
              ${note.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}
            </div>
          ` : ''}
          <div class="footer">
            Generado por QuickNote - ${new Date().toLocaleString()}
          </div>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
    setShowShareMenu(false);
  };

  /**
   * Exportar nota como JSON
   */
  const handleExport = () => {
    const exportData = {
      ...note,
      export_date: new Date().toISOString(),
      exported_from: 'QuickNote',
    };
    
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nota-${note.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    success('✅ Nota exportada como JSON');
    setShowShareMenu(false);
  };

  /**
   * Exportar como texto plano
   */
  const handleExportTxt = () => {
    const content = `${note.title}\n${'='.repeat(note.title.length)}\n\n${note.content}\n\n---\nCreada: ${new Date(note.created_at).toLocaleString()}\nID: ${note.id}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nota-${note.id}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    success('✅ Nota exportada como texto');
    setShowShareMenu(false);
  };

  /**
   * Exportar como Markdown
   */
  const handleExportMarkdown = () => {
    const tags = note.tags?.map(tag => `#${tag}`).join(' ') || '';
    const content = `# ${note.title}\n\n${note.content}\n\n---\n\n${tags}\n\n*Creada: ${new Date(note.created_at).toLocaleString()}*`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nota-${note.id}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    success('✅ Nota exportada como Markdown');
    setShowShareMenu(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header con navegación */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div 
                  className="w-2 h-8 rounded-full"
                  style={{ background: `linear-gradient(to bottom, ${noteColorHex}, ${noteColorHex}80)` }}
                />
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Detalle de Nota
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Badges de estado */}
              <AnimatePresence>
                {note.is_favorite && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>Favorita</span>
                  </motion.div>
                )}

                {note.is_archived && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archivada</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botón de menú principal */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Opciones"
                  title="Opciones de nota"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>

                {/* Menú principal */}
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    >
                      <div className="p-2">
                        {/* Compartir */}
                        <button
                          onClick={handleShare}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                            <Share2 className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Compartir
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Comparte esta nota
                            </p>
                          </div>
                        </button>

                        {/* Copiar */}
                        <button
                          onClick={handleCopy}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform">
                            <Copy className="w-4 h-4 text-purple-500" />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Copiar
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Copiar contenido al portapapeles
                            </p>
                          </div>
                        </button>

                        {/* Imprimir */}
                        <button
                          onClick={handlePrint}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform">
                            <Printer className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Imprimir
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Imprimir nota
                            </p>
                          </div>
                        </button>

                        {/* Exportar (con submenú) */}
                        <div className="relative">
                          <button
                            onClick={() => setShowShareOptions(!showShareOptions)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                          >
                            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 group-hover:scale-110 transition-transform">
                              <Download className="w-4 h-4 text-orange-500" />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Exportar
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Guardar como archivo
                              </p>
                            </div>
                          </button>

                          {/* Submenú de exportación */}
                          <AnimatePresence>
                            {showShareOptions && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="absolute left-full top-0 ml-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                              >
                                <div className="p-2">
                                  <button
                                    onClick={handleExport}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                                  >
                                    <span className="text-sm">📄 JSON</span>
                                  </button>
                                  <button
                                    onClick={handleExportTxt}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                                  >
                                    <span className="text-sm">📝 Texto plano</span>
                                  </button>
                                  <button
                                    onClick={handleExportMarkdown}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                                  >
                                    <span className="text-sm">📘 Markdown</span>
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de opciones de compartir */}
      <AnimatePresence>
        {showShareOptions && !showShareMenu && (
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
              onClick={() => setShowShareOptions(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-2xl"
            >
              <div 
                className="px-6 py-4"
                style={{
                  background: `linear-gradient(135deg, ${noteColorHex}, ${noteColorHex}DD)`,
                }}
              >
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Compartir nota
                </h3>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
                  ¿Cómo quieres compartir esta nota?
                </p>

                <div className="grid grid-cols-4 gap-3 mb-6">
                  <button
                    onClick={handleShareEmail}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    title="Correo electrónico"
                  >
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Email</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    title="WhatsApp"
                  >
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">WhatsApp</span>
                  </button>

                  <button
                    onClick={handleShareTwitter}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    title="Twitter/X"
                  >
                    <div className="p-3 rounded-full bg-sky-100 dark:bg-sky-900/30 group-hover:scale-110 transition-transform">
                      <Twitter className="w-5 h-5 text-sky-500" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Twitter</span>
                  </button>

                  <button
                    onClick={handleShareFacebook}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    title="Facebook"
                  >
                    <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 group-hover:scale-110 transition-transform">
                      <Facebook className="w-5 h-5 text-indigo-500" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Facebook</span>
                  </button>

                  <button
                    onClick={handleShareLinkedIn}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    title="LinkedIn"
                  >
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                      <Linkedin className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">LinkedIn</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group col-span-2"
                    title="Copiar enlace"
                  >
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform">
                      <Link2 className="w-5 h-5 text-purple-500" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Copiar enlace</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowShareOptions(false)}
                  className="w-full px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido principal (se mantiene igual) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ... resto del contenido ... */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Columna izquierda - Contenido de la nota */}
          <div className="lg:w-2/3 space-y-6">
            {/* Tarjeta principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl"
              style={{
                boxShadow: `0 25px 50px -12px ${noteColorHex}40`,
              }}
            >
              {/* Efectos decorativos */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  background: `radial-gradient(circle at 0% 0%, ${noteColorHex}, transparent 70%)`,
                }}
              />
              
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl"
                style={{ backgroundColor: `${noteColorHex}20` }}
              />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl"
                style={{ backgroundColor: `${noteColorHex}20` }}
              />

              <div className="relative z-10 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Avatar con gradiente */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="relative"
                  >
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center text-white font-bold text-3xl md:text-4xl shadow-2xl bg-gradient-to-br ${gradient}`}
                      style={{
                        boxShadow: `0 20px 30px -10px ${noteColorHex}80`,
                      }}
                    >
                      {initials}
                    </div>
                    {/* Indicador de color */}
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
                    <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${colors.text}`}>
                      {note.title}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Creada: <span className="font-medium text-gray-900 dark:text-gray-200">
                            {formatDateTime(note.created_at)}
                          </span>
                        </span>
                      </div>
                      
                      {note.updated_at && note.updated_at !== note.created_at && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Actualizada: <span className="font-medium text-gray-900 dark:text-gray-200">
                              {formatDateTime(note.updated_at)}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tarjeta de contenido */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl"
            >
              <div className="relative z-10 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-1.5 h-8 rounded-full"
                    style={{ background: `linear-gradient(to bottom, ${noteColorHex}, ${noteColorHex}80)` }}
                  />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    Contenido
                  </h3>
                </div>
                
                <div className="min-h-[250px] p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {note.content || 'Sin contenido'}
                  </p>
                </div>

                {/* Etiquetas */}
                {note.tags && note.tags.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <TagIcon className={`w-5 h-5 ${colors.text}`} />
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Etiquetas
                      </h4>
                      <span className="ml-auto text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                        {note.tags.length} {note.tags.length === 1 ? 'etiqueta' : 'etiquetas'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag, index) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TagChip
                            tagName={tag}
                            onTap={onTagClick ? () => onTagClick(tag) : undefined}
                            showIcon
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Columna derecha - Acciones (se mantiene igual) */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-4">
              {/* Panel de acciones (se mantiene igual) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl"
                style={{
                  boxShadow: `0 20px 40px -15px ${noteColorHex}60`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                
                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${noteColorHex}20, ${noteColorHex}05)`,
                        border: `1px solid ${noteColorHex}30`,
                      }}
                    >
                      <MoreVertical className="w-5 h-5" style={{ color: noteColorHex }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        Acciones rápidas
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Gestiona tu nota
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Favorito */}
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onToggleFavorite}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 dark:hover:from-yellow-900/20 dark:hover:to-amber-900/20 transition-all duration-200 group border border-transparent hover:border-yellow-200 dark:hover:border-yellow-800"
                    >
                      <div className={`p-3 rounded-xl transition-all duration-200 group-hover:scale-110 ${
                        note.is_favorite 
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        <Star className={`w-5 h-5 ${note.is_favorite ? 'fill-white' : ''}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold ${note.is_favorite ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {note.is_favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {note.is_favorite ? 'Eliminar de la lista de favoritos' : 'Marcar como nota favorita'}
                        </p>
                      </div>
                    </motion.button>

                    {/* Archivar */}
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onToggleArchive}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 transition-all duration-200 group border border-transparent hover:border-teal-200 dark:hover:border-teal-800"
                    >
                      <div className={`p-3 rounded-xl transition-all duration-200 group-hover:scale-110 ${
                        note.is_archived 
                          ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-lg shadow-teal-500/30' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        <Archive className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold ${note.is_archived ? 'text-teal-600 dark:text-teal-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {note.is_archived ? 'Desarchivar nota' : 'Archivar nota'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {note.is_archived ? 'Restaurar a notas activas' : 'Mover a notas archivadas'}
                        </p>
                      </div>
                    </motion.button>

                    {/* Editar */}
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onEdit}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 group border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-all duration-200">
                        <Edit className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                          Editar nota
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Modificar contenido y configuración
                        </p>
                      </div>
                    </motion.button>

                    {/* Eliminar */}
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteClick}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-200 group border border-transparent hover:border-red-200 dark:hover:border-red-800"
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-lg shadow-red-500/30 group-hover:scale-110 transition-all duration-200">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-red-600 dark:text-red-400">
                          Eliminar nota
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Esta acción no se puede deshacer
                        </p>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Información adicional */}
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      ID de la nota
                    </p>
                    <p className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                      {note.id}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCancelDelete}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-red-500/30 shadow-2xl"
            >
              {/* Header con gradiente */}
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
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    ¿Estás seguro?
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Esta acción eliminará permanentemente la nota
                  </p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                    "{note.title}"
                  </p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelDelete}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmDelete}
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
    </div>
  );
};

export default NoteDetail;