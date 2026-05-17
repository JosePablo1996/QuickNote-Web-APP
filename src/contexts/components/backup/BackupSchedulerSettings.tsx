// src/contexts/components/backup/BackupSchedulerSettings.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  Bell, 
  CheckCircle, 
  RefreshCw,
  Power,
  PowerOff,
  Info,
  Cloud,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useNotes } from '../../../hooks/useNotes';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { backupScheduler, BackupSchedule, ScheduleFrequency } from '../../../services/backupScheduler';
import { backupService } from '../../../services/backup';
import LoadingSpinner from '../ui/LoadingSpinner';

interface BackupSchedulerSettingsProps {
  onBackupComplete?: () => void;
}

const BackupSchedulerSettings: React.FC<BackupSchedulerSettingsProps> = ({ onBackupComplete }) => {
  const { isDarkMode } = useTheme();
  const { notes } = useNotes();
  const { user } = useAuth();
  const { success, error: showError, info } = useToast();
  
  const [schedule, setSchedule] = useState<BackupSchedule>(backupScheduler.getSchedule());
  const [isExecuting, setIsExecuting] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem('quicknote_last_sync_time');
    return saved ? new Date(saved) : null;
  });
  const [pendingBackupsCount, setPendingBackupsCount] = useState(0);

  // Suscribirse a cambios en el scheduler
  useEffect(() => {
    const unsubscribe = backupScheduler.subscribe((newSchedule) => {
      setSchedule(newSchedule);
    });
    
    // Verificar permisos de notificación
    checkNotificationPermission();
    
    // Cargar backups pendientes
    loadPendingBackups();
    
    // Escuchar evento de trigger
    const handleTrigger = () => {
      executeBackup();
    };
    window.addEventListener('backup-scheduler-trigger', handleTrigger);
    
    return () => {
      unsubscribe();
      window.removeEventListener('backup-scheduler-trigger', handleTrigger);
    };
  }, []);

  const loadPendingBackups = async () => {
    try {
      const backups = await backupService.getBackups();
      const unsyncedCount = backups.filter(b => b.source === 'local' && !b.cloud_id).length;
      setPendingBackupsCount(unsyncedCount);
    } catch (error) {
      console.error('Error loading pending backups:', error);
    }
  };

  const checkNotificationPermission = async () => {
    const hasPermission = await backupScheduler.requestNotificationPermission();
    setNotificationPermission(hasPermission);
  };

  const executeBackup = async () => {
    if (notes.length === 0) {
      info('No hay notas para respaldar');
      return;
    }

    setIsExecuting(true);
    try {
      const backupSuccess = await backupScheduler.executeBackup(notes);
      if (backupSuccess) {
        success('Backup automático completado');
        await loadPendingBackups();
        if (onBackupComplete) {
          onBackupComplete();
        }
      } else {
        showError('Error en backup automático');
      }
    } catch (error) {
      showError('Error al ejecutar backup');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleManualSync = async () => {
    if (!user) {
      info('Inicia sesión para sincronizar con la nube');
      return;
    }
    
    setSyncStatus('syncing');
    try {
      const result = await backupService.syncWithCloud();
      setLastSyncTime(new Date());
      localStorage.setItem('quicknote_last_sync_time', new Date().toISOString());
      
      if (result.synced > 0) {
        success(`✅ ${result.synced} backups sincronizados con la nube`);
        setSyncStatus('success');
        await loadPendingBackups();
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else if (result.failed > 0) {
        info(`⚠️ ${result.failed} backups no pudieron sincronizarse`);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        info('📡 Todos los backups ya están sincronizados');
        setSyncStatus('idle');
      }
      
      if (onBackupComplete) {
        onBackupComplete();
      }
    } catch (error) {
      showError('Error al sincronizar con la nube');
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleToggleEnabled = () => {
    const newEnabled = !schedule.enabled;
    backupScheduler.updateSchedule({ enabled: newEnabled });
    if (newEnabled) {
      success('Backup automático activado');
    } else {
      success('Backup automático desactivado');
    }
  };

  const handleFrequencyChange = (frequency: ScheduleFrequency) => {
    backupScheduler.updateSchedule({ frequency });
    success(`Frecuencia cambiada a ${getFrequencyText(frequency)}`);
  };

  const getFrequencyText = (freq: ScheduleFrequency): string => {
    switch (freq) {
      case 'daily': return 'Diario (2:00 AM)';
      case 'weekly': return 'Semanal (Lunes 2:00 AM)';
      default: return 'Nunca';
    }
  };

  const getStatusColor = (): string => {
    if (!schedule.enabled) return 'text-gray-400';
    if (schedule.lastStatus === 'success') return 'text-green-500';
    if (schedule.lastStatus === 'error') return 'text-red-500';
    return 'text-amber-500';
  };

  const getStatusText = (): string => {
    if (!schedule.enabled) return 'Desactivado';
    if (schedule.lastStatus === 'success') return `Último backup: ${new Date(schedule.lastRun!).toLocaleString()}`;
    if (schedule.lastStatus === 'error') return `Error: ${schedule.lastError}`;
    return 'Pendiente';
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleString();
  };

  const formatRelativeTime = (date: Date | null): string => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return `hace ${diffSeconds} segundos`;
    if (diffSeconds < 3600) return `hace ${Math.floor(diffSeconds / 60)} minutos`;
    if (diffSeconds < 86400) return `hace ${Math.floor(diffSeconds / 3600)} horas`;
    return `hace ${Math.floor(diffSeconds / 86400)} días`;
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Cloud className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            ⏰ Backup Automático Programado
          </h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`p-1.5 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          title="Información"
          aria-label="Mostrar información del backup automático"
        >
          <Info className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>
      </div>

      {/* Info panel */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`p-3 rounded-xl text-xs ${
            isDarkMode
              ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}
        >
          <p className="font-medium mb-1">📋 ¿Cómo funciona?</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Los backups se ejecutan automáticamente a las 2:00 AM</li>
            <li>Solo se ejecuta si tienes notas nuevas desde el último backup</li>
            <li>Recibirás una notificación cuando se complete</li>
            <li>Los backups se guardan en la nube con el límite de 10</li>
            <li>Puedes sincronizar manualmente backups locales pendientes</li>
          </ul>
        </motion.div>
      )}

      {/* Tarjeta principal */}
      <div className={`rounded-xl p-4 border ${
        schedule.enabled
          ? isDarkMode
            ? 'bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/30'
            : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300'
          : isDarkMode
            ? 'bg-gray-800/40 border-gray-700'
            : 'bg-gray-50 border-gray-200'
      }`}>
        {/* Estado y toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${schedule.enabled ? 'bg-emerald-500/20' : 'bg-gray-500/20'}`}>
              {schedule.enabled ? (
                <Power className={`w-4 h-4 text-emerald-500`} />
              ) : (
                <PowerOff className={`w-4 h-4 text-gray-500`} />
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Backup Automático
              </p>
              <p className={`text-xs ${getStatusColor()}`}>
                {getStatusText()}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              schedule.enabled ? 'bg-emerald-500' : 'bg-gray-400'
            }`}
            title={schedule.enabled ? 'Desactivar backup automático' : 'Activar backup automático'}
            aria-label={schedule.enabled ? 'Desactivar backup automático' : 'Activar backup automático'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                schedule.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Frecuencia */}
        {schedule.enabled && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-black/5 dark:bg-white/5">
              <Calendar className="w-4 h-4 text-purple-400" />
              <select
                value={schedule.frequency}
                onChange={(e) => handleFrequencyChange(e.target.value as ScheduleFrequency)}
                className={`flex-1 bg-transparent text-sm outline-none ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
                title="Frecuencia del backup automático"
                aria-label="Seleccionar frecuencia del backup automático"
              >
                <option value="daily">📅 Diario (2:00 AM)</option>
                <option value="weekly">📆 Semanal (Lunes 2:00 AM)</option>
                <option value="never">⏸️ Desactivar programación</option>
              </select>
            </div>

            {/* Próxima ejecución */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-black/5 dark:bg-white/5">
              <Clock className="w-4 h-4 text-amber-400" />
              <div className="flex-1">
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Próxima ejecución
                </p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {backupScheduler.getNextRunText(schedule)}
                  {schedule.nextRun && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({formatDate(schedule.nextRun)})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Bell className={`w-3 h-3 ${notificationPermission ? 'text-green-400' : 'text-gray-500'}`} />
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {notificationPermission ? 'Notificaciones activadas' : 'Sin notificaciones'}
                </span>
                {!notificationPermission && (
                  <button
                    onClick={checkNotificationPermission}
                    className="text-xs text-blue-500 hover:underline"
                    title="Activar notificaciones"
                    aria-label="Activar notificaciones del sistema"
                  >
                    Activar
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 text-gray-500" />
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {schedule.totalBackups} backups realizados
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botón ejecutar manual */}
        {schedule.enabled && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={executeBackup}
            disabled={isExecuting || notes.length === 0}
            className="w-full mt-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all text-sm disabled:opacity-50"
            title="Ejecutar backup manualmente ahora"
            aria-label="Ejecutar backup manual ahora"
          >
            {isExecuting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Ejecutar ahora</span>
          </motion.button>
        )}
      </div>

      {/* ✅ NUEVO: Sección de sincronización manual */}
      {user && (
        <div className={`rounded-xl p-4 border ${
          isDarkMode
            ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30'
            : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Cloud className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Sincronización Manual
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Sube backups locales pendientes a la nube
              </p>
            </div>
            {pendingBackupsCount > 0 && (
              <span className="px-2 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-500">
                {pendingBackupsCount} pendiente(s)
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSyncStatusIcon()}
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {syncStatus === 'syncing' && 'Sincronizando...'}
                {syncStatus === 'success' && '¡Sincronizado!'}
                {syncStatus === 'error' && 'Error en sincronización'}
                {syncStatus === 'idle' && lastSyncTime && `Última sincronización: ${formatRelativeTime(lastSyncTime)}`}
                {syncStatus === 'idle' && !lastSyncTime && 'No se ha sincronizado aún'}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleManualSync}
              disabled={syncStatus === 'syncing'}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                isDarkMode
                  ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
              } ${syncStatus === 'syncing' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>Sincronizar ahora</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* Resumen de actividad */}
      {schedule.totalBackups > 0 && (
        <div className={`p-3 rounded-xl ${
          isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Historial de actividad
            </p>
          </div>
          <div className="space-y-1">
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ✅ Última ejecución: {formatDate(schedule.lastRun)}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              📦 Total de backups automáticos: {schedule.totalBackups}
            </p>
            {pendingBackupsCount > 0 && (
              <p className={`text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                ⏳ Backups locales pendientes de sincronizar: {pendingBackupsCount}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupSchedulerSettings;