// src/contexts/components/ui/ViewToggle.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, List } from 'lucide-react';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  className?: string;
  showLabel?: boolean;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewChange,
  className = '',
  showLabel = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-1 p-1 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Botón de Vista Grid */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onViewChange('grid')}
        className={`
          relative px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2
          ${viewMode === 'grid' 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        `}
        aria-label="Vista en cuadrícula"
        title="Vista en cuadrícula"
      >
        <Grid3x3 className="w-4 h-4" />
        {showLabel && <span className="text-sm font-medium">Grid</span>}
      </motion.button>

      {/* Botón de Vista Lista */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onViewChange('list')}
        className={`
          relative px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2
          ${viewMode === 'list' 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        `}
        aria-label="Vista en lista"
        title="Vista en lista"
      >
        <List className="w-4 h-4" />
        {showLabel && <span className="text-sm font-medium">Lista</span>}
      </motion.button>
    </div>
  );
};

export default ViewToggle;