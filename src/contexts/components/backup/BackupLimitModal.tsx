// src/contexts/components/backup/BackupLimitModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, HardDrive, RefreshCw } from 'lucide-react';
import { BackupLimitInfo } from '../../../services/backup';
import LoadingSpinner from '../ui/LoadingSpinner';

interface BackupLimitModalProps {
  isOpen: boolean;
  limitInfo: BackupLimitInfo | null;
  isDeleting: boolean;
  onDeleteOldest: () => void;
  onDeleteAll: () => void;
  onClose: () => void;
  formatFileSize: (bytes: number) => string;
}

const BackupLimitModal: React.FC<BackupLimitModalProps> = ({
  isOpen,
  limitInfo,
  isDeleting,
  onDeleteOldest,
  onDeleteAll,
  onClose,
  formatFileSize
}) => {
  if (!isOpen || !limitInfo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md rounded-3xl overflow-hidden bg-white/20 backdrop-blur-2xl border-2 border-amber-500/30 shadow-2xl"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Límite de Backups Alcanzado
            </h3>
          </div>
          <div className="p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 flex items-center justify-center backdrop-blur-sm">
                <HardDrive className="w-8 h-8 text-amber-400" />
              </div>
            </div>
            <p className="text-center text-white mb-2">
              Has alcanzado el límite de {limitInfo.max} backups.
            </p>
            <p className="text-center text-sm text-blue-100 mb-4">
              Para crear nuevos backups, debes liberar espacio eliminando algunos existentes.
            </p>
            <div className="bg-white/10 rounded-xl p-3 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/80">Estado actual:</span>
                <span className="text-white font-bold">{limitInfo.current}/{limitInfo.max} backups</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  style={{ width: `${(limitInfo.current / limitInfo.max) * 100}%` }}
                />
              </div>
              <p className="text-xs text-white/60 mt-2">
                📦 Espacio usado: {formatFileSize(limitInfo.totalSize)}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDeleteOldest}
                disabled={isDeleting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Eliminar los más antiguos (mantener 5)
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDeleteAll}
                disabled={isDeleting}
                className="w-full py-3 border-2 border-red-500 text-red-400 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Eliminar todos los backups
                  </>
                )}
              </motion.button>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BackupLimitModal;