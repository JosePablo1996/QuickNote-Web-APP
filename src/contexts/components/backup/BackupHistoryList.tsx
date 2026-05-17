// src/contexts/components/backup/BackupHistoryList.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { History, FileText, Globe, HardDrive as LocalIcon, RotateCcw, Download, Trash2, RefreshCw } from 'lucide-react';
import { BackupMetadata } from '../../../services/backup';
import LoadingSpinner from '../ui/LoadingSpinner';

interface BackupHistoryListProps {
  isDarkMode: boolean;
  backups: BackupMetadata[];
  isLoading: boolean;
  filterType: 'all' | 'local' | 'cloud';
  isRestoring: string | null;
  isDownloading: string | null;
  isDeleting: string | null;
  onRestore: (backup: BackupMetadata) => void;
  onDownload: (backup: BackupMetadata) => void;
  onDelete: (backup: BackupMetadata) => void;
}

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

const BackupHistoryList: React.FC<BackupHistoryListProps> = ({
  isDarkMode,
  backups,
  isLoading,
  filterType,
  isRestoring,
  isDownloading,
  isDeleting,
  onRestore,
  onDownload,
  onDelete
}) => {
  const getFilterTitle = () => {
    if (filterType === 'local') return 'Locales';
    if (filterType === 'cloud') return 'Nube';
    return '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
        <h2 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          <History size={14} />
          Historial de Backups {filterType !== 'all' && `(${getFilterTitle()})`}
        </h2>
      </div>

      <div className={`rounded-xl sm:rounded-2xl backdrop-blur-lg border overflow-hidden shadow-sm ${
        isDarkMode
          ? "bg-gray-800/60 border-gray-700/40"
          : "bg-white/80 border-white/90"
      }`}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" text="Cargando backups..." />
          </div>
        ) : backups.length === 0 ? (
          <div className="p-8 text-center">
            <History className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
            <p className={`font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              {filterType === 'all' && 'No hay backups aún'}
              {filterType === 'local' && 'No hay backups locales'}
              {filterType === 'cloud' && 'No hay backups en la nube'}
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
              {filterType === 'all' && 'Crea tu primer backup para proteger tus notas'}
              {filterType === 'local' && 'Crea un backup local desde el botón "Crear Backup"'}
              {filterType === 'cloud' && 'Conéctate a internet y sincroniza tus backups'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {backups.map((backup) => {
              const isCloudBackup = backup.source === 'cloud';
              return (
                <motion.div
                  key={backup.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 sm:p-5 flex items-center gap-4 ${
                    backup.is_latest && !isCloudBackup
                      ? isDarkMode ? "bg-emerald-900/20" : "bg-emerald-50"
                      : ""
                  }`}
                >
                  {/* Icono */}
                  <div className={`p-2 rounded-lg ${
                    isCloudBackup
                      ? "bg-purple-500/20"
                      : backup.is_latest ? "bg-emerald-500/20" : "bg-blue-500/20"
                  }`}>
                    {isCloudBackup ? (
                      <Globe className="w-5 h-5 text-purple-500" />
                    ) : (
                      <FileText className={`w-5 h-5 ${backup.is_latest ? "text-emerald-500" : "text-blue-500"}`} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`font-medium text-sm truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {backup.file_name}
                      </span>
                      
                      {/* Badge de origen */}
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full flex items-center gap-1 ${
                        isCloudBackup
                          ? 'bg-purple-500/20 text-purple-500'
                          : 'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {isCloudBackup ? (
                          <><Globe className="w-2.5 h-2.5" /> Nube</>
                        ) : (
                          <><LocalIcon className="w-2.5 h-2.5" /> Local</>
                        )}
                      </span>
                      
                      {backup.is_latest && !isCloudBackup && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-500 rounded-full">
                          ÚLTIMO
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>📝 {backup.note_count} notas</span>
                      <span>📦 {formatFileSize(backup.file_size)}</span>
                      <span>🕒 {formatDate(backup.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => onRestore(backup)}
                      disabled={isRestoring === backup.id}
                      className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                      title={`Restaurar desde ${isCloudBackup ? 'la nube' : 'local'}`}
                    >
                      {isRestoring === backup.id ? <LoadingSpinner size="sm" /> : <RotateCcw className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onDownload(backup)}
                      disabled={isDownloading === backup.id}
                      className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                      title="Descargar"
                    >
                      {isDownloading === backup.id ? <LoadingSpinner size="sm" /> : <Download className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onDelete(backup)}
                      disabled={isDeleting === backup.id}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      title={`Eliminar ${isCloudBackup ? 'de la nube' : 'local'}`}
                    >
                      {isDeleting === backup.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupHistoryList;