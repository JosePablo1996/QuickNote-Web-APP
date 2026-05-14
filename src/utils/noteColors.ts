// src/utils/noteColors.ts
import { PREDEFINED_COLORS, getColorWithOpacity, NoteShape, NOTE_SHAPES } from '../models/Note';

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
}> = {
  '#3B82F6': { // Azul
    bg: 'bg-blue-500',
    bgHover: 'hover:bg-blue-600',
    border: 'border-blue-500',
    text: 'text-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    lightBg: 'bg-blue-50 dark:bg-blue-900/20',
    shadow: 'shadow-blue-500/30',
    rgb: '59,130,246'
  },
  '#10B981': { // Verde
    bg: 'bg-green-500',
    bgHover: 'hover:bg-green-600',
    border: 'border-green-500',
    text: 'text-green-500',
    gradient: 'from-green-500 to-green-600',
    lightBg: 'bg-green-50 dark:bg-green-900/20',
    shadow: 'shadow-green-500/30',
    rgb: '16,185,129'
  },
  '#EF4444': { // Rojo
    bg: 'bg-red-500',
    bgHover: 'hover:bg-red-600',
    border: 'border-red-500',
    text: 'text-red-500',
    gradient: 'from-red-500 to-red-600',
    lightBg: 'bg-red-50 dark:bg-red-900/20',
    shadow: 'shadow-red-500/30',
    rgb: '239,68,68'
  },
  '#F59E0B': { // Amarillo/Naranja
    bg: 'bg-amber-500',
    bgHover: 'hover:bg-amber-600',
    border: 'border-amber-500',
    text: 'text-amber-500',
    gradient: 'from-amber-500 to-amber-600',
    lightBg: 'bg-amber-50 dark:bg-amber-900/20',
    shadow: 'shadow-amber-500/30',
    rgb: '245,158,11'
  },
  '#8B5CF6': { // Púrpura
    bg: 'bg-purple-500',
    bgHover: 'hover:bg-purple-600',
    border: 'border-purple-500',
    text: 'text-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    lightBg: 'bg-purple-50 dark:bg-purple-900/20',
    shadow: 'shadow-purple-500/30',
    rgb: '139,92,246'
  },
  '#EC4899': { // Rosa
    bg: 'bg-pink-500',
    bgHover: 'hover:bg-pink-600',
    border: 'border-pink-500',
    text: 'text-pink-500',
    gradient: 'from-pink-500 to-pink-600',
    lightBg: 'bg-pink-50 dark:bg-pink-900/20',
    shadow: 'shadow-pink-500/30',
    rgb: '236,72,153'
  },
  '#06B6D4': { // Cian
    bg: 'bg-cyan-500',
    bgHover: 'hover:bg-cyan-600',
    border: 'border-cyan-500',
    text: 'text-cyan-500',
    gradient: 'from-cyan-500 to-cyan-600',
    lightBg: 'bg-cyan-50 dark:bg-cyan-900/20',
    shadow: 'shadow-cyan-500/30',
    rgb: '6,182,212'
  },
  '#F97316': { // Naranja oscuro
    bg: 'bg-orange-500',
    bgHover: 'hover:bg-orange-600',
    border: 'border-orange-500',
    text: 'text-orange-500',
    gradient: 'from-orange-500 to-orange-600',
    lightBg: 'bg-orange-50 dark:bg-orange-900/20',
    shadow: 'shadow-orange-500/30',
    rgb: '249,115,22'
  },
  '#6366F1': { // Índigo
    bg: 'bg-indigo-500',
    bgHover: 'hover:bg-indigo-600',
    border: 'border-indigo-500',
    text: 'text-indigo-500',
    gradient: 'from-indigo-500 to-indigo-600',
    lightBg: 'bg-indigo-50 dark:bg-indigo-900/20',
    shadow: 'shadow-indigo-500/30',
    rgb: '99,102,241'
  },
  '#14B8A6': { // Teal
    bg: 'bg-teal-500',
    bgHover: 'hover:bg-teal-600',
    border: 'border-teal-500',
    text: 'text-teal-500',
    gradient: 'from-teal-500 to-teal-600',
    lightBg: 'bg-teal-50 dark:bg-teal-900/20',
    shadow: 'shadow-teal-500/30',
    rgb: '20,184,166'
  },
  '#84CC16': { // Lima
    bg: 'bg-lime-500',
    bgHover: 'hover:bg-lime-600',
    border: 'border-lime-500',
    text: 'text-lime-500',
    gradient: 'from-lime-500 to-lime-600',
    lightBg: 'bg-lime-50 dark:bg-lime-900/20',
    shadow: 'shadow-lime-500/30',
    rgb: '132,204,22'
  },
  '#A855F7': { // Violeta
    bg: 'bg-violet-500',
    bgHover: 'hover:bg-violet-600',
    border: 'border-violet-500',
    text: 'text-violet-500',
    gradient: 'from-violet-500 to-violet-600',
    lightBg: 'bg-violet-50 dark:bg-violet-900/20',
    shadow: 'shadow-violet-500/30',
    rgb: '168,85,247'
  },
};

// Color por defecto (azul)
export const DEFAULT_COLOR = '#3B82F6';

// Opciones de color predefinidas (para usar en formularios)
export const COLOR_OPTIONS = PREDEFINED_COLORS;

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

// Función para obtener estilo inline con el color (para modo oscuro/claro)
export const getNoteInlineStyle = (colorHex: string, isDarkMode: boolean = false) => {
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

// Función para obtener estilos completos de la nota
export const getNoteCompleteStyle = (
  colorHex: string, 
  shape: NoteShape, 
  isDarkMode: boolean = false
): React.CSSProperties => {
  const opacity = isDarkMode ? 0.12 : 0.08;
  const shapeClass = getShapeClassName(shape);
  
  let borderRadius = '1rem';
  if (shape === 'square') borderRadius = '0';
  if (shape === 'rounded') borderRadius = '1rem';
  if (shape === 'oval') borderRadius = '9999px';
  if (shape === 'pill') borderRadius = '9999px';
  
  return {
    backgroundColor: getColorWithOpacity(colorHex, opacity),
    borderLeft: `4px solid ${colorHex}`,
    boxShadow: `0 4px 12px ${getColorWithOpacity(colorHex, 0.2)}`,
    borderRadius,
    transition: 'all 0.3s ease',
  };
};

// Función para obtener el color de texto contrastante
export const getContrastColor = (hexColor: string): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};