// src/contexts/components/backup/BackupFilterBar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Globe, HardDrive as LocalIcon, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

type BackupFilterType = 'all' | 'local' | 'cloud';

interface BackupFilterBarProps {
  isDarkMode: boolean;
  filterType: BackupFilterType;
  onFilterChange: (filter: BackupFilterType) => void;
  stats: { total: number; localCount: number; cloudCount: number };
  isSyncing: boolean;
  onSync: () => void;
  lastSyncTime: Date | null;
}

const BackupFilterBar: React.FC<BackupFilterBarProps> = ({
  isDarkMode,
  filterType,
  onFilterChange,
  stats,
  isSyncing,
  onSync,
  lastSyncTime
}) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Filter className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Mostrar:
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterType === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => onFilterChange('local')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
              filterType === 'local'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <LocalIcon className="w-3.5 h-3.5" />
            Locales ({stats.localCount})
          </button>
          <button
            onClick={() => onFilterChange('cloud')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
              filterType === 'cloud'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Nube ({stats.cloudCount})
          </button>
        </div>
      </div>

      {user && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSync}
          disabled={isSyncing}
          className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${
            isDarkMode
              ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30'
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
          } ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>Sincronizar con nube</span>
        </motion.button>
      )}

      {lastSyncTime && (
        <div className={`text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Última sincronización: {lastSyncTime.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default BackupFilterBar;