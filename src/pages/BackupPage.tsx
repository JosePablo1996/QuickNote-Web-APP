// src/pages/BackupPage.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useNotes } from "../hooks/useNotes";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { backupService, BackupMetadata } from "../services/backup";
import LoadingSpinner from "../contexts/components/ui/LoadingSpinner";
import EmptyState from "../contexts/components/ui/EmptyState";
import CloudBackupSection from "../contexts/components/backup/CloudBackupSection";
import BackupSummarySection from "../contexts/components/backup/BackupSummarySection";
import BackupSchedulerSettings from "../contexts/components/backup/BackupSchedulerSettings";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Cloud,
  Upload,
  Trash2,
  RotateCcw,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  History,
  RefreshCw,
  ShieldAlert,
  FileJson,
  HardDrive,
  Database,
  Info,
  CloudUpload,
  Sparkles,
  Zap,
} from "lucide-react";

// ============================================
// INTERFACES LOCALES
// ============================================

interface BackupHistoryEntry {
  date: string;
  noteCount: number;
  fileName: string;
  timestamp: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const BackupPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { notes, replaceAllNotes } = useNotes();
  const { user } = useAuth();
  const { success, error: showError, info, warning } = useToast();

  // Estados de backups
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  // Estados de modales
  const [showDeleteModal, setShowDeleteModal] = useState<BackupMetadata | null>(
    null,
  );
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Estados de modales de éxito
  const [modalNoteCount, setModalNoteCount] = useState(0);
  const [modalFileName, setModalFileName] = useState("");
  const [modalImportedCount, setModalImportedCount] = useState(0);
  const [modalTotalCount, setModalTotalCount] = useState(0);

  // Estadísticas
  const [backupStats, setBackupStats] = useState({
    totalNotes: 0,
    lastBackup: null as BackupMetadata | null,
    notesSinceLastBackup: 0,
    needsBackup: false,
  });

  // Tamaño total de backups
  const [totalBackupSize, setTotalBackupSize] = useState(0);

  // Historial de backups (localStorage)
  const [backupHistory, setBackupHistory] = useState<BackupHistoryEntry[]>(
    () => {
      try {
        const saved = localStorage.getItem("quicknote_backup_history");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    },
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guardar historial en localStorage
  useEffect(() => {
    localStorage.setItem(
      "quicknote_backup_history",
      JSON.stringify(backupHistory),
    );
  }, [backupHistory]);

  // Cargar backups al montar
  useEffect(() => {
    loadBackups();
  }, []);

  // Actualizar estadísticas cuando cambien notas o backups
  useEffect(() => {
    if (notes.length > 0 || backups.length > 0) {
      loadStats();
    }
  }, [notes, backups]);

  // Calcular tamaño total de backups
  useEffect(() => {
    const total = backups.reduce((acc, b) => acc + b.file_size, 0);
    setTotalBackupSize(total);
  }, [backups]);

  // ============================================
  // FUNCIONES DE CARGA
  // ============================================

  const loadBackups = async () => {
    try {
      setIsLoading(true);
      const data = await backupService.getBackups();
      setBackups(data);
    } catch (error) {
      showError("Error al cargar los backups");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = useCallback(async () => {
    try {
      const stats = await backupService.getBackupStats(notes);
      setBackupStats(stats);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  }, [notes]);

  // ============================================
  // FUNCIONES DE BACKUP AUTOMÁTICO
  // ============================================

  const handleCreateBackup = async () => {
    if (notes.length === 0) {
      info("No hay notas para respaldar");
      return;
    }

    setIsCreating(true);
    setBackupProgress(0);
    setModalTotalCount(notes.length);
    setShowProgressModal(true);

    const interval = setInterval(() => {
      setBackupProgress((prev) => {
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
      const backup = backupService.createBackup(notes, true);

      clearInterval(interval);
      setBackupProgress(100);
      setProgressText("¡Completado!");

      const now = new Date();
      addToHistory(backup.note_count, backup.file_name);

      setShowProgressModal(false);
      setModalNoteCount(backup.note_count);
      setModalFileName(backup.file_name);
      setShowSuccessModal(true);

      await loadBackups();
    } catch (error) {
      clearInterval(interval);
      setShowProgressModal(false);
      showError("Error al crear backup");
    } finally {
      setTimeout(() => {
        setIsCreating(false);
        setBackupProgress(0);
        setProgressText("");
      }, 500);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    const backup = backups.find((b) => b.id === backupId);
    if (!backup) return;

    if (
      !window.confirm(
        `¿Restaurar el backup del ${formatDate(backup.created_at)}?\n\nLas notas actuales (${notes.length}) serán reemplazadas por ${backup.note_count} notas del backup.`,
      )
    ) {
      return;
    }

    setIsRestoring(backupId);
    setShowProgressModal(true);
    setProgressText("Restaurando backup...");
    setBackupProgress(0);
    setModalTotalCount(backup.note_count);

    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.floor(Math.random() * 20) + 10;
      });
    }, 200);

    try {
      const restoredNotes = await backupService.restoreBackup(backupId);
      await replaceAllNotes(restoredNotes);

      clearInterval(interval);
      setBackupProgress(100);

      setShowProgressModal(false);
      setModalImportedCount(restoredNotes.length);
      setModalTotalCount(backup.note_count);
      setShowRestoreModal(true);

      success(`✅ ${restoredNotes.length} notas restauradas correctamente`);
      await loadBackups();
    } catch (error) {
      clearInterval(interval);
      setShowProgressModal(false);
      showError("Error al restaurar backup");
    } finally {
      setIsRestoring(null);
    }
  };

  // ============================================
  // FUNCIONES DE EXPORTAR / IMPORTAR MANUAL
  // ============================================

  const handleExport = async () => {
    if (notes.length === 0) {
      info("No hay notas para exportar");
      return;
    }

    setIsCreating(true);
    try {
      backupService.createBackup(notes, false);
      success("✅ Backup exportado correctamente");
      await loadBackups();
    } catch (error) {
      showError("Error al exportar");
    } finally {
      setIsCreating(false);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showError("El archivo es demasiado grande (máx 10MB)");
      return;
    }

    setIsRestoring("upload");
    setShowProgressModal(true);
    setProgressText("Leyendo archivo...");
    setBackupProgress(0);

    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.floor(Math.random() * 20) + 10;
      });
    }, 200);

    try {
      const restoredNotes = await backupService.restoreFromFile(file);

      clearInterval(interval);
      setBackupProgress(100);
      setShowProgressModal(false);

      setModalImportedCount(restoredNotes.length);
      setModalTotalCount(restoredNotes.length);
      setShowRestoreModal(true);

      if (
        window.confirm(
          `¿Restaurar ${restoredNotes.length} notas desde el archivo?\n\nLas notas actuales serán reemplazadas.`,
        )
      ) {
        await replaceAllNotes(restoredNotes);
        success(`✅ ${restoredNotes.length} notas restauradas desde archivo`);
      }

      await loadBackups();
    } catch (error) {
      clearInterval(interval);
      setShowProgressModal(false);
      showError("Error al restaurar desde archivo. Formato inválido.");
    } finally {
      setIsRestoring(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownloadBackup = async (backupId: string) => {
    setIsDownloading(backupId);
    try {
      await backupService.downloadBackupFromHistory(backupId);
      success("✅ Descarga iniciada");
    } catch (error) {
      showError("Error al descargar backup");
    } finally {
      setIsDownloading(null);
    }
  };

  // ============================================
  // FUNCIONES DE ELIMINACIÓN
  // ============================================

  const handleDeleteBackup = (backup: BackupMetadata) => {
    setShowDeleteModal(backup);
  };

  const confirmDeleteBackup = async () => {
    if (!showDeleteModal) return;

    setIsDeleting(showDeleteModal.id);
    try {
      await backupService.deleteBackup(showDeleteModal.id);
      success(`✅ Backup eliminado`);
      await loadBackups();
    } catch (error) {
      showError("Error al eliminar backup");
    } finally {
      setIsDeleting(null);
      setShowDeleteModal(null);
    }
  };

  const handleDeleteAllBackups = () => {
    if (backups.length === 0) return;
    setShowDeleteAllModal(true);
  };

  const confirmDeleteAllBackups = async () => {
    setIsDeletingAll(true);
    try {
      for (const backup of backups) {
        await backupService.deleteBackup(backup.id);
      }
      success(`🧹 ${backups.length} backups eliminados correctamente`);
      await loadBackups();
    } catch (error) {
      showError("Error al eliminar los backups");
    } finally {
      setIsDeletingAll(false);
      setShowDeleteAllModal(false);
    }
  };

  // ============================================
  // FUNCIONES DE ZONA DE PELIGRO
  // ============================================

  const addToHistory = (noteCount: number, fileName: string) => {
    const now = new Date();
    const entry: BackupHistoryEntry = {
      date: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`,
      noteCount,
      fileName,
      timestamp: Date.now(),
    };
    setBackupHistory((prev) => [entry, ...prev].slice(0, 10));
  };

  const handleClearHistory = () => {
    setBackupHistory([]);
    localStorage.removeItem("quicknote_backup_history");
    setShowDangerModal(false);
    success("Historial de backups eliminado");
  };

  const handleResetCounter = () => {
    setShowResetModal(false);
    success("Contador restablecido");
  };

  // ============================================
  // FUNCIONES UTILITARIAS
  // ============================================

  const getProgressColor = (progress: number): string => {
    if (progress < 33) return "bg-yellow-500";
    if (progress < 66) return "bg-orange-500";
    return "bg-emerald-500";
  };

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

  // ============================================
  // RENDER
  // ============================================

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Input oculto para subir archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelected}
        className="hidden"
        aria-label="Subir archivo de backup"
        title="Selecciona un archivo de backup JSON"
      />

      {/* ============================================ */}
      {/* HEADER ESTILO LOGIN PAGE */}
      {/* ============================================ */}
      <div className="sticky top-0 z-10 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/settings")}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                aria-label="Volver a configuración"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Copias de Seguridad
                </h1>
              </div>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name
                      ?.split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2) || "U"
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* BANNER DECORATIVO ESTILO LOGIN PAGE */}
      {/* ============================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-40 md:h-48 w-full overflow-hidden rounded-3xl shadow-2xl"
        >
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />

            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col items-center space-y-3">
              <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl tracking-tight">
                Quick<span className="text-amber-300">Note</span>
              </h2>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30 shadow-2xl"
              >
                <HardDrive className="w-4 h-4 text-amber-300" />
                <span className="text-white font-medium text-sm md:text-base">
                  Sistema de Copias de Seguridad
                </span>
              </motion.div>
            </div>

            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30 shadow-lg">
                v 2.1.0
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ============================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ============================================ */}
        {/* GRID: RESUMEN DE BACKUPS + CLOUD BACKUP */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna 1: Resumen de Backups */}
          <div
            className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
              isDarkMode
                ? "bg-gray-800/40 border-gray-700/50"
                : "bg-white/60 border-white/70"
            }`}
          >
            <div className="px-5 pt-5 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  📊 Resumen General
                </h2>
              </div>
            </div>
            <div className="p-5">
              <BackupSummarySection
                isDarkMode={isDarkMode}
                backups={backups}
                backupStats={backupStats}
                totalBackupSize={totalBackupSize}
                onRefresh={loadBackups}
              />
            </div>
          </div>

          {/* Columna 2: Cloud Backup */}
          <div
            className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
              isDarkMode
                ? "bg-gray-800/40 border-gray-700/50"
                : "bg-white/60 border-white/70"
            }`}
          >
            <div className="px-5 pt-5 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  ☁️ Backup en la Nube
                </h2>
              </div>
            </div>
            <div className="p-5">
              <CloudBackupSection />
            </div>
          </div>
        </div>

        {/* ✅ NUEVO: SECCIÓN DE BACKUP PROGRAMADO - DESPUÉS DEL GRID */}
        <div className="mt-6">
          <BackupSchedulerSettings onBackupComplete={loadBackups} />
        </div>

        {/* ============================================ */}
        {/* BACKUP AUTOMÁTICO */}
        {/* ============================================ */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full" />
            <h2
              className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              <RefreshCw size={14} />
              Backup Automático
            </h2>
          </div>

          <div
            className={`rounded-xl sm:rounded-2xl backdrop-blur-lg border overflow-hidden shadow-sm ${
              isDarkMode
                ? "bg-gray-800/60 border-gray-700/40"
                : "bg-white/80 border-white/90"
            }`}
          >
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-semibold text-sm sm:text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Crear Backup
                  </h4>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Crea una copia de seguridad de todas tus notas
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 rounded-full text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                  {notes.length} notas
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateBackup}
                disabled={isCreating || notes.length === 0}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-md disabled:opacity-50 text-sm sm:text-base"
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner size="sm" /> Creando backup...
                  </>
                ) : (
                  <>
                    <Cloud className="w-5 h-5" /> Iniciar Backup Automático
                  </>
                )}
              </motion.button>

              <hr
                className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
              />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-semibold text-sm sm:text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Restaurar Backup
                  </h4>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Recupera tus notas desde una copia de seguridad
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleImport}
                disabled={isRestoring === "upload"}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all shadow-md disabled:opacity-50 text-sm sm:text-base"
              >
                {isRestoring === "upload" ? (
                  <>
                    <LoadingSpinner size="sm" /> Restaurando...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" /> Seleccionar Archivo y
                    Restaurar
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* EXPORTAR / IMPORTAR MANUAL */}
        {/* ============================================ */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            <h2
              className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              <FileJson size={14} />
              Exportar / Importar Manual
            </h2>
          </div>

          <div
            className={`rounded-xl sm:rounded-2xl backdrop-blur-lg border overflow-hidden shadow-sm ${
              isDarkMode
                ? "bg-gray-800/60 border-gray-700/40"
                : "bg-white/80 border-white/90"
            }`}
          >
            {/* Exportar */}
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                  <Download className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4
                    className={`font-semibold text-sm sm:text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Exportar Notas
                  </h4>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Descarga un archivo JSON con todas tus notas activas
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div
                  className={`text-center p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}
                >
                  <p className="text-lg font-bold text-emerald-500">
                    {notes.length}
                  </p>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Total
                  </p>
                </div>
                <div
                  className={`text-center p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}
                >
                  <p className="text-lg font-bold text-amber-500">
                    {notes.filter((n) => !n.is_archived).length}
                  </p>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Activas
                  </p>
                </div>
                <div
                  className={`text-center p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}
                >
                  <p className="text-lg font-bold text-blue-500">
                    {notes.filter((n) => n.is_archived).length}
                  </p>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Archivadas
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  disabled={isCreating || notes.length === 0}
                  className="flex-1 py-2.5 border-2 border-emerald-500 text-emerald-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all disabled:opacity-50 text-sm"
                >
                  <Download className="w-4 h-4" /> Descargar JSON
                </motion.button>
              </div>
            </div>

            {/* Importar */}
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-orange-500/10 rounded-lg">
                  <Upload className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4
                    className={`font-semibold text-sm sm:text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Importar Notas
                  </h4>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Restaura tus notas desde un archivo JSON previamente
                    exportado
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg mb-3">
                <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Las notas importadas se agregarán a las existentes. No se
                  eliminarán las notas actuales.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleImport}
                disabled={isRestoring === "upload"}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-orange-600 hover:to-amber-600 transition-all shadow-md disabled:opacity-50 text-sm sm:text-base"
              >
                {isRestoring === "upload" ? (
                  <>
                    <LoadingSpinner size="sm" /> Importando...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" /> Seleccionar archivo JSON
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* HISTORIAL DE BACKUPS */}
        {/* ============================================ */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            <h2
              className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              <History size={14} />
              Historial de Backups
            </h2>
          </div>

          <div
            className={`rounded-xl sm:rounded-2xl backdrop-blur-lg border overflow-hidden shadow-sm ${
              isDarkMode
                ? "bg-gray-800/60 border-gray-700/40"
                : "bg-white/80 border-white/90"
            }`}
          >
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" text="Cargando backups..." />
              </div>
            ) : backups.length === 0 ? (
              <div className="p-8 text-center">
                <History
                  className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                />
                <p
                  className={`font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  No hay backups aún
                </p>
                <p
                  className={`text-sm mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                >
                  Crea tu primer backup para proteger tus notas
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {backups.map((backup) => (
                  <motion.div
                    key={backup.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 sm:p-5 flex items-center gap-4 ${
                      backup.is_latest
                        ? isDarkMode
                          ? "bg-emerald-900/20"
                          : "bg-emerald-50"
                        : ""
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        backup.is_latest
                          ? "bg-emerald-500/20"
                          : "bg-blue-500/20"
                      }`}
                    >
                      <FileText
                        className={`w-5 h-5 ${backup.is_latest ? "text-emerald-500" : "text-blue-500"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-medium text-sm truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {backup.file_name}
                        </span>
                        {backup.is_latest && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-500 rounded-full flex-shrink-0">
                            ÚLTIMO
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>📝 {backup.note_count} notas</span>
                        <span>
                          📦{" "}
                          {backup.file_size < 1024
                            ? `${backup.file_size} B`
                            : `${(backup.file_size / 1024).toFixed(1)} KB`}
                        </span>
                        <span>🕒 {formatDate(backup.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRestoreBackup(backup.id)}
                        disabled={isRestoring === backup.id || isDeletingAll}
                        className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                        title="Restaurar"
                      >
                        {isRestoring === backup.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDownloadBackup(backup.id)}
                        disabled={isDownloading === backup.id || isDeletingAll}
                        className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                        title="Descargar"
                      >
                        {isDownloading === backup.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup)}
                        disabled={isDeleting === backup.id || isDeletingAll}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        {isDeleting === backup.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* ⚠️ ZONA DE PELIGRO */}
        {/* ============================================ */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-pink-500 rounded-full" />
            <h2
              className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              <ShieldAlert size={14} className="text-red-500" />
              Zona de Peligro
            </h2>
          </div>

          <div className="rounded-xl sm:rounded-2xl border-2 border-red-500/30 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 px-4 sm:px-6 py-3">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                <AlertTriangle className="w-5 h-5" />
                Zona de Peligro
              </h3>
              <p className="text-red-100 text-xs mt-0.5">
                Estas acciones son irreversibles. Úsalas con precaución.
              </p>
            </div>

            <div
              className={`p-4 sm:p-5 space-y-4 ${isDarkMode ? "bg-gray-800/60" : "bg-white/80"}`}
            >
              {/* Historial de backups */}
              <div>
                <h4
                  className={`font-semibold text-sm sm:text-base flex items-center gap-2 mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  <History className="w-4 h-4 text-gray-500" />
                  Historial de Backups Realizados
                </h4>
                {backupHistory.length === 0 ? (
                  <div
                    className={`text-center py-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No hay backups registrados aún.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {backupHistory.slice(0, 5).map((entry, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2.5 rounded-lg text-xs sm:text-sm ${
                          isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span
                            className={
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }
                          >
                            {entry.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            {entry.noteCount} notas
                          </span>
                          <span
                            className={`text-[10px] truncate max-w-[100px] ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                          >
                            {entry.fileName}
                          </span>
                        </div>
                      </div>
                    ))}
                    {backupHistory.length > 5 && (
                      <p
                        className={`text-center text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        +{backupHistory.length - 5} backups más
                      </p>
                    )}
                  </div>
                )}
              </div>

              <hr
                className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
              />

              <div className="space-y-3">
                <div
                  className={`p-3 rounded-xl border border-red-500/20 ${isDarkMode ? "bg-red-500/5" : "bg-red-50"}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-red-500/10 rounded-lg flex-shrink-0">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <h4
                        className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Eliminar historial de backups
                      </h4>
                      <p
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Se perderán todos los registros de copias de seguridad
                        realizadas. Las notas NO se eliminarán.
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDangerModal(true)}
                    className="w-full py-2.5 border-2 border-red-500 text-red-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar todo el historial
                  </motion.button>
                </div>

                <div
                  className={`p-3 rounded-xl border border-amber-500/20 ${isDarkMode ? "bg-amber-500/5" : "bg-amber-50"}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg flex-shrink-0">
                      <RefreshCw className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <h4
                        className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Restablecer contador
                      </h4>
                      <p
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Vuelve el contador de "Última copia" a cero sin eliminar
                        el historial.
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowResetModal(true)}
                    className="w-full py-2.5 border-2 border-amber-500 text-amber-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-white transition-all text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restablecer contador
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* INFORMACIÓN */}
        {/* ============================================ */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-5 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full" />
            <h2
              className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              <Info size={14} />
              Información
            </h2>
          </div>

          <div
            className={`rounded-xl sm:rounded-2xl backdrop-blur-lg border overflow-hidden shadow-sm ${
              isDarkMode
                ? "bg-gray-800/60 border-gray-700/40"
                : "bg-white/80 border-white/90"
            }`}
          >
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span
                  className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Formato JSON compatible
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span
                  className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Incluye título, contenido, color, etiquetas y más
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span
                  className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Las notas importadas se agregan sin eliminar las existentes
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                <span
                  className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Al restaurar, las notas actuales serán reemplazadas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* MODALES (se mantienen igual) */}
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
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                <RefreshCw className="w-10 h-10 text-purple-300 mx-auto animate-spin mb-4" />
                <h3 className="text-lg font-bold mb-2 text-white">
                  {progressText || "Procesando..."}
                </h3>
                <div className="w-full bg-white/20 rounded-full h-3 mb-2 overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className={`h-full rounded-full ${getProgressColor(backupProgress)}`}
                    animate={{ width: `${backupProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-2xl font-bold text-white">
                  {backupProgress}%
                </p>
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
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                ✅ Backup Completado
              </h3>
              <p className="text-blue-100 mb-1">
                Se exportaron {modalNoteCount} notas.
              </p>
              <p className="text-xs text-blue-200/70 mb-4 truncate">
                {modalFileName}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl font-semibold hover:from-green-500 hover:to-blue-600 transition-all shadow-lg"
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
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center"
            >
              {modalImportedCount < modalTotalCount ? (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">
                    ⚠️ Restauración Parcial
                  </h3>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">
                    ✅ Restauración Completada
                  </h3>
                </>
              )}
              <p className="text-blue-100 mb-1">
                Se importaron {modalImportedCount} de {modalTotalCount} notas.
              </p>
              {modalImportedCount < modalTotalCount && (
                <p className="text-xs text-amber-300 mb-4">
                  {modalTotalCount - modalImportedCount} notas no pudieron ser
                  importadas.
                </p>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRestoreModal(false)}
                className={`w-full py-3 text-white rounded-xl font-semibold shadow-lg transition-all ${
                  modalImportedCount < modalTotalCount
                    ? "bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500"
                    : "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
                }`}
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
              className="relative w-full max-w-md rounded-3xl overflow-hidden bg-white/20 backdrop-blur-2xl border-2 border-red-400/30 shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Eliminar backup
                </h3>
              </div>
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center backdrop-blur-sm">
                    <Trash2 className="w-8 h-8 text-red-400" />
                  </div>
                </div>
                <p className="text-center text-white mb-2">
                  ¿Eliminar este backup?
                </p>
                <p className="text-center text-sm text-blue-100 mb-4 truncate">
                  {showDeleteModal.file_name}
                </p>
                <p className="text-center text-xs text-red-300 mb-6">
                  Esta acción no se puede deshacer
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium border border-white/20"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteBackup}
                    disabled={isDeleting === showDeleteModal.id}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:via-pink-600 hover:to-rose-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting === showDeleteModal.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        <span>Eliminar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación - Eliminar todos los backups */}
      <AnimatePresence>
        {showDeleteAllModal && (
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
              className="relative w-full max-w-md rounded-3xl overflow-hidden bg-white/20 backdrop-blur-2xl border-2 border-red-400/30 shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Eliminar todos los backups
                </h3>
              </div>
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center backdrop-blur-sm">
                    <Trash2 className="w-8 h-8 text-red-400" />
                  </div>
                </div>
                <p className="text-center text-white mb-2">
                  ¿Eliminar todos los backups?
                </p>
                <p className="text-center text-sm text-blue-100 mb-4">
                  Se eliminarán {backups.length} backup
                  {backups.length !== 1 ? "s" : ""}
                </p>
                <p className="text-center text-xs text-red-300 mb-6">
                  ⚠️ Esta acción no se puede deshacer
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteAllModal(false)}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium border border-white/20"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteAllBackups}
                    disabled={isDeletingAll}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:via-pink-600 hover:to-rose-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeletingAll ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        <span>Eliminar todo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación - Eliminar Historial */}
      <AnimatePresence>
        {showDangerModal && (
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
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  ⚠️ ¿Estás seguro?
                </h3>
                <p className="text-blue-100 mb-1 text-sm">
                  Esta acción eliminará{" "}
                  <strong>todo el historial de backups</strong>.
                </p>
                <p className="text-xs text-red-300 mb-4">
                  Las notas NO se eliminarán, solo los registros de copias
                  realizadas.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDangerModal(false)}
                    className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all text-sm border border-white/20"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearHistory}
                    className="flex-1 py-2.5 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white rounded-xl font-medium hover:from-red-600 hover:via-pink-600 hover:to-rose-600 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sí, eliminar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación - Restablecer Contador */}
      <AnimatePresence>
        {showResetModal && (
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
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  🔄 ¿Restablecer contador?
                </h3>
                <p className="text-blue-100 mb-4 text-sm">
                  El contador de "Última copia" volverá a cero. El historial se
                  mantendrá.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all text-sm border border-white/20"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResetCounter}
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl font-medium hover:from-amber-500 hover:to-orange-500 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restablecer
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

export default BackupPage;
