// src/contexts/components/backup/CloudBackupSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { useNotes } from '../../../hooks/useNotes';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { api, CloudBackupMetadata } from '../../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud,
  CloudUpload,
  CloudDownload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Shield,
  Info,
  Filter
} from 'lucide-react';
import { Note } from '../../../models/Note';
import { openSelectiveBackupModal } from '../../../hooks/useSelectiveBackup';
import { RestoreOptionsModal } from './RestoreOptionsModal';
import { applyRestoreMode, RestoreMode } from '../../../utils/backupUtils';

// Constantes para valores por defecto
const DEFAULT_COLOR = '#3B82F6';
const DEFAULT_SHAPE = 'rounded';
const DEFAULT_ICON = 'default';
const DEFAULT_SIZE = 'normal';
const DEFAULT_COLOR_INTENSITY = 'medium';

// Servicio de backup usando el api centralizado
const backupService = {
  getCloudBackups: () => api.getCloudBackups(),
  saveBackupToCloud: (notes: any[]) => api.saveCloudBackup(notes),
  restoreCloudBackup: (backupId: string) => api.restoreCloudBackup(backupId),
  deleteCloudBackup: (backupId: string) => api.deleteCloudBackup(backupId),
};

// Constante para el límite máximo de backups
const MAX_BACKUPS = 20;

// ✅ Función para extraer notas de diferentes estructuras de datos
const extractNotesFromBackupData = (data: any): any[] => {
  // Caso 1: data.notes es un array
  if (data && data.notes && Array.isArray(data.notes)) {
    console.log('📦 Estructura detectada: data.notes');
    return data.notes;
  }
  
  // Caso 2: data es directamente un array
  if (data && Array.isArray(data)) {
    console.log('📦 Estructura detectada: array directo');
    return data;
  }
  
  // Caso 3: data.data.notes (estructura anidada)
  if (data && data.data && data.data.notes && Array.isArray(data.data.notes)) {
    console.log('📦 Estructura detectada: data.data.notes');
    return data.data.notes;
  }
  
  // Caso 4: data.notes_data (estructura de backup)
  if (data && data.notes_data && data.notes_data.notes && Array.isArray(data.notes_data.notes)) {
    console.log('📦 Estructura detectada: data.notes_data.notes');
    return data.notes_data.notes;
  }
  
  // Caso 5: Intentar buscar cualquier propiedad que sea un array de notas
  if (data && typeof data === 'object') {
    for (const key of Object.keys(data)) {
      if (data[key] && Array.isArray(data[key]) && data[key].length > 0 && data[key][0]?.title !== undefined) {
        console.log(`📦 Estructura detectada: data.${key} (array de notas)`);
        return data[key];
      }
    }
  }
  
  console.warn('⚠️ No se pudo extraer notas de la estructura:', data);
  return [];
};

// ✅ Función para mapear datos del backup al modelo Note completo (PRESERVANDO PERSONALIZACIÓN)
const mapToNoteModel = (backupNote: any): Note => {
  return {
    id: backupNote.id || crypto.randomUUID(),
    title: backupNote.title || 'Nota sin título',
    content: backupNote.content || '',
    color: backupNote.color || DEFAULT_COLOR,
    shape: backupNote.shape || DEFAULT_SHAPE,
    icon: backupNote.icon || DEFAULT_ICON,
    size: backupNote.size || DEFAULT_SIZE,
    colorIntensity: backupNote.colorIntensity || DEFAULT_COLOR_INTENSITY,
    is_favorite: backupNote.is_favorite || false,
    is_archived: backupNote.is_archived || false,
    tags: backupNote.tags || [],
    created_at: backupNote.created_at || new Date().toISOString(),
    updated_at: backupNote.updated_at || new Date().toISOString(),
    deleted_at: backupNote.deleted_at || null,
    user_id: backupNote.user_id || ''
  };
};

// ✅ Función para formatear fecha
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// ✅ Función para formatear tamaño de archivo
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const CloudBackupSection: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { notes, replaceAllNotes } = useNotes();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  const [cloudBackups, setCloudBackups] = useState<CloudBackupMetadata[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [isRestoringCloud, setIsRestoringCloud] = useState<string | null>(null);
  const [isDeletingCloud, setIsDeletingCloud] = useState<string | null>(null);
  const [showDeleteCloudModal, setShowDeleteCloudModal] = useState<CloudBackupMetadata | null>(null);
  const [cloudProgress, setCloudProgress] = useState(0);
  const [showCloudProgress, setShowCloudProgress] = useState(false);
  const [showCloudSuccess, setShowCloudSuccess] = useState(false);
  const [cloudSuccessMessage, setCloudSuccessMessage] = useState('');

  // ✅ Estados para el modal de opciones de restauración
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [pendingRestoreBackup, setPendingRestoreBackup] = useState<CloudBackupMetadata | null>(null);
  const [pendingRestoreNotes, setPendingRestoreNotes] = useState<Note[]>([]);
  const [isLoadingBackupNotes, setIsLoadingBackupNotes] = useState(false);
  const [restoreMode, setRestoreMode] = useState<RestoreMode>('merge');

  // Calcular backups restantes
  const remainingBackups = MAX_BACKUPS - cloudBackups.length;
  const isNearLimit = remainingBackups <= 2 && remainingBackups > 0;
  const isLimitReached = remainingBackups <= 0;

  useEffect(() => {
    if (user) {
      loadCloudBackups();
    }
  }, [user]);

  const loadCloudBackups = async () => {
    setIsLoadingCloud(true);
    try {
      const backups = await backupService.getCloudBackups();
      setCloudBackups(backups);
    } catch (error) {
      console.error('Error cargando backups de la nube:', error);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  const handleSaveToCloud = async () => {
    if (notes.length === 0) {
      showError('No hay notas para respaldar');
      return;
    }

    setIsSavingToCloud(true);
    setShowCloudProgress(true);
    setCloudProgress(0);

    const interval = setInterval(() => {
      setCloudProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);

    try {
      const backup = await backupService.saveBackupToCloud(notes);
      
      clearInterval(interval);
      setCloudProgress(100);
      
      setTimeout(() => {
        setShowCloudProgress(false);
        setCloudSuccessMessage(`✅ ${backup?.note_count || notes.length} notas guardadas en la nube`);
        setShowCloudSuccess(true);
        loadCloudBackups();
      }, 500);
      
      success('✅ Backup guardado en la nube');
    } catch (error: any) {
      clearInterval(interval);
      setShowCloudProgress(false);
      showError(error.message || 'Error al guardar en la nube');
    } finally {
      setTimeout(() => {
        setIsSavingToCloud(false);
        setCloudProgress(0);
      }, 500);
    }
  };

  // ✅ Función para cargar las notas del backup antes de mostrar el modal
  const handleRestoreCloud = async (backup: CloudBackupMetadata) => {
    setIsLoadingBackupNotes(true);
    setPendingRestoreBackup(backup);
    
    try {
      console.log(`📥 Cargando notas del backup ${backup.file_name}...`);
      const restoredData = await backupService.restoreCloudBackup(backup.id);
      const restoredNotesArray = extractNotesFromBackupData(restoredData);
      const mappedNotes = restoredNotesArray.map(mapToNoteModel);
      setPendingRestoreNotes(mappedNotes);
      setShowRestoreModal(true);
      console.log(`✅ ${mappedNotes.length} notas cargadas del backup`);
    } catch (error: any) {
      console.error('Error cargando notas del backup:', error);
      showError(error.message || 'Error al cargar las notas del backup');
      setPendingRestoreBackup(null);
    } finally {
      setIsLoadingBackupNotes(false);
    }
  };

  // ✅ Función para confirmar la restauración con el modo seleccionado
  const handleConfirmRestore = async (mode: RestoreMode) => {
    if (!pendingRestoreBackup) return;

    setShowRestoreModal(false);
    setRestoreMode(mode);
    setIsRestoringCloud(pendingRestoreBackup.id);
    setShowCloudProgress(true);
    setCloudProgress(0);

    const interval = setInterval(() => {
      setCloudProgress(prev => {
        if (prev >= 90) return 90;
        return prev + Math.floor(Math.random() * 20) + 10;
      });
    }, 200);

    try {
      // ✅ APLICAR EL MODO DE RESTAURACIÓN SELECCIONADO
      const mergedNotes = applyRestoreMode(notes, pendingRestoreNotes, mode, (current, total) => {
        const progressPercent = (current / total) * 100;
        setCloudProgress(Math.min(progressPercent, 90));
      });
      
      console.log(`📝 Restaurando con modo: ${mode}`);
      console.log(`   Notas originales: ${notes.length}`);
      console.log(`   Notas del backup: ${pendingRestoreNotes.length}`);
      console.log(`   Notas resultantes: ${mergedNotes.length}`);
      
      clearInterval(interval);
      setCloudProgress(100);

      setTimeout(() => {
        setShowCloudProgress(false);
        const modeText = mode === 'replace' ? 'Reemplazar' : mode === 'merge' ? 'Fusionar' : 'Solo agregar nuevas';
        setCloudSuccessMessage(`✅ ${mergedNotes.length} notas restauradas (modo: ${modeText})`);
        setShowCloudSuccess(true);
      }, 500);
      
      if (replaceAllNotes) {
        await replaceAllNotes(mergedNotes);
      }
      
      success(`✅ ${mergedNotes.length} notas restauradas (modo: ${mode === 'replace' ? 'Reemplazar' : mode === 'merge' ? 'Fusionar' : 'Solo agregar nuevas'})`);
      await loadCloudBackups();
    } catch (error: any) {
      clearInterval(interval);
      setShowCloudProgress(false);
      console.error('Error restaurando backup:', error);
      showError(error.message || 'Error al restaurar desde la nube');
    } finally {
      setIsRestoringCloud(null);
      setPendingRestoreBackup(null);
      setPendingRestoreNotes([]);
    }
  };

  const handleDeleteCloud = (backup: CloudBackupMetadata) => {
    setShowDeleteCloudModal(backup);
  };

  const confirmDeleteCloud = async () => {
    if (!showDeleteCloudModal) return;

    setIsDeletingCloud(showDeleteCloudModal.id);
    try {
      const result = await backupService.deleteCloudBackup(showDeleteCloudModal.id);
      if (result) {
        success('✅ Backup eliminado de la nube');
        await loadCloudBackups();
      } else {
        showError('Error al eliminar backup de la nube');
      }
    } catch (error) {
      showError('Error al eliminar backup de la nube');
    } finally {
      setIsDeletingCloud(null);
      setShowDeleteCloudModal(null);
    }
  };

  const handleOpenSelectiveBackup = () => {
    if (notes.length === 0) {
      showError('No hay notas para respaldar');
      return;
    }
    openSelectiveBackupModal(notes);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header con icono de nube */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className={`font-semibold text-sm sm:text-base ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ☁️ Backup en la Nube
            </h4>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Tus backups seguros en Supabase, disponibles en todos tus dispositivos
            </p>
          </div>
          {cloudBackups.length > 0 && (
            <span className="px-2.5 py-1 bg-purple-500/10 rounded-full text-xs font-semibold text-purple-400 border border-purple-500/20">
              {cloudBackups.length}
            </span>
          )}
        </div>

        {/* Botón para guardar en la nube (completo) */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveToCloud}
          disabled={isSavingToCloud || notes.length === 0 || isLimitReached}
          className="w-full py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 text-sm"
        >
          {isSavingToCloud ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Guardando en la nube...</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-4 h-4" />
              <span>Guardar Backup en la Nube</span>
            </>
          )}
        </motion.button>

        {/* Botón para Backup Selectivo */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenSelectiveBackup}
          disabled={notes.length === 0}
          className="w-full py-2.5 border-2 border-purple-500/50 text-purple-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-500/10 transition-all text-sm disabled:opacity-50"
        >
          <Filter className="w-4 h-4" />
          <span>Backup Selectivo</span>
        </motion.button>

        {/* Indicador de límite de backups */}
        {!isLoadingCloud && cloudBackups.length > 0 && (
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1.5">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                📦 {cloudBackups.length} / {MAX_BACKUPS} backups
              </span>
              {!isLimitReached && (
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${(cloudBackups.length / MAX_BACKUPS) * 100}%` }}
                  />
                </div>
              )}
            </div>
            {isNearLimit && !isLimitReached && (
              <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                ⚠️ Quedan {remainingBackups} espacios
              </span>
            )}
            {isLimitReached && (
              <span className="text-red-400 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Límite alcanzado
              </span>
            )}
          </div>
        )}

        {/* Advertencia cuando no hay backups */}
        {!isLoadingCloud && cloudBackups.length === 0 && (
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-1">
            💾 Puedes guardar hasta {MAX_BACKUPS} backups en la nube
          </div>
        )}

        {/* Lista de backups en la nube */}
        {isLoadingCloud ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" text="Cargando backups..." />
          </div>
        ) : cloudBackups.length > 0 ? (
          <div className="space-y-2">
            <p className={`text-xs font-medium uppercase tracking-wider ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Backups en la nube ({cloudBackups.length})
            </p>
            {cloudBackups.map((backup) => (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl border ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 hover:border-purple-500/30'
                    : 'bg-white/60 border-white/40 hover:border-purple-300'
                } backdrop-blur-sm transition-all duration-200`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <Cloud className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {backup.file_name}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <span>📝 {backup.note_count} notas</span>
                      <span>📦 {formatFileSize(backup.file_size)}</span>
                      <span>🕒 {formatDate(backup.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleRestoreCloud(backup)}
                      disabled={isRestoringCloud === backup.id || isLoadingBackupNotes}
                      className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                      title="Restaurar desde la nube (preserva personalización)"
                    >
                      {isRestoringCloud === backup.id ? (
                        <LoadingSpinner size="sm" />
                      ) : isLoadingBackupNotes && pendingRestoreBackup?.id === backup.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CloudDownload className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCloud(backup)}
                      disabled={isDeletingCloud === backup.id}
                      className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      title="Eliminar de la nube"
                    >
                      {isDeletingCloud === backup.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-6 rounded-xl border-2 border-dashed ${
            isDarkMode
              ? 'border-gray-700 bg-gray-800/30'
              : 'border-gray-200 bg-gray-50/50'
          }`}>
            <Cloud className={`w-10 h-10 mx-auto mb-2 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <p className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Sin backups en la nube
            </p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Guarda tu primer backup en Supabase
            </p>
          </div>
        )}

        {/* Info de seguridad */}
        <div className={`p-3 rounded-xl border ${
          isDarkMode
            ? 'bg-blue-500/5 border-blue-500/20'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex gap-2">
            <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className={`text-xs ${
              isDarkMode ? 'text-blue-300' : 'text-blue-600'
            }`}>
              Tus backups están seguros con Row Level Security. Solo tú puedes acceder a ellos.
              <span className="block text-[10px] mt-1 opacity-75">
                ✨ Se preservan todos los estilos: forma, icono, tamaño e intensidad de color.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* MODAL DE OPCIONES DE RESTAURACIÓN (NUEVO) */}
      {/* ============================================ */}
      <RestoreOptionsModal
        isOpen={showRestoreModal}
        onClose={() => {
          setShowRestoreModal(false);
          setPendingRestoreBackup(null);
          setPendingRestoreNotes([]);
        }}
        onConfirm={handleConfirmRestore}
        existingNotes={notes}
        backupNotes={pendingRestoreNotes}
        backupName={pendingRestoreBackup?.file_name || ''}
        backupDate={pendingRestoreBackup ? formatDate(pendingRestoreBackup.created_at) : ''}
        backupNoteCount={pendingRestoreBackup?.note_count || 0}
        isRestoring={isRestoringCloud === pendingRestoreBackup?.id}
        source="cloud"
      />

      {/* Modal de progreso */}
      <AnimatePresence>
        {showCloudProgress && (
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
                <h3 className="text-lg font-bold mb-2 text-white">Procesando...</h3>
                <div className="w-full bg-white/20 rounded-full h-3 mb-2 overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full"
                    animate={{ width: `${cloudProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-2xl font-bold text-white">{cloudProgress}%</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de éxito */}
      <AnimatePresence>
        {showCloudSuccess && (
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
              <h3 className="text-xl font-bold mb-2 text-white">✅ Operación Exitosa</h3>
              <p className="text-blue-100 mb-4 text-sm">{cloudSuccessMessage}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCloudSuccess(false)}
                className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl font-semibold hover:from-green-500 hover:to-blue-600 transition-all shadow-lg"
              >
                Aceptar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación para eliminar */}
      <AnimatePresence>
        {showDeleteCloudModal && (
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
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Eliminar backup de la nube
                </h3>
              </div>
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center backdrop-blur-sm">
                    <Trash2 className="w-8 h-8 text-red-400" />
                  </div>
                </div>
                <p className="text-center text-white mb-2">
                  ¿Eliminar este backup de la nube?
                </p>
                <p className="text-center text-sm text-blue-100 mb-4 truncate">
                  {showDeleteCloudModal.file_name}
                </p>
                <p className="text-center text-xs text-red-300 mb-6">
                  Esta acción no se puede deshacer
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteCloudModal(null)}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium border border-white/20"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteCloud}
                    disabled={isDeletingCloud === showDeleteCloudModal.id}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeletingCloud === showDeleteCloudModal.id ? (
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
    </>
  );
};

export default CloudBackupSection;