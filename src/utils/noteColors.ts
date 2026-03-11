// Mapa de colores para las notas (estilo LoginForm)
export const noteColorMap: Record<string, { 
  bg: string; 
  bgHover: string; 
  border: string; 
  text: string;
  gradient: string;
  lightBg: string;
  shadow: string;
}> = {
  '#3B82F6': { // Azul
    bg: 'bg-blue-500',
    bgHover: 'hover:bg-blue-600',
    border: 'border-blue-500',
    text: 'text-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    lightBg: 'bg-blue-50 dark:bg-blue-900/20',
    shadow: 'shadow-blue-500/30'
  },
  '#EF4444': { // Rojo
    bg: 'bg-red-500',
    bgHover: 'hover:bg-red-600',
    border: 'border-red-500',
    text: 'text-red-500',
    gradient: 'from-red-500 to-red-600',
    lightBg: 'bg-red-50 dark:bg-red-900/20',
    shadow: 'shadow-red-500/30'
  },
  '#10B981': { // Verde
    bg: 'bg-green-500',
    bgHover: 'hover:bg-green-600',
    border: 'border-green-500',
    text: 'text-green-500',
    gradient: 'from-green-500 to-green-600',
    lightBg: 'bg-green-50 dark:bg-green-900/20',
    shadow: 'shadow-green-500/30'
  },
  '#F59E0B': { // Naranja
    bg: 'bg-orange-500',
    bgHover: 'hover:bg-orange-600',
    border: 'border-orange-500',
    text: 'text-orange-500',
    gradient: 'from-orange-500 to-orange-600',
    lightBg: 'bg-orange-50 dark:bg-orange-900/20',
    shadow: 'shadow-orange-500/30'
  },
  '#8B5CF6': { // Púrpura
    bg: 'bg-purple-500',
    bgHover: 'hover:bg-purple-600',
    border: 'border-purple-500',
    text: 'text-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    lightBg: 'bg-purple-50 dark:bg-purple-900/20',
    shadow: 'shadow-purple-500/30'
  },
  '#14B8A6': { // Teal
    bg: 'bg-teal-500',
    bgHover: 'hover:bg-teal-600',
    border: 'border-teal-500',
    text: 'text-teal-500',
    gradient: 'from-teal-500 to-teal-600',
    lightBg: 'bg-teal-50 dark:bg-teal-900/20',
    shadow: 'shadow-teal-500/30'
  },
  '#EC4899': { // Rosa
    bg: 'bg-pink-500',
    bgHover: 'hover:bg-pink-600',
    border: 'border-pink-500',
    text: 'text-pink-500',
    gradient: 'from-pink-500 to-pink-600',
    lightBg: 'bg-pink-50 dark:bg-pink-900/20',
    shadow: 'shadow-pink-500/30'
  },
  '#6366F1': { // Índigo
    bg: 'bg-indigo-500',
    bgHover: 'hover:bg-indigo-600',
    border: 'border-indigo-500',
    text: 'text-indigo-500',
    gradient: 'from-indigo-500 to-indigo-600',
    lightBg: 'bg-indigo-50 dark:bg-indigo-900/20',
    shadow: 'shadow-indigo-500/30'
  }
};

// Color por defecto (azul)
export const DEFAULT_COLOR = '#3B82F6';

// Función para obtener las clases de color de una nota
export const getNoteColorClasses = (colorHex?: string | null) => {
  const color = colorHex || DEFAULT_COLOR;
  return noteColorMap[color] || noteColorMap[DEFAULT_COLOR];
};

// Función para obtener el gradiente de una nota
export const getNoteGradient = (colorHex?: string | null) => {
  const color = colorHex || DEFAULT_COLOR;
  return noteColorMap[color]?.gradient || noteColorMap[DEFAULT_COLOR].gradient;
};

// Función para obtener la sombra de una nota
export const getNoteShadow = (colorHex?: string | null) => {
  const color = colorHex || DEFAULT_COLOR;
  return noteColorMap[color]?.shadow || noteColorMap[DEFAULT_COLOR].shadow;
};