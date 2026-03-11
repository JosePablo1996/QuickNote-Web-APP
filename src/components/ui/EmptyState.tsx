import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Star,
  Archive,
  Trash2,
  Tag,
  Search,
  Cloud,
  AlertCircle,
  Plus,
  ArrowRight,
  BookOpen,
  Heart,
  Clock,
  Download
} from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'notes' | 'favorites' | 'archived' | 'trash' | 'tags' | 'search' | 'backup' | 'custom';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  actionLabel,
  onAction,
  type = 'custom',
}) => {
  // Configuraciones por defecto según el tipo
  const getDefaultConfig = () => {
    switch (type) {
      case 'notes':
        return {
          title: '¡Comienza a tomar notas!',
          message: 'Tus ideas, pensamientos y recordatorios en un solo lugar',
          icon: <FileText className="w-16 h-16 text-blue-400" />,
          actionLabel: 'Crear primera nota',
          gradient: 'from-blue-500 to-cyan-500',
          iconBg: 'bg-blue-500/20',
        };
      case 'favorites':
        return {
          title: 'No hay notas favoritas',
          message: 'Las notas que marques como favoritas aparecerán aquí',
          icon: <Star className="w-16 h-16 text-yellow-400" />,
          gradient: 'from-yellow-500 to-orange-500',
          iconBg: 'bg-yellow-500/20',
        };
      case 'archived':
        return {
          title: 'No hay notas archivadas',
          message: 'Las notas que archives aparecerán aquí',
          icon: <Archive className="w-16 h-16 text-teal-400" />,
          gradient: 'from-teal-500 to-cyan-500',
          iconBg: 'bg-teal-500/20',
        };
      case 'trash':
        return {
          title: 'La papelera está vacía',
          message: 'Las notas que elimines aparecerán aquí',
          icon: <Trash2 className="w-16 h-16 text-red-400" />,
          gradient: 'from-red-500 to-rose-500',
          iconBg: 'bg-red-500/20',
        };
      case 'tags':
        return {
          title: 'No hay etiquetas',
          message: 'Las etiquetas aparecerán cuando las agregues a tus notas',
          icon: <Tag className="w-16 h-16 text-purple-400" />,
          gradient: 'from-purple-500 to-pink-500',
          iconBg: 'bg-purple-500/20',
        };
      case 'search':
        return {
          title: 'No se encontraron resultados',
          message: 'Intenta con otros términos de búsqueda',
          icon: <Search className="w-16 h-16 text-gray-400" />,
          gradient: 'from-gray-500 to-gray-600',
          iconBg: 'bg-gray-500/20',
        };
      case 'backup':
        return {
          title: title || 'No hay backups',
          message: message || 'Crea tu primer backup para proteger tus notas en la nube',
          icon: icon || <Cloud className="w-16 h-16 text-blue-400" />,
          actionLabel: actionLabel || 'Crear backup',
          gradient: 'from-blue-500 to-purple-500',
          iconBg: 'bg-blue-500/20',
        };
      default:
        return {
          title: title || 'No hay elementos',
          message: message || 'No hay elementos para mostrar',
          icon: icon || <AlertCircle className="w-16 h-16 text-gray-400" />,
          gradient: 'from-gray-500 to-gray-600',
          iconBg: 'bg-gray-500/20',
        };
    }
  };

  const config = getDefaultConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12"
    >
      {/* Contenedor del icono con efectos */}
      <div className="relative mb-8">
        {/* Círculos decorativos animados */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} blur-3xl opacity-20`}
        />
        
        <motion.div
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700"
        />

        {/* Icono principal con fondo */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className={`relative w-32 h-32 rounded-3xl bg-gradient-to-br ${config.gradient} p-1 shadow-2xl`}
        >
          <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center backdrop-blur-sm">
            <div className={`${config.iconBg} p-4 rounded-xl`}>
              {config.icon}
            </div>
          </div>
        </motion.div>

        {/* Partículas flotantes */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400/30"
        />
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-purple-400/30"
        />
      </div>

      {/* Título */}
      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`text-3xl font-bold text-center mb-3 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
      >
        {config.title}
      </motion.h2>

      {/* Mensaje */}
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8 text-lg"
      >
        {config.message}
      </motion.p>

      {/* Botón de acción */}
      {(actionLabel || config.actionLabel) && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
        >
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          
          <span className="relative z-10 flex items-center gap-3 text-lg">
            {actionLabel || config.actionLabel}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>
      )}

      {/* Sugerencias adicionales según el tipo */}
      {type === 'notes' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex gap-4 text-sm text-gray-500 dark:text-gray-400"
        >
          <div className="flex items-center gap-1">
            <Plus className="w-4 h-4" />
            <span>Nueva nota</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            <span>Organiza con etiquetas</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span>Destaca favoritas</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;