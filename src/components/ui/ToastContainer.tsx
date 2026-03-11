import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast, ToastType } from '../../hooks/useToast';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
  Bell
} from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  // Configuración por tipo
  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          gradient: 'from-green-500 to-emerald-500',
          icon: <CheckCircle className="w-5 h-5 text-white" />,
          bgLight: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          shadow: 'shadow-green-500/20',
        };
      case 'error':
        return {
          gradient: 'from-red-500 to-rose-500',
          icon: <XCircle className="w-5 h-5 text-white" />,
          bgLight: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          shadow: 'shadow-red-500/20',
        };
      case 'info':
        return {
          gradient: 'from-blue-500 to-cyan-500',
          icon: <Info className="w-5 h-5 text-white" />,
          bgLight: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          shadow: 'shadow-blue-500/20',
        };
      case 'warning':
        return {
          gradient: 'from-yellow-500 to-orange-500',
          icon: <AlertCircle className="w-5 h-5 text-white" />,
          bgLight: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          shadow: 'shadow-yellow-500/20',
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          icon: <Bell className="w-5 h-5 text-white" />,
          bgLight: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          shadow: 'shadow-gray-500/20',
        };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => {
          const config = getToastConfig(toast.type);

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ 
                opacity: 0, 
                x: 50, 
                scale: 0.5,
                transition: { duration: 0.2 }
              }}
              whileHover={{ scale: 1.02, x: -5 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: index * 0.1
              }}
              className={`relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl ${config.shadow} border ${config.border} w-80 backdrop-blur-sm`}
              role="alert"
              aria-live="polite"
            >
              {/* Barra lateral con gradiente */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${config.gradient}`} />

              <div className="relative p-4 pl-5">
                <div className="flex items-start gap-3">
                  {/* Icono */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r ${config.gradient} flex items-center justify-center shadow-md`}>
                    {config.icon}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {toast.message}
                    </p>
                    
                    {/* Acción opcional */}
                    {toast.action && (
                      <motion.button
                        whileHover={{ scale: 1.05, x: 2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          toast.action?.onClick();
                          dismiss(toast.id);
                        }}
                        className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${config.gradient} shadow-md hover:shadow-lg transition-all`}
                      >
                        {toast.action.label}
                      </motion.button>
                    )}
                  </div>

                  {/* Botón cerrar */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => dismiss(toast.id)}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Cerrar notificación"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </motion.button>
                </div>

                {/* Barra de progreso */}
                {toast.duration && (
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ 
                      duration: toast.duration / 1000,
                      ease: "linear"
                    }}
                    onAnimationComplete={() => dismiss(toast.id)}
                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${config.gradient}`}
                  />
                )}
              </div>

              {/* Efecto decorativo */}
              <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-r ${config.gradient} opacity-10 blur-lg`} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;