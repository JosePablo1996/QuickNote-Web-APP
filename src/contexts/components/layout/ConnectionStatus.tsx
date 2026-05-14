import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, CloudOff, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  isOnline?: boolean;
  onRefresh?: () => void;
  pendingSync?: number;
  onRetry?: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isOnline: externalIsOnline,
  onRefresh,
  pendingSync = 0,
  onRetry,
}) => {
  const [internalIsOnline, setInternalIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // Usar estado externo si se proporciona, sino usar interno
  const isOnline = externalIsOnline !== undefined ? externalIsOnline : internalIsOnline;

  useEffect(() => {
    if (externalIsOnline !== undefined) return;

    const handleOnline = () => {
      console.log('🌐 Conexión restablecida');
      setInternalIsOnline(true);
      setWasOffline(true);
      
      // Mostrar mensaje de reconexión por 3 segundos
      setTimeout(() => {
        setWasOffline(false);
      }, 3000);
    };

    const handleOffline = () => {
      console.log('📴 Conexión perdida');
      setInternalIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [externalIsOnline]);

  // No mostrar nada si está online y no hay reconexión reciente
  if (isOnline && !wasOffline && !pendingSync) {
    return null;
  }

  // Determinar tipo de mensaje
  const isReconnecting = wasOffline && isOnline;
  const isOffline = !isOnline;

  return (
    <AnimatePresence mode="wait">
      {/* Mensaje de offline */}
      {isOffline && (
        <motion.div
          key="offline"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="relative z-50"
        >
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-2xl relative overflow-hidden">
            {/* Efectos de fondo decorativos */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-1">
                  {/* Icono con efecto de pulso */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"
                  >
                    <WifiOff className="w-5 h-5 text-white" />
                  </motion.div>

                  {/* Mensajes */}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      SIN CONEXIÓN
                    </p>
                    <p className="text-xs text-white/80 mt-0.5">
                      Estás trabajando sin conexión a internet. Los cambios se guardarán localmente.
                    </p>
                    
                    {/* Indicador de cambios pendientes */}
                    {pendingSync > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex items-center gap-2"
                      >
                        <div className="px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm">
                          <span className="text-xs font-bold text-white">
                            {pendingSync} cambio{pendingSync !== 1 ? 's' : ''} pendiente{pendingSync !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-2">
                  {onRetry && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onRetry}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white text-sm font-bold transition-all duration-200 flex items-center gap-2 border border-white/20"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>REINTENTAR</span>
                    </motion.button>
                  )}
                  
                  {onRefresh && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onRefresh}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white text-sm font-bold transition-all duration-200 border border-white/20"
                    >
                      RECARGAR
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mensaje de reconexión */}
      {isReconnecting && (
        <motion.div
          key="reconnecting"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="relative z-50"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl relative overflow-hidden">
            {/* Efectos de fondo decorativos */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"
                >
                  <RefreshCw className="w-5 h-5 text-white" />
                </motion.div>
                
                <div>
                  <p className="text-sm font-bold text-white">
                    CONEXIÓN RESTABLECIDA
                  </p>
                  <p className="text-xs text-white/80">
                    Sincronizando cambios...
                  </p>
                </div>

                {pendingSync > 0 && (
                  <div className="ml-auto px-3 py-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <span className="text-xs font-bold text-white">
                      {pendingSync} cambio{pendingSync !== 1 ? 's' : ''} pendiente{pendingSync !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mensaje de cambios pendientes (cuando está online pero hay cambios por sincronizar) */}
      {isOnline && !isReconnecting && pendingSync > 0 && (
        <motion.div
          key="pending"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="relative z-50"
        >
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-2xl relative overflow-hidden">
            {/* Efectos de fondo decorativos */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"
                  >
                    <CloudOff className="w-5 h-5 text-white" />
                  </motion.div>
                  
                  <div>
                    <p className="text-sm font-bold text-white">
                      CAMBIOS PENDIENTES
                    </p>
                    <p className="text-xs text-white/80">
                      {pendingSync} nota{pendingSync !== 1 ? 's' : ''} por sincronizar
                    </p>
                  </div>
                </div>

                {onRefresh && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRefresh}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white text-sm font-bold transition-all duration-200 flex items-center gap-2 border border-white/20"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>SINCRONIZAR</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;