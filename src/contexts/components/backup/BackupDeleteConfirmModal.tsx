// src/contexts/components/backup/BackupDeleteConfirmModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface BackupDeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const BackupDeleteConfirmModal: React.FC<BackupDeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  isDeleting,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

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
          className="relative w-full max-w-md rounded-3xl overflow-hidden bg-white/20 backdrop-blur-2xl border-2 border-red-400/30 shadow-2xl"
        >
          <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              {title}
            </h3>
          </div>
          <div className="p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center backdrop-blur-sm">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <p className="text-center text-white mb-2">{message}</p>
            <p className="text-center text-xs text-red-300 mb-6">
              Esta acción no se puede deshacer
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium border border-white/20"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:via-pink-600 hover:to-rose-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    {confirmText}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BackupDeleteConfirmModal;