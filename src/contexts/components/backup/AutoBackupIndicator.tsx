// src/contexts/components/backup/AutoBackupIndicator.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudUpload, RefreshCw, CheckCircle } from 'lucide-react';
import { useAutoBackup } from '../../../hooks/useAutoBackup';

interface AutoBackupIndicatorProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'inline';
}

const AutoBackupIndicator: React.FC<AutoBackupIndicatorProps> = ({ position = 'bottom-right' }) => {
  const { pendingChanges, isBackingUp, lastBackupTime, forceBackup } = useAutoBackup({ enabled: true });
  
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-40',
    'bottom-right': 'fixed bottom-4 right-4 z-40',
    'top-left': 'fixed top-4 left-4 z-40',
    'bottom-left': 'fixed bottom-4 left-4 z-40',
    'inline': 'relative z-0'
  };
  
  const formatRelativeTime = (date: Date | null): string => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'hace unos segundos';
    if (diffMinutes < 60) return `hace ${diffMinutes} minutos`;
    if (diffMinutes < 1440) return `hace ${Math.floor(diffMinutes / 60)} horas`;
    return `hace ${Math.floor(diffMinutes / 1440)} días`;
  };
  
  // Versión inline (sin fixed positioning)
  if (position === 'inline') {
    return (
      <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-gray-200 dark:border-gray-700">
        <div className={`p-1.5 rounded-lg ${
          isBackingUp 
            ? 'bg-blue-500/20' 
            : pendingChanges 
              ? 'bg-amber-500/20' 
              : 'bg-emerald-500/20'
        }`}>
          {isBackingUp ? (
            <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          ) : pendingChanges ? (
            <CloudUpload className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Cloud className="w-3.5 h-3.5 text-emerald-500" />
          )}
        </div>
        
        <div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {isBackingUp 
              ? 'Guardando en la nube...' 
              : pendingChanges 
                ? 'Cambios pendientes' 
                : 'Backup en la nube'}
          </p>
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              {lastBackupTime 
                ? `Último backup: ${formatRelativeTime(lastBackupTime)}` 
                : 'Sin backups aún'}
            </p>
            {!pendingChanges && !isBackingUp && lastBackupTime && (
              <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
            )}
          </div>
        </div>
        
        {pendingChanges && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={forceBackup}
            disabled={isBackingUp}
            className="px-2 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] font-medium hover:shadow-md transition-all disabled:opacity-50 ml-2"
          >
            Guardar
          </motion.button>
        )}
      </div>
    );
  }
  
  // Versión flotante (fixed)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className={`${positionClasses[position]} z-40`}
      >
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 min-w-[200px]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              isBackingUp 
                ? 'bg-blue-500/20' 
                : pendingChanges 
                  ? 'bg-amber-500/20' 
                  : 'bg-emerald-500/20'
            }`}>
              {isBackingUp ? (
                <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
              ) : pendingChanges ? (
                <CloudUpload className="w-4 h-4 text-amber-500" />
              ) : (
                <Cloud className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {isBackingUp 
                  ? 'Guardando en la nube...' 
                  : pendingChanges 
                    ? 'Cambios pendientes' 
                    : 'Backup en la nube'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {lastBackupTime 
                    ? `Último backup: ${formatRelativeTime(lastBackupTime)}` 
                    : 'Sin backups aún'}
                </p>
                {!pendingChanges && !isBackingUp && lastBackupTime && (
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                )}
              </div>
            </div>
            
            {pendingChanges && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={forceBackup}
                disabled={isBackingUp}
                className="px-2 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] font-medium hover:shadow-md transition-all disabled:opacity-50"
              >
                Guardar
              </motion.button>
            )}
          </div>
          
          {isBackingUp && (
            <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                animate={{ width: ['0%', '30%', '60%', '80%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AutoBackupIndicator;