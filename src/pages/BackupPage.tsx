// src/pages/BackupPage.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useNotes } from "../hooks/useNotes";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { backupService, BackupMetadata, BackupLimitInfo } from "../services/backup";
import LoadingSpinner from "../contexts/components/ui/LoadingSpinner";
import { motion } from "framer-motion";
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
  Info,
  Filter,
  Globe,
  HardDrive as LocalIcon,
  CheckSquare,
  Square,
} from "lucide-react";

// Componentes importados
import BackupStatsCards from "../contexts/components/backup/BackupStatsCards";
import CloudBackupSection from "../contexts/components/backup/CloudBackupSection";
import BackupSchedulerSettings from "../contexts/components/backup/BackupSchedulerSettings";
import BackupModals from "../contexts/components/backup/BackupModals";
import BackupSelectionBar from "../contexts/components/backup/BackupSelectionBar";

// ============================================
// TIPOS E INTERFACES
// ============================================

interface BackupHistoryEntry {
  date: string;
  noteCount: number;
  fileName: string;
  timestamp: number;
}

type BackupFilterType = 'all' | 'local' | 'cloud';

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

  // Filtro de origen
  const [backupFilter, setBackupFilter] = useState<BackupFilterType>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Estados para selección múltiple
  const [selectedBackupIds, setSelectedBackupIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);

  // Estados para límite de backups
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitInfo, setLimitInfo] = useState<BackupLimitInfo | null>(null);
  const [isDeletingOldest, setIsDeletingOldest] = useState(false);

  // Estados de modales existentes
  const [showDeleteModal, setShowDeleteModal] = useState<BackupMetadata | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; failed: number } | null>(null);

  // Datos de modales
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
  const [totalBackupSize, setTotalBackupSize] = useState(0);

  // Historial de backups (localStorage)
  const [backupHistory, setBackupHistory] = useState<BackupHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem("quicknote_backup_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    localStorage.setItem("quicknote_backup_history", JSON.stringify(backupHistory));
  }, [backupHistory]);

  useEffect(() => {
    loadBackups();
  }, []);

  useEffect(() => {
    if (notes.length > 0 || backups.length > 0) {
      loadStats();
    }
  }, [notes, backups]);

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
  // FUNCIONES DE SELECCIÓN MÚLTIPLE
  // ============================================

  const getFilteredBackups = (): BackupMetadata[] => {
    switch (backupFilter) {
      case 'local':
        return backups.filter(b => b.source === 'local' || !b.source);
      case 'cloud':
        return backups.filter(b => b.source === 'cloud');
      default:
        return backups;
    }
  };

  const getFilterStats = () => {
    const localCount = backups.filter(b => b.source === 'local' || !b.source).length;
    const cloudCount = backups.filter(b => b.source === 'cloud').length;
    return { localCount, cloudCount, total: backups.length };
  };

  const filteredBackups = getFilteredBackups();
  const filterStats = getFilterStats();
  const isAllSelected = selectedBackupIds.size === filteredBackups.length && filteredBackups.length > 0;

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

  const toggleSelectAllBackups = () => {
    if (isAllSelected) {
      setSelectedBackupIds(new Set());
      setIsSelectionMode(false);
    } else {
      setSelectedBackupIds(new Set(filteredBackups.map(b => b.id)));
      setIsSelectionMode(true);
    }
  };

  const clearBackupSelection = () => {
    setSelectedBackupIds(new Set());
    setIsSelectionMode(false);
  };

  const handleDeleteSelectedBackups = async () => {
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
      success(`✅ ${successCount} backup${successCount !== 1 ? 's' : ''} eliminado${successCount !== 1 ? 's' : ''}`);
    }
    if (failCount > 0) {
      showError(`❌ ${failCount} backup${failCount !== 1 ? 's' : ''} no pudieron eliminarse`);
    }
    
    setSelectedBackupIds(new Set());
    setIsSelectionMode(false);
    setShowDeleteSelectedModal(false);
    setIsDeletingSelected(false);
    await loadBackups();
  };

  // ============================================
  // FUNCIONES DE LÍMITE DE BACKUPS
  // ============================================

  const checkBackupLimit = async (): Promise<boolean> => {
    const limitData = await backupService.getBackupLimitInfo();
    if (limitData.isFull) {
      setLimitInfo(limitData);
      setShowLimitModal(true);
      return false;
    }
    if (limitData.isLow) {
      warning(`⚠️ Te quedan solo ${limitData.remaining} espacios de ${limitData.max} para backups.`);
    }
    return true;
  };

  const handleDeleteOldestBackups = async () => {
    setIsDeletingOldest(true);
    try {
      const result = await backupService.deleteOldestBackups(5);
      if (result.deleted > 0) {
        success(`✅ ${result.deleted} backup${result.deleted !== 1 ? 's' : ''} antiguo${result.deleted !== 1 ? 's' : ''} eliminado${result.deleted !== 1 ? 's' : ''}`);
        await loadBackups();
      }
      if (result.failed > 0) {
        showError(`❌ ${result.failed} backup${result.failed !== 1 ? 's' : ''} no pudieron eliminarse`);
      }
      setShowLimitModal(false);
    } catch (error) {
      showError("Error al eliminar backups antiguos");
    } finally {
      setIsDeletingOldest(false);
    }
  };

  const handleDeleteAllBackupsFromLimit = async () => {
    setIsDeletingOldest(true);
    try {
      const allBackups = await backupService.getBackups();
      let successCount = 0;
      for (const backup of allBackups) {
        try {
          await backupService.deleteBackup(backup.id);
          successCount++;
        } catch (error) {
          console.error(error);
        }
      }
      if (successCount > 0) {
        success(`✅ ${successCount} backup${successCount !== 1 ? 's' : ''} eliminado${successCount !== 1 ? 's' : ''}`);
        await loadBackups();
      }
      setShowLimitModal(false);
    } catch (error) {
      showError("Error al eliminar backups");
    } finally {
      setIsDeletingOldest(false);
    }
  };

  // ============================================
  // FUNCIONES DE BACKUP
  // ============================================

  const handleCreateBackup = async () => {
    if (notes.length === 0) {
      info("No hay notas para respaldar");
      return;
    }

    const canCreate = await checkBackupLimit();
    if (!canCreate) return;

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
      const backup = await backupService.createBackup(notes, true);

      clearInterval(interval);
      setBackupProgress(100);
      setProgressText("¡Completado!");

      addToHistory(backup.note_count, backup.file_name);

      setShowProgressModal(false);
      setModalNoteCount(backup.note_count);
      setModalFileName(backup.file_name);
      setShowSuccessModal(true);

      await loadBackups();
    } catch (error: any) {
      clearInterval(interval);
      setShowProgressModal(false);
      
      if (error.message && error.message.startsWith('LÍMITE_ALCANZADO:')) {
        try {
          const limitData = JSON.parse(error.message.replace('LÍMITE_ALCANZADO:', ''));
          setLimitInfo(limitData);
          setShowLimitModal(true);
        } catch {
          showError("Has alcanzado el límite de backups. Elimina algunos para continuar.");
        }
      } else {
        showError("Error al crear backup");
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
    const isCloudBackup = backup.source === 'cloud';
    const sourceText = isCloudBackup ? 'la nube' : 'local';
    
    if (!window.confirm(
      `¿Restaurar backup desde ${sourceText}?\n\n` +
      `📁 Archivo: ${backup.file_name}\n` +
      `📅 Fecha: ${formatDate(backup.created_at)}\n` +
      `📝 Notas: ${backup.note_count}\n\n` +
      `⚠️ Las notas actuales (${notes.length}) serán reemplazadas.`
    )) {
      return;
    }

    setIsRestoring(backup.id);
    setShowProgressModal(true);
    setProgressText(`Restaurando desde ${sourceText}...`);
    setBackupProgress(0);
    setModalTotalCount(backup.note_count);

    const interval = setInterval(() => {
      setBackupProgress((prev) => {
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

      success(`✅ ${restoredNotes.length} notas restauradas desde ${sourceText}`);
      await loadBackups();
    } catch (error) {
      clearInterval(interval);
      setShowProgressModal(false);
      showError("Error al restaurar backup");
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
      success(`✅ Backup eliminado`);
      await loadBackups();
    } catch (error) {
      showError("Error al eliminar backup");
    } finally {
      setIsDeleting(null);
      setShowDeleteModal(null);
    }
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

  const handleSyncWithCloud = async () => {
    setIsSyncing(true);
    setShowSyncModal(true);
    setSyncResult(null);
    
    try {
      const result = await backupService.syncWithCloud();
      setSyncResult(result);
      setLastSyncTime(new Date());
      await loadBackups();
      
      if (result.synced > 0) {
        success(`✅ ${result.synced} backups sincronizados con la nube`);
      } else if (result.failed > 0) {
        warning(`⚠️ ${result.failed} backups no pudieron sincronizarse`);
      } else {
        info('📡 Todos los backups ya están sincronizados');
      }
    } catch (error) {
      showError('Error al sincronizar con la nube');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = async () => {
    if (notes.length === 0) {
      info("No hay notas para exportar");
      return;
    }

    setIsCreating(true);
    try {
      await backupService.createBackup(notes, false);
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

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

      if (window.confirm(`¿Restaurar ${restoredNotes.length} notas desde el archivo?\n\nLas notas actuales serán reemplazadas.`)) {
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // ============================================
  // RENDER
  // ============================================

  if (isLoading && backups.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando backups..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* HEADER */}
      <div className="sticky top-0 z-10 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/settings")}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
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
                    <img src={user.avatar} alt={user.name || ""} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.split(" ").map((w) => w[0]).join("").toUpperCase().substring(0, 2) || "U"
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BANNER DECORATIVO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-40 md:h-48 w-full overflow-hidden rounded-3xl shadow-2xl"
        >
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }} />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl" />
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl tracking-tight">
                Quick<span className="text-amber-300">Note</span>
              </h2>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30">
                <HardDrive className="w-4 h-4 text-amber-300" />
                <span className="text-white font-medium text-sm md:text-base">
                  Sistema de Copias de Seguridad
                </span>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30 shadow-lg">
                v 2.4.0
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* GRID: RESUMEN DE BACKUPS + CLOUD BACKUP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
            isDarkMode ? "bg-gray-800/40 border-gray-700/50" : "bg-white/60 border-white/70"
          }`}>
            <div className="px-5 pt-5 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  📊 Resumen General
                </h2>
              </div>
            </div>
            <div className="p-5">
              <BackupStatsCards
                isDarkMode={isDarkMode}
                backups={backups}
                backupStats={backupStats}
                totalBackupSize={totalBackupSize}
                onRefresh={loadBackups} cloudBackups={[]} isLoadingCloud={false}              />
            </div>
          </div>

          <div className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
            isDarkMode ? "bg-gray-800/40 border-gray-700/50" : "bg-white/60 border-white/70"
          }`}>
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

        {/* BARRA DE FILTROS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Mostrar:
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setBackupFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  backupFilter === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos ({filterStats.total})
              </button>
              <button
                onClick={() => setBackupFilter('local')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  backupFilter === 'local'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <LocalIcon className="w-3.5 h-3.5" />
                Locales ({filterStats.localCount})
              </button>
              <button
                onClick={() => setBackupFilter('cloud')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  backupFilter === 'cloud'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Nube ({filterStats.cloudCount})
              </button>
            </div>
            
            <button
              onClick={() => {
                setIsSelectionMode(true);
                setSelectedBackupIds(new Set());
              }}
              className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Seleccionar
            </button>
          </div>

          {user && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSyncWithCloud}
              disabled={isSyncing}
              className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${
                isDarkMode
                  ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
              } ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>Sincronizar con nube</span>
            </motion.button>
          )}
        </div>

        {lastSyncTime && (
          <div className={`text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Última sincronización: {lastSyncTime.toLocaleString()}
          </div>
        )}

        {/* BARRA DE SELECCIÓN MÚLTIPLE */}
        {isSelectionMode && (
          <BackupSelectionBar
            isDarkMode={isDarkMode}
            selectedCount={selectedBackupIds.size}
            totalCount={filteredBackups.length}
            isAllSelected={isAllSelected}
            onSelectAll={toggleSelectAllBackups}
            onClearSelection={clearBackupSelection}
            onDeleteSelected={() => setShowDeleteSelectedModal(true)}
            isDeleting={isDeletingSelected}
          />
        )}

        {/* BACKUP AUTOMÁTICO */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full" />
            <h2 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              <RefreshCw size={14} />
              Backup Automático
            </h2>
          </div>
          <div className={`rounded-xl sm:rounded-2xl backdrop-blur-lg border overflow-hidden shadow-sm ${
            isDarkMode ? "bg-gray-800/60 border-gray-700/40" : "bg-white/80 border-white/90"
          }`}>
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm sm:text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Crear Backup
                  </h4>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
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
                {isCreating ? <><LoadingSpinner size="sm" /> Creando backup...</> : <><Cloud className="w-5 h-5" /> Iniciar Backup Automático</>}
              </motion.button>
              <hr className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`} />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm sm:text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Restaurar Backup
                  </h4>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
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
                {isRestoring === "upload" ? <><LoadingSpinner size="sm" /> Restaurando...</> : <><Upload className="w-5 h-5" /> Seleccionar Archivo y Restaurar</>}
              </motion.button>
            </div>
          </div>
        </div>

        {/* EXPORTAR / IMPORTAR MANUAL */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            <h2 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              <FileJson size={14} />
              Exportar / Importar Manual
            </h2>
          </div>
          <div className={`rounded-xl sm:rounded-2xl backdrop-blur-lg border overflow-hidden shadow-sm ${
            isDarkMode ? "bg-gray-800/60 border-gray-700/40" : "bg-white/80 border-white/90"
          }`}>
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                  <Download className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className={`font-semibold text-sm sm:text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Exportar Notas
                  </h4>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Descarga un archivo JSON con todas tus notas
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className={`text-center p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                  <p className="text-lg font-bold text-emerald-500">{notes.length}</p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total</p>
                </div>
                <div className={`text-center p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                  <p className="text-lg font-bold text-amber-500">{notes.filter(n => !n.is_archived).length}</p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Activas</p>
                </div>
                <div className={`text-center p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                  <p className="text-lg font-bold text-blue-500">{notes.filter(n => n.is_archived).length}</p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Archivadas</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                disabled={isCreating || notes.length === 0}
                className="w-full py-2.5 border-2 border-emerald-500 text-emerald-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all disabled:opacity-50 text-sm"
              >
                <Download className="w-4 h-4" /> Descargar JSON
              </motion.button>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-orange-500/10 rounded-lg">
                  <Upload className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className={`font-semibold text-sm sm:text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Importar Notas
                  </h4>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Restaura tus notas desde un archivo JSON previamente exportado
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg mb-3">
                <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Las notas importadas se agregarán a las existentes. No se eliminarán las notas actuales.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleImport}
                disabled={isRestoring === "upload"}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-orange-600 hover:to-amber-600 transition-all shadow-md disabled:opacity-50 text-sm sm:text-base"
              >
                {isRestoring === "upload" ? <><LoadingSpinner size="sm" /> Importando...</> : <><Upload className="w-5 h-5" /> Seleccionar archivo JSON</>}
              </motion.button>
            </div>
          </div>
        </div>

        {/* HISTORIAL DE BACKUPS */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            <h2 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              <History size={14} />
              Historial de Backups {backupFilter !== 'all' && `(${backupFilter === 'local' ? 'Locales' : 'Nube'})`}
            </h2>
          </div>
          <div className={`rounded-xl sm:rounded-2xl backdrop-blur-lg border overflow-hidden shadow-sm ${
            isDarkMode ? "bg-gray-800/60 border-gray-700/40" : "bg-white/80 border-white/90"
          }`}>
            {isLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner size="md" text="Cargando backups..." /></div>
            ) : filteredBackups.length === 0 ? (
              <div className="p-8 text-center">
                <History className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
                <p className={`font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {backupFilter === 'all' && 'No hay backups aún'}
                  {backupFilter === 'local' && 'No hay backups locales'}
                  {backupFilter === 'cloud' && 'No hay backups en la nube'}
                </p>
                <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  {backupFilter === 'all' && 'Crea tu primer backup para proteger tus notas'}
                  {backupFilter === 'local' && 'Crea un backup local desde el botón "Crear Backup"'}
                  {backupFilter === 'cloud' && 'Conéctate a internet y sincroniza tus backups'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBackups.map((backup) => {
                  const isCloudBackup = backup.source === 'cloud';
                  const isSelected = selectedBackupIds.has(backup.id);
                  return (
                    <div key={backup.id} className={`p-4 sm:p-5 flex items-center gap-4 ${
                      backup.is_latest && !isCloudBackup ? (isDarkMode ? "bg-emerald-900/20" : "bg-emerald-50") : ""
                    } ${isSelected ? (isDarkMode ? "bg-blue-900/30" : "bg-blue-100") : ""}`}>
                      {isSelectionMode && (
                        <button onClick={(e) => { e.stopPropagation(); toggleBackupSelection(backup.id); }} className="flex-shrink-0">
                          {isSelected ? <CheckSquare className="w-5 h-5 text-purple-500" /> : <Square className="w-5 h-5 text-gray-400" />}
                        </button>
                      )}
                      <div className={`p-2 rounded-lg ${isCloudBackup ? "bg-purple-500/20" : backup.is_latest ? "bg-emerald-500/20" : "bg-blue-500/20"}`}>
                        {isCloudBackup ? <Globe className="w-5 h-5 text-purple-500" /> : <FileText className={`w-5 h-5 ${backup.is_latest ? "text-emerald-500" : "text-blue-500"}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`font-medium text-sm truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>{backup.file_name}</span>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full flex items-center gap-1 ${isCloudBackup ? 'bg-purple-500/20 text-purple-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                            {isCloudBackup ? <><Globe className="w-2.5 h-2.5" /> Nube</> : <><LocalIcon className="w-2.5 h-2.5" /> Local</>}
                          </span>
                          {backup.is_latest && !isCloudBackup && <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-500 rounded-full">ÚLTIMO</span>}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>📝 {backup.note_count} notas</span>
                          <span>📦 {formatFileSize(backup.file_size)}</span>
                          <span>🕒 {formatDate(backup.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleRestoreBackup(backup)} disabled={isRestoring === backup.id} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                          {isRestoring === backup.id ? <LoadingSpinner size="sm" /> : <RotateCcw className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDownloadBackup(backup)} disabled={isDownloading === backup.id} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50">
                          {isDownloading === backup.id ? <LoadingSpinner size="sm" /> : <Download className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDeleteBackup(backup)} disabled={isDeleting === backup.id} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50">
                          {isDeleting === backup.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* BACKUP PROGRAMADO */}
        <BackupSchedulerSettings onBackupComplete={loadBackups} />

        {/* ZONA DE PELIGRO */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-pink-500 rounded-full" />
            <h2 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
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
              <p className="text-red-100 text-xs mt-0.5">Estas acciones son irreversibles. Úsalas con precaución.</p>
            </div>
            <div className={`p-4 sm:p-5 space-y-4 ${isDarkMode ? "bg-gray-800/60" : "bg-white/80"}`}>
              <div>
                <h4 className={`font-semibold text-sm sm:text-base flex items-center gap-2 mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  <History className="w-4 h-4 text-gray-500" />
                  Historial de Backups Realizados
                </h4>
                {backupHistory.length === 0 ? (
                  <div className={`text-center py-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No hay backups registrados aún.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {backupHistory.slice(0, 5).map((entry, index) => (
                      <div key={index} className={`flex items-center justify-between p-2.5 rounded-lg text-xs sm:text-sm ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{entry.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{entry.noteCount} notas</span>
                          <span className={`text-[10px] truncate max-w-[100px] ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{entry.fileName}</span>
                        </div>
                      </div>
                    ))}
                    {backupHistory.length > 5 && <p className={`text-center text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>+{backupHistory.length - 5} backups más</p>}
                  </div>
                )}
              </div>
              <hr className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`} />
              <div className="space-y-3">
                <div className={`p-3 rounded-xl border border-red-500/20 ${isDarkMode ? "bg-red-500/5" : "bg-red-50"}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-red-500/10 rounded-lg flex-shrink-0"><Trash2 className="w-4 h-4 text-red-500" /></div>
                    <div>
                      <h4 className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>Eliminar historial de backups</h4>
                      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Se perderán todos los registros de copias de seguridad realizadas. Las notas NO se eliminarán.</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setShowDangerModal(true)} className="w-full py-2.5 border-2 border-red-500 text-red-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all text-sm">
                    <Trash2 className="w-4 h-4" /> Eliminar todo el historial
                  </motion.button>
                </div>
                <div className={`p-3 rounded-xl border border-amber-500/20 ${isDarkMode ? "bg-amber-500/5" : "bg-amber-50"}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg flex-shrink-0"><RefreshCw className="w-4 h-4 text-amber-500" /></div>
                    <div>
                      <h4 className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>Restablecer contador</h4>
                      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Vuelve el contador de "Última copia" a cero sin eliminar el historial.</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setShowResetModal(true)} className="w-full py-2.5 border-2 border-amber-500 text-amber-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-white transition-all text-sm">
                    <RefreshCw className="w-4 h-4" /> Restablecer contador
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INFORMACIÓN */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-5 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full" />
            <h2 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              <Info size={14} />
              Información
            </h2>
          </div>
          <div className={`rounded-xl sm:rounded-2xl backdrop-blur-lg border p-4 sm:p-5 ${isDarkMode ? "bg-gray-800/60 border-gray-700/40" : "bg-white/80 border-white/90"}`}>
            <div className="space-y-2">
              <div className="flex items-start gap-2"><div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mt-0.5" /><span className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Formato JSON compatible</span></div>
              <div className="flex items-start gap-2"><div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mt-0.5" /><span className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Incluye título, contenido, color, etiquetas y más</span></div>
              <div className="flex items-start gap-2"><div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mt-0.5" /><span className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Las notas importadas se agregan sin eliminar las existentes</span></div>
              <div className="flex items-start gap-2"><div className="w-3.5 h-3.5 rounded-full bg-amber-500 mt-0.5" /><span className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Al restaurar, las notas actuales serán reemplazadas</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALES */}
      <BackupModals
        isDarkMode={isDarkMode}
        showProgressModal={showProgressModal}
        backupProgress={backupProgress}
        progressText={progressText}
        showSuccessModal={showSuccessModal}
        modalNoteCount={modalNoteCount}
        modalFileName={modalFileName}
        onCloseSuccess={() => setShowSuccessModal(false)}
        showRestoreModal={showRestoreModal}
        modalImportedCount={modalImportedCount}
        modalTotalCount={modalTotalCount}
        onCloseRestore={() => setShowRestoreModal(false)}
        showDeleteModal={showDeleteModal}
        isDeleting={isDeleting}
        onCancelDelete={() => setShowDeleteModal(null)}
        onConfirmDelete={confirmDeleteBackup}
        showDeleteAllModal={showDeleteAllModal}
        isDeletingAll={isDeletingAll}
        backupsCount={backups.length}
        onCancelDeleteAll={() => setShowDeleteAllModal(false)}
        onConfirmDeleteAll={confirmDeleteAllBackups}
        showDangerModal={showDangerModal}
        onCancelDanger={() => setShowDangerModal(false)}
        onConfirmDanger={handleClearHistory}
        showResetModal={showResetModal}
        onCancelReset={() => setShowResetModal(false)}
        onConfirmReset={handleResetCounter}
        showSyncModal={showSyncModal}
        isSyncing={isSyncing}
        syncResult={syncResult}
        onCloseSync={() => setShowSyncModal(false)}
        showLimitModal={showLimitModal}
        limitInfo={limitInfo}
        isDeletingOldest={isDeletingOldest}
        onDeleteOldest={handleDeleteOldestBackups}
        onDeleteAllFromLimit={handleDeleteAllBackupsFromLimit}
        onCloseLimitModal={() => setShowLimitModal(false)}
        formatFileSize={formatFileSize}
        showDeleteSelectedModal={showDeleteSelectedModal}
        selectedCount={selectedBackupIds.size}
        isDeletingSelected={isDeletingSelected}
        onConfirmDeleteSelected={handleDeleteSelectedBackups}
        onCancelDeleteSelected={() => setShowDeleteSelectedModal(false)}
      />
    </div>
  );
};

export default BackupPage;