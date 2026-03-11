import { Note } from '../models/Note';
import { User } from '../models/User';

// Claves de localStorage
const STORAGE_KEYS = {
  NOTES: 'quicknote_notes',
  DELETED_NOTES: 'quicknote_deleted_notes',
  USER: 'quicknote_user',
  SETTINGS: 'quicknote_settings',
  LAST_SYNC: 'quicknote_last_sync',
  BACKUP_HISTORY: 'quicknote_backup_history',
  THEME: 'quicknote_theme',
  VIEW_PREFERENCES: 'quicknote_view_prefs',
} as const;

class StorageService {
  // ============== NOTES ==============

  /**
   * Guardar notas en localStorage
   */
  saveNotes(notes: Note[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes to localStorage:', error);
    }
  }

  /**
   * Obtener notas de localStorage
   */
  getNotes(): Note[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading notes from localStorage:', error);
      return [];
    }
  }

  /**
   * Guardar notas eliminadas
   */
  saveDeletedNotes(notes: Note[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DELETED_NOTES, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving deleted notes to localStorage:', error);
    }
  }

  /**
   * Obtener notas eliminadas
   */
  getDeletedNotes(): Note[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DELETED_NOTES);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading deleted notes from localStorage:', error);
      return [];
    }
  }

  /**
   * Limpiar todas las notas
   */
  clearNotes(): void {
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.DELETED_NOTES);
  }

  // ============== USER ==============

  /**
   * Guardar usuario
   */
  saveUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }

  /**
   * Obtener usuario
   */
  getUser(): User | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      return null;
    }
  }

  // ============== SYNC ==============

  /**
   * Guardar timestamp de última sincronización
   */
  saveLastSync(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Error saving last sync to localStorage:', error);
    }
  }

  /**
   * Obtener timestamp de última sincronización
   */
  getLastSync(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  }

  // ============== SETTINGS ==============

  /**
   * Guardar configuración
   */
  saveSettings(settings: Record<string, any>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }

  /**
   * Obtener configuración
   */
  getSettings(): Record<string, any> {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return {};
    }
  }

  // ============== THEME ==============

  /**
   * Guardar tema
   */
  saveTheme(theme: 'light' | 'dark' | 'system'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  /**
   * Obtener tema
   */
  getTheme(): 'light' | 'dark' | 'system' | null {
    return localStorage.getItem(STORAGE_KEYS.THEME) as any;
  }

  // ============== VIEW PREFERENCES ==============

  /**
   * Guardar preferencias de vista
   */
  saveViewPreferences(prefs: { view: 'grid' | 'list'; sort: string }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW_PREFERENCES, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving view preferences:', error);
    }
  }

  /**
   * Obtener preferencias de vista
   */
  getViewPreferences(): { view: 'grid' | 'list'; sort: string } | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIEW_PREFERENCES);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  // ============== UTILITIES ==============

  /**
   * Limpiar todo el almacenamiento
   */
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Obtener tamaño total usado (en bytes aproximados)
   */
  getTotalSize(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        total += (key.length + (value?.length || 0)) * 2; // Aproximación en bytes
      }
    }
    return total;
  }

  /**
   * Verificar si hay espacio disponible (estimado)
   */
  hasSpace(requiredBytes: number): boolean {
    const used = this.getTotalSize();
    const maxSize = 5 * 1024 * 1024; // 5MB estimado
    return used + requiredBytes < maxSize;
  }
}

// Exportar instancia única
export const storage = new StorageService();

// Exportar constantes para uso en otros archivos
export { STORAGE_KEYS };