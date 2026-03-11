// ============================================
// CONSTANTES DE LA APLICACIÓN
// ============================================

// URL de la API
export const API_URL = import.meta.env.VITE_API_URL || 'https://quicknote-api-app-react.onrender.com/api/v1';

// Endpoints
export const ENDPOINTS = {
  NOTES: '/notes',
  NOTES_BY_ID: (id: string) => `/notes/${id}`,
  NOTES_SYNC: '/notes/sync',
  HEALTH: '/health',
  STATS: '/stats',
} as const;

// Configuración de la app
export const APP_CONFIG = {
  NAME: 'QuickNote',
  VERSION: '1.0.0',
  DESCRIPTION: 'Tus notas siempre contigo',
  AUTHOR: 'José Pablo Miranda Quintanilla',
  GITHUB: 'https://github.com/JosePablo1996',
  EMAIL: 'jose.miranda@quicknote.com',
} as const;

// ============================================
// CONFIGURACIÓN DE NOTAS
// ============================================

export const NOTE_CONFIG = {
  MAX_TITLE_LENGTH: 200,
  MAX_CONTENT_LENGTH: 10000,
  MIN_TITLE_LENGTH: 1,
  DEFAULT_COLOR: '#3B82F6',
  MAX_TAGS_PER_NOTE: 10,
  MAX_TAG_LENGTH: 30,
} as const;

// Colores predefinidos para notas
export const NOTE_COLORS = [
  '#3B82F6', // Azul
  '#EF4444', // Rojo
  '#10B981', // Verde
  '#F59E0B', // Naranja
  '#8B5CF6', // Púrpura
  '#14B8A6', // Teal
  '#EC4899', // Rosa
  '#6366F1', // Índigo
  '#F97316', // Naranja oscuro
  '#06B6D4', // Cian
  '#84CC16', // Lima
  '#D946EF', // Fucsia
] as const;

// ============================================
// CONFIGURACIÓN DE ETIQUETAS
// ============================================

export const TAG_CONFIG = {
  MAX_TAGS_DISPLAY: 5,
  CLOUD_MIN_SIZE: 12,
  CLOUD_MAX_SIZE: 24,
  CLOUD_MIN_OPACITY: 0.6,
  CLOUD_MAX_OPACITY: 1,
} as const;

// Colores predefinidos para etiquetas comunes
export const TAG_COLORS: Record<string, string> = {
  personal: '#3B82F6',
  trabajo: '#F59E0B',
  estudio: '#10B981',
  compras: '#8B5CF6',
  ideas: '#EC4899',
  proyecto: '#14B8A6',
  urgente: '#EF4444',
  salud: '#EC4899',
  viajes: '#6366F1',
  hogar: '#8B5CF6',
  tecnología: '#3B82F6',
  finanzas: '#10B981',
  deportes: '#F59E0B',
  música: '#8B5CF6',
  lectura: '#6366F1',
  universidad: '#8B5CF6',
  recordatorio: '#EC4899',
  cumpleaños: '#F59E0B',
  reunión: '#6366F1',
  tarea: '#10B981',
};

// Colores por defecto para etiquetas no definidas
export const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // orange
  '#8B5CF6', // purple
  '#14B8A6', // teal
  '#EC4899', // pink
  '#6366F1', // indigo
] as const;

// Iconos para etiquetas comunes
export const TAG_ICONS: Record<string, string> = {
  personal: '👤',
  trabajo: '💼',
  estudio: '📚',
  compras: '🛒',
  ideas: '💡',
  proyecto: '📊',
  urgente: '⚠️',
  salud: '❤️',
  viajes: '✈️',
  hogar: '🏠',
  tecnología: '💻',
  finanzas: '💰',
  deportes: '⚽',
  música: '🎵',
  lectura: '📖',
  universidad: '🎓',
  recordatorio: '⏰',
  cumpleaños: '🎂',
  reunión: '🤝',
  tarea: '✅',
};

// ============================================
// MENSAJES DE LA APLICACIÓN
// ============================================

export const MESSAGES = {
  // Éxito
  SUCCESS: {
    NOTE_CREATED: '✅ Nota creada exitosamente',
    NOTE_UPDATED: '✏️ Nota actualizada exitosamente',
    NOTE_DELETED: '🗑️ Nota movida a la papelera',
    NOTE_RESTORED: '✨ Nota restaurada',
    NOTE_PERMANENTLY_DELETED: '⚠️ Nota eliminada permanentemente',
    FAVORITE_ADDED: '⭐ Añadida a favoritos',
    FAVORITE_REMOVED: '⭐ Quitada de favoritos',
    ARCHIVED_ADDED: '📦 Nota archivada',
    ARCHIVED_REMOVED: '📦 Nota desarchivada',
    BACKUP_CREATED: '💾 Backup creado exitosamente',
    BACKUP_RESTORED: '🔄 Backup restaurado',
    BACKUP_DELETED: '🗑️ Backup eliminado',
    TRASH_EMPTIED: '🧹 Papelera vaciada',
    SYNC_SUCCESS: '🔄 Sincronización completada',
    LOGIN_SUCCESS: '🔐 ¡Bienvenido de vuelta!',
    REGISTER_SUCCESS: '📝 ¡Registro exitoso!',
    PROFILE_UPDATED: '👤 Perfil actualizado',
    PASSWORD_UPDATED: '🔑 Contraseña actualizada',
  },

  // Error
  ERROR: {
    LOAD_NOTES: 'Error al cargar las notas',
    CREATE_NOTE: 'Error al crear la nota',
    UPDATE_NOTE: 'Error al actualizar la nota',
    DELETE_NOTE: 'Error al eliminar la nota',
    RESTORE_NOTE: 'Error al restaurar la nota',
    TOGGLE_FAVORITE: 'Error al cambiar favorito',
    TOGGLE_ARCHIVE: 'Error al archivar/desarchivar',
    LOAD_BACKUPS: 'Error al cargar los backups',
    CREATE_BACKUP: 'Error al crear el backup',
    RESTORE_BACKUP: 'Error al restaurar el backup',
    DELETE_BACKUP: 'Error al eliminar el backup',
    SYNC_ERROR: 'Error al sincronizar',
    NETWORK_ERROR: 'Error de conexión. Modo offline activado',
    UNKNOWN_ERROR: 'Ha ocurrido un error inesperado',
    LOGIN_ERROR: 'Error al iniciar sesión',
    REGISTER_ERROR: 'Error al registrarse',
    LOGOUT_ERROR: 'Error al cerrar sesión',
    UPLOAD_ERROR: 'Error al subir el archivo',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    EMAIL_IN_USE: 'El email ya está registrado',
    WEAK_PASSWORD: 'La contraseña es demasiado débil',
  },

  // Confirmaciones
  CONFIRM: {
    DELETE_NOTE: (title: string) => `¿Eliminar la nota "${title}"?`,
    DELETE_MULTIPLE: (count: number) => `¿Eliminar ${count} nota${count !== 1 ? 's' : ''}?`,
    DELETE_PERMANENTLY: (title: string) => `¿Eliminar permanentemente "${title}"? Esta acción no se puede deshacer.`,
    DELETE_MULTIPLE_PERMANENTLY: (count: number) => `¿Eliminar permanentemente ${count} nota${count !== 1 ? 's' : ''}? Esta acción no se puede deshacer.`,
    EMPTY_TRASH: (count: number) => `¿Vaciar la papelera? Se eliminarán permanentemente ${count} nota${count !== 1 ? 's' : ''}.`,
    RESTORE_NOTE: (title: string) => `¿Restaurar la nota "${title}"?`,
    RESTORE_MULTIPLE: (count: number) => `¿Restaurar ${count} nota${count !== 1 ? 's' : ''}?`,
    CLEAR_ALL_NOTES: '¿Eliminar TODAS las notas? Esta acción no se puede deshacer.',
    LOGOUT: '¿Cerrar sesión?',
    LEAVE_PAGE: 'Tienes cambios sin guardar. ¿Seguro que quieres salir?',
  },

  // Placeholders
  PLACEHOLDER: {
    SEARCH: 'Buscar notas...',
    TITLE: 'Título de la nota',
    CONTENT: 'Escribe tu nota aquí...',
    TAG: 'Nueva etiqueta',
    EMAIL: 'correo@ejemplo.com',
    PASSWORD: '********',
    NAME: 'Nombre completo',
    CONFIRM_PASSWORD: 'Confirmar contraseña',
  },

  // Empty States
  EMPTY: {
    NOTES: 'No hay notas. ¡Crea tu primera nota!',
    FAVORITES: 'No hay notas favoritas. Marca algunas con ⭐',
    ARCHIVED: 'No hay notas archivadas',
    TRASH: 'La papelera está vacía',
    TAGS: 'No hay etiquetas. Crea una desde el formulario de notas',
    SEARCH: (query: string) => `No se encontraron resultados para "${query}"`,
    BACKUPS: 'No hay backups. Crea tu primer backup',
    CALENDAR: 'No hay notas en este mes',
  },
} as const;

// ============================================
// RUTAS DE LA APLICACIÓN
// ============================================

