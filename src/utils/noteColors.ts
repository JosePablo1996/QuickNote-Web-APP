// src/utils/noteColors.ts
import { 
  PREDEFINED_COLORS, 
  getColorWithOpacity, 
  NoteShape, 
  NOTE_SHAPES,
  // ========== NUEVAS IMPORTACIONES ==========
  ColorIntensity,
  getIntensityConfig,
  COLOR_INTENSITIES
} from '../models/Note';

// Mapa de colores para las notas (estilo LoginForm) - ACTUALIZADO con todos los colores
export const noteColorMap: Record<string, { 
  bg: string; 
  bgHover: string; 
  border: string; 
  text: string;
  gradient: string;
  lightBg: string;
  shadow: string;
  rgb: string;
  darkBg: string;
  mediumBg: string;
}> = {
  '#3B82F6': { // Azul
    bg: 'bg-blue-500',
    bgHover: 'hover:bg-blue-600',
    border: 'border-blue-500',
    text: 'text-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    lightBg: 'bg-blue-50 dark:bg-blue-950/30',
    shadow: 'shadow-blue-500/30',
    rgb: '59,130,246',
    darkBg: 'bg-blue-600',
    mediumBg: 'bg-blue-400'
  },
  '#10B981': { // Verde
    bg: 'bg-green-500',
    bgHover: 'hover:bg-green-600',
    border: 'border-green-500',
    text: 'text-green-500',
    gradient: 'from-green-500 to-green-600',
    lightBg: 'bg-green-50 dark:bg-green-950/30',
    shadow: 'shadow-green-500/30',
    rgb: '16,185,129',
    darkBg: 'bg-green-600',
    mediumBg: 'bg-green-400'
  },
  '#EF4444': { // Rojo
    bg: 'bg-red-500',
    bgHover: 'hover:bg-red-600',
    border: 'border-red-500',
    text: 'text-red-500',
    gradient: 'from-red-500 to-red-600',
    lightBg: 'bg-red-50 dark:bg-red-950/30',
    shadow: 'shadow-red-500/30',
    rgb: '239,68,68',
    darkBg: 'bg-red-600',
    mediumBg: 'bg-red-400'
  },
  '#F59E0B': { // Amarillo/Naranja
    bg: 'bg-amber-500',
    bgHover: 'hover:bg-amber-600',
    border: 'border-amber-500',
    text: 'text-amber-500',
    gradient: 'from-amber-500 to-amber-600',
    lightBg: 'bg-amber-50 dark:bg-amber-950/30',
    shadow: 'shadow-amber-500/30',
    rgb: '245,158,11',
    darkBg: 'bg-amber-600',
    mediumBg: 'bg-amber-400'
  },
  '#8B5CF6': { // Púrpura
    bg: 'bg-purple-500',
    bgHover: 'hover:bg-purple-600',
    border: 'border-purple-500',
    text: 'text-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    lightBg: 'bg-purple-50 dark:bg-purple-950/30',
    shadow: 'shadow-purple-500/30',
    rgb: '139,92,246',
    darkBg: 'bg-purple-600',
    mediumBg: 'bg-purple-400'
  },
  '#EC4899': { // Rosa
    bg: 'bg-pink-500',
    bgHover: 'hover:bg-pink-600',
    border: 'border-pink-500',
    text: 'text-pink-500',
    gradient: 'from-pink-500 to-pink-600',
    lightBg: 'bg-pink-50 dark:bg-pink-950/30',
    shadow: 'shadow-pink-500/30',
    rgb: '236,72,153',
    darkBg: 'bg-pink-600',
    mediumBg: 'bg-pink-400'
  },
  '#06B6D4': { // Cian
    bg: 'bg-cyan-500',
    bgHover: 'hover:bg-cyan-600',
    border: 'border-cyan-500',
    text: 'text-cyan-500',
    gradient: 'from-cyan-500 to-cyan-600',
    lightBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    shadow: 'shadow-cyan-500/30',
    rgb: '6,182,212',
    darkBg: 'bg-cyan-600',
    mediumBg: 'bg-cyan-400'
  },
  '#F97316': { // Naranja oscuro
    bg: 'bg-orange-500',
    bgHover: 'hover:bg-orange-600',
    border: 'border-orange-500',
    text: 'text-orange-500',
    gradient: 'from-orange-500 to-orange-600',
    lightBg: 'bg-orange-50 dark:bg-orange-950/30',
    shadow: 'shadow-orange-500/30',
    rgb: '249,115,22',
    darkBg: 'bg-orange-600',
    mediumBg: 'bg-orange-400'
  },
  '#6366F1': { // Índigo
    bg: 'bg-indigo-500',
    bgHover: 'hover:bg-indigo-600',
    border: 'border-indigo-500',
    text: 'text-indigo-500',
    gradient: 'from-indigo-500 to-indigo-600',
    lightBg: 'bg-indigo-50 dark:bg-indigo-950/30',
    shadow: 'shadow-indigo-500/30',
    rgb: '99,102,241',
    darkBg: 'bg-indigo-600',
    mediumBg: 'bg-indigo-400'
  },
  '#14B8A6': { // Teal
    bg: 'bg-teal-500',
    bgHover: 'hover:bg-teal-600',
    border: 'border-teal-500',
    text: 'text-teal-500',
    gradient: 'from-teal-500 to-teal-600',
    lightBg: 'bg-teal-50 dark:bg-teal-950/30',
    shadow: 'shadow-teal-500/30',
    rgb: '20,184,166',
    darkBg: 'bg-teal-600',
    mediumBg: 'bg-teal-400'
  },
  '#84CC16': { // Lima
    bg: 'bg-lime-500',
    bgHover: 'hover:bg-lime-600',
    border: 'border-lime-500',
    text: 'text-lime-500',
    gradient: 'from-lime-500 to-lime-600',
    lightBg: 'bg-lime-50 dark:bg-lime-950/30',
    shadow: 'shadow-lime-500/30',
    rgb: '132,204,22',
    darkBg: 'bg-lime-600',
    mediumBg: 'bg-lime-400'
  },
  '#A855F7': { // Violeta
    bg: 'bg-violet-500',
    bgHover: 'hover:bg-violet-600',
    border: 'border-violet-500',
    text: 'text-violet-500',
    gradient: 'from-violet-500 to-violet-600',
    lightBg: 'bg-violet-50 dark:bg-violet-950/30',
    shadow: 'shadow-violet-500/30',
    rgb: '168,85,247',
    darkBg: 'bg-violet-600',
    mediumBg: 'bg-violet-400'
  },
  '#6B7280': { // Gris
    bg: 'bg-gray-500',
    bgHover: 'hover:bg-gray-600',
    border: 'border-gray-500',
    text: 'text-gray-500',
    gradient: 'from-gray-500 to-gray-600',
    lightBg: 'bg-gray-50 dark:bg-gray-800',
    shadow: 'shadow-gray-500/30',
    rgb: '107,114,128',
    darkBg: 'bg-gray-600',
    mediumBg: 'bg-gray-400'
  },
};

// Color por defecto (azul)
export const DEFAULT_COLOR = '#3B82F6';

// Opciones de color predefinidas (para usar en formularios)
export const COLOR_OPTIONS = PREDEFINED_COLORS;

// ========== NUEVAS FUNCIONES PARA INTENSIDAD DE COLOR ==========

// Obtener opacidad según intensidad y tipo
export const getIntensityOpacityValue = (intensity: ColorIntensity, type: 'bg' | 'border' | 'shadow'): number => {
  const config = getIntensityConfig(intensity);
  switch (type) {
    case 'bg': return config.bgOpacity;
    case 'border': return config.borderOpacity;
    case 'shadow': return config.shadowIntensity;
    default: return config.bgOpacity;
  }
};

// Obtener estilo inline con intensidad de color (para modo oscuro/claro)
export const getNoteInlineStyleWithIntensity = (
  colorHex: string, 
  intensity: ColorIntensity = 'medium',
  isDarkMode: boolean = false
): React.CSSProperties => {
  const intensityConfig = getIntensityConfig(intensity);
  const opacity = intensityConfig.bgOpacity;
  const borderOpacity = intensityConfig.borderOpacity;
  const shadowIntensity = intensityConfig.shadowIntensity;
  
  return {
    backgroundColor: getColorWithOpacity(colorHex, opacity),
    borderLeft: `4px solid ${getColorWithOpacity(colorHex, borderOpacity)}`,
    boxShadow: `0 4px 12px ${getColorWithOpacity(colorHex, shadowIntensity)}`,
  };
};

// Obtener clase de fondo según intensidad
export const getBackgroundClassByIntensity = (colorHex: string, intensity: ColorIntensity): string => {
  const colorMap = noteColorMap[colorHex] || noteColorMap[DEFAULT_COLOR];
  
  switch (intensity) {
    case 'subtle':
      return colorMap.lightBg;
    case 'medium':
      return colorMap.mediumBg || colorMap.bg;
    case 'intense':
      return colorMap.darkBg || colorMap.bg;
    default:
      return colorMap.lightBg;
  }
};

