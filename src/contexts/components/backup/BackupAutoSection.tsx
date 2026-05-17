// src/contexts/components/backup/BackupAutoSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Upload, RotateCcw, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface BackupAutoSectionProps {
  isDarkMode: boolean;
  notesCount: number;
  isCreating: boolean;
  isRestoring: boolean;
  onCreateBackup: () => void;
  onImportBackup: () => void;
}

const BackupAutoSection: React.FC<BackupAutoSectionProps> = ({
  isDarkMode,
  notesCount,
  isCreating,
  isRestoring,
  onCreateBackup,
  onImportBackup
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full" />
        <h2 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          <RefreshCw size={14} />
          Backup Automático
        </h2>
      </div>

      <div className={`rounded-xl sm:rounded-2xl backdrop-blur-lg border overflow-hidden shadow-sm ${
        isDarkMode
          ? "bg-gray-800/60 border-gray-700/40"
          : "bg-white/80 border-white/90"
      }`}>
        <div className="p-4 sm:p-5 space-y-4">
          {/* Crear Backup */}
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
              {notesCount} notas
            </span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateBackup}
            disabled={isCreating || notesCount === 0}
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

          <hr className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`} />

          {/* Restaurar Backup */}
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
            onClick={onImportBackup}
            disabled={isRestoring}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all shadow-md disabled:opacity-50 text-sm sm:text-base"
          >
            {isRestoring ? (
              <>
                <LoadingSpinner size="sm" /> Restaurando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" /> Seleccionar Archivo y Restaurar
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default BackupAutoSection;