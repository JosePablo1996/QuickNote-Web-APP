// services/api.ts
import { Note, NoteCreate, NoteUpdate } from '../models/Note';
import { compressData, decompressData } from '../utils/compression';

// ============================================
// ✅ URL DE LA API - CONFIGURADA PARA PRODUCCIÓN
// ============================================
// Hardcodeada temporalmente para pruebas en Render
const API_URL = 'https://quicknote-api-app-react.onrender.com';

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

// ============================================
// INTERFACES PARA PASSKEYS
// ============================================

export interface PasskeyCredential {
  id: string;
  credential_id: string;
  device_name: string;
  created_at: string;
  last_used_at: string | null;
}

export interface PasskeyRegistrationOptions {
  challenge_id: string;
  options: any;
}

export interface PasskeyAuthenticationOptions {
  challenge_id: string;
  options: any;
  rpId: string;
}

// ============================================
// INTERFACES PARA 2FA
// ============================================

export interface TwoFactorEnableResponse {
  secret: string;
  qr_code: string;
  manual_key: string;
  message: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
  secret: string;
  password?: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  message: string;
  backup_codes?: string[];
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  method: string | null;
  created_at: string | null;
}

export interface TwoFactorLoginVerifyResponse {
  success: boolean;
  message: string;
  token: string;
  user: any;
}

// ============================================
// INTERFACES PARA CLOUD BACKUP
// ============================================

export interface CloudBackupMetadata {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  note_count: number;
  created_at: string;
}

export interface CloudBackup extends CloudBackupMetadata {
  notes_data: any;
}

// ============================================
// CLASE PRINCIPAL API SERVICE
// ============================================

class ApiService {
  private baseUrl: string;

  constructor() {
    // ✅ AHORA USA LA URL HARCODEADA
    this.baseUrl = API_URL;
    
    console.log('%c🔧================================', 'color: #00ff00; font-weight: bold');
    console.log('%c🌐 API Service inicializado', 'color: #00ff00; font-weight: bold');
    console.log('%c🔧================================', 'color: #00ff00; font-weight: bold');
    console.log('📌 URL Base:', this.baseUrl);
    console.log('🔧 Modo:', isDevelopment() ? '✅ DESARROLLO' : '🚀 PRODUCCIÓN');
    console.log('🔧 API URL:', API_URL);
    console.log('%c🔧================================\n', 'color: #00ff00; font-weight: bold');
  }

  // ============== MÉTODOS DE AUTENTICACIÓN ==============

  private getAuthToken(): string | null {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    return token;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

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

  // ============================================
  // ENDPOINTS CLOUD BACKUP (CON COMPRESIÓN)
  // ============================================

  /**
   * Guardar backup en la nube con compresión automática
   */
  async saveCloudBackup(notes: any[]): Promise<CloudBackup | null> {
    console.log('☁️ [API] POST /backup/cloud - Guardando backup en la nube');
    console.log('📦 [API] Notas a enviar:', notes.length);
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.error('❌ [API] No hay token de autenticación');
        throw new Error('No autenticado');
      }

      console.log('🗜️ [API] Comprimiendo datos...');
      const compressionResult = await compressData({ notes });
      
      const originalSizeKB = (compressionResult.originalSize / 1024).toFixed(2);
      const compressedSizeKB = (compressionResult.compressedSize / 1024).toFixed(2);
      
      console.log(`🗜️ [API] Compresión completada: ${originalSizeKB} KB → ${compressedSizeKB} KB (${compressionResult.ratio} reducción, método: ${compressionResult.method})`);
      
      const backupData = {
        file_name: `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
        file_size: compressionResult.compressedSize,
        note_count: notes.length,
        notes_data: {
          __compressed__: true,
          method: compressionResult.method,
          data: compressionResult.compressed
        }
      };

      const url = `${this.baseUrl}/api/v1/backup/cloud`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(backupData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [API] Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText };
        }
        throw new Error(errorData.detail || 'Error al guardar backup en la nube');
      }
      
      const data = await response.json();
      console.log('✅ [API] Backup guardado correctamente:', data.id);
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en saveCloudBackup:', error);
      throw error;
    }
  }

  /**
   * Listar backups en la nube del usuario
   */
  async getCloudBackups(): Promise<CloudBackupMetadata[]> {
    console.log('☁️ [API] GET /backup/cloud - Listando backups');
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.warn('⚠️ [API] No hay token de autenticación');
        return [];
      }

      const url = `${this.baseUrl}/api/v1/backup/cloud`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('⚠️ [API] No autenticado');
          return [];
        }
        return [];
      }
      
      const data = await response.json();
      const backups = Array.isArray(data) ? data : [];
      console.log(`✅ [API] ${backups.length} backups encontrados`);
      return backups;
      
    } catch (error) {
      console.error('❌ [API] Error en getCloudBackups:', error);
      return [];
    }
  }

  /**
   * Restaurar backup específico de la nube con descompresión automática
   */
  async restoreCloudBackup(backupId: string): Promise<any[] | null> {
    console.log(`☁️ [API] GET /backup/cloud/${backupId} - Restaurando backup`);
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.error('❌ [API] No hay token de autenticación');
        throw new Error('No autenticado');
      }

      const url = `${this.baseUrl}/api/v1/backup/cloud/${backupId}`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [API] Error:', errorData);
        throw new Error(errorData.detail || 'Error al restaurar backup');
      }
      
      const data = await response.json();
      
      let notes: any[] = [];
      
      if (data.notes_data && data.notes_data.__compressed__ === true) {
        console.log(`🗜️ [API] Datos comprimidos detectados (método: ${data.notes_data.method})`);
        console.log(`🗜️ [API] Descomprimiendo datos...`);
        
        try {
          const decompressed = await decompressData<{ notes: any[] }>(
            data.notes_data.data,
            data.notes_data.method
          );
          notes = decompressed.notes;
          console.log(`🗜️ [API] Descompresión completada: ${notes.length} notas`);
        } catch (decompressError) {
          console.error('❌ [API] Error en descompresión:', decompressError);
          throw new Error('Error al descomprimir los datos del backup');
        }
      } 
      else if (data.notes_data && Array.isArray(data.notes_data)) {
        console.log('📦 [API] Backup sin compresión detectado (formato antiguo)');
        notes = data.notes_data;
      } 
      else if (data.notes_data && data.notes_data.notes && Array.isArray(data.notes_data.notes)) {
        console.log('📦 [API] Backup sin compresión detectado (formato objeto)');
        notes = data.notes_data.notes;
      }
      else {
        console.warn('⚠️ [API] Formato de backup no reconocido');
      }
      
      console.log(`✅ [API] Backup restaurado: ${notes.length} notas`);
      return notes;
      
    } catch (error) {
      console.error('❌ [API] Error en restoreCloudBackup:', error);
      throw error;
    }
  }

  /**
   * Eliminar backup de la nube
   */
  async deleteCloudBackup(backupId: string): Promise<boolean> {
    console.log(`☁️ [API] DELETE /backup/cloud/${backupId} - Eliminando backup`);
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.error('❌ [API] No hay token de autenticación');
        return false;
      }

      const url = `${this.baseUrl}/api/v1/backup/cloud/${backupId}`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [API] Error:', errorData);
        return false;
      }
      
      console.log('✅ [API] Backup eliminado correctamente');
      return true;
      
    } catch (error) {
      console.error('❌ [API] Error en deleteCloudBackup:', error);
      return false;
    }
  }

  /**
   * Obtener información del límite de backups
   */
  async getBackupLimitInfo(): Promise<{ current: number; max: number; remaining: number; is_full: boolean; is_low: boolean } | null> {
    console.log('📊 [API] GET /backup/cloud/limit/info');
    
    try {
      const token = this.getAuthToken();
      if (!token) return null;

      const url = `${this.baseUrl}/api/v1/backup/cloud/limit/info`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.error('❌ [API] Error en getBackupLimitInfo:', error);
      return null;
    }
  }

  // ============================================
  // ENDPOINTS 2FA (TWO-FACTOR AUTHENTICATION)
  // ============================================

  async enableTwoFactor(): Promise<TwoFactorEnableResponse | null> {
    console.log('🔐 [API] POST /auth/2fa/enable');
    
    try {
      const url = `${this.baseUrl}/api/v1/auth/2fa/enable`;
      const headers = this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers: headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al iniciar activación de 2FA');
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en enableTwoFactor:', error);
      throw error;
    }
  }

  async verifyEnableTwoFactor(code: string, secret: string): Promise<TwoFactorVerifyResponse | null> {
    console.log('🔐 [API] POST /auth/2fa/verify-enable');
    
    try {
      const url = `${this.baseUrl}/api/v1/auth/2fa/verify-enable`;
      const headers = this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ code, secret })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Código inválido');
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en verifyEnableTwoFactor:', error);
      throw error;
    }
  }

  async verifyTwoFactorLogin(code: string, tempToken: string): Promise<TwoFactorLoginVerifyResponse | null> {
    console.log('🔐 [API] POST /auth/2fa/verify-login');
    
    try {
      const url = `${this.baseUrl}/api/v1/auth/2fa/verify-login`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ code, temp_token: tempToken })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Código 2FA inválido');
      }
      
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en verifyTwoFactorLogin:', error);
      throw error;
    }
  }

  async verifyBackupCode(code: string, tempToken: string): Promise<TwoFactorLoginVerifyResponse | null> {
    console.log('🔐 [API] POST /auth/2fa/verify-backup');
    
    try {
      const url = `${this.baseUrl}/api/v1/auth/2fa/verify-backup`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ code, temp_token: tempToken })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Código de respaldo inválido');
      }
      
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en verifyBackupCode:', error);
      throw error;
    }
  }

  async disableTwoFactor(): Promise<{ success: boolean; message: string } | null> {
    console.log('🔐 [API] POST /auth/2fa/disable');
    
    try {
      const url = `${this.baseUrl}/api/v1/auth/2fa/disable`;
      const headers = this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers: headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al desactivar 2FA');
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en disableTwoFactor:', error);
      throw error;
    }
  }

  async getTwoFactorStatus(): Promise<TwoFactorStatusResponse | null> {
    console.log('🔐 [API] GET /auth/2fa/status');
    
    try {
      const url = `${this.baseUrl}/api/v1/auth/2fa/status`;
      const headers = this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en getTwoFactorStatus:', error);
      return null;
    }
  }

  // ============================================
  // ENDPOINTS PASSKEYS
  // ============================================

  async getPasskeys(): Promise<PasskeyCredential[]> {
    console.log('🔐 [API] GET /passkeys/list');
    
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        return [];
      }

      const url = `${this.baseUrl}/api/v1/passkeys/list/${userId}`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      const passkeysList = data.passkeys || data.data || data || [];
      return Array.isArray(passkeysList) ? passkeysList : [];
      
    } catch (error) {
      console.error('❌ [API] Error en getPasskeys:', error);
      return [];
    }
  }

  async startPasskeyRegistration(email: string): Promise<PasskeyRegistrationOptions | null> {
    console.log('🔐 [API] POST /passkeys/register/start');
    
    try {
      const url = `${this.baseUrl}/api/v1/passkeys/register/start`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al iniciar registro de passkey');
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en startPasskeyRegistration:', error);
      throw error;
    }
  }

  async completePasskeyRegistration(
    email: string,
    credential: any,
    deviceName: string
  ): Promise<boolean> {
    console.log('🔐 [API] POST /passkeys/register/complete');
    
    try {
      const url = `${this.baseUrl}/api/v1/passkeys/register/complete`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          email,
          credential,
          device_name: deviceName
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al completar registro de passkey');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ [API] Error en completePasskeyRegistration:', error);
      throw error;
    }
  }

  async deletePasskey(credentialId: string, userId: string): Promise<boolean> {
    console.log('🗑️ [API] DELETE /passkeys');
    
    try {
      const url = `${this.baseUrl}/api/v1/passkeys/${credentialId}?user_id=${userId}`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return true;
        }
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ [API] Error en deletePasskey:', error);
      return false;
    }
  }

  async startPasskeyLogin(email?: string): Promise<PasskeyAuthenticationOptions | null> {
    console.log('🔐 [API] POST /passkeys/login/start');
    
    try {
      const url = `${this.baseUrl}/api/v1/passkeys/login/start`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email: email || null })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al iniciar autenticación');
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en startPasskeyLogin:', error);
      throw error;
    }
  }

  async completePasskeyLogin(email: string, credential: any): Promise<{ token: string; user: any } | null> {
    console.log('🔐 [API] POST /passkeys/login/complete');
    
    try {
      const url = `${this.baseUrl}/api/v1/passkeys/login/complete`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          email,
          credential
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al completar autenticación');
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en completePasskeyLogin:', error);
      throw error;
    }
  }

  // ============================================
  // ENDPOINTS NOTES CRUD
  // ============================================

  async getNotes(deleted: boolean = false): Promise<Note[]> {
    console.log(`📥 [API] GET /notes?deleted=${deleted}`);
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        return [];
      }

      const url = `${this.baseUrl}/api/v1/notes/?deleted=${deleted}`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
      
    } catch (error) {
      console.error('❌ [API] Error en getNotes:', error);
      return [];
    }
  }

  async getNoteById(id: string): Promise<Note | null> {
    console.log(`🔍 [API] GET /notes/${id}`);
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        return null;
      }

      const url = `${this.baseUrl}/api/v1/notes/${id}`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        headers: headers
      });
      
      if (!response.ok) {
        return null;
      }
      
      const note = await response.json();
      return note;
      
    } catch (error) {
      console.error('❌ [API] Error en getNoteById:', error);
      return null;
    }
  }

  async createNote(note: NoteCreate): Promise<Note | null> {
    console.log('📝 [API] Creando nota');
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        return null;
      }

      const noteToSend = {
        title: String(note.title || '').trim(),
        content: String(note.content || '').trim(),
        color: String(note.color || '#3B82F6'),
        is_favorite: Boolean(note.is_favorite),
        is_archived: Boolean(note.is_archived),
        tags: Array.isArray(note.tags) ? note.tags.map(t => String(t).trim()).filter(t => t) : []
      };
      
      if (!noteToSend.title) {
        return null;
      }
      
      const url = `${this.baseUrl}/api/v1/notes/`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(noteToSend)
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en createNote:', error);
      return null;
    }
  }

  async updateNote(id: string, note: NoteUpdate): Promise<Note | null> {
    console.log(`✏️ [API] PUT /notes/${id}`);
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        return null;
      }

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

      const url = `${this.baseUrl}/api/v1/notes/${id}`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(noteToSend)
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ [API] Error en updateNote:', error);
      return null;
    }
  }

  async deleteNote(id: string): Promise<boolean> {
    console.log(`🗑️ [API] DELETE /notes/${id}`);
    
    try {
      const url = `${this.baseUrl}/api/v1/notes/${id}`;
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });
      
      return response.status === 204 || response.ok;
      
    } catch (error) {
      console.error('❌ [API] Error en deleteNote:', error);
      return false;
    }
  }

  async softDeleteNote(id: string): Promise<Note | null> {
    return await this.updateNote(id, {
      deleted_at: new Date().toISOString()
    });
  }

  async restoreNote(id: string): Promise<Note | null> {
    return await this.updateNote(id, {
      deleted_at: null
    });
  }

  async getDeletedNotes(): Promise<Note[]> {
    return this.getNotes(true);
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.getAuthToken();
    const hasUser = !!this.getCurrentUserId();
    return hasToken && hasUser;
  }

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

// Exportar también como objeto con los métodos de backup para compatibilidad
export const backupCloudService = {
  saveBackupToCloud: (notes: any[]) => api.saveCloudBackup(notes),
  getCloudBackups: () => api.getCloudBackups(),
  restoreCloudBackup: (backupId: string) => api.restoreCloudBackup(backupId),
  deleteCloudBackup: (backupId: string) => api.deleteCloudBackup(backupId)
};