export const ROUTES = {
  SPLASH: '/',
  NOTES: '/notes',
  NOTE_DETAIL: (id: string) => `/notes/${id}`,
  NOTE_EDIT: (id: string) => `/notes/${id}/edit`,
  NOTE_NEW: '/notes/new',
  FAVORITES: '/favorites',
  ARCHIVED: '/archived',
  TRASH: '/trash',
  TAGS: '/tags',
  TAG_NOTES: (tag: string) => `/tags/${encodeURIComponent(tag)}`,
  CALENDAR: '/calendar',
  SETTINGS: '/settings',
  BACKUP: '/backup',
  HELP: '/help',
  DEVELOPER: '/developer',
  CHANGELOG: '/changelog',
  PROFILE: '/profile',
  WELCOME: '/welcome',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

// ============================================
// CONFIGURACIÓN DE BACKUP
// ============================================

export const BACKUP_CONFIG = {
  MAX_BACKUPS: 10,
  AUTO_BACKUP_INTERVALS: [1, 3, 6, 12, 24] as const,
  FILE_PREFIX: 'quicknote_backup',
  FILE_EXTENSION: '.json',
  CURRENT_VERSION: '1.0.0',
} as const;

// ============================================
// CONFIGURACIÓN DE CALENDARIO
// ============================================

export const CALENDAR_CONFIG = {
  WEEK_DAYS: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  MONTHS: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ],
} as const;

// ============================================
// CONFIGURACIÓN DE PAGINACIÓN
// ============================================

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  LIMIT_OPTIONS: [10, 20, 50, 100],
} as const;

// ============================================
// LÍMITES Y VALORES POR DEFECTO
// ============================================

export const LIMITS = {
  MAX_NOTES_PER_PAGE: 100,
  MAX_TAGS_PER_REQUEST: 50,
  MAX_BACKUP_SIZE: 10 * 1024 * 1024, // 10MB
  TOAST_DURATION: 4000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
} as const;

// ============================================
// CONFIGURACIÓN DE TEMA
// ============================================

export const THEME_CONFIG = {
  STORAGE_KEY: 'quicknote_theme',
  DEFAULT_MODE: 'light' as const,
  TRANSITION_DURATION: 300,
} as const;

// ============================================
// CONFIGURACIÓN DE ALMACENAMIENTO LOCAL
// ============================================

export const STORAGE_KEYS = {
  THEME: 'quicknote_theme',
  USER: 'quicknote_user',
  TOKEN: 'quicknote_token',
  BACKUP_HISTORY: 'quicknote_backup_history',
  BACKUPS: 'quicknote_backups',
  SETTINGS: 'quicknote_settings',
  DEVELOPER_MODE: 'quicknote_developer_mode',
  NOTES_VIEW: 'quicknote_notes_view',
  NOTES_SORT: 'quicknote_notes_sort',
  LAST_SYNC: 'quicknote_last_sync',
  RECENT_TAGS: 'quicknote_recent_tags',
} as const;

// ============================================
// CONFIGURACIÓN DE RED
// ============================================

export const NETWORK_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// ============================================
// EXPRESIONES REGULARES
// ============================================

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  TAG: /^[a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ\s]{1,30}$/,
  COLOR: /^#[0-9A-F]{6}$/i,
} as const;

// ============================================
// FORMATOS DE FECHA
// ============================================

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  FILENAME: 'YYYY-MM-DD_HH-mm',
} as const;

// ============================================
// ANIMACIONES
// ============================================

export const ANIMATIONS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
  },
  EASING: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    IN: 'cubic-bezier(0.4, 0, 1, 1)',
    OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// ============================================
// ORDENAMIENTO
// ============================================

export const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Fecha de creación (más reciente)' },
  { value: 'created_at_asc', label: 'Fecha de creación (más antigua)' },
  { value: 'updated_at_desc', label: 'Fecha de modificación (más reciente)' },
  { value: 'updated_at_asc', label: 'Fecha de modificación (más antigua)' },
  { value: 'title_asc', label: 'Título (A-Z)' },
  { value: 'title_desc', label: 'Título (Z-A)' },
] as const;

// ============================================
// IDIOMAS SOPORTADOS
// ============================================

export const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
] as const;

// ============================================
// EXPORTACIÓN POR DEFECTO
// ============================================

export default {
  API_URL,
  ENDPOINTS,
  APP_CONFIG,
  NOTE_CONFIG,
  NOTE_COLORS,
  TAG_CONFIG,
  TAG_COLORS,
  DEFAULT_COLORS,
  TAG_ICONS,
  MESSAGES,
  ROUTES,
  BACKUP_CONFIG,
  CALENDAR_CONFIG,
  PAGINATION_CONFIG,
  LIMITS,
  THEME_CONFIG,
  STORAGE_KEYS,
  NETWORK_CONFIG,
  REGEX,
  DATE_FORMATS,
  ANIMATIONS,
  SORT_OPTIONS,
  SUPPORTED_LANGUAGES,
};