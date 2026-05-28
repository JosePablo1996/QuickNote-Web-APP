// src/services/backupCloudService.ts
import { supabase } from './supabase';
import { Note } from '../models/Note';

export interface CloudBackupMetadata {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  note_count: number;
  version: string;
  is_accumulative: boolean;
  created_at: string;
  updated_at: string;
}

export interface CloudBackupWithData extends CloudBackupMetadata {
  notes_data: BackupData;
}

export interface BackupData {
  version: string;
  timestamp: string;
  total_notes: number;
  notes: Note[];
  metadata: {
    app_version: string;
    export_date: string;
  };
}

/**
 * Detectar si estamos en desarrollo
 */
const isDevelopment = (): boolean => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  }
  return false;
};

/**
 * Construir URL correctamente (sin duplicar /api/v1)
 * ✅ CORREGIDO: Usa la misma lógica que api.ts
 */
const buildUrl = (path: string): string => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  if (isDevelopment()) {
    // En desarrollo: usar proxy de Vite
    console.log(`🔧 Proxy: usando ruta relativa ${normalizedPath}`);
    return normalizedPath;
  }
  
  // En producción: la URL base NO debe incluir /api/v1
  const cleanBaseUrl = apiUrl.replace(/\/api\/v1\/?$/, '');
  const fullUrl = `${cleanBaseUrl}${normalizedPath}`;
  console.log(`🔧 Producción: ${fullUrl}`);
  return fullUrl;
};

class BackupCloudService {
  /**
   * Obtener token JWT de localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Obtener usuario de localStorage
   */
  private getUserEmail(): string | null {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.email || null;
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
    return null;
  }

  /**
   * Función auxiliar para extraer notas de diferentes estructuras
   */
  private extractNotesFromData(data: any): Note[] {
    if (data && data.notes && Array.isArray(data.notes)) {
      console.log('📦 [backupCloudService] Estructura detectada: data.notes');
      return data.notes;
    }
    
    if (data && Array.isArray(data)) {
      console.log('📦 [backupCloudService] Estructura detectada: array directo');
      return data;
    }
    
    if (data && data.data && data.data.notes && Array.isArray(data.data.notes)) {
      console.log('📦 [backupCloudService] Estructura detectada: data.data.notes');
      return data.data.notes;
    }
    
    if (data && data.notes_data && data.notes_data.notes && Array.isArray(data.notes_data.notes)) {
      console.log('📦 [backupCloudService] Estructura detectada: data.notes_data.notes');
      return data.notes_data.notes;
    }
    
    if (data && typeof data === 'object') {
      for (const key of Object.keys(data)) {
        if (data[key] && Array.isArray(data[key]) && data[key].length > 0 && data[key][0]?.title !== undefined) {
          console.log(`📦 [backupCloudService] Estructura detectada: data.${key} (array de notas)`);
          return data[key];
        }
      }
    }
    
    console.warn('⚠️ [backupCloudService] No se pudo extraer notas de la estructura:', data);
    return [];
  }

  /**
   * Guardar backup en Supabase
   */
  async saveBackupToCloud(notes: Note[]): Promise<CloudBackupMetadata | null> {
    const token = this.getAuthToken();
    
    if (!token) {
      console.error('❌ No hay token de autenticación');
      throw new Error('Usuario no autenticado');
    }

    if (notes.length === 0) {
      throw new Error('No hay notas para respaldar');
    }

    const backupData: BackupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      total_notes: notes.length,
      notes: notes,
      metadata: {
        app_version: '2.1.0',
        export_date: new Date().toISOString(),
      },
    };

    const jsonContent = JSON.stringify(backupData);
    const fileSize = new Blob([jsonContent]).size;
    const fileName = `quicknote_cloud_backup_${Date.now()}.json`;

    // ✅ CORREGIDO: Usar buildUrl() para evitar duplicar /api/v1
    const url = buildUrl('/api/v1/backup/cloud');

    console.log(`☁️ Guardando backup en la nube...`);
    console.log(`📡 URL: ${url}`);
    console.log(`📝 Notas: ${notes.length}, Tamaño: ${fileSize} bytes`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        file_name: fileName,
        file_size: fileSize,
        note_count: notes.length,
        notes_data: backupData
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('❌ Error guardando backup:', response.status, error);
      throw new Error(error.detail || 'Error al guardar backup en la nube');
    }

    const result = await response.json();
    console.log('✅ Backup guardado en la nube:', result.id);
    
    return {
      id: result.id,
      user_id: result.user_id,
      file_name: result.file_name,
      file_size: result.file_size,
      note_count: result.note_count,
      version: result.version,
      is_accumulative: result.is_accumulative,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  }

  /**
   * Obtener lista de backups desde Supabase
   */
  async getCloudBackups(): Promise<CloudBackupMetadata[]> {
    const token = this.getAuthToken();
    
    if (!token) {
      console.log('⚠️ No hay token de autenticación, no se pueden obtener backups');
      return [];
    }

    // ✅ CORREGIDO: Usar buildUrl() para evitar duplicar /api/v1
    const url = buildUrl('/api/v1/backup/cloud');

    console.log(`📋 Obteniendo backups de la nube...`);
    console.log(`📡 URL: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('ℹ️ No hay backups en la nube (404)');
          return [];
        }
        console.error('❌ Error obteniendo backups:', response.status);
        return [];
      }

      const result = await response.json();
      console.log(`✅ ${result?.length || 0} backups encontrados en la nube`);
      
      return result?.map((backup: any) => ({
        id: backup.id,
        user_id: backup.user_id,
        file_name: backup.file_name,
        file_size: backup.file_size,
        note_count: backup.note_count,
        version: backup.version,
        is_accumulative: backup.is_accumulative,
        created_at: backup.created_at,
        updated_at: backup.updated_at,
      })) || [];
    } catch (error) {
      console.error('❌ Error en getCloudBackups:', error);
      return [];
    }
  }

  /**
   * Obtener un backup específico de la nube (incluye datos)
   */
  async getCloudBackup(backupId: string): Promise<CloudBackupWithData | null> {
    const token = this.getAuthToken();
    
    if (!token) {
      console.error('❌ No hay token de autenticación');
      return null;
    }

    // ✅ CORREGIDO: Usar buildUrl() para evitar duplicar /api/v1
    const url = buildUrl(`/api/v1/backup/cloud/${backupId}`);

    console.log(`🔍 Obteniendo backup ${backupId} de la nube...`);
    console.log(`📡 URL: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        console.warn(`⚠️ Backup ${backupId} no encontrado en la nube`);
        return null;
      }

      if (!response.ok) {
        console.error('❌ Error obteniendo backup:', response.status);
        return null;
      }

      const backup = await response.json();
      console.log(`✅ Backup encontrado: ${backup.file_name}`);
      
      let notesData = backup.notes_data;
      if (typeof notesData === 'string') {
        try {
          notesData = JSON.parse(notesData);
        } catch (e) {
          console.error('Error parsing notes_data:', e);
        }
      }
      
      return {
        id: backup.id,
        user_id: backup.user_id,
        file_name: backup.file_name,
        file_size: backup.file_size,
        note_count: backup.note_count,
        version: backup.version,
        is_accumulative: backup.is_accumulative,
        created_at: backup.created_at,
        updated_at: backup.updated_at,
        notes_data: notesData as BackupData,
      };
    } catch (error) {
      console.error('❌ Error en getCloudBackup:', error);
      return null;
    }
  }

  /**
   * Restaurar backup desde Supabase
   */
  async restoreCloudBackup(backupId: string): Promise<Note[]> {
    const cloudBackup = await this.getCloudBackup(backupId);
    
    if (!cloudBackup || !cloudBackup.notes_data) {
      console.error('❌ Error cargando datos del backup');
      throw new Error('Backup no encontrado en la nube');
    }

    const notes = this.extractNotesFromData(cloudBackup.notes_data);
    
    if (!notes || notes.length === 0) {
      console.error('❌ No se encontraron notas en el backup');
      console.log('📦 Estructura del backup:', cloudBackup.notes_data);
      throw new Error('No hay notas en el backup');
    }

    console.log(`✅ ${notes.length} notas recuperadas de la nube`);
    return notes;
  }

  /**
   * Eliminar backup de Supabase
   */
  async deleteCloudBackup(backupId: string): Promise<boolean> {
    const token = this.getAuthToken();
    
    if (!token) {
      console.error('❌ No hay token de autenticación');
      return false;
    }

    // ✅ CORREGIDO: Usar buildUrl() para evitar duplicar /api/v1
    const url = buildUrl(`/api/v1/backup/cloud/${backupId}`);

    console.log(`🗑️ Eliminando backup ${backupId} de la nube...`);
    console.log(`📡 URL: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        console.log(`⚠️ Backup ${backupId} no existe en la nube (ya fue eliminado)`);
        return true;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error eliminando backup:', response.status, errorData);
        return false;
      }

      const result = await response.json();
      console.log('✅ Backup eliminado de la nube:', backupId);
      return true;
    } catch (error) {
      console.error('❌ Error en deleteCloudBackup:', error);
      console.warn(`⚠️ Error de red al eliminar backup ${backupId}, considerando como eliminado`);
      return true;
    }
  }

  /**
   * Obtener cantidad de backups en la nube
   */
  async getCloudBackupCount(): Promise<number> {
    const backups = await this.getCloudBackups();
    return backups.length;
  }

  /**
   * Sincronizar backups locales con la nube
   */
  async syncWithCloud(localBackups: Array<{
    id: string;
    file_name: string;
    file_size: number;
    note_count: number;
    created_at: string;
    source: string;
  }>): Promise<{
    synced_count: number;
    failed_count: number;
    cloud_backups_to_download: Array<{
      id: string;
      file_name: string;
      file_size: number;
      note_count: number;
      created_at: string;
      notes_data: BackupData;
    }>;
    message: string;
  }> {
    const token = this.getAuthToken();
    const userEmail = this.getUserEmail();
    
    if (!token) {
      console.error('❌ No hay token de autenticación (auth_token)');
      throw new Error('Usuario no autenticado');
    }

    console.log('✅ Token JWT encontrado en localStorage para syncWithCloud');
    console.log('✅ Usuario:', userEmail || 'desconocido');
    console.log('✅ Token longitud:', token.length);

    // ✅ CORREGIDO: Usar buildUrl() para evitar duplicar /api/v1
    const url = buildUrl('/api/v1/backup/cloud/sync');

    console.log(`📡 Enviando solicitud de sincronización a: ${url}`);
    console.log(`📡 Backups locales a sincronizar: ${localBackups.length}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ local_backups: localBackups })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('❌ Error en respuesta del backend:', response.status, error);
      
      if (response.status === 401) {
        console.error('🔑 Token inválido o expirado. Por favor, cierra sesión y vuelve a iniciar.');
      }
      
      throw new Error(error.detail || `Error HTTP ${response.status}: Error al sincronizar con la nube`);
    }

    const result = await response.json();
    console.log(`✅ Sincronización completada: ${result.synced_count} reportados, ${result.cloud_backups_to_download?.length || 0} para descargar`);
    
    return result;
  }

  /**
   * Subir un backup específico a la nube (para sincronización)
   */
  async uploadBackupForSync(backupData: BackupData, fileName: string): Promise<CloudBackupMetadata | null> {
    const token = this.getAuthToken();
    
    if (!token) {
      console.error('❌ No hay token de autenticación');
      throw new Error('Usuario no autenticado');
    }

    const jsonContent = JSON.stringify(backupData);
    const fileSize = new Blob([jsonContent]).size;

    // ✅ CORREGIDO: Usar buildUrl() para evitar duplicar /api/v1
    const url = buildUrl('/api/v1/backup/cloud');

    console.log(`📤 Subiendo backup a la nube: ${fileName}`);
    console.log(`📡 URL: ${url}`);
    console.log(`📝 Notas: ${backupData.notes.length}, Tamaño: ${fileSize} bytes`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        file_name: fileName,
        file_size: fileSize,
        note_count: backupData.notes.length,
        notes_data: backupData
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('❌ Error subiendo backup:', response.status, error);
      throw new Error(error.detail || `Error HTTP ${response.status}: Error al subir backup`);
    }

    const result = await response.json();
    console.log(`✅ Backup subido a la nube: ${result.id}`);
    
    return {
      id: result.id,
      user_id: result.user_id,
      file_name: result.file_name,
      file_size: result.file_size,
      note_count: result.note_count,
      version: result.version,
      is_accumulative: result.is_accumulative,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  }
}

// Exportar instancia única
export const backupCloudService = new BackupCloudService();