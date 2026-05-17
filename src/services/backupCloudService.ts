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

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const url = `${apiUrl}/api/v1/backup/cloud`;

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

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const url = `${apiUrl}/api/v1/backup/cloud`;

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

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const url = `${apiUrl}/api/v1/backup/cloud/${backupId}`;

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
        notes_data: backup.notes_data as BackupData,
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

    const data = cloudBackup.notes_data;
    
    if (!data.notes || !Array.isArray(data.notes)) {
      throw new Error('Formato de backup inválido');
    }

    console.log(`✅ ${data.notes.length} notas recuperadas de la nube`);
    return data.notes;
  }

  /**
   * Eliminar backup de Supabase
   * ✅ MEJORADO: Maneja errores 404 y considera éxito si el backup no existe
   */
  async deleteCloudBackup(backupId: string): Promise<boolean> {
    const token = this.getAuthToken();
    
    if (!token) {
      console.error('❌ No hay token de autenticación');
      return false;
    }

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const url = `${apiUrl}/api/v1/backup/cloud/${backupId}`;

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

      // ✅ 404 significa que el backup ya no existe - consideramos éxito
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
      // ✅ En caso de error de red, consideramos que el backup puede estar eliminado
      // para evitar backups huérfanos en el frontend
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

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const url = `${apiUrl}/api/v1/backup/cloud/sync`;

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

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const url = `${apiUrl}/api/v1/backup/cloud`;

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