import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
  Bell,
  ExternalLink
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 4000,
  onClose,
  action,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Configuraciones por tipo con gradientes y iconos
  const typeConfig = {
    success: {
      gradient: 'from-green-500 to-emerald-500',
      icon: <CheckCircle className="w-5 h-5 text-white" />,
      bgLight: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
    },
    error: {
      gradient: 'from-red-500 to-rose-500',
      icon: <XCircle className="w-5 h-5 text-white" />,
      bgLight: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
    },
    info: {
      gradient: 'from-blue-500 to-cyan-500',
      icon: <Info className="w-5 h-5 text-white" />,
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
    },
    warning: {
      gradient: 'from-yellow-500 to-orange-500',
      icon: <AlertCircle className="w-5 h-5 text-white" />,
      bgLight: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
    },
  };

  const { gradient, icon, bgLight, border } = typeConfig[type];

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = (remaining / duration) * 100;

      if (remaining <= 0) {
        setIsVisible(false);
        onClose?.();
        return;
      }

      setProgress(newProgress);
      requestAnimationFrame(updateProgress);
    };

    const animationFrame = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(animationFrame);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4"
        role="alert"
        aria-live="polite"
      >
        <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border ${border}`}>
          {/* Barra de progreso superior */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
            className={`absolute top-0 left-0 h-1 bg-gradient-to-r ${gradient}`}
          />

          <div className="relative p-4">
            <div className="flex items-start gap-3">
              {/* Icono con gradiente */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
                {icon}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {message}
                </p>
                
                {/* Acción opcional */}
                {action && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      action.onClick();
                      setIsVisible(false);
                      onClose?.();
                    }}
                    className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${gradient} shadow-md hover:shadow-lg transition-all`}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {action.label}
                  </motion.button>
                )}
              </div>

              {/* Botón cerrar */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setIsVisible(false);
                  onClose?.();
                }}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>

          {/* Efecto decorativo */}
          <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-r ${gradient} opacity-10 blur-xl`} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;