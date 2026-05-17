// src/contexts/components/backup/BackupStatsCards.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Database, Cloud, Clock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { BackupMetadata } from '../../../services/backup';
import { useAuth } from '../../../hooks/useAuth';
import { api, CloudBackupMetadata } from '../../../services/api';

interface BackupStats {
  totalNotes: number;
  lastBackup: BackupMetadata | null;
  notesSinceLastBackup: number;
  needsBackup: boolean;
}

interface BackupStatsCardsProps {
  isDarkMode: boolean;
  backups: BackupMetadata[];
  backupStats: BackupStats;
  totalBackupSize: number;
  cloudBackups: CloudBackupMetadata[];
  isLoadingCloud: boolean;
  onRefresh?: () => void;
}

const MAX_CLOUD_BACKUPS = 10;

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'Nunca';
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const BackupStatsCards: React.FC<BackupStatsCardsProps> = ({
  isDarkMode,
  backups,
  backupStats,
  totalBackupSize,
  cloudBackups,
  isLoadingCloud,
  onRefresh
}) => {
  const localCount = backups.filter(b => b.source === 'local' || !b.source).length;
  const cloudCount = cloudBackups.length;
  const cloudRemaining = MAX_CLOUD_BACKUPS - cloudCount;
  
  const latestCloudBackup = cloudBackups.length > 0 
    ? cloudBackups.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;

  const statsCards = [
    {
      id: 'total-notes',
      title: 'Total Notas',
      value: backupStats.totalNotes,
      icon: <HardDrive className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-500',
      subValue: `${backupStats.totalNotes} notas en total`
    },
    {
      id: 'local-backups',
      title: 'Backups Locales',
      value: localCount,
      icon: <Database className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
      subValue: `${formatFileSize(totalBackupSize)} usado`
    },
    {
      id: 'cloud-backups',
      title: 'Backups en la Nube',
      value: cloudCount,
      icon: <Cloud className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500',
      subValue: `${cloudRemaining} de ${MAX_CLOUD_BACKUPS} disponibles`,
      badge: cloudRemaining <= 2 && cloudRemaining > 0 ? '⚠️ Pocos espacios' : cloudRemaining === 0 ? '🔴 Lleno' : null
    },
    {
      id: 'last-backup',
      title: 'Último Backup',
      value: formatDate(backupStats.lastBackup?.created_at || null),
      icon: <Clock className="w-5 h-5" />,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
      subValue: backupStats.lastBackup ? `${backupStats.lastBackup.note_count} notas` : null
    }
  ];

  return (
    <div className="space-y-4">
      {/* Grid de estadísticas - 2 columnas en móvil, 4 en desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative overflow-hidden rounded-2xl p-4 border backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] group ${
              isDarkMode
                ? 'bg-gray-800/60 border-gray-700/50 hover:border-gray-600'
                : 'bg-white/80 border-white/60 hover:border-gray-200'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${card.bgColor}`}>
                  <div className={card.textColor}>{card.icon}</div>
                </div>
                {card.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    card.badge.includes('⚠️') 
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {card.badge}
                  </span>
                )}
              </div>
              
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {card.value}
              </p>
              
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {card.title}
              </p>
              
              {card.subValue && (
                <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {card.subValue}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tarjeta de último backup en la nube */}
      {latestCloudBackup && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`relative overflow-hidden rounded-2xl p-4 border backdrop-blur-sm transition-all duration-200 ${
            isDarkMode
              ? 'bg-indigo-900/20 border-indigo-500/30'
              : 'bg-indigo-50/80 border-indigo-200'
          }`}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-2 rounded-xl bg-indigo-500/10">
              <Cloud className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ☁️ Último backup en la nube
                </p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {formatDate(latestCloudBackup.created_at)}
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {latestCloudBackup.note_count} notas • {formatFileSize(latestCloudBackup.file_size)}
              </p>
            </div>
            {isLoadingCloud && (
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </motion.div>
      )}

      {/* Alerta de backup pendiente */}
      {backupStats.lastBackup && backupStats.notesSinceLastBackup > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center gap-3 p-3 rounded-xl border ${
            isDarkMode
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
            <AlertCircle className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
              {backupStats.notesSinceLastBackup} nota(s) nueva(s) desde el último backup
            </p>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-amber-400/70' : 'text-amber-600'}`}>
              Recomendamos crear un nuevo backup
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              Actualizar
            </button>
          )}
        </motion.div>
      )}

      {/* Tarjeta de seguridad */}
      <div className={`flex items-start gap-2 p-3 rounded-xl ${
        isDarkMode
          ? 'bg-green-500/5 border border-green-500/20'
          : 'bg-green-50 border border-green-200'
      }`}>
        <Shield className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
        <div className="flex-1">
          <p className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
            🔒 Seguridad de tus datos:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1">
            <p className={`text-[10px] flex items-center gap-1 ${isDarkMode ? 'text-green-400/70' : 'text-green-600'}`}>
              <CheckCircle className="w-3 h-3" /> Backups locales en JSON
            </p>
            <p className={`text-[10px] flex items-center gap-1 ${isDarkMode ? 'text-green-400/70' : 'text-green-600'}`}>
              <CheckCircle className="w-3 h-3" /> Backups en la nube con RLS
            </p>
            <p className={`text-[10px] flex items-center gap-1 ${isDarkMode ? 'text-green-400/70' : 'text-green-600'}`}>
              <CheckCircle className="w-3 h-3" /> Hasta {MAX_CLOUD_BACKUPS} backups en la nube
            </p>
            <p className={`text-[10px] flex items-center gap-1 ${isDarkMode ? 'text-green-400/70' : 'text-green-600'}`}>
              <CheckCircle className="w-3 h-3" /> Sincronización automática
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupStatsCards;