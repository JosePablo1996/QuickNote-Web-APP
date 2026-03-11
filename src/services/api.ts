import { Note, NoteCreate, NoteUpdate } from '../models/Note';

// Usar variable de entorno para la URL de la API
const API_URL = import.meta.env.VITE_API_URL || 'https://quicknote-api-app-react.onrender.com/api/v1';

// Detectar si estamos en desarrollo
const isDevelopment = (): boolean => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  }
  return false;
};

// Helper for conditional logging
const log = {
  info: (...args: any[]) => {
    if (isDevelopment()) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (isDevelopment()) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment()) {
      console.warn(...args);
    }
  }
};

class ApiService {
  private baseUrl: string;

  constructor() {
    // Asegurar que la URL no tenga barra al final
    this.baseUrl = API_URL.replace(/\/$/, '');
    
    console.log('%c🔧================================', 'color: #00ff00; font-weight: bold');
    console.log('%c🌐 API Service inicializado', 'color: #00ff00; font-weight: bold');
    console.log('%c🔧================================', 'color: #00ff00; font-weight: bold');
    console.log('📌 URL Base:', this.baseUrl);
    console.log('🔧 Modo:', isDevelopment() ? '✅ DESARROLLO' : '🚀 PRODUCCIÓN');
    console.log('📦 Variables de entorno:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD
    });
    
    // Verificar si la URL es localhost en desarrollo
    if (isDevelopment() && !this.baseUrl.includes('localhost')) {
      console.warn('⚠️ [API] Estás en modo desarrollo pero la API apunta a:', this.baseUrl);
      console.warn('⚠️ [API] Debería ser: http://localhost:3001/api/v1');
    }
    
    if (!isDevelopment() && this.baseUrl.includes('localhost')) {
      console.warn('⚠️ [API] Estás en modo producción pero la API apunta a localhost');
    }
    
