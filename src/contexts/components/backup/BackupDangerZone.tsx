// src/contexts/components/backup/BackupDangerZone.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Trash2, History, RefreshCw } from 'lucide-react';

interface BackupHistoryEntry {
  date: string;
  noteCount: number;
  fileName: string;
  timestamp: number;
}

interface BackupDangerZoneProps {
  isDarkMode: boolean;
  backupHistory: BackupHistoryEntry[];
  onClearHistory: () => void;
  onResetCounter: () => void;
}

const BackupDangerZone: React.FC<BackupDangerZoneProps> = ({
  isDarkMode,
  backupHistory,
  onClearHistory,
  onResetCounter
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-pink-500 rounded-full" />
        <h2 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          <ShieldAlert size={14} className="text-red-500" />
          Zona de Peligro
        </h2>
      </div>

      <div className="rounded-xl sm:rounded-2xl border-2 border-red-500/30 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 px-4 sm:px-6 py-3">
          <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
            <AlertTriangle className="w-5 h-5" />
            Zona de Peligro
          </h3>
          <p className="text-red-100 text-xs mt-0.5">
            Estas acciones son irreversibles. Úsalas con precaución.
          </p>
        </div>

        <div className={`p-4 sm:p-5 space-y-4 ${isDarkMode ? "bg-gray-800/60" : "bg-white/80"}`}>
          {/* Historial de backups */}
          <div>
            <h4 className={`font-semibold text-sm sm:text-base flex items-center gap-2 mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              <History className="w-4 h-4 text-gray-500" />
              Historial de Backups Realizados
            </h4>
            {backupHistory.length === 0 ? (
              <div className={`text-center py-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No hay backups registrados aún.</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {backupHistory.slice(0, 5).map((entry, index) => (
                  <div key={index} className={`flex items-center justify-between p-2.5 rounded-lg text-xs sm:text-sm ${
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{entry.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {entry.noteCount} notas
                      </span>
                      <span className={`text-[10px] truncate max-w-[100px] ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {entry.fileName}
                      </span>
                    </div>
                  </div>
                ))}
                {backupHistory.length > 5 && (
                  <p className={`text-center text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    +{backupHistory.length - 5} backups más
                  </p>
                )}
              </div>
            )}
          </div>

          <hr className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`} />

          <div className="space-y-3">
            {/* Eliminar historial */}
            <div className={`p-3 rounded-xl border border-red-500/20 ${isDarkMode ? "bg-red-500/5" : "bg-red-50"}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-red-500/10 rounded-lg flex-shrink-0">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h4 className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Eliminar historial de backups
                  </h4>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Se perderán todos los registros de copias de seguridad realizadas. Las notas NO se eliminarán.
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClearHistory}
                className="w-full py-2.5 border-2 border-red-500 text-red-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar todo el historial
              </motion.button>
            </div>

            {/* Restablecer contador */}
            <div className={`p-3 rounded-xl border border-amber-500/20 ${isDarkMode ? "bg-amber-500/5" : "bg-amber-50"}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-amber-500/10 rounded-lg flex-shrink-0">
                  <RefreshCw className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h4 className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Restablecer contador
                  </h4>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Vuelve el contador de "Última copia" a cero sin eliminar el historial.
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={onResetCounter}
                className="w-full py-2.5 border-2 border-amber-500 text-amber-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-white transition-all text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Restablecer contador
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupDangerZone;