// src/contexts/components/backup/CloudRestorePrompt.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudDownload, X, Calendar, Database, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useNotes } from '../../../hooks/useNotes';
import { api, CloudBackupMetadata } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import { Note } from '../../../models/Note';  // ← Solo importar Note
import { DEFAULT_COLOR } from '@/utils/noteColors';

interface CloudRestorePromptProps {
  onComplete?: () => void;
}

// Valores por defecto para las propiedades opcionales de Note
const DEFAULT_SHAPE = 'rounded';
const DEFAULT_ICON = 'default';
const DEFAULT_SIZE = 'normal';
const DEFAULT_COLOR_INTENSITY = 'medium';

const CloudRestorePrompt: React.FC<CloudRestorePromptProps> = ({ onComplete }) => {
  const { isDarkMode } = useTheme();
  const { notes, replaceAllNotes } = useNotes();
  const { success, error: showError, info } = useToast();
  
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [latestBackup, setLatestBackup] = useState<CloudBackupMetadata | null>(null);

  useEffect(() => {
    const checkCloudBackup = async () => {
      const alreadyAsked = sessionStorage.getItem('cloud_restore_asked');
      if (alreadyAsked === 'true') return;

      try {
        const backups = await api.getCloudBackups();
        
        if (backups && backups.length > 0) {
          const sorted = backups.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          const latest = sorted[0];
          
          const lastBackupDate = new Date(latest.created_at);
          const lastNoteDate = notes.length > 0 
            ? new Date(Math.max(...notes.map(n => new Date(n.updated_at).getTime())))
            : new Date(0);
          
          if (lastBackupDate > lastNoteDate) {
            setLatestBackup(latest);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Error checking cloud backups:', error);
      }
    };

    if (notes !== undefined) {
      checkCloudBackup();
    }
  }, [notes]);

  // Función para mapear los datos del backup al modelo Note completo
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

  const handleRestore = async () => {
    if (!latestBackup) return;
    
    setIsLoading(true);
    try {
      const restoredNotes = await api.restoreCloudBackup(latestBackup.id);
      
      if (restoredNotes && restoredNotes.length > 0) {
        // Mapear cada nota restaurada al modelo Note completo
        const notesToRestore: Note[] = restoredNotes.map(mapToNoteModel);
        
        await replaceAllNotes(notesToRestore);
        success(`✅ ${restoredNotes.length} notas restauradas desde la nube`);
        sessionStorage.setItem('cloud_restore_asked', 'true');
        setIsVisible(false);
        onComplete?.();
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

  const handleDismiss = () => {
    sessionStorage.setItem('cloud_restore_asked', 'true');
    setIsVisible(false);
    info('Puedes restaurar manualmente desde Configuración > Backup');
  };

  if (!isVisible || !latestBackup) return null;

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
            {/* Header con gradiente */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
              
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
                    <h3 className={`font-bold text-base sm:text-lg truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      💾 Restaurar desde la nube
                    </h3>
                    <p className={`text-xs sm:text-sm mt-1 line-clamp-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Encontramos un backup en la nube con datos más recientes
                    </p>
                  </div>
                  
                  <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-1.5 sm:p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
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
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
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
                        Fecha del backup
                      </p>
                      <p className={`text-xs sm:text-sm font-semibold truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {new Date(latestBackup.created_at).toLocaleDateString()}
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
                        Notas disponibles
                      </p>
                      <p className={`text-xs sm:text-sm font-semibold truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {latestBackup.note_count} {latestBackup.note_count === 1 ? 'nota' : 'notas'}
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
                  Al restaurar, se reemplazarán TODAS tus notas actuales por las del backup.
                </p>
              </motion.div>

              {/* Botones de acción */}
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRestore}
                  disabled={isLoading}
                  className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Restaurando...</span>
                    </>
                  ) : (
                    <>
                      <CloudDownload className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Restaurar ahora</span>
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
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CloudRestorePrompt;