// Obtener clase de borde según intensidad
export const getBorderClassByIntensity = (colorHex: string, intensity: ColorIntensity): string => {
  const colorMap = noteColorMap[colorHex] || noteColorMap[DEFAULT_COLOR];
  
  switch (intensity) {
    case 'subtle':
      return `border-${colorMap.border.split('-')[1]}-200`;
    case 'medium':
      return colorMap.border;
    case 'intense':
      return `border-${colorMap.border.split('-')[1]}-700`;
    default:
      return colorMap.border;
  }
};

// Obtener clase de sombra según intensidad
export const getShadowClassByIntensity = (colorHex: string, intensity: ColorIntensity): string => {
  const colorMap = noteColorMap[colorHex] || noteColorMap[DEFAULT_COLOR];
  
  switch (intensity) {
    case 'subtle':
      return 'shadow-sm';
    case 'medium':
      return colorMap.shadow;
    case 'intense':
      return `shadow-lg ${colorMap.shadow}`;
    default:
      return colorMap.shadow;
  }
};

// ========== FUNCIONES EXISTENTES ACTUALIZADAS ==========

// Función para obtener las clases de color de una nota (con intensidad)
export const getNoteColorClasses = (colorHex?: string | null, intensity?: ColorIntensity) => {
  const color = colorHex || DEFAULT_COLOR;
  const baseClasses = noteColorMap[color] || noteColorMap[DEFAULT_COLOR];
  
  // Si hay intensidad, ajustar clases
  if (intensity && intensity !== 'medium') {
    return {
      ...baseClasses,
      bg: getBackgroundClassByIntensity(color, intensity),
      border: getBorderClassByIntensity(color, intensity),
      shadow: getShadowClassByIntensity(color, intensity),
    };
  }
  
  return baseClasses;
};

// Función para obtener el gradiente de una nota (con intensidad)
export const getNoteGradient = (colorHex?: string | null, intensity?: ColorIntensity): string => {
  const color = colorHex || DEFAULT_COLOR;
  const baseGradient = noteColorMap[color]?.gradient || noteColorMap[DEFAULT_COLOR].gradient;
  
  if (intensity === 'intense') {
    return baseGradient.replace('500', '600').replace('600', '700');
  }
  if (intensity === 'subtle') {
    return baseGradient.replace('500', '300').replace('600', '400');
  }
  
  return baseGradient;
};

// Función para obtener la sombra de una nota (con intensidad)
export const getNoteShadow = (colorHex?: string | null, intensity?: ColorIntensity): string => {
  const color = colorHex || DEFAULT_COLOR;
  const baseShadow = noteColorMap[color]?.shadow || noteColorMap[DEFAULT_COLOR].shadow;
  
  if (intensity === 'intense') {
    return baseShadow.replace('/30', '/50');
  }
  if (intensity === 'subtle') {
    return baseShadow.replace('/30', '/15');
  }
  
  return baseShadow;
};

// Función para obtener estilo inline con el color (para modo oscuro/claro) - Legacy
export const getNoteInlineStyle = (colorHex: string, isDarkMode: boolean = false): React.CSSProperties => {
  const opacity = isDarkMode ? 0.12 : 0.08;
  return {
    backgroundColor: getColorWithOpacity(colorHex, opacity),
    borderLeft: `4px solid ${colorHex}`,
    boxShadow: `0 4px 12px ${getColorWithOpacity(colorHex, 0.2)}`,
  };
};

// Función para obtener clase de forma CSS
export const getShapeClassName = (shape: NoteShape): string => {
  const shapeConfig = NOTE_SHAPES.find(s => s.value === shape);
  return shapeConfig?.className || NOTE_SHAPES[1].className;
};

// Función para obtener estilos completos de la nota (color + forma + intensidad)
export const getNoteCompleteStyle = (
  colorHex: string, 
  shape: NoteShape, 
  intensity: ColorIntensity = 'medium',
  isDarkMode: boolean = false
): React.CSSProperties => {
  const intensityConfig = getIntensityConfig(intensity);
  const opacity = intensityConfig.bgOpacity;
  const borderOpacity = intensityConfig.borderOpacity;
  const shadowIntensity = intensityConfig.shadowIntensity;
  
  let borderRadius = '1rem';
  if (shape === 'square') borderRadius = '0';
  if (shape === 'rounded') borderRadius = '1rem';
  if (shape === 'oval') borderRadius = '9999px';
  if (shape === 'pill') borderRadius = '9999px';
  
  return {
    backgroundColor: getColorWithOpacity(colorHex, opacity),
    borderLeft: `4px solid ${getColorWithOpacity(colorHex, borderOpacity)}`,
    boxShadow: `0 4px 12px ${getColorWithOpacity(colorHex, shadowIntensity)}`,
    borderRadius,
    transition: 'all 0.3s ease',
  };
};

