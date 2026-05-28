// src/contexts/components/ui/OfflineIndicator.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, Cloud, CheckCircle } from 'lucide-react';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import { useOfflineNotes } from '../../../hooks/useOfflineNotes';

interface OfflineIndicatorProps {
  onSync?: () => void;
  showDetails?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  onSync, 
  showDetails = true 
}) => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const { pendingCount, forceSync } = useOfflineNotes();

  const handleSync = () => {
    if (onSync) {
      onSync();
    } else {
      forceSync();
    }
  };

  // No mostrar nada si todo está bien
  if (isOnline && !wasOffline && pendingCount === 0) {
    return null;
  }

  // Determinar el color y el icono según el estado
  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        bgColor: 'bg-red-500',
        textColor: 'text-white',
        icon: <WifiOff size={16} />,
        title: 'Sin conexión',
        subtitle: 'Modo offline activado',
        showSyncButton: false,
      };
    }
    
    if (pendingCount > 0) {
      return {
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
        icon: <Cloud size={16} />,
        title: `${pendingCount} cambio(s) pendiente(s)`,
        subtitle: showDetails ? 'Los cambios se sincronizarán automáticamente' : undefined,
        showSyncButton: true,
      };
    }
    
    if (wasOffline) {
      return {
        bgColor: 'bg-green-500',
        textColor: 'text-white',
        icon: <CheckCircle size={16} />,
        title: 'Conexión recuperada',
        subtitle: showDetails ? 'Todo sincronizado' : undefined,
        showSyncButton: false,
      };
    }
    
    return null;
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="offline-indicator"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      >
        <div 
          className={`mt-2 px-4 py-2 rounded-full shadow-lg flex items-center gap-3 pointer-events-auto ${config.bgColor} ${config.textColor}`}
        >
          {config.icon}
          
          <span className="text-sm font-medium">
            {config.title}
          </span>
          
          {config.subtitle && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {config.subtitle}
            </span>
          )}
          
          {config.showSyncButton && (
            <button
              onClick={handleSync}
              className="ml-1 p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Sincronizar ahora"
              title="Sincronizar ahora"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineIndicator;