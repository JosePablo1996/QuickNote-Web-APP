// src/contexts/components/backup/BackupLocalSection.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HardDrive, 
  Cloud, 
  Upload, 
  Trash2, 
  RotateCcw, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Info,
  CheckSquare,
  Square,
  Plus,
  Database
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useNotes } from '../../../hooks/useNotes';
import { useToast } from '../../../hooks/useToast';
import { backupService, BackupMetadata, BackupLimitInfo } from '../../../services/backup';
import LoadingSpinner from '../ui/LoadingSpinner';

interface BackupLocalSectionProps {
  onBackupChange?: () => void;
}

const BackupLocalSection: React.FC<BackupLocalSectionProps> = ({ onBackupChange }) => {
  const { isDarkMode } = useTheme();
  const { notes, replaceAllNotes } = useNotes();
  const { success, error: showError, info, warning } = useToast();

  // Estados de backups locales
  const [localBackups, setLocalBackups] = useState<BackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [backupProgress, setBackupProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  // Estados para selección múltiple
  const [selectedBackupIds, setSelectedBackupIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);

  // Estados de modales
  const [showDeleteModal, setShowDeleteModal] = useState<BackupMetadata | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Datos de modales
  const [modalNoteCount, setModalNoteCount] = useState(0);
  const [modalFileName, setModalFileName] = useState("");
  const [modalImportedCount, setModalImportedCount] = useState(0);
  const [modalTotalCount, setModalTotalCount] = useState(0);

  // Estadísticas
  const [totalBackupSize, setTotalBackupSize] = useState(0);
  const [limitInfo, setLimitInfo] = useState<BackupLimitInfo | null>(null);

  // ============================================
  // FUNCIONES DE CARGA
  // ============================================

  const loadLocalBackups = useCallback(async () => {
    try {
      setIsLoading(true);
      // Usar el nuevo método getLocalBackups() que solo trae backups locales
      const locals = backupService.getLocalBackups();
      setLocalBackups(locals);
      
      const total = locals.reduce((acc, b) => acc + b.file_size, 0);
      setTotalBackupSize(total);
      
      // Cargar información de límite
      const limit = await backupService.getBackupLimitInfo();
      setLimitInfo(limit);
    } catch (error) {
      showError("Error al cargar los backups locales");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadLocalBackups();
  }, [loadLocalBackups]);

  // ============================================
  // FUNCIONES DE SELECCIÓN MÚLTIPLE
  // ============================================

  const toggleBackupSelection = (backupId: string) => {
    setSelectedBackupIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(backupId)) {
        newSet.delete(backupId);
        if (newSet.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        newSet.add(backupId);
        setIsSelectionMode(true);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedBackupIds.size === localBackups.length) {
      setSelectedBackupIds(new Set());
      setIsSelectionMode(false);
    } else {
      setSelectedBackupIds(new Set(localBackups.map(b => b.id)));
      setIsSelectionMode(true);
    }
  };

  const clearSelection = () => {
    setSelectedBackupIds(new Set());
    setIsSelectionMode(false);
  };

  const handleDeleteSelected = async () => {
    if (selectedBackupIds.size === 0) return;
    
    setIsDeletingSelected(true);
    let successCount = 0;
    let failCount = 0;
    
    for (const backupId of selectedBackupIds) {
      try {
        await backupService.deleteBackup(backupId);
        successCount++;
      } catch (error) {
        console.error(`Error deleting backup ${backupId}:`, error);
        failCount++;
      }
    }
    
    if (successCount > 0) {
      success(`✅ ${successCount} backup${successCount !== 1 ? 's' : ''} local${successCount !== 1 ? 'es' : ''} eliminado${successCount !== 1 ? 's' : ''}`);
    }
    if (failCount > 0) {
      showError(`❌ ${failCount} backup${failCount !== 1 ? 's' : ''} no pudieron eliminarse`);
    }
    
    setSelectedBackupIds(new Set());
    setIsSelectionMode(false);
    setShowDeleteSelectedModal(false);
    setIsDeletingSelected(false);
    await loadLocalBackups();
    if (onBackupChange) onBackupChange();
  };

  // ============================================
  // FUNCIONES DE BACKUP LOCAL
  // ============================================

  const handleCreateBackup = async () => {
    if (notes.length === 0) {
      info("No hay notas para respaldar");
      return;
    }

    // Verificar límite antes de crear
    if (limitInfo?.isFull) {
      warning(`Has alcanzado el límite de ${limitInfo.max} backups locales. Elimina algunos para continuar.`);
      return;
    }

    setIsCreating(true);
    setBackupProgress(0);
    setModalTotalCount(notes.length);
    setShowProgressModal(true);

    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        const newProgress = prev + Math.floor(Math.random() * 15) + 5;
        return newProgress > 90 ? 90 : newProgress;
      });
      setProgressText(getProgressText(backupProgress));
    }, 200);

    try {
      // ✅ IMPORTANTE: syncToCloud = false para NO subir a la nube
      // Los backups locales se quedan SOLO en local
      const backup = await backupService.createBackup(notes, true, false);

      clearInterval(interval);
      setBackupProgress(100);
      setProgressText("¡Completado!");

      setShowProgressModal(false);
      setModalNoteCount(backup.note_count);
      setModalFileName(backup.file_name);
      setShowSuccessModal(true);

      await loadLocalBackups();
      if (onBackupChange) onBackupChange();
    } catch (error: any) {
      clearInterval(interval);
      setShowProgressModal(false);
      
      if (error.message && error.message.startsWith('LÍMITE_ALCANZADO:')) {
        warning("Has alcanzado el límite de backups locales. Elimina algunos para continuar.");
      } else {
        showError("Error al crear backup local");
      }
    } finally {
      setTimeout(() => {
        setIsCreating(false);
        setBackupProgress(0);
        setProgressText("");
      }, 500);
    }
  };

  const handleRestoreBackup = async (backup: BackupMetadata) => {
    if (!window.confirm(
      `¿Restaurar backup local?\n\n` +
      `📁 Archivo: ${backup.file_name}\n` +
      `📅 Fecha: ${formatDate(backup.created_at)}\n` +
      `📝 Notas: ${backup.note_count}\n\n` +
      `⚠️ Las notas actuales (${notes.length}) serán reemplazadas.`
    )) {
      return;
    }

    setIsRestoring(backup.id);
    setShowProgressModal(true);
    setProgressText("Restaurando desde local...");
    setBackupProgress(0);
    setModalTotalCount(backup.note_count);

    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 90) return 90;
        return prev + Math.floor(Math.random() * 20) + 10;
      });
    }, 200);

    try {
      const restoredNotes = await backupService.restoreBackup(backup.id);
      await replaceAllNotes(restoredNotes);

      clearInterval(interval);
      setBackupProgress(100);

      setShowProgressModal(false);
      setModalImportedCount(restoredNotes.length);
      setModalTotalCount(backup.note_count);
      setShowRestoreModal(true);

      success(`✅ ${restoredNotes.length} notas restauradas desde backup local`);
      await loadLocalBackups();
    } catch (error) {
      clearInterval(interval);
      setShowProgressModal(false);
      showError("Error al restaurar backup local");
    } finally {
      setIsRestoring(null);
    }
  };

  const handleDownloadBackup = async (backup: BackupMetadata) => {
    setIsDownloading(backup.id);
    try {
      await backupService.downloadBackupFromHistory(backup.id);
      success("✅ Descarga iniciada");
    } catch (error) {
      showError("Error al descargar backup");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDeleteBackup = (backup: BackupMetadata) => {
    setShowDeleteModal(backup);
  };

  const confirmDeleteBackup = async () => {
    if (!showDeleteModal) return;

    setIsDeleting(showDeleteModal.id);
    try {
      await backupService.deleteBackup(showDeleteModal.id);
      success(`✅ Backup local eliminado`);
      await loadLocalBackups();
      if (onBackupChange) onBackupChange();
    } catch (error) {
      showError("Error al eliminar backup local");
    } finally {
      setIsDeleting(null);
      setShowDeleteModal(null);
    }
  };

  // ============================================
  // FUNCIONES UTILITARIAS
  // ============================================

  const getProgressText = (progress: number): string => {
    if (progress === 0) return "Iniciando...";
    if (progress < 25) return "Preparando notas...";
    if (progress < 50) return "Comprimiendo datos...";
    if (progress < 75) return "Generando backup...";
    if (progress < 100) return "Finalizando...";
    return "¡Completado!";
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Hoy, ${date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const isAllSelected = selectedBackupIds.size === localBackups.length && localBackups.length > 0;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-4">
      {/* Header de la sección */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            💾 Backups Locales
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsSelectionMode(true);
              setSelectedBackupIds(new Set());
            }}
            className="px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Seleccionar
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateBackup}
            disabled={isCreating || notes.length === 0 || limitInfo?.isFull}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-md transition-all disabled:opacity-50"
            title={limitInfo?.isFull ? `Límite alcanzado (${limitInfo.current}/${limitInfo.max})` : "Crear nuevo backup local"}
          >
            {isCreating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Nuevo Backup</span>
          </motion.button>
        </div>
      </div>

      {/* Barra de selección múltiple */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-16 z-20 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg"
          >
            <div className="px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {isAllSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                </button>
                <span className="text-sm font-medium">
                  {selectedBackupIds.size} backup{selectedBackupIds.size !== 1 ? 's' : ''} seleccionado{selectedBackupIds.size !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearSelection}
                  className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowDeleteSelectedModal(true)}
                  disabled={selectedBackupIds.size === 0}
                  className="px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-xs flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/60 border-white/70'}`}>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Backups</span>
          </div>
          <p className="text-xl font-bold mt-1">{localBackups.length} / {limitInfo?.max || 20}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">{formatFileSize(totalBackupSize)} usado</p>
        </div>
        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/60 border-white/70'}`}>
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-500" />
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Notas actuales</span>
          </div>
          <p className="text-xl font-bold mt-1">{notes.length}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">para respaldar</p>
        </div>
      </div>

      {/* Indicador de límite próximo */}
      {limitInfo?.isLow && !limitInfo.isFull && (
        <div className={`p-2 rounded-lg text-center text-xs ${isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
          ⚠️ Te quedan solo {limitInfo.remaining} espacios de {limitInfo.max} para backups locales.
        </div>
      )}

      {/* Lista de backups locales */}
      <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/60 border-white/70'}`}>
        <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Historial de Backups Locales ({localBackups.length})
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="sm" text="Cargando backups locales..." />
          </div>
        ) : localBackups.length === 0 ? (
          <div className="p-8 text-center">
            <Database className={`w-10 h-10 mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No hay backups locales
            </p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Crea tu primer backup local para proteger tus notas
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {localBackups.map((backup) => {
              const isSelected = selectedBackupIds.has(backup.id);
              return (
                <motion.div
                  key={backup.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-3 flex items-center gap-3 ${isSelected ? (isDarkMode ? "bg-blue-900/30" : "bg-blue-100") : ""}`}
                >
                  {isSelectionMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBackupSelection(backup.id); }}
                      className="flex-shrink-0"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4 text-gray-400" />}
                    </button>
                  )}
                  
                  <div className="p-1.5 rounded-lg bg-blue-500/20">
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {backup.file_name}
                      </span>
                      {backup.is_latest && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-500 rounded-full">
                          ÚLTIMO
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      <span>📝 {backup.note_count} notas</span>
                      <span>📦 {formatFileSize(backup.file_size)}</span>
                      <span>🕒 {formatDate(backup.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleRestoreBackup(backup)}
                      disabled={isRestoring === backup.id}
                      className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                      title="Restaurar"
                    >
                      {isRestoring === backup.id ? <LoadingSpinner size="sm" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDownloadBackup(backup)}
                      disabled={isDownloading === backup.id}
                      className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                      title="Descargar"
                    >
                      {isDownloading === backup.id ? <LoadingSpinner size="sm" /> : <Download className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup)}
                      disabled={isDeleting === backup.id}
                      className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      {isDeleting === backup.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Información */}
      <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex gap-2">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
            Los backups locales se almacenan en tu navegador y se descargan como archivos JSON.
            Son independientes de los backups en la nube.
          </p>
        </div>
      </div>

      {/* ============================================ */}
      {/* MODALES */}
      {/* ============================================ */}

      {/* Modal de Progreso */}
      <AnimatePresence>
        {showProgressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl p-5 max-w-xs w-full shadow-2xl"
            >
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-300 mx-auto animate-spin mb-3" />
                <h3 className="text-base font-bold mb-1 text-white">{progressText || "Procesando..."}</h3>
                <div className="w-full bg-white/20 rounded-full h-2 mb-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                    animate={{ width: `${backupProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xl font-bold text-white">{backupProgress}%</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Éxito - Exportación */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-1 text-white">✅ Backup Local Completado</h3>
              <p className="text-blue-100 text-xs mb-1">Se exportaron {modalNoteCount} notas.</p>
              <p className="text-[10px] text-blue-200/70 mb-3 truncate">{modalFileName}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2 text-sm bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg font-semibold"
              >
                Aceptar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Éxito - Restauración */}
      <AnimatePresence>
        {showRestoreModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center"
            >
              {modalImportedCount < modalTotalCount ? (
                <>
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-white">⚠️ Restauración Parcial</h3>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-white">✅ Restauración Completada</h3>
                </>
              )}
              <p className="text-blue-100 text-xs mb-1">
                Se importaron {modalImportedCount} de {modalTotalCount} notas.
              </p>
              {modalImportedCount < modalTotalCount && (
                <p className="text-[10px] text-amber-300 mb-3">
                  {modalTotalCount - modalImportedCount} notas no pudieron ser importadas.
                </p>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRestoreModal(false)}
                className="w-full py-2 text-sm rounded-lg font-semibold bg-gradient-to-r from-green-400 to-blue-500 text-white"
              >
                Aceptar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación - Eliminar un backup */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-white/20 backdrop-blur-2xl border-2 border-red-400/30 shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-4 py-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Eliminar backup local
                </h3>
              </div>
              <div className="p-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-400" />
                  </div>
                </div>
                <p className="text-center text-white text-sm mb-1">
                  ¿Eliminar este backup local?
                </p>
                <p className="text-center text-xs text-blue-100 mb-3 truncate">
                  {showDeleteModal.file_name}
                </p>
                <p className="text-center text-[10px] text-red-300 mb-4">
                  Esta acción no se puede deshacer
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteBackup}
                    disabled={isDeleting === showDeleteModal.id}
                    className="flex-1 py-2 text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isDeleting === showDeleteModal.id ? <LoadingSpinner size="sm" /> : <><Trash2 className="w-4 h-4" /> Eliminar</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación - Eliminar seleccionados */}
      <AnimatePresence>
        {showDeleteSelectedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-white/20 backdrop-blur-2xl border-2 border-red-400/30 shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-4 py-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Eliminar {selectedBackupIds.size} backups
                </h3>
              </div>
              <div className="p-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-400" />
                  </div>
                </div>
                <p className="text-center text-white text-sm mb-1">
                  ¿Eliminar {selectedBackupIds.size} backup{selectedBackupIds.size !== 1 ? 's' : ''} permanentemente?
                </p>
                <p className="text-center text-[10px] text-red-300 mb-4">
                  Esta acción no se puede deshacer
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteSelectedModal(false)}
                    className="flex-1 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={isDeletingSelected}
                    className="flex-1 py-2 text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isDeletingSelected ? <LoadingSpinner size="sm" /> : <><Trash2 className="w-4 h-4" /> Eliminar</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BackupLocalSection;