    console.log('%c🔧================================\n', 'color: #00ff00; font-weight: bold');
  }

  // ============== MÉTODOS DE AUTENTICACIÓN ==============

  /**
   * Obtener token de autenticación
   */
  private getAuthToken(): string | null {
    // Intentar diferentes keys donde podría estar el token
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const tokenPreview = token ? `${token.substring(0, 20)}...` : 'null';
    console.log(`🔑 [API] Token en localStorage: ${tokenPreview}`);
    
    return token;
  }

  /**
   * Obtener headers con autenticación - Versión simplificada
   */
  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 [API] Token añadido a headers:', token.substring(0, 30) + '...');
    } else {
      console.error('❌ [API] No hay token disponible para la petición');
      console.log('📦 [API] localStorage keys:', Object.keys(localStorage));
    }
    
    return headers;
  }

  /**
   * Obtener ID del usuario actual
   */
  private getCurrentUserId(): string | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      return user.id ? String(user.id) : null;
    } catch {
      return null;
    }
  }

  // ============== NOTES CRUD ==============

  /**
   * Obtener todas las notas del usuario actual
   */
  async getNotes(deleted: boolean = false): Promise<Note[]> {
    console.log('%c📥================================', 'color: #ffaa00; font-weight: bold');
    console.log(`📥 [API] GET /notes?deleted=${deleted}`);
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.warn('⚠️ [API] No hay token de autenticación');
        return [];
      }

      const url = `${this.baseUrl}/notes/?deleted=${deleted}`;
      console.log(`🌐 [API] Fetching: ${url}`);
      
      const headers = this.getAuthHeaders();
      console.log('📦 [API] Headers:', { 
        ...headers, 
        Authorization: headers.Authorization ? 'Bearer [HIDDEN]' : 'none' 
      });
      
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      const endTime = Date.now();
      
      console.log(`⏱️ [API] Tiempo de respuesta: ${endTime - startTime}ms`);
      console.log(`📥 [API] Respuesta status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.error(`❌ [API] Error response: ${response.status} ${response.statusText}`);
        
        if (response.status === 401) {
          console.error('❌ [API] Token inválido o expirado');
        }
        
        const errorText = await response.text();
        console.error('📄 [API] Error response body:', errorText);
        
        console.log('%c❌================================\n', 'color: #ff0000; font-weight: bold');
        return [];
      }
      
      const data = await response.json();
      console.log(`✅ [API] ${data.length} notas encontradas`);
      console.log('%c✅================================\n', 'color: #00ff00; font-weight: bold');
      
      return Array.isArray(data) ? data : [];
      
    } catch (error) {
      console.error('❌ [API] Error en getNotes:', error);
      console.log('%c❌================================\n', 'color: #ff0000; font-weight: bold');
      return [];
    }
  }

  /**
   * Obtener una nota por ID
   */
  async getNoteById(id: string): Promise<Note | null> {
    console.log(`🔍 [API] GET /notes/${id}`);
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.warn('⚠️ [API] No hay token de autenticación');
        return null;
      }

      const url = `${this.baseUrl}/notes/${id}`;
      console.log(`🌐 [API] Fetching: ${url}`);
      
      const headers = this.getAuthHeaders();
      const response = await fetch(url, {
        headers: headers
      });
      
      console.log(`📥 [API] Respuesta status: ${response.status}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('📄 [API] Nota no encontrada');
          return null;
        }
        console.error(`❌ [API] Error response: ${response.status}`);
        const errorText = await response.text();
        console.error('📄 [API] Error response body:', errorText);
        return null;
      }
      
      const note = await response.json();
      console.log('✅ [API] Nota encontrada:', note);
      return note;
      
    } catch (error) {
      console.error('❌ [API] Error en getNoteById:', error);
      return null;
    }
  }

  /**
   * Crear una nueva nota
   */
  async createNote(note: NoteCreate): Promise<Note | null> {
    console.log('%c📝================================', 'color: #0066ff; font-weight: bold');
    console.log('📝 [API] Creando nota');
    console.log('🌐 [API] URL Base:', this.baseUrl);
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.error('❌ [API] No hay token de autenticación');
        console.log('%c❌================================\n', 'color: #ff0000; font-weight: bold');
        return null;
      }

      // ✅ Crear objeto limpio sin user_id (el backend lo asigna)
      const noteToSend = {
        title: String(note.title || '').trim(),
        content: String(note.content || '').trim(),
        color: String(note.color || '#3B82F6'),
        is_favorite: Boolean(note.is_favorite),
        is_archived: Boolean(note.is_archived),
        tags: Array.isArray(note.tags) ? note.tags.map(t => String(t).trim()).filter(t => t) : []
      };
      
      // Validaciones
      if (!noteToSend.title) {
        console.error('❌ [API] El título es requerido');
        return null;
      }
      
      const url = `${this.baseUrl}/notes/`;
      console.log('📤 [API] Petición POST a:', url);
      console.log('📦 [API] Datos a enviar:', JSON.stringify(noteToSend, null, 2));
      
      const headers = this.getAuthHeaders();
      console.log('📦 [API] Headers:', { 
        ...headers, 
        Authorization: headers.Authorization ? 'Bearer [HIDDEN]' : 'none' 
      });
      
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(noteToSend)
      });
      const endTime = Date.now();
      
      console.log(`⏱️ [API] Tiempo de respuesta: ${endTime - startTime}ms`);
      console.log(`📥 [API] Respuesta status: ${response.status} ${response.statusText}`);
      
      // Intentar obtener el cuerpo de la respuesta
      const responseText = await response.text();
      console.log('📄 [API] Respuesta raw:', responseText);
      
      if (!response.ok) {
        console.error('❌ [API] Error en la petición:');
        console.error(`  - Status: ${response.status}`);
        console.error(`  - StatusText: ${response.statusText}`);
        console.error(`  - Body: ${responseText}`);
        
        if (response.status === 401) {
          console.error('❌ [API] Token inválido o expirado');
        }
        
        console.log('%c❌================================\n', 'color: #ff0000; font-weight: bold');
        return null;
      }
      
      // Parsear respuesta JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ [API] Error al parsear respuesta JSON:', e);
        console.log('%c❌================================\n', 'color: #ff0000; font-weight: bold');
        return null;
      }
      
      console.log('✅ [API] Nota creada exitosamente:');
      console.log(`  - ID: ${data.id}`);
      console.log(`  - Título: ${data.title}`);
      console.log('%c✅================================\n', 'color: #00ff00; font-weight: bold');
      
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en createNote:', error);
      if (error instanceof Error) {
        console.error('  - Message:', error.message);
      }
      console.log('%c❌================================\n', 'color: #ff0000; font-weight: bold');
      return null;
    }
  }

  /**
   * Actualizar una nota existente
   */
  async updateNote(id: string, note: NoteUpdate): Promise<Note | null> {
    console.log(`✏️ [API] PUT /notes/${id}`);
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.error('❌ [API] No hay token de autenticación');
        return null;
      }

      // Crear objeto para actualización
      const noteToSend: Record<string, any> = {};
      
      if (note.title !== undefined) noteToSend.title = String(note.title).trim();
      if (note.content !== undefined) noteToSend.content = String(note.content).trim();
      if (note.color !== undefined) noteToSend.color = String(note.color);
      if (note.is_favorite !== undefined) noteToSend.is_favorite = Boolean(note.is_favorite);
      if (note.is_archived !== undefined) noteToSend.is_archived = Boolean(note.is_archived);
      if (note.tags !== undefined) {
        noteToSend.tags = Array.isArray(note.tags) 
          ? note.tags.map(t => String(t).trim()).filter(t => t) 
          : [];
      }
      if (note.deleted_at !== undefined) noteToSend.deleted_at = note.deleted_at;

      console.log('📦 [API] Datos a enviar:', noteToSend);

      const url = `${this.baseUrl}/notes/${id}`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(noteToSend)
      });
      
      console.log(`📥 [API] Respuesta status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`❌ [API] Error response: ${response.status}`);
        const errorText = await response.text();
        console.error('📄 [API] Error response body:', errorText);
        
        if (response.status === 401) {
          console.error('❌ [API] Token inválido o expirado');
        }
        return null;
      }
      
      const data = await response.json();
      console.log('✅ [API] Nota actualizada');
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en updateNote:', error);
      return null;
    }
  }

  /**
   * Eliminar una nota (hard delete)
   */
  async deleteNote(id: string): Promise<boolean> {
    console.log(`🗑️ [API] DELETE /notes/${id}`);
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.error('❌ [API] No hay token de autenticación');
        return false;
      }

      const url = `${this.baseUrl}/notes/${id}`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });
      
      console.log(`📥 [API] Respuesta status: ${response.status}`);
      
      if (response.status === 204) {
        console.log('✅ [API] Nota eliminada');
        return true;
      }
      
      console.error(`❌ [API] Error response: ${response.status}`);
      return false;
      
    } catch (error) {
      console.error('❌ [API] Error en deleteNote:', error);
      return false;
    }
  }

  /**
   * Soft delete - mover a papelera
   */
  async softDeleteNote(id: string): Promise<Note | null> {
    console.log(`🗑️ [API] SOFT DELETE /notes/${id}`);
    return await this.updateNote(id, {
      deleted_at: new Date().toISOString()
    });
  }

  /**
   * Restaurar nota
   */
  async restoreNote(id: string): Promise<Note | null> {
    console.log(`🔄 [API] RESTORE /notes/${id}`);
    return await this.updateNote(id, {
      deleted_at: null
    });
  }

  /**
   * Obtener solo notas eliminadas
   */
  async getDeletedNotes(): Promise<Note[]> {
    return this.getNotes(true);
  }

  /**
   * Verificar autenticación
   */
  isAuthenticated(): boolean {
    const hasToken = !!this.getAuthToken();
    const hasUser = !!this.getCurrentUserId();
    return hasToken && hasUser;
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}

// Exportar instancia única
export const api = new ApiService();