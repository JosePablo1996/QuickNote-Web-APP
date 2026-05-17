// src/contexts/components/backup/BackupManualSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, FileJson, AlertCircle } from 'lucide-react';
import { Note } from '../../../models/Note';

interface BackupManualSectionProps {
  isDarkMode: boolean;
  notes: Note[];
  isExporting: boolean;
  isImporting: boolean;
  onExport: () => void;
  onImport: () => void;
}

const BackupManualSection: React.FC<BackupManualSectionProps> = ({
  isDarkMode,
  notes,
  isExporting,
  isImporting,
  onExport,
  onImport
}) => {
  const activeNotes = notes.filter(n => !n.is_archived).length;
  const archivedNotes = notes.filter(n => n.is_archived).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
        <h2 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          <FileJson size={14} />
          Exportar / Importar Manual
        </h2>
      </div>

      <div className={`rounded-xl sm:rounded-2xl backdrop-blur-lg border overflow-hidden shadow-sm ${
        isDarkMode
          ? "bg-gray-800/60 border-gray-700/40"
          : "bg-white/80 border-white/90"
      }`}>
        {/* Exportar */}
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
              <p className="text-lg font-bold text-amber-500">{activeNotes}</p>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Activas</p>
            </div>
            <div className={`text-center p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <p className="text-lg font-bold text-blue-500">{archivedNotes}</p>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Archivadas</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExport}
            disabled={isExporting || notes.length === 0}
            className="w-full py-2.5 border-2 border-emerald-500 text-emerald-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" /> Descargar JSON
          </motion.button>
        </div>

        {/* Importar */}
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
            onClick={onImport}
            disabled={isImporting}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-orange-600 hover:to-amber-600 transition-all shadow-md disabled:opacity-50 text-sm sm:text-base"
          >
            {isImporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Importando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" /> Seleccionar archivo JSON
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default BackupManualSection;