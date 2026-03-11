import { User } from '../models/User';

// Usuario de demostración (para cuando no hay backend)
export const DEMO_USER: User = {
  id: '1',
  email: 'demo@quicknote.com',
  name: 'Usuario Demo',
  avatar: 'https://ui-avatars.com/api/?name=Usuario+Demo&background=3B82F6&color=fff&size=200',
  banner: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
  role: 'user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_active: true,
  settings: {
    theme: 'system',
    language: 'es',
    notifications: true,
    default_note_color: '#3B82F6',
    auto_save: true,
    default_view: 'grid',
    sort_by: 'created_at',
    sort_order: 'desc',
  },
};

// ============== VALIDACIONES ==============

/**
 * Validar formato de email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar contraseña (mínimo 8 caracteres, al menos una letra y un número)
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};

/**
 * Validar que las contraseñas coincidan
 */
export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

// ============== FORTALEZA DE CONTRASEÑA ==============

/**
 * Calcular fortaleza de contraseña (0-100)
 */
export const getPasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
  return Math.min(strength, 100);
};

/**
 * Obtener texto descriptivo de fortaleza
 */
export const getPasswordStrengthText = (strength: number): string => {
  if (strength === 0) return '';
  if (strength < 40) return 'Débil';
  if (strength < 70) return 'Media';
  return 'Fuerte';
};

/**
 * Obtener color según fortaleza
 */
export const getPasswordStrengthColor = (strength: number): string => {
  if (strength < 40) return 'bg-red-500';
  if (strength < 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

// ============== UTILIDADES DE USUARIO ==============

/**
 * Obtener iniciales del nombre
 */
export const getInitials = (name: string): string => {
  if (!name || name.length === 0) return '?';
  const words = name.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

/**
 * Formatear nombre a partir de email
 */
export const formatNameFromEmail = (email: string): string => {
  const parts = email.split('@')[0].split(/[._-]/);
  return parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

/**
 * Obtener color de avatar basado en nombre
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
  ];
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Obtener gradiente de avatar basado en nombre
 */
export const getAvatarGradient = (name: string): string => {
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600',
    'from-purple-500 to-pink-600',
    'from-yellow-500 to-orange-600',
    'from-cyan-500 to-blue-600',
  ];
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return gradients[Math.abs(hash) % gradients.length];
};

// ============== GESTIÓN DE LOCALSTORAGE ==============

// Claves de localStorage
const STORAGE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'auth_token',
  THEME: 'theme',
  VISUAL_THEME: 'visual_theme',
} as const;

/**
 * Guardar usuario en localStorage
 */
export const saveUserToStorage = (user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error guardando usuario en localStorage:', error);
  }
};

/**
 * Obtener usuario de localStorage
 */
export const getUserFromStorage = (): User | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error obteniendo usuario de localStorage:', error);
  }
  return null;
};

/**
 * Eliminar usuario de localStorage
 */
export const removeUserFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error eliminando usuario de localStorage:', error);
  }
};

// ============== GESTIÓN DE TOKENS ==============

/**
 * Guardar token en localStorage
 */
export const saveTokenToStorage = (token: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error guardando token en localStorage:', error);
  }
};

/**
 * Obtener token de localStorage
 */
export const getTokenFromStorage = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error obteniendo token de localStorage:', error);
    return null;
  }
};

/**
 * Eliminar token de localStorage
 */
export const removeTokenFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error eliminando token de localStorage:', error);
  }
};

// ============== LIMPIEZA COMPLETA DE SESIÓN ==============

/**
 * Limpiar todos los datos de sesión (LOGOUT COMPLETO)
 */
export const clearAllSessionData = (): void => {
  try {
    // Eliminar datos de autenticación
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    
    // Nota: No limpiamos preferencias de tema ni backups
    // para mantener la experiencia personalizada
    // localStorage.removeItem(STORAGE_KEYS.THEME);
    // localStorage.removeItem(STORAGE_KEYS.VISUAL_THEME);
    // localStorage.removeItem('quicknote_backups_metadata');
    
    console.log('🧹 Datos de sesión limpiados correctamente');
  } catch (error) {
    console.error('Error limpiando datos de sesión:', error);
  }
};

/**
 * Cerrar sesión (alias de clearAllSessionData para compatibilidad)
 */
export const logout = (): void => {
  clearAllSessionData();
};

// ============== VERIFICACIONES ==============

/**
 * Verificar si el usuario está autenticado (tiene token y usuario)
 */
export const isAuthenticated = (): boolean => {
  const hasToken = !!getTokenFromStorage();
  const hasUser = !!getUserFromStorage();
  return hasToken && hasUser;
};

/**
 * Verificar si hay una sesión activa (solo verifica existencia)
 */
export const hasActiveSession = (): boolean => {
  return !!getTokenFromStorage() || !!getUserFromStorage();
};

// ============== UTILIDADES DE SESIÓN ==============

/**
 * Obtener ID del usuario actual
 */
export const getCurrentUserId = (): string | null => {
  const user = getUserFromStorage();
  return user?.id || null;
};

/**
 * Obtener email del usuario actual
 */
export const getCurrentUserEmail = (): string | null => {
  const user = getUserFromStorage();
  return user?.email || null;
};

/**
 * Verificar si el usuario actual es propietario de un recurso
 */
export const isResourceOwner = (resourceUserId: string): boolean => {
  const currentUserId = getCurrentUserId();
  return !!currentUserId && currentUserId === resourceUserId;
};