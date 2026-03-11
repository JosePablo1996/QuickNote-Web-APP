// src/styles/colors.ts

export const colors = {
  // Colores primarios - Azul (estilo LoginForm)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },
  
  // Colores secundarios - Púrpura (estilo LoginForm)
  secondary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    950: '#2E1065',
  },
  
  // Colores de acento - Rosa (estilo LoginForm)
  accent: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
    950: '#500724',
  },

  // Colores de éxito - Verde
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    950: '#052E16',
  },

  // Colores de advertencia - Amarillo/Naranja
  warning: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308',
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
    950: '#422006',
  },

  // Colores de error - Rojo
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },

  // Colores de información - Cian
  info: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
    950: '#083344',
  },

  // Colores neutrales - Gris
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  // Colores de fondo para modo oscuro/claro
  background: {
    light: '#F9FAFB',
    dark: '#111827',
  },

  surface: {
    light: '#FFFFFF',
    dark: '#1F2937',
  },

  text: {
    light: {
      primary: '#111827',
      secondary: '#4B5563',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    dark: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      tertiary: '#6B7280',
      inverse: '#111827',
    },
  },

  border: {
    light: '#E5E7EB',
    dark: '#374151',
  },
};

// Gradientes predefinidos (estilo LoginForm)
export const gradients = {
  primary: 'from-blue-500 to-purple-600',
  secondary: 'from-purple-500 to-pink-600',
  success: 'from-green-500 to-emerald-600',
  warning: 'from-yellow-500 to-orange-500',
  error: 'from-red-500 to-rose-600',
  info: 'from-cyan-500 to-blue-600',
  accent: 'from-pink-500 to-rose-500',
  sunset: 'from-orange-500 to-pink-600',
  ocean: 'from-cyan-500 to-blue-600',
  forest: 'from-green-500 to-teal-600',
  midnight: 'from-indigo-900 via-purple-900 to-pink-900',
  dawn: 'from-orange-400 via-pink-500 to-purple-600',
  login: 'from-blue-600 via-purple-600 to-pink-600', // Gradiente específico del LoginForm
  card: 'from-blue-500/20 to-purple-500/20', // Para fondos de tarjetas
  glass: 'from-white/20 to-white/5 dark:from-gray-800/20 dark:to-gray-800/5', // Para efectos glass
};

// Sombras personalizadas (con colores del LoginForm)
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  glow: '0 0 20px rgba(59, 130, 246, 0.5)',
  'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
  'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
  'glow-login': '0 0 30px rgba(139, 92, 246, 0.4)', // Sombra estilo LoginForm
  card: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  'card-hover': '0 30px 35px -10px rgba(0, 0, 0, 0.2)',
};

// Animaciones predefinidas
export const animations = {
  spin: 'spin 1s linear infinite',
  ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  bounce: 'bounce 1s infinite',
  fadeIn: 'fadeIn 0.5s ease-in',
  slideUp: 'slideUp 0.3s ease-out',
  slideDown: 'slideDown 0.3s ease-out',
  slideLeft: 'slideLeft 0.3s ease-out',
  slideRight: 'slideRight 0.3s ease-out',
  scaleIn: 'scaleIn 0.3s ease-out',
  float: 'float 3s ease-in-out infinite',
  glow: 'glow 2s ease-in-out infinite',
};

// Transiciones predefinidas
export const transitions = {
  base: 'all 0.2s ease-in-out',
  smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  theme: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, color 0.3s ease-in-out',
};

// Breakpoints para responsive
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Spacing consistente
export const spacing = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
};

// Bordes y radios (estilo LoginForm - más redondeado)
export const borderRadius = {
  none: '0px',
  sm: '0.25rem',
  base: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
  card: '1.5rem', // Para tarjetas estilo LoginForm
  button: '1rem', // Para botones estilo LoginForm
  input: '1rem', // Para inputs estilo LoginForm
};

// Fuentes
export const fonts = {
  sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  mono: 'JetBrains Mono, "Fira Code", monospace',
};

// Tamaños de fuente
export const fontSizes = {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  '5xl': ['3rem', { lineHeight: '1' }],
  '6xl': ['3.75rem', { lineHeight: '1' }],
  '7xl': ['4.5rem', { lineHeight: '1' }],
  '8xl': ['6rem', { lineHeight: '1' }],
  '9xl': ['8rem', { lineHeight: '1' }],
};

// Pesos de fuente
export const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

// Z-index
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  modal: '1000',
  overlay: '100',
  popover: '200',
  tooltip: '300',
  toast: '400',
  dropdown: '500',
  header: '50',
  menu: '60',
};

// Opacidades
export const opacity = {
  0: '0',
  5: '0.05',
  10: '0.1',
  20: '0.2',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  80: '0.8',
  90: '0.9',
  100: '1',
};

// Exportar todo junto
export const theme = {
  colors,
  gradients,
  shadows,
  animations,
  transitions,
  breakpoints,
  spacing,
  borderRadius,
  fonts,
  fontSizes,
  fontWeights,
  zIndex,
  opacity,
};

export default theme;