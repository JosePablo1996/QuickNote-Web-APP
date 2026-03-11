import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  List,
  ArrowUpDown,
  RefreshCw,
  Upload,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Tag,
  Star,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  HelpCircle,
  FileText,
  Grid3x3,
  Rows,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface NoteMenuProps {
  onViewList: () => void;
  onSort: () => void;
  onSync: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onFilter?: () => void;
  currentView?: 'grid' | 'list';
  sortBy?: 'date' | 'title' | 'favorite';
  sortDirection?: 'asc' | 'desc';
  filterArchived?: boolean;
  filterFavorites?: boolean;
  hasPendingSync?: boolean;
  lastSyncTime?: Date | null;
}

const NoteMenu: React.FC<NoteMenuProps> = ({
  onViewList,
  onSort,
  onSync,
  onImport,
  onExport,
  onFilter,
  currentView = 'grid',
  sortBy = 'date',
  sortDirection = 'desc',
  filterArchived = false,
  filterFavorites = false,
  hasPendingSync = false,
  lastSyncTime = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      await onSync();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-5 h-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      default:
        return <RefreshCw className="w-5 h-5" />;
    }
  };

  const getSyncColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'from-blue-500 to-purple-500';
      case 'success':
        return 'from-green-500 to-emerald-500';
      case 'error':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const menuSections = [
    {
      title: 'Vista',
      icon: <Eye className="w-4 h-4" />,
      items: [
        {
          icon: currentView === 'grid' ? <Grid3x3 className="w-5 h-5" /> : <Rows className="w-5 h-5" />,
          label: currentView === 'grid' ? 'Vista cuadrícula' : 'Vista lista',
          description: `Cambiar a vista ${currentView === 'grid' ? 'lista' : 'cuadrícula'}`,
          onClick: onViewList,
          color: 'blue',
          badge: currentView === 'grid' ? 'Activa' : undefined,
        },
      ],
    },
    {
      title: 'Ordenar',
      icon: <ArrowUpDown className="w-4 h-4" />,
      items: [
        {
          icon: <SortAsc className="w-5 h-5" />,
          label: 'Por fecha',
          description: `Ordenar por fecha (${sortDirection === 'desc' ? 'reciente primero' : 'antiguo primero'})`,
          onClick: onSort,
          color: 'green',
          badge: sortBy === 'date' ? '✓' : undefined,
        },
        {
          icon: <SortDesc className="w-5 h-5" />,
          label: 'Por título',
          description: 'Ordenar alfabéticamente',
          onClick: onSort,
          color: 'orange',
          badge: sortBy === 'title' ? '✓' : undefined,
        },
        {
          icon: <Star className="w-5 h-5" />,
          label: 'Por favoritos',
          description: 'Favoritos primero',
          onClick: onSort,
          color: 'yellow',
          badge: sortBy === 'favorite' ? '✓' : undefined,
        },
      ],
    },
    {
      title: 'Filtros',
      icon: <Filter className="w-4 h-4" />,
      items: [
        {
          icon: <Archive className="w-5 h-5" />,
          label: 'Archivadas',
          description: filterArchived ? 'Mostrar archivadas' : 'Ocultar archivadas',
          onClick: onFilter,
          color: 'purple',
          badge: filterArchived ? 'Activo' : undefined,
        },
        {
          icon: <Star className="w-5 h-5" />,
          label: 'Favoritas',
          description: filterFavorites ? 'Solo favoritas' : 'Todas las notas',
          onClick: onFilter,
          color: 'yellow',
          badge: filterFavorites ? 'Activo' : undefined,
        },
        {
          icon: <Tag className="w-5 h-5" />,
          label: 'Por etiqueta',
          description: 'Filtrar por etiqueta específica',
          onClick: onFilter,
          color: 'pink',
        },
      ],
    },
    {
      title: 'Sincronización',
      icon: <RefreshCw className="w-4 h-4" />,
      items: [
        {
          icon: getSyncIcon(),
          label: syncStatus === 'syncing' ? 'Sincronizando...' : 
                 syncStatus === 'success' ? '¡Sincronizado!' : 
                 syncStatus === 'error' ? 'Error al sincronizar' : 'Sincronizar ahora',
          description: lastSyncTime 
            ? `Última sincronización: ${lastSyncTime.toLocaleTimeString()}`
            : 'No hay sincronización previa',
          onClick: handleSync,
          color: syncStatus === 'error' ? 'red' : 
                 syncStatus === 'success' ? 'green' : 'cyan',
          badge: hasPendingSync ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span>Pendiente</span>
            </span>
          ) : undefined,
        },
      ],
    },
    {
      title: 'Importar/Exportar',
      icon: <Upload className="w-4 h-4" />,
      items: [
        {
          icon: <Upload className="w-5 h-5" />,
          label: 'Importar notas',
          description: 'Importar desde archivo JSON',
          onClick: onImport || (() => {}),
          color: 'green',
        },
        {
          icon: <Download className="w-5 h-5" />,
          label: 'Exportar notas',
          description: 'Exportar como JSON',
          onClick: onExport || (() => {}),
          color: 'blue',
        },
        {
          icon: <FileText className="w-5 h-5" />,
          label: 'Exportar como PDF',
          description: 'Generar documento PDF',
          onClick: () => {},
          color: 'red',
        },
      ],
    },
    {
      title: 'Opciones avanzadas',
      icon: <Settings className="w-4 h-4" />,
      items: [
        {
          icon: <Trash2 className="w-5 h-5" />,
          label: 'Papelera',
          description: 'Ver notas eliminadas',
          onClick: () => {},
          color: 'red',
        },
        {
          icon: <Clock className="w-5 h-5" />,
          label: 'Historial',
          description: 'Ver cambios recientes',
          onClick: () => {},
          color: 'purple',
        },
        {
          icon: <HelpCircle className="w-5 h-5" />,
          label: 'Ayuda',
          description: 'Guías y soporte',
          onClick: () => {},
          color: 'blue',
        },
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; hover: string; text: string; lightBg: string; gradient: string }> = {
      blue: { 
        bg: 'bg-blue-500/10', 
        hover: 'hover:bg-blue-500/20', 
        text: 'text-blue-500',
        lightBg: 'bg-blue-50 dark:bg-blue-900/20',
        gradient: 'from-blue-500 to-blue-600'
      },
      green: { 
        bg: 'bg-green-500/10', 
        hover: 'hover:bg-green-500/20', 
        text: 'text-green-500',
        lightBg: 'bg-green-50 dark:bg-green-900/20',
        gradient: 'from-green-500 to-green-600'
      },
      orange: { 
        bg: 'bg-orange-500/10', 
        hover: 'hover:bg-orange-500/20', 
        text: 'text-orange-500',
        lightBg: 'bg-orange-50 dark:bg-orange-900/20',
        gradient: 'from-orange-500 to-orange-600'
      },
      yellow: { 
        bg: 'bg-yellow-500/10', 
        hover: 'hover:bg-yellow-500/20', 
        text: 'text-yellow-500',
        lightBg: 'bg-yellow-50 dark:bg-yellow-900/20',
        gradient: 'from-yellow-500 to-yellow-600'
      },
      purple: { 
        bg: 'bg-purple-500/10', 
        hover: 'hover:bg-purple-500/20', 
        text: 'text-purple-500',
        lightBg: 'bg-purple-50 dark:bg-purple-900/20',
        gradient: 'from-purple-500 to-purple-600'
      },
      pink: { 
        bg: 'bg-pink-500/10', 
        hover: 'hover:bg-pink-500/20', 
        text: 'text-pink-500',
        lightBg: 'bg-pink-50 dark:bg-pink-900/20',
        gradient: 'from-pink-500 to-pink-600'
      },
      red: { 
        bg: 'bg-red-500/10', 
        hover: 'hover:bg-red-500/20', 
        text: 'text-red-500',
        lightBg: 'bg-red-50 dark:bg-red-900/20',
        gradient: 'from-red-500 to-red-600'
      },
      cyan: { 
        bg: 'bg-cyan-500/10', 
        hover: 'hover:bg-cyan-500/20', 
        text: 'text-cyan-500',
        lightBg: 'bg-cyan-50 dark:bg-cyan-900/20',
        gradient: 'from-cyan-500 to-cyan-600'
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="relative">
      {/* Botón para abrir el menú */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-40 p-4 rounded-2xl shadow-2xl
          bg-gradient-to-r from-blue-600 to-purple-600
          hover:from-blue-700 hover:to-purple-700
          text-white transition-all duration-300
          flex items-center gap-2 group
        `}
      >
        <LayoutGrid className="w-6 h-6" />
        <span className="font-bold">Opciones</span>
        
        {/* Indicador de notificaciones */}
        {hasPendingSync && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menú lateral derecho */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-96 z-50 overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl rounded-l-3xl border-l border-white/20"
          >
            {/* Header del menú */}
            <div className="sticky top-0 z-20 p-4">
              <div className="relative h-32 rounded-2xl overflow-hidden">
                {/* Fondo con gradiente */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                
                {/* Efectos decorativos */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
                
                {/* Botón de cerrar */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="absolute top-3 left-3 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/30 z-30"
                >
                  <XCircle className="w-5 h-5 text-white" />
                </motion.button>

                {/* Contenido del header */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.h2 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-2xl font-bold text-white mb-1 drop-shadow-lg"
                  >
                    Menú de notas
                  </motion.h2>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full border border-white/50"
                  >
                    <span className="text-xs font-semibold text-white">
                      {new Date().toLocaleDateString()}
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Contenido del menú */}
            <div className="px-4 pb-6">
              {/* Resumen rápido */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vista actual</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                      {currentView === 'grid' ? <Grid3x3 className="w-4 h-4" /> : <Rows className="w-4 h-4" />}
                      {currentView === 'grid' ? 'Cuadrícula' : 'Lista'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Orden</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                      {sortDirection === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                      {sortBy === 'date' ? 'Fecha' : sortBy === 'title' ? 'Título' : 'Favoritos'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Secciones del menú */}
              {menuSections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (idx + 2) }}
                  className="mb-6"
                >
                  {/* Título de sección */}
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      {section.title}
                    </span>
                    {section.icon && (
                      <span className="text-gray-500 dark:text-gray-500">
                        {section.icon}
                      </span>
                    )}
                  </div>

                  {/* Items de la sección */}
                  <div className="space-y-1">
                    {section.items.map((item, itemIdx) => {
                      const colors = getColorClasses(item.color);
                      
                      return (
                        <motion.button
                          key={itemIdx}
                          whileHover={{ scale: 1.02, x: -5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            item.onClick();
                            if (item.label !== 'Sincronizar ahora' && !item.label.includes('Sincronizando')) {
                              setTimeout(() => setIsOpen(false), 300);
                            }
                          }}
                          className={`
                            w-full flex items-center gap-3 px-3 py-3 rounded-xl
                            transition-all duration-200 relative overflow-hidden group
                            hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100
                            dark:hover:from-gray-800 dark:hover:to-gray-700
                          `}
                        >
                          {/* Icono con fondo */}
                          <div className={`
                            relative z-10 p-2 rounded-xl ${colors.lightBg}
                            transition-all duration-200 group-hover:scale-110
                          `}>
                            <span className={colors.text}>
                              {item.icon}
                            </span>
                          </div>
                          
                          {/* Label y descripción */}
                          <div className="flex-1 text-left relative z-10">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {item.label}
                            </span>
                            {item.description && (
                              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {item.description}
                              </span>
                            )}
                          </div>
                          
                          {/* Badge */}
                          {item.badge && (
                            <span className={`
                              relative z-10 px-2 py-0.5 rounded-lg text-xs font-medium
                              ${colors.lightBg} ${colors.text}
                            `}>
                              {item.badge}
                            </span>
                          )}
                          
                          {/* Flecha decorativa */}
                          <svg
                            className={`relative z-10 w-4 h-4 ${colors.text} opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>

                          {/* Efecto de hover gradiente */}
                          <div className={`
                            absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0
                            group-hover:opacity-5 transition-opacity duration-300
                          `} />
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}

              {/* Estado de sincronización */}
              {lastSyncTime && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Última sincronización: {lastSyncTime.toLocaleString()}</span>
                  </div>
                </motion.div>
              )}

              {/* Footer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-4 text-center"
              >
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  QuickNote v1.4.0
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoteMenu;