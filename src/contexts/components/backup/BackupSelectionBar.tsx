// src/contexts/components/backup/BackupSelectionBar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Square, Trash2 } from 'lucide-react';

interface BackupSelectionBarProps {
  isDarkMode: boolean;
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  isDeleting: boolean;
}

const BackupSelectionBar: React.FC<BackupSelectionBarProps> = ({
  isDarkMode,
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  isDeleting
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="sticky top-16 z-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg"
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onSelectAll}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            title={isAllSelected ? "Deseleccionar todo" : "Seleccionar todo"}
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
          <span className="font-medium">
            {selectedCount} backup{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClearSelection}
            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onDeleteSelected}
            disabled={selectedCount === 0 || isDeleting}
            className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar seleccionados
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BackupSelectionBar;