// Función para obtener estilos en hover (con intensidad)
export const getNoteHoverStyle = (
  colorHex: string, 
  intensity: ColorIntensity = 'medium'
): React.CSSProperties => {
  const intensityConfig = getIntensityConfig(intensity);
  return {
    boxShadow: `0 8px 24px ${getColorWithOpacity(colorHex, intensityConfig.shadowIntensity + 0.1)}`,
    transform: 'translateY(-2px)',
  };
};

// Función para obtener el color de texto contrastante (blanco o negro según fondo)
export const getContrastColor = (hexColor: string): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// ========== NUEVAS FUNCIONES UTILITARIAS ==========

// Obtener todos los estilos combinados para una nota
export const getNoteCombinedStyles = (
  note: {
    color: string;
    shape: NoteShape;
    colorIntensity?: ColorIntensity;
  },
  isDarkMode: boolean = false
): {
  containerStyle: React.CSSProperties;
  headerStyle: React.CSSProperties;
  contentStyle: React.CSSProperties;
  shadowClass: string;
  borderClass: string;
  bgClass: string;
} => {
  const intensity = note.colorIntensity || 'medium';
  const color = note.color || DEFAULT_COLOR;
  const shape = note.shape || 'rounded';
  
  const containerStyle = getNoteCompleteStyle(color, shape, intensity, isDarkMode);
  const hoverStyle = getNoteHoverStyle(color, intensity);
  const colorClasses = getNoteColorClasses(color, intensity);
  
  return {
    containerStyle,
    headerStyle: {
      borderBottom: `2px solid ${getColorWithOpacity(color, getIntensityOpacityValue(intensity, 'border'))}`,
    },
    contentStyle: {
      color: getContrastColor(color),
    },
    shadowClass: colorClasses.shadow,
    borderClass: colorClasses.border,
    bgClass: colorClasses.bg,
  };
};

// Obtener preview de intensidad para UI
export const getIntensityPreview = (colorHex: string): Record<ColorIntensity, React.CSSProperties> => {
  return {
    subtle: {
      backgroundColor: getColorWithOpacity(colorHex, COLOR_INTENSITIES[0].bgOpacity),
      borderLeft: `4px solid ${getColorWithOpacity(colorHex, COLOR_INTENSITIES[0].borderOpacity)}`,
      boxShadow: `0 2px 8px ${getColorWithOpacity(colorHex, COLOR_INTENSITIES[0].shadowIntensity)}`,
    },
    medium: {
      backgroundColor: getColorWithOpacity(colorHex, COLOR_INTENSITIES[1].bgOpacity),
      borderLeft: `4px solid ${getColorWithOpacity(colorHex, COLOR_INTENSITIES[1].borderOpacity)}`,
      boxShadow: `0 4px 12px ${getColorWithOpacity(colorHex, COLOR_INTENSITIES[1].shadowIntensity)}`,
    },
    intense: {
      backgroundColor: getColorWithOpacity(colorHex, COLOR_INTENSITIES[2].bgOpacity),
      borderLeft: `4px solid ${getColorWithOpacity(colorHex, COLOR_INTENSITIES[2].borderOpacity)}`,
      boxShadow: `0 6px 16px ${getColorWithOpacity(colorHex, COLOR_INTENSITIES[2].shadowIntensity)}`,
    },
  };
};

// Función para obtener clases CSS para la intensidad (usando Tailwind)
export const getIntensityTailwindClasses = (intensity: ColorIntensity): {
  bgOpacity: string;
  borderOpacity: string;
  shadowIntensity: string;
} => {
  switch (intensity) {
    case 'subtle':
      return {
        bgOpacity: 'bg-opacity-5',
        borderOpacity: 'border-opacity-20',
        shadowIntensity: 'shadow-sm',
      };
    case 'medium':
      return {
        bgOpacity: 'bg-opacity-15',
        borderOpacity: 'border-opacity-40',
        shadowIntensity: 'shadow-md',
      };
    case 'intense':
      return {
        bgOpacity: 'bg-opacity-25',
        borderOpacity: 'border-opacity-60',
        shadowIntensity: 'shadow-lg',
      };
    default:
      return {
        bgOpacity: 'bg-opacity-15',
        borderOpacity: 'border-opacity-40',
        shadowIntensity: 'shadow-md',
      };
  }
};

// Exportar utilidades de intensidad
export const IntensityUtils = {
  getConfig: getIntensityConfig,
  getOpacityValue: getIntensityOpacityValue,
  getPreview: getIntensityPreview,
  getTailwindClasses: getIntensityTailwindClasses,
  getAllIntensities: () => COLOR_INTENSITIES,
};