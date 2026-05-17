// src/contexts/components/backup/CloudRestorePrompt.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  CloudDownload, 
  X, 
  Calendar, 
  Database, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Shield,
  Sparkles,
  Clock,
  HardDrive,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useNotes } from '../../../hooks/useNotes';
import { useAuth } from '../../../hooks/useAuth';
import { api, CloudBackupMetadata } from '../../../services/api';
import { backupCloudService } from '../../../services/backupCloudService';
import { backupService } from '../../../services/backup';
import { useToast } from '../../../hooks/useToast';
import { Note } from '../../../models/Note';

interface CloudRestorePromptProps {
  onComplete?: () => void;
}

// Valores por defecto para las propiedades opcionales de Note
const DEFAULT_COLOR = '#3B82F6';
const DEFAULT_SHAPE = 'rounded';
const DEFAULT_ICON = 'default';
const DEFAULT_SIZE = 'normal';
const DEFAULT_COLOR_INTENSITY = 'medium';

// Función para mapear los datos del backup al modelo Note completo (preservando personalización)
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

const CloudRestorePrompt: React.FC<CloudRestorePromptProps> = ({ onComplete }) => {
  const { isDarkMode } = useTheme();
  const { notes, replaceAllNotes } = useNotes();
  const { user } = useAuth();
  const { success, error: showError, info } = useToast();
  
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [latestBackup, setLatestBackup] = useState<CloudBackupMetadata | null>(null);
  const [backupStats, setBackupStats] = useState<{
    noteCount: number;
    fileSize: string;
    date: string;
  } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Verificar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Función para formatear tamaño de archivo
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  // Verificar si hay backups en la nube más recientes
  const checkCloudBackup = useCallback(async () => {
    const alreadyAsked = sessionStorage.getItem('cloud_restore_asked');
    if (alreadyAsked === 'true') return;

    if (!isOnline) {
      console.log('📡 Sin conexión a internet, no se pueden verificar backups en la nube');
      return;
    }

    if (!user) {
      console.log('👤 Usuario no autenticado, no se pueden verificar backups');
      return;
    }

    try {
      // Obtener backups de la nube usando el servicio unificado
      const cloudBackupList = await backupCloudService.getCloudBackups();
      
      if (cloudBackupList && cloudBackupList.length > 0) {
        // Ordenar por fecha (más reciente primero)
        const sorted = [...cloudBackupList].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const latest = sorted[0];
        
        // Calcular fecha de la última nota local
        const lastNoteDate = notes.length > 0 
          ? new Date(Math.max(...notes.map(n => new Date(n.updated_at).getTime())))
          : new Date(0);
        
        const lastBackupDate = new Date(latest.created_at);
        
        // Mostrar solo si el backup en la nube es más reciente que las notas locales
        if (lastBackupDate > lastNoteDate) {
          setLatestBackup(latest);
          setBackupStats({
            noteCount: latest.note_count,
            fileSize: formatFileSize(latest.file_size),
            date: new Date(latest.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          });
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Error checking cloud backups:', error);
    }
  }, [notes, user, isOnline, formatFileSize]);

  // Ejecutar verificación al montar y cuando cambien las dependencias
  useEffect(() => {
    if (notes !== undefined && user) {
      checkCloudBackup();
    }
  }, [notes, user, checkCloudBackup]);

  // Restaurar desde la nube
  const handleRestore = async () => {
    if (!latestBackup) return;
    
    setIsLoading(true);
    try {
      // Usar el servicio unificado para restaurar
      const restoredNotesData = await backupCloudService.restoreCloudBackup(latestBackup.id);
      
      if (restoredNotesData && restoredNotesData.length > 0) {
        // Mapear cada nota restaurada al modelo Note completo (preserva personalización)
        const notesToRestore: Note[] = restoredNotesData.map(mapToNoteModel);
        
        // Log para depuración - verificar que los campos se preservan
        console.log('📝 Notas restauradas con personalización:', notesToRestore.map(n => ({
          title: n.title,
          shape: n.shape,
          icon: n.icon,
          size: n.size,
          colorIntensity: n.colorIntensity
        })));
        
        await replaceAllNotes(notesToRestore);
        success(`✅ ${restoredNotesData.length} notas restauradas desde la nube`);
        
        // Marcar como preguntado para no volver a mostrar
        sessionStorage.setItem('cloud_restore_asked', 'true');
        setIsVisible(false);
        
        // Ejecutar callback si existe
        if (onComplete) {
          onComplete();
        }
      } else {
        showError('No se encontraron notas para restaurar');
      }
    } catch (error: any) {
      console.error('Error restoring backup:', error);
      showError(error.message || 'Error al restaurar desde la nube');
    } finally {
      setIsLoading(false);
    }
  };

  // Descartar la restauración
  const handleDismiss = () => {
    sessionStorage.setItem('cloud_restore_asked', 'true');
    setIsVisible(false);
    info('Puedes restaurar manualmente desde Configuración > Copias de Seguridad');
  };

  // No mostrar si no hay conexión
  if (!isOnline) return null;
  
  // No mostrar si no hay backup
  if (!isVisible || !latestBackup || !backupStats) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 top-0 z-50 flex items-start justify-center px-3 sm:px-4 pt-3 sm:pt-4 md:pt-6 pointer-events-none"
      >
        <div className="w-full max-w-[95%] sm:max-w-md md:max-w-lg lg:max-w-xl pointer-events-auto">
          <div className={`rounded-2xl shadow-2xl overflow-hidden border ${
            isDarkMode
              ? 'bg-gray-800/95 border-purple-500/30 backdrop-blur-md'
              : 'bg-white/95 border-purple-300 shadow-xl'
          }`}>
            {/* Header con gradiente animado */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
              
              <div className="relative p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icono animado */}
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.1 }}
                    className="flex-shrink-0 p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg"
                  >
                    <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-base sm:text-lg truncate flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      ¡Backup en la nube disponible!
                    </h3>
                    <p className={`text-xs sm:text-sm mt-1 line-clamp-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Encontramos un backup en la nube con datos más recientes que tus notas actuales
                    </p>
                  </div>
                  
                  <button
                    onClick={handleDismiss}
                    disabled={isLoading}
                    className="flex-shrink-0 p-1.5 sm:p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
                    aria-label="Cerrar"
                  >
                    <X className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="p-4 sm:p-5 pt-0 sm:pt-0">
              {/* Tarjeta de información del backup */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`mb-4 sm:mb-5 p-3 sm:p-4 rounded-xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20' 
                    : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'
                }`}
              >
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
                  {/* Fecha del backup */}
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] sm:text-xs uppercase font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Fecha
                      </p>
                      <p className={`text-[10px] sm:text-xs font-semibold truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {backupStats.date}
                      </p>
                    </div>
                  </div>

                  {/* Cantidad de notas */}
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                    }`}>
                      <Database className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        isDarkMode ? 'text-purple-400' : 'text-purple-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] sm:text-xs uppercase font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Notas
                      </p>
                      <p className={`text-[10px] sm:text-xs font-semibold truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {backupStats.noteCount} {backupStats.noteCount === 1 ? 'nota' : 'notas'}
                      </p>
                    </div>
                  </div>

                  {/* Tamaño del backup */}
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                    }`}>
                      <HardDrive className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] sm:text-xs uppercase font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Tamaño
                      </p>
                      <p className={`text-[10px] sm:text-xs font-semibold truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {backupStats.fileSize}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Mensaje de advertencia */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`mb-4 sm:mb-5 p-2.5 sm:p-3 rounded-lg flex items-start gap-2 ${
                  isDarkMode 
                    ? 'bg-amber-500/10 border border-amber-500/20' 
                    : 'bg-amber-50 border border-amber-200'
                }`}
              >
                <AlertCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 ${
                  isDarkMode ? 'text-amber-400' : 'text-amber-600'
                }`} />
                <p className={`text-[11px] sm:text-xs ${
                  isDarkMode ? 'text-amber-300' : 'text-amber-700'
                }`}>
                  <strong>Importante:</strong> Al restaurar, se reemplazarán TODAS tus {notes.length} notas actuales 
                  por las {backupStats.noteCount} notas del backup. Esta acción no se puede deshacer.
                </p>
              </motion.div>

              {/* Información de personalización preservada */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className={`mb-4 sm:mb-5 p-2.5 sm:p-3 rounded-lg flex items-start gap-2 ${
                  isDarkMode 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} />
                <p className={`text-[11px] sm:text-xs ${
                  isDarkMode ? 'text-green-300' : 'text-green-700'
                }`}>
                  ✨ Se preservarán todos los estilos de tus notas: forma, icono, tamaño e intensidad de color.
                </p>
              </motion.div>

              {/* Estado de conexión */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`mb-4 sm:mb-5 p-2 sm:p-2.5 rounded-lg flex items-center gap-2 ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-100'
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500" />
                    <span className={`text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Conexión activa - Backup listo para restaurar
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                    <span className={`text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Sin conexión - Conéctate a internet para restaurar
                    </span>
                  </>
                )}
              </motion.div>

              {/* Botones de acción */}
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRestore}
                  disabled={isLoading || !isOnline}
                  className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Restaurando...</span>
                    </>
                  ) : (
                    <>
                      <CloudDownload className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Restaurar {backupStats.noteCount} notas</span>
                    </>
                  )}
                </motion.button>
                
                <button
                  onClick={handleDismiss}
                  disabled={isLoading}
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl border font-semibold transition-all duration-200 text-sm sm:text-base ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50' 
                      : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  No, gracias
                </button>
              </div>

              {/* Información adicional */}
              <div className={`mt-3 sm:mt-4 pt-2 sm:pt-3 text-center border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-center gap-1.5">
                  <Shield className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-[9px] sm:text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Backup protegido con RLS - Solo tú puedes acceder
                  </p>
                </div>
                <p className={`text-[9px] sm:text-[10px] mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Puedes gestionar todos tus backups en Configuración &gt; Copias de Seguridad
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CloudRestorePrompt;