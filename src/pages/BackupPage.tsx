import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useNotes } from '../hooks/useNotes';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { backupService, BackupMetadata } from '../services/backup';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
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
  XCircle,
  Trash,
  AlertTriangle
} from 'lucide-react';

const BackupPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { notes, replaceAllNotes } = useNotes();
  const { user } = useAuth();
  const { success, error: showError, info, warning } = useToast();
  
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<BackupMetadata | null>(null);
  const [selectedBackups, setSelectedBackups] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [backupStats, setBackupStats] = useState({
    totalNotes: 0,
    lastBackup: null as BackupMetadata | null,
    notesSinceLastBackup: 0,
    needsBackup: false,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const loadBackups = async () => {
    try {
      setIsLoading(true);
      const data = await backupService.getBackups();
      setBackups(data);
    } catch (error) {
      showError('Error al cargar los backups');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = useCallback(async () => {
    try {
      const stats = await backupService.getBackupStats(notes);
      setBackupStats(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, [notes]);

  const handleCreateBackup = async () => {
    if (notes.length === 0) {
      info('No hay notas para respaldar');
      return;
    }

    setIsCreating(true);
    setBackupProgress(0);

    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const backup = backupService.createBackup(notes, true);
      
      clearInterval(interval);
      setBackupProgress(100);
      
      success(`✅ Backup creado: ${backup.note_count} notas`);
      await loadBackups();

      setTimeout(() => {
        setBackupProgress(0);
        setIsCreating(false);
      }, 1000);
    } catch (error) {
      clearInterval(interval);
      showError('Error al crear backup');
      setIsCreating(false);
      setBackupProgress(0);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;

    if (!window.confirm(`¿Restaurar el backup del ${formatDate(backup.created_at)}? Las notas actuales (${notes.length}) serán reemplazadas por ${backup.note_count} notas del backup.`)) {
      return;
    }

    setIsRestoring(backupId);

    try {
      const restoredNotes = await backupService.restoreBackup(backupId);
      await replaceAllNotes(restoredNotes);
      
      success(`✅ ${restoredNotes.length} notas restauradas correctamente`);
      await loadBackups();
    } catch (error) {
      showError('Error al restaurar backup');
    } finally {
      setIsRestoring(null);
    }
  };

  const handleDownloadBackup = async (backupId: string) => {
    setIsDownloading(backupId);

    try {
      await backupService.downloadBackupFromHistory(backupId);
      success('✅ Descarga iniciada');
    } catch (error) {
      showError('Error al descargar backup');
    } finally {
      setIsDownloading(null);
    }
  };

  const handleUploadBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showError('El archivo es demasiado grande (máx 10MB)');
      return;
    }

    setIsRestoring('upload');

    try {
      const restoredNotes = await backupService.restoreFromFile(file);
      
      if (!window.confirm(`¿Restaurar ${restoredNotes.length} notas desde el archivo? Las notas actuales serán reemplazadas.`)) {
        return;
      }

      await replaceAllNotes(restoredNotes);
      
      success(`✅ ${restoredNotes.length} notas restauradas desde archivo`);
      await loadBackups();
    } catch (error) {
      showError('Error al restaurar desde archivo');
    } finally {
      setIsRestoring(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ============== FUNCIONALIDADES DE ELIMINACIÓN ==============

  /**
   * Eliminar un backup individual
   */
  const handleDeleteBackup = async (backup: BackupMetadata) => {
    setShowDeleteModal(backup);
  };

  const confirmDeleteBackup = async () => {
    if (!showDeleteModal) return;

    setIsDeleting(showDeleteModal.id);

    try {
      await backupService.deleteBackup(showDeleteModal.id);
      success(`✅ Backup "${showDeleteModal.file_name}" eliminado`);
      await loadBackups();
      
      // Si estábamos en modo selección, limpiar
      if (selectedBackups.has(showDeleteModal.id)) {
        const newSelected = new Set(selectedBackups);
        newSelected.delete(showDeleteModal.id);
        setSelectedBackups(newSelected);
        if (newSelected.size === 0) {
          setIsSelectionMode(false);
        }
      }
    } catch (error) {
      showError('Error al eliminar backup');
    } finally {
      setIsDeleting(null);
      setShowDeleteModal(null);
    }
  };

  /**
   * Eliminar todos los backups
   */
  const handleDeleteAllBackups = () => {
    if (backups.length === 0) return;
    setShowDeleteAllModal(true);
  };

  const confirmDeleteAllBackups = async () => {
    setIsDeletingAll(true);

    try {
      // Eliminar uno por uno para garantizar que se limpien los datos
      for (const backup of backups) {
        await backupService.deleteBackup(backup.id);
      }
      
      success(`🧹 ${backups.length} backups eliminados correctamente`);
      await loadBackups();
      
      // Limpiar selección
      setSelectedBackups(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      showError('Error al eliminar los backups');
    } finally {
      setIsDeletingAll(false);
      setShowDeleteAllModal(false);
    }
  };

  /**
   * Eliminar backups seleccionados
   */
  const handleDeleteSelectedBackups = async () => {
    if (selectedBackups.size === 0) return;

    const confirmMessage = `¿Eliminar ${selectedBackups.size} backup${selectedBackups.size !== 1 ? 's' : ''} permanentemente?`;
    
    if (!window.confirm(confirmMessage)) return;

    setIsDeletingAll(true);

    try {
      let successCount = 0;
      const errors: string[] = [];

      for (const id of selectedBackups) {
        try {
          await backupService.deleteBackup(id);
          successCount++;
        } catch {
          errors.push(id);
        }
      }

      if (errors.length === 0) {
        success(`✅ ${successCount} backup${successCount !== 1 ? 's' : ''} eliminado${successCount !== 1 ? 's' : ''}`);
      } else if (successCount > 0) {
        info(`${successCount} backup${successCount !== 1 ? 's' : ''} eliminado${successCount !== 1 ? 's' : ''}, ${errors.length} fallaron`);
      } else {
        showError('No se pudo eliminar ningún backup');
      }

      await loadBackups();
      setSelectedBackups(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      showError('Error al eliminar los backups seleccionados');
    } finally {
      setIsDeletingAll(false);
    }
  };

  // ============== FUNCIONES DE SELECCIÓN MÚLTIPLE ==============

  const toggleBackupSelection = (id: string) => {
    setSelectedBackups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        if (newSet.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        newSet.add(id);
        setIsSelectionMode(true);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedBackups.size === backups.length) {
      setSelectedBackups(new Set());
      setIsSelectionMode(false);
    } else {
      setSelectedBackups(new Set(backups.map(b => b.id)));
      setIsSelectionMode(true);
    }
  };

  const clearSelection = () => {
    setSelectedBackups(new Set());
    setIsSelectionMode(false);
  };

  const getProgressColor = (progress: number): string => {
    if (progress < 33) return 'bg-yellow-500';
    if (progress < 66) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getProgressText = (progress: number): string => {
    if (progress === 0) return 'Iniciando...';
    if (progress < 25) return 'Preparando notas...';
    if (progress < 50) return 'Comprimiendo datos...';
    if (progress < 75) return 'Generando backup...';
    if (progress < 100) return 'Finalizando...';
    return '¡Completado!';
  };

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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Input oculto para subir archivos */}
      <div className="sr-only">
        <label htmlFor="backup-file-upload">Subir archivo de backup</label>
      </div>
      <input
        id="backup-file-upload"
        type="file"
        ref={fileInputRef}
        onChange={handleUploadBackup}
        accept=".json"
        className="hidden"
        aria-label="Subir archivo de backup"
        title="Selecciona un archivo de backup JSON"
      />

      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Volver a configuración"
                title="Volver"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold">Backups</h1>
            </div>
            
            {/* Información del usuario */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name || 'Avatar'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {getInitials()}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.name || 'Usuario'}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Tarjeta de estadísticas */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Resumen</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {backups.length} backups
              </span>
              {backups.length > 0 && (
                <button
                  onClick={handleDeleteAllBackups}
                  disabled={isDeletingAll}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Eliminar todos los backups"
                  aria-label="Eliminar todos los backups"
                >
                  {isDeletingAll ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm opacity-80">Total notas</p>
              <p className="text-2xl font-bold">{backupStats.totalNotes}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm opacity-80">Espacio usado</p>
              <p className="text-2xl font-bold">
                {formatFileSize(backups.reduce((acc, b) => acc + b.file_size, 0))}
              </p>
            </div>
          </div>

          {backupStats.lastBackup ? (
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-80">Último backup</span>
                <span className="text-xs bg-green-500/30 px-2 py-1 rounded-full">
                  {backupStats.lastBackup.note_count} notas
                </span>
              </div>
              <p className="font-medium">{formatDate(backupStats.lastBackup.created_at)}</p>
              {backupStats.notesSinceLastBackup > 0 && (
                <p className="text-sm mt-2 text-yellow-200 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {backupStats.notesSinceLastBackup} nota(s) nueva(s) desde último backup
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-sm opacity-80">No hay backups aún</p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCreateBackup}
            disabled={isCreating || notes.length === 0}
            className="py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold shadow-lg flex items-center justify-center gap-2"
            aria-label="Crear nuevo backup"
            title="Crear backup de todas las notas"
          >
            {isCreating ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Cloud className="w-5 h-5" />
                <span>Crear Backup</span>
              </>
            )}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRestoring === 'upload'}
            className="py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold shadow-lg flex items-center justify-center gap-2"
            aria-label="Subir archivo de backup"
            title="Restaurar desde un archivo de backup"
          >
            {isRestoring === 'upload' ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Restaurando...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Subir Backup</span>
              </>
            )}
          </button>
        </div>

        {/* Barra de progreso */}
        {isCreating && backupProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{getProgressText(backupProgress)}</span>
              <span className="font-semibold">{backupProgress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(backupProgress)} transition-all duration-300`}
                style={{ width: `${backupProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Barra de selección múltiple */}
        {isSelectionMode && backups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white flex items-center justify-between"
          >
            <span className="font-medium">
              {selectedBackups.size} seleccionado{selectedBackups.size !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                {selectedBackups.size === backups.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
              {selectedBackups.size > 0 && (
                <button
                  onClick={handleDeleteSelectedBackups}
                  disabled={isDeletingAll}
                  className="px-3 py-1.5 bg-red-500/30 hover:bg-red-500/40 rounded-lg transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
                >
                  {isDeletingAll ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {/* Lista de backups */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Historial</h3>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" text="Cargando backups..." />
            </div>
          ) : backups.length === 0 ? (
            <EmptyState
              type="backup"
              title="No hay backups"
              message="Crea tu primer backup para proteger tus notas"
              actionLabel="Crear backup"
              onAction={handleCreateBackup}
            />
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => {
                const isSelected = selectedBackups.has(backup.id);
                const isDeletingThis = isDeleting === backup.id;

                return (
                  <motion.div
                    key={backup.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 rounded-xl backdrop-blur-lg border-2 transition-all hover:shadow-lg ${
                      isSelected
                        ? 'ring-2 ring-blue-500 scale-[1.02] shadow-2xl'
                        : backup.is_latest
                        ? isDarkMode
                          ? 'bg-green-900/30 border-green-500/50'
                          : 'bg-green-50 border-green-300'
                        : isDarkMode
                        ? 'bg-gray-800/60 border-gray-700/40'
                        : 'bg-white/80 border-white/90'
                    } ${isDeletingThis ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox para selección múltiple */}
                      {isSelectionMode && (
                        <button
                          onClick={() => toggleBackupSelection(backup.id)}
                          disabled={isDeletingAll}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : isDarkMode 
                                ? 'border-gray-600' 
                                : 'border-gray-300'
                          } disabled:opacity-50`}
                          aria-label={isSelected ? 'Deseleccionar backup' : 'Seleccionar backup'}
                        >
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </button>
                      )}

                      <div className={`p-2 rounded-lg ${
                        backup.is_latest ? 'bg-green-500/20' : 'bg-blue-500/20'
                      }`}>
                        <FileText className={`w-5 h-5 ${backup.is_latest ? 'text-green-500' : 'text-blue-500'}`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {backup.file_name.length > 40
                              ? `${backup.file_name.substring(0, 37)}...`
                              : backup.file_name}
                          </span>
                          {backup.is_latest && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-green-500/20 text-green-500 rounded-full">
                              ÚLTIMO
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                          <span>📝 {backup.note_count} notas</span>
                          <span>📦 {formatFileSize(backup.file_size)}</span>
                          <span>🕒 {formatDate(backup.created_at)}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestoreBackup(backup.id)}
                            disabled={isRestoring === backup.id || isDeletingAll}
                            className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                            title="Restaurar"
                            aria-label={`Restaurar backup del ${formatDate(backup.created_at)}`}
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
                            aria-label={`Descargar backup del ${formatDate(backup.created_at)}`}
                          >
                            {isDownloading === backup.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(backup)}
                            disabled={isDeletingThis || isDeletingAll}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            title="Eliminar"
                            aria-label={`Eliminar backup del ${formatDate(backup.created_at)}`}
                          >
                            {isDeletingThis ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Botón para activar modo selección */}
              {!isSelectionMode && backups.length > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setIsSelectionMode(true)}
                  className="w-full py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Activar selección múltiple</span>
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* Nota informativa */}
        <div className="text-xs text-center text-gray-500 mt-4 space-y-1">
          <p>💾 Los backups se guardan en tu navegador (localStorage).</p>
          <p>📥 Puedes descargarlos, subirlos o restaurarlos en cualquier momento.</p>
          <p className="text-yellow-500">⚠️ Al restaurar, las notas actuales serán reemplazadas.</p>
        </div>
      </div>

      {/* Modal de confirmación para eliminar un backup */}
      <AnimatePresence>
        {showDeleteModal && (
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
              onClick={() => setShowDeleteModal(null)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-red-500/30 shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Eliminar backup
                </h3>
              </div>

              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500/20 to-red-500/20 flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                </div>

                <p className="text-center text-gray-700 dark:text-gray-300 mb-2">
                  ¿Eliminar este backup?
                </p>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {showDeleteModal.file_name}
                </p>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-6">
                  Esta acción no se puede deshacer
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteBackup}
                    disabled={isDeleting === showDeleteModal.id}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
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

      {/* Modal de confirmación para eliminar todos los backups */}
      <AnimatePresence>
        {showDeleteAllModal && (
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
              onClick={() => setShowDeleteAllModal(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-red-500/30 shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Eliminar todos los backups
                </h3>
              </div>

              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500/20 to-red-500/20 flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                </div>

                <p className="text-center text-gray-700 dark:text-gray-300 mb-2">
                  ¿Eliminar todos los backups?
                </p>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Se eliminarán {backups.length} backup{backups.length !== 1 ? 's' : ''}
                </p>
                <p className="text-center text-xs text-red-500 dark:text-red-400 mb-6">
                  ⚠️ Esta acción no se puede deshacer
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteAllModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteAllBackups}
                    disabled={isDeletingAll}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
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
    </div>
  );
};

export default BackupPage;