// src/pages/BackupPage.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useNotes } from "../hooks/useNotes";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { backupService, BackupMetadata } from "../services/backup";
import { api, CloudBackupMetadata } from "../services/api";
import LoadingSpinner from "../contexts/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Cloud,
  HardDrive,
  ShieldAlert,
  Info,
  Database,
  BarChart3,
} from "lucide-react";

// Componentes importados
import BackupStatsCards from "../contexts/components/backup/BackupStatsCards";
import BackupLocalSection from "../contexts/components/backup/BackupLocalSection";
import CloudBackupSection from "../contexts/components/backup/CloudBackupSection";
import BackupSchedulerSettings from "../contexts/components/backup/BackupSchedulerSettings";
import BackupDangerZone from "../contexts/components/backup/BackupDangerZone";

// ============================================
// TIPOS
// ============================================

type TabType = 'overview' | 'local' | 'cloud';

interface BackupHistoryEntry {
  date: string;
  noteCount: number;
  fileName: string;
  timestamp: number;
}

// ============================================
// COMPONENTE DE PESTAÑAS (CENTRADO CON CONTADORES)
// ============================================

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}> = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
      active
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
        : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-gray-200'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
    {count !== undefined && count > 0 && (
      <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
        active ? 'bg-white/20 text-white' : 'bg-gray-500/20 text-gray-500'
      }`}>
        {count}
      </span>
    )}
  </button>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const BackupPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { notes } = useNotes();
  const { user } = useAuth();
  const { success, error: showError, info, warning } = useToast();

  // Estado de pestaña activa
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Estados de backups para el resumen
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backupStats, setBackupStats] = useState({
    totalNotes: 0,
    lastBackup: null as BackupMetadata | null,
    notesSinceLastBackup: 0,
    needsBackup: false,
  });
  const [totalBackupSize, setTotalBackupSize] = useState(0);
  
  // ✅ NUEVO: Estado para backups en la nube (contador)
  const [cloudBackups, setCloudBackups] = useState<CloudBackupMetadata[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);

  // Historial de backups (localStorage)
  const [backupHistory, setBackupHistory] = useState<BackupHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem("quicknote_backup_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ============================================
  // FUNCIONES DE CARGA
  // ============================================

  const loadBackups = async () => {
    try {
      setIsLoading(true);
      const data = await backupService.getBackups();
      setBackups(data);
      
      const total = data.reduce((acc, b) => acc + b.file_size, 0);
      setTotalBackupSize(total);
    } catch (error) {
      showError("Error al cargar los backups");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NUEVO: Cargar backups de la nube para el contador
  const loadCloudBackups = async () => {
    try {
      setIsLoadingCloud(true);
      const cloudData = await api.getCloudBackups();
      setCloudBackups(cloudData);
    } catch (error) {
      console.error("Error cargando backups de la nube:", error);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  const loadStats = useCallback(async () => {
    try {
      const stats = await backupService.getBackupStats(notes);
      setBackupStats(stats);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  }, [notes]);

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    loadBackups();
    loadCloudBackups(); // ✅ Cargar backups de la nube
  }, []);

  useEffect(() => {
    if (notes.length > 0 || backups.length > 0) {
      loadStats();
    }
  }, [notes, backups, loadStats]);

  useEffect(() => {
    localStorage.setItem("quicknote_backup_history", JSON.stringify(backupHistory));
  }, [backupHistory]);

  // ============================================
  // FUNCIONES DE ZONA DE PELIGRO
  // ============================================

  const handleClearHistory = () => {
    setBackupHistory([]);
    localStorage.removeItem("quicknote_backup_history");
    success("Historial de backups eliminado");
  };

  const handleResetCounter = () => {
    success("Contador restablecido");
  };

  // Obtener conteo de backups locales
  const localBackupsCount = backups.filter(b => b.source === 'local' || !b.source).length;
  
  // ✅ Obtener conteo de backups en la nube
  const cloudBackupsCount = cloudBackups.length;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      {/* HEADER */}
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/settings")}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
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
                    <img src={user.avatar} alt={user.name || ""} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.split(" ").map((w) => w[0]).join("").toUpperCase().substring(0, 2) || "U"
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BANNER DECORATIVO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-32 md:h-40 w-full overflow-hidden rounded-2xl shadow-2xl"
        >
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }} />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl" />
            <div className="relative z-10 flex flex-col items-center space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-2xl tracking-tight">
                Quick<span className="text-amber-300">Note</span>
              </h2>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                <HardDrive className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-white font-medium text-xs md:text-sm">
                  Sistema de Copias de Seguridad
                </span>
              </div>
            </div>
            <div className="absolute top-2 right-3">
              <span className="inline-flex items-center px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] font-medium border border-white/30">
                v 2.6.0
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ✅ PESTAÑAS CENTRADAS CON CONTADORES */}
        <div className="flex justify-center mb-6">
          <div className="flex flex-wrap gap-2 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={<BarChart3 className="w-4 h-4" />}
              label="Resumen General"
            />
            <TabButton
              active={activeTab === 'local'}
              onClick={() => setActiveTab('local')}
              icon={<Database className="w-4 h-4" />}
              label="Respaldos Locales"
              count={localBackupsCount}
            />
            <TabButton
              active={activeTab === 'cloud'}
              onClick={() => setActiveTab('cloud')}
              icon={<Cloud className="w-4 h-4" />}
              label="Respaldos en la Nube"
              count={cloudBackupsCount} // ✅ AHORA MUESTRA EL CONTADOR
            />
          </div>
        </div>

        {/* CONTENIDO SEGÚN PESTAÑA */}
        <AnimatePresence mode="wait">
          {/* Pestaña 1: Resumen General */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Estadísticas */}
              <BackupStatsCards
                isDarkMode={isDarkMode}
                backups={backups}
                backupStats={backupStats}
                totalBackupSize={totalBackupSize}
                onRefresh={loadBackups}
              />

              {/* Backup Programado */}
              <BackupSchedulerSettings onBackupComplete={loadBackups} />

              {/* Zona de Peligro */}
              <BackupDangerZone
                isDarkMode={isDarkMode}
                backupHistory={backupHistory}
                onClearHistory={handleClearHistory}
                onResetCounter={handleResetCounter}
              />

              {/* Información */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-1 h-5 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full" />
                  <h2 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <Info size={14} />
                    Información
                  </h2>
                </div>
                <div className={`rounded-xl backdrop-blur-lg border p-4 sm:p-5 ${
                  isDarkMode ? "bg-gray-800/60 border-gray-700/40" : "bg-white/80 border-white/90"
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mt-0.5" />
                      <span className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Formato JSON compatible
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mt-0.5" />
                      <span className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Incluye título, contenido, color, etiquetas y más
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mt-0.5" />
                      <span className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Las notas importadas se agregan sin eliminar las existentes
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-500 mt-0.5" />
                      <span className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Al restaurar, las notas actuales serán reemplazadas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Pestaña 2: Respaldos Locales */}
          {activeTab === 'local' && (
            <motion.div
              key="local"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <BackupLocalSection onBackupChange={loadBackups} />
            </motion.div>
          )}

          {/* Pestaña 3: Respaldos en la Nube */}
          {activeTab === 'cloud' && (
            <motion.div
              key="cloud"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CloudBackupSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BackupPage;