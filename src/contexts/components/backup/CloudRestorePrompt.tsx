// src/contexts/components/backup/CloudRestorePrompt.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudDownload, X } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useNotes } from '../../../hooks/useNotes';
import { api, CloudBackupMetadata } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';

interface CloudRestorePromptProps {
  onComplete?: () => void;
}

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

  const handleRestore = async () => {
    if (!latestBackup) return;
    
    setIsLoading(true);
    try {
      const restoredNotes = await api.restoreCloudBackup(latestBackup.id);
      
      if (restoredNotes && restoredNotes.length > 0) {
        const notesToRestore = restoredNotes.map((note: any) => ({
          id: note.id || crypto.randomUUID(),
          title: note.title || '',
          content: note.content || '',
          color: note.color || '#FFFFFF',
          is_favorite: note.is_favorite || false,
          is_archived: note.is_archived || false,
          tags: note.tags || [],
          created_at: note.created_at || new Date().toISOString(),
          updated_at: note.updated_at || new Date().toISOString(),
          deleted_at: note.deleted_at || null,
          user_id: note.user_id || ''
        }));
        
        await replaceAllNotes(notesToRestore);
        success(`✅ ${restoredNotes.length} notas restauradas desde la nube`);
        sessionStorage.setItem('cloud_restore_asked', 'true');
        setIsVisible(false);
        onComplete?.();
      }
    } catch (error: any) {
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
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
      >
        <div className={`rounded-2xl shadow-2xl overflow-hidden border ${
          isDarkMode
            ? 'bg-gray-800/95 border-purple-500/30 backdrop-blur-md'
            : 'bg-white/95 border-purple-300 shadow-xl'
        }`}>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  💾 Restaurar desde la nube
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Encontramos un backup en la nube del {new Date(latestBackup.created_at).toLocaleDateString()} con {latestBackup.note_count} notas.
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ¿Deseas restaurar tus notas desde la nube?
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
            <div className="flex gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRestore}
                disabled={isLoading}
                className="flex-1 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CloudDownload className="w-4 h-4" />
                )}
                <span>Restaurar ahora</span>
              </motion.button>
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                No, gracias
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CloudRestorePrompt;