import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CircleDot, Activity, Clock } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'gray';
  fullScreen?: boolean;
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'progress';
  progress?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  fullScreen = false,
  text,
  variant = 'spinner',
  progress = 0,
}) => {
  // Mapa de colores con gradientes
  const colorGradients = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-rose-500',
    yellow: 'from-yellow-500 to-orange-500',
    gray: 'from-gray-500 to-gray-600',
  };

  // Clases de tamaño
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const spinnerSize = sizeClasses[size];
  const textSize = textSizeClasses[size];
  const gradient = colorGradients[color];

  // Contenedor principal
  const Container = ({ children }: { children: React.ReactNode }) => (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-50' : ''}`}>
      {children}
    </div>
  );

  // Spinner simple con animación
  if (variant === 'spinner') {
    return (
      <Container>
        <div className="relative">
          {/* Círculo de fondo */}
          <div className={`${spinnerSize} rounded-full border-4 border-gray-200 dark:border-gray-700`} />
          
          {/* Círculo animado con gradiente */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 rounded-full border-4 border-t-transparent border-l-transparent bg-gradient-to-r ${gradient}`}
            style={{
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              padding: '3px',
            }}
          />
        </div>
        {text && (
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`mt-4 ${textSize} text-gray-600 dark:text-gray-400 font-medium`}
          >
            {text}
          </motion.p>
        )}
      </Container>
    );
  }

  // Puntos animados
  if (variant === 'dots') {
    return (
      <Container>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [-10, 0, -10],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className={`${spinnerSize} rounded-full bg-gradient-to-r ${gradient}`}
            />
          ))}
        </div>
        {text && (
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`mt-4 ${textSize} text-gray-600 dark:text-gray-400 font-medium`}
          >
            {text}
          </motion.p>
        )}
      </Container>
    );
  }

  // Pulso
  if (variant === 'pulse') {
    return (
      <Container>
        <div className="relative">
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`${spinnerSize} rounded-full bg-gradient-to-r ${gradient} opacity-20`}
          />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute inset-0 ${spinnerSize} rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center`}
          >
            <Activity className="w-1/2 h-1/2 text-white" />
          </motion.div>
        </div>
        {text && (
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`mt-4 ${textSize} text-gray-600 dark:text-gray-400 font-medium`}
          >
            {text}
          </motion.p>
        )}
      </Container>
    );
  }

  // Barra de progreso
  if (variant === 'progress') {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    
    return (
      <Container>
        <div className="w-64 relative">
          {/* Barra de fondo */}
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            {/* Barra de progreso animada */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${clampedProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${gradient} relative`}
            >
              {/* Efecto de brillo */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-white/30 skew-x-12"
              />
            </motion.div>
          </div>
          
          {/* Texto de progreso */}
          <div className="flex justify-between mt-2">
            <span className={`text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1`}>
              <Clock className="w-3 h-3" />
              Progreso
            </span>
            <motion.span 
              key={clampedProgress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`text-xs font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
            >
              {Math.round(clampedProgress)}%
            </motion.span>
          </div>
        </div>
        
        {text && (
          <p className={`mt-4 ${textSize} text-gray-600 dark:text-gray-400 font-medium`}>
            {text}
          </p>
        )}
      </Container>
    );
  }

  return null;
};

export default LoadingSpinner;