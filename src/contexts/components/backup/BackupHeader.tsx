// src/contexts/components/backup/BackupHeader.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { User } from '../../../models/User';

interface BackupHeaderProps {
  isDarkMode: boolean;
  onBack: () => void;
  user: User | null;
}

const BackupHeader: React.FC<BackupHeaderProps> = ({ isDarkMode, onBack, user }) => {
  return (
    <div className="sticky top-0 z-10 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              aria-label="Volver a configuración"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Copias de Seguridad
              </h1>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2) || "U"
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupHeader;