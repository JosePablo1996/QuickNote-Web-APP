// src/contexts/components/backup/RestoreOptionsModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Info,
  Database,
  HardDrive,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Note } from '../../../models/Note';
import { 
  RestoreMode, 
  restoreModeInfo, 
  getRestoreStats, 
  getModeImpact
} from '../../../utils/backupUtils';

interface RestoreOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mode: RestoreMode) => void;
  existingNotes: Note[];
  backupNotes: Note[];
  backupName: string;
  backupDate: string;
  backupNoteCount: number;
  isRestoring: boolean;
  source: 'local' | 'cloud';
}

export const RestoreOptionsModal: React.FC<RestoreOptionsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  existingNotes,
  backupNotes,
  backupName,
  backupDate,
  backupNoteCount,
  isRestoring,
  source,
}) => {
  const [selectedMode, setSelectedMode] = useState<RestoreMode>('merge');
  const [showDetails, setShowDetails] = useState(false);
  
  const stats = getRestoreStats(existingNotes, backupNotes);
  
  if (!isOpen) return null;
  
  const getSourceIcon = () => {
    return source === 'cloud' ? '☁️' : '💾';
  };
  
  const getSourceLabel = () => {
    return source === 'cloud' ? 'Nube' : 'Local';
  };
  
  const getSourceColor = () => {
    return source === 'cloud' ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500';
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header con gradiente */}
            <div className={`bg-gradient-to-r ${getSourceColor()} px-5 sm:px-6 py-4 sm:py-5`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Restaurar backup
                    </h2>
                    <p className="text-white/80 text-xs sm:text-sm mt-0.5">
                      {getSourceIcon()} Backup {getSourceLabel()} • {backupDate}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            {/* Contenido */}
            <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto">
              
              {/* Información del backup */}
              <div className={`mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl bg-gradient-to-r ${getSourceColor()} bg-opacity-10 border ${source === 'cloud' ? 'border-purple-500/30' : 'border-blue-500/30'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/10">
                      <HardDrive className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-sm">
                        {backupName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {backupNoteCount} nota{backupNoteCount !== 1 ? 's' : ''} • {source === 'cloud' ? 'Almacenado en la nube' : 'Almacenado localmente'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white">
                      {getSourceLabel()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Comparación rápida */}
              <div className="grid grid-cols-2 gap-3 mb-5 sm:mb-6">
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notas actuales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.existingCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notas en backup</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.backupCount}</p>
                </div>
              </div>
              
              {/* Título de selección */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Selecciona el modo de restauración
                </h3>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="ml-auto text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
                </button>
              </div>
              
              {/* Opciones de restauración */}
              <div className="space-y-3 mb-5 sm:mb-6">
                {(['replace', 'merge', 'add_new'] as RestoreMode[]).map((mode) => {
                  const info = restoreModeInfo[mode];
                  const isSelected = selectedMode === mode;
                  const impact = getModeImpact(mode, stats);
                  
                  return (
                    <motion.button
                      key={mode}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedMode(mode)}
                      className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `bg-gradient-to-r ${info.color} border-transparent shadow-lg`
                          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`text-2xl sm:text-3xl ${isSelected ? 'text-white' : ''}`}>
                          {info.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-bold text-sm sm:text-base ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                              {info.title}
                            </h4>
                            {mode === 'merge' && (
                              <span className="px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30">
                                Recomendado
                              </span>
                            )}
                          </div>
                          <p className={`text-xs sm:text-sm mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                            {info.description}
                          </p>
                          
                          {/* Detalles del impacto */}
                          {showDetails && (
                            <div className={`mt-2 p-2 rounded-lg text-xs ${isSelected ? 'bg-white/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
                              <div className="flex items-center gap-2">
                                <Database className="w-3 h-3" />
                                <span className={isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}>
                                  {impact}
                                </span>
                              </div>
                              {mode === 'replace' && (
                                <div className="flex items-center gap-2 mt-1 text-red-500 dark:text-red-400">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{info.warning}</span>
                                </div>
                              )}
                              {mode === 'merge' && stats.mergeWillAdd > 0 && (
                                <div className="flex items-center gap-2 mt-1 text-green-600 dark:text-green-400">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Se agregarán {stats.mergeWillAdd} nota{stats.mergeWillAdd !== 1 ? 's' : ''} nuevas</span>
                                </div>
                              )}
                              {mode === 'add_new' && stats.addNewWillAdd > 0 && (
                                <div className="flex items-center gap-2 mt-1 text-blue-600 dark:text-blue-400">
                                  <Sparkles className="w-3 h-3" />
                                  <span>Se agregarán {stats.addNewWillAdd} nota{stats.addNewWillAdd !== 1 ? 's' : ''} nuevas</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="text-white text-xl">✓</div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Resumen de estadísticas detalladas */}
              {showDetails && (
                <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Database className="w-3.5 h-3.5" />
                    Comparación detallada
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Notas actuales:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.existingCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Notas en backup:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.backupCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Notas nuevas (solo en backup):</span>
                      <span className="font-medium text-green-600 dark:text-green-400">+{stats.newCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Notas duplicadas (en ambas):</span>
                      <span className="font-medium text-yellow-600 dark:text-yellow-400">{stats.duplicateCount}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Advertencia final */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex gap-2">
                  <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Esta acción no se puede deshacer. Te recomendamos crear un backup de tus notas actuales antes de restaurar.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Footer con botones */}
            <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-col xs:flex-row gap-3">
                <button
                  onClick={onClose}
                  disabled={isRestoring}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm sm:text-base order-2 xs:order-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => onConfirm(selectedMode)}
                  disabled={isRestoring}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base order-1 xs:order-2"
                >
                  {isRestoring ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Restaurando...</span>
                    </>
                  ) : (
                    <>
                      <span>Restaurar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RestoreOptionsModal;