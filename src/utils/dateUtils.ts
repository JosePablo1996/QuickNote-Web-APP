// ============================================
// FORMATO DE FECHAS
// ============================================

/**
 * Formatea una fecha a formato local (DD/MM/YYYY)
 */
export const formatDate = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return typeof date === 'string' ? date.substring(0, 10) : '';
  }
};

/**
 * Formatea una fecha con hora (DD/MM/YYYY HH:MM)
 */
export const formatDateTime = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return typeof date === 'string' ? date.substring(0, 16) : '';
  }
};

/**
 * Formatea solo la hora (HH:MM)
 */
export const formatTime = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

/**
 * Formatea fecha para nombre de archivo (YYYY-MM-DD_HH-mm)
 */
export const formatDateForFilename = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}`;
};

/**
 * Formatea fecha para API (ISO string)
 */
export const formatDateForAPI = (date: Date = new Date()): string => {
  return date.toISOString();
};

// ============================================
// CÁLCULOS DE TIEMPO
// ============================================

/**
 * Obtiene el tiempo relativo (hace X días, ayer, hoy)
 */
export const getRelativeTime = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
    }
    const years = Math.floor(diffDays / 365);
    return `Hace ${years} año${years > 1 ? 's' : ''}`;
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Fecha desconocida';
  }
};

/**
 * Obtiene la diferencia en días entre dos fechas
 */
export const getDaysDifference = (date1: Date, date2: Date = new Date()): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Verifica si una fecha es hoy
 */
export const isToday = (date: string | Date): boolean => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    console.error('Error checking if today:', error);
    return false;
  }
};

/**
 * Verifica si una fecha es ayer
 */
export const isYesterday = (date: string | Date): boolean => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    );
  } catch (error) {
    console.error('Error checking if yesterday:', error);
    return false;
  }
};

/**
 * Verifica si una fecha es de esta semana
 */
export const isThisWeek = (date: string | Date): boolean => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo && d <= now;
  } catch (error) {
    console.error('Error checking if this week:', error);
    return false;
  }
};

/**
 * Verifica si una fecha es de este mes
 */
export const isThisMonth = (date: string | Date): boolean => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  } catch (error) {
    console.error('Error checking if this month:', error);
    return false;
  }
};

// ============================================
// UTILIDADES DE CALENDARIO
// ============================================

/**
 * Obtiene el primer día del mes
 */
export const getFirstDayOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Obtiene el último día del mes
 */
export const getLastDayOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Obtiene los días del mes
 */
export const getDaysInMonth = (date: Date = new Date()): number => {
  return getLastDayOfMonth(date).getDate();
};

/**
 * Obtiene el array de días del mes para calendario
 */
export const getMonthDays = (date: Date = new Date()): (Date | null)[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days: (Date | null)[] = [];
  
  // Días del mes anterior
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  
  // Días del mes actual
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  return days;
};

/**
 * Obtiene los días de la semana actual
 */
export const getWeekDays = (date: Date = new Date()): Date[] => {
  const startOfWeek = new Date(date);
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1; // Ajustar para que la semana empiece en lunes
  startOfWeek.setDate(date.getDate() - diff);
  
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });
};

// ============================================
// ORDENAMIENTO DE FECHAS
// ============================================

/**
 * Ordena un array de fechas (más reciente primero)
 */
export const sortDatesDesc = (dates: (string | Date)[]): (string | Date)[] => {
  return [...dates].sort((a, b) => {
    const dateA = typeof a === 'string' ? new Date(a) : a;
    const dateB = typeof b === 'string' ? new Date(b) : b;
    return dateB.getTime() - dateA.getTime();
  });
};

/**
 * Ordena un array de fechas (más antigua primero)
 */
export const sortDatesAsc = (dates: (string | Date)[]): (string | Date)[] => {
  return [...dates].sort((a, b) => {
    const dateA = typeof a === 'string' ? new Date(a) : a;
    const dateB = typeof b === 'string' ? new Date(b) : b;
    return dateA.getTime() - dateB.getTime();
  });
};

// ============================================
// VALIDACIÓN DE FECHAS
// ============================================

/**
 * Verifica si una fecha es válida
 */
export const isValidDate = (date: unknown): boolean => {
  if (date === null || date === undefined) return false;
  
  try {
    const d = new Date(date as string | number | Date);
    return d instanceof Date && !isNaN(d.getTime());
  } catch {
    return false;
  }
};

/**
 * Parsea una fecha de forma segura
 */
export const safeParseDate = (date: string | Date | null | undefined): Date | null => {
  if (date === null || date === undefined) return null;
  
  try {
    const d = new Date(date);
    return isValidDate(d) ? d : null;
  } catch {
    return null;
  }
};

// ============================================
// EXPORTACIÓN POR DEFECTO
// ============================================

export default {
  formatDate,
  formatDateTime,
  formatTime,
  formatDateForFilename,
  formatDateForAPI,
  getRelativeTime,
  getDaysDifference,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getDaysInMonth,
  getMonthDays,
  getWeekDays,
  sortDatesDesc,
  sortDatesAsc,
  isValidDate,
  safeParseDate,
};