// src/contexts/components/backup/BackupModals.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Trash2, 
  XCircle,
  History
} from 'lucide-react';
import { BackupMetadata, BackupLimitInfo } from '../../../services/backup';
import LoadingSpinner from '../ui/LoadingSpinner';
import BackupLimitModal from './BackupLimitModal';
import BackupDeleteConfirmModal from './BackupDeleteConfirmModal';

interface BackupModalsProps {
  isDarkMode: boolean;
  
  // Modal de progreso
  showProgressModal: boolean;
  backupProgress: number;
  progressText: string;
  
  // Modal de éxito - Exportación
  showSuccessModal: boolean;
  modalNoteCount: number;
  modalFileName: string;
  onCloseSuccess: () => void;
  
  // Modal de éxito - Restauración
  showRestoreModal: boolean;
  modalImportedCount: number;
  modalTotalCount: number;
  onCloseRestore: () => void;
  
  // Modal de confirmación - Eliminar un backup
  showDeleteModal: BackupMetadata | null;
  isDeleting: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  
  // Modal de confirmación - Eliminar todos los backups
  showDeleteAllModal: boolean;
  isDeletingAll: boolean;
  backupsCount: number;
  onCancelDeleteAll: () => void;
  onConfirmDeleteAll: () => void;
  
  // Modal de confirmación - Eliminar historial
  showDangerModal: boolean;
  onCancelDanger: () => void;
  onConfirmDanger: () => void;
  
  // Modal de confirmación - Restablecer contador
  showResetModal: boolean;
  onCancelReset: () => void;
  onConfirmReset: () => void;
  
  // Modal de sincronización
  showSyncModal: boolean;
  isSyncing: boolean;
  syncResult: { synced: number; failed: number } | null;
  onCloseSync: () => void;

  // ✅ NUEVO: Modal de límite de backups
  showLimitModal: boolean;
  limitInfo: BackupLimitInfo | null;
  isDeletingOldest: boolean;
  onDeleteOldest: () => void;
  onDeleteAllFromLimit: () => void;
  onCloseLimitModal: () => void;
  formatFileSize: (bytes: number) => string;

  // ✅ NUEVO: Modal de eliminación de seleccionados
  showDeleteSelectedModal: boolean;
  selectedCount: number;
  isDeletingSelected: boolean;
  onConfirmDeleteSelected: () => void;
  onCancelDeleteSelected: () => void;
}

const getProgressColor = (progress: number): string => {
  if (progress < 33) return "bg-yellow-500";
  if (progress < 66) return "bg-orange-500";
  return "bg-emerald-500";
};

const BackupModals: React.FC<BackupModalsProps> = ({
  isDarkMode,
  showProgressModal,
  backupProgress,
  progressText,
  showSuccessModal,
  modalNoteCount,
  modalFileName,
  onCloseSuccess,
  showRestoreModal,
  modalImportedCount,
  modalTotalCount,
  onCloseRestore,
  showDeleteModal,
  isDeleting,
  onCancelDelete,
  onConfirmDelete,
  showDeleteAllModal,
  isDeletingAll,
  backupsCount,
  onCancelDeleteAll,
  onConfirmDeleteAll,
  showDangerModal,
  onCancelDanger,
  onConfirmDanger,
  showResetModal,
  onCancelReset,
  onConfirmReset,
  showSyncModal,
  isSyncing,
  syncResult,
  onCloseSync,
  // ✅ Nuevos props
  showLimitModal,
  limitInfo,
  isDeletingOldest,
  onDeleteOldest,
  onDeleteAllFromLimit,
  onCloseLimitModal,
  formatFileSize,
  showDeleteSelectedModal,
  selectedCount,
  isDeletingSelected,
  onConfirmDeleteSelected,
  onCancelDeleteSelected
}) => {
  return (
    <>
      {/* Modal de Progreso */}
      <AnimatePresence>
        {showProgressModal && (
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
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                <RefreshCw className="w-10 h-10 text-purple-300 mx-auto animate-spin mb-4" />
                <h3 className="text-lg font-bold mb-2 text-white">{progressText || "Procesando..."}</h3>
                <div className="w-full bg-white/20 rounded-full h-3 mb-2 overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className={`h-full rounded-full ${getProgressColor(backupProgress)}`}
                    animate={{ width: `${backupProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-2xl font-bold text-white">{backupProgress}%</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Éxito - Exportación */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">✅ Backup Completado</h3>
              <p className="text-blue-100 mb-1">Se exportaron {modalNoteCount} notas.</p>
              <p className="text-xs text-blue-200/70 mb-4 truncate">{modalFileName}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCloseSuccess}
                className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl font-semibold hover:from-green-500 hover:to-blue-600 transition-all shadow-lg"
              >
                Aceptar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Éxito - Restauración */}
      <AnimatePresence>
        {showRestoreModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center"
            >
              {modalImportedCount < modalTotalCount ? (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">⚠️ Restauración Parcial</h3>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">✅ Restauración Completada</h3>
                </>
              )}
              <p className="text-blue-100 mb-1">
                Se importaron {modalImportedCount} de {modalTotalCount} notas.
              </p>
              {modalImportedCount < modalTotalCount && (
                <p className="text-xs text-amber-300 mb-4">
                  {modalTotalCount - modalImportedCount} notas no pudieron ser importadas.
                </p>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCloseRestore}
                className={`w-full py-3 text-white rounded-xl font-semibold shadow-lg transition-all ${
                  modalImportedCount < modalTotalCount
                    ? "bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500"
                    : "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
                }`}
              >
                Aceptar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación - Eliminar un backup */}
      <AnimatePresence>
        {showDeleteModal && (
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
                  Eliminar backup
                </h3>
              </div>
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center backdrop-blur-sm">
                    <Trash2 className="w-8 h-8 text-red-400" />
                  </div>
                </div>
                <p className="text-center text-white mb-2">
                  ¿Eliminar este backup{showDeleteModal.source === 'cloud' ? ' de la nube' : ''}?
                </p>
                <p className="text-center text-sm text-blue-100 mb-4 truncate">
                  {showDeleteModal.file_name}
                </p>
                <p className="text-center text-xs text-red-300 mb-6">
                  Esta acción no se puede deshacer
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onCancelDelete}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium border border-white/20"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={onConfirmDelete}
                    disabled={isDeleting === showDeleteModal.id}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:via-pink-600 hover:to-rose-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting === showDeleteModal.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        <span>Eliminar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación - Eliminar todos los backups */}
      <AnimatePresence>
        {showDeleteAllModal && (
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
                  Eliminar todos los backups
                </h3>
              </div>
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center backdrop-blur-sm">
                    <Trash2 className="w-8 h-8 text-red-400" />
                  </div>
                </div>
                <p className="text-center text-white mb-2">
                  ¿Eliminar todos los backups?
                </p>
                <p className="text-center text-sm text-blue-100 mb-4">
                  Se eliminarán {backupsCount} backup{backupsCount !== 1 ? "s" : ""}
                </p>
                <p className="text-center text-xs text-red-300 mb-6">
                  ⚠️ Esta acción no se puede deshacer
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onCancelDeleteAll}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium border border-white/20"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={onConfirmDeleteAll}
                    disabled={isDeletingAll}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:via-pink-600 hover:to-rose-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeletingAll ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        <span>Eliminar todo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación - Eliminar Historial */}
      <AnimatePresence>
        {showDangerModal && (
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
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">⚠️ ¿Estás seguro?</h3>
                <p className="text-blue-100 mb-1 text-sm">
                  Esta acción eliminará <strong>todo el historial de backups</strong>.
                </p>
                <p className="text-xs text-red-300 mb-4">
                  Las notas NO se eliminarán, solo los registros de copias realizadas.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onCancelDanger}
                    className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all text-sm border border-white/20"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onConfirmDanger}
                    className="flex-1 py-2.5 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white rounded-xl font-medium hover:from-red-600 hover:via-pink-600 hover:to-rose-600 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sí, eliminar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación - Restablecer Contador */}
      <AnimatePresence>
        {showResetModal && (
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
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">🔄 ¿Restablecer contador?</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  El contador de "Última copia" volverá a cero. El historial se mantendrá.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onCancelReset}
                    className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all text-sm border border-white/20"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onConfirmReset}
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl font-medium hover:from-amber-500 hover:to-orange-500 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restablecer
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Sincronización */}
      <AnimatePresence>
        {showSyncModal && (
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
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-12 h-12 text-purple-300 mx-auto animate-spin mb-4" />
                    <h3 className="text-lg font-bold mb-2 text-white">Sincronizando...</h3>
                    <p className="text-sm text-blue-100">
                      Subiendo backups locales a la nube
                    </p>
                  </>
                ) : syncResult ? (
                  <>
                    {syncResult.synced > 0 ? (
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    ) : (
                      <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    )}
                    <h3 className="text-lg font-bold mb-2 text-white">
                      {syncResult.synced > 0 ? 'Sincronización Completada' : 'Sin cambios'}
                    </h3>
                    <p className="text-sm text-blue-100 mb-2">
                      ✅ {syncResult.synced} backups sincronizados
                    </p>
                    {syncResult.failed > 0 && (
                      <p className="text-sm text-red-300 mb-4">
                        ❌ {syncResult.failed} fallidos
                      </p>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onCloseSync}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium"
                    >
                      Cerrar
                    </motion.button>
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ NUEVO: Modal de Límite de Backups */}
      <BackupLimitModal
        isOpen={showLimitModal}
        limitInfo={limitInfo}
        isDeleting={isDeletingOldest}
        onDeleteOldest={onDeleteOldest}
        onDeleteAll={onDeleteAllFromLimit}
        onClose={onCloseLimitModal}
        formatFileSize={formatFileSize}
      />

      {/* ✅ NUEVO: Modal de Eliminación de Seleccionados */}
      <BackupDeleteConfirmModal
        isOpen={showDeleteSelectedModal}
        title={`Eliminar ${selectedCount} backup${selectedCount !== 1 ? 's' : ''}`}
        message={`¿Eliminar ${selectedCount} backup${selectedCount !== 1 ? 's' : ''} permanentemente?`}
        confirmText="Eliminar todo"
        isDeleting={isDeletingSelected}
        onConfirm={onConfirmDeleteSelected}
        onCancel={onCancelDeleteSelected}
      />
    </>
  );
};

export default BackupModals;