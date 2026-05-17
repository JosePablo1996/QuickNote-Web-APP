// src/services/backup.ts
import { Note } from '../models/Note';
import { backupCloudService } from './backupCloudService';
import { supabase } from './supabase';

export interface BackupMetadata {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  note_count: number;
  version: string;
  is_accumulative: boolean;
  created_at: string;
  is_latest: boolean;
  source?: 'local' | 'cloud';
  cloud_id?: string;
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

export interface BackupWithData extends BackupMetadata {
  data: BackupData;
}

export interface BackupStats {
  totalNotes: number;
  lastBackup: BackupMetadata | null;
  notesSinceLastBackup: number;
  needsBackup: boolean;
}

export interface BackupLimitInfo {
  current: number;
  max: number;
  remaining: number;
  isFull: boolean;
  isLow: boolean;
  totalSize: number;
}

// Clave para guardar los datos completos de los backups
const BACKUP_DATA_PREFIX = 'quicknote_backup_data_';
const BACKUP_METADATA_KEY = 'quicknote_backups_metadata';
const SYNCED_BACKUPS_KEY = 'quicknote_synced_backup_ids';
const MAX_BACKUPS_LIMIT = 10;

class BackupService {
  private backups: BackupMetadata[] = [];
  private listeners: (() => void)[] = [];
  private isSyncing = false;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Cargar backups desde localStorage
   */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(BACKUP_METADATA_KEY);
      if (saved) {
        this.backups = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading backups from storage:', error);
      this.backups = [];
    }
  }

  /**
   * Guardar backups en localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(this.backups));
    } catch (error) {
      console.error('Error saving backups to storage:', error);
    }
  }

  /**
   * Guardar datos completos de un backup
   */
  private saveBackupData(backupId: string, data: BackupData): void {
    try {
      localStorage.setItem(`${BACKUP_DATA_PREFIX}${backupId}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving backup data for ${backupId}:`, error);
    }
  }

  /**
   * Obtener datos completos de un backup
   */
  private getBackupData(backupId: string): BackupData | null {
    try {
      const data = localStorage.getItem(`${BACKUP_DATA_PREFIX}${backupId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading backup data for ${backupId}:`, error);
      return null;
    }
  }

  /**
   * Eliminar datos completos de un backup
   */
  private deleteBackupData(backupId: string): void {
    try {
      localStorage.removeItem(`${BACKUP_DATA_PREFIX}${backupId}`);
    } catch (error) {
      console.error(`Error deleting backup data for ${backupId}:`, error);
    }
  }

  /**
   * Registrar un backup como sincronizado con la nube
   */
  private markAsSynced(backupId: string, cloudId: string): void {
    try {
      const synced = this.getSyncedBackups();
      synced[backupId] = cloudId;
      localStorage.setItem(SYNCED_BACKUPS_KEY, JSON.stringify(synced));
      
      // Actualizar metadata local
      const backup = this.backups.find(b => b.id === backupId);
      if (backup) {
        backup.cloud_id = cloudId;
        backup.source = 'cloud';
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Error marking backup as synced:', error);
    }
  }

  /**
   * Obtener backups sincronizados
   */
  private getSyncedBackups(): Record<string, string> {
    try {
      const synced = localStorage.getItem(SYNCED_BACKUPS_KEY);
      return synced ? JSON.parse(synced) : {};
    } catch {
      return {};
    }
  }

  /**
   * Verificar si un backup ya está sincronizado con la nube
   */
  private isBackupSynced(localId: string): boolean {
    const synced = this.getSyncedBackups();
    return !!synced[localId];
  }

  /**
   * Suscribirse a cambios en los backups
   */
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notificar a los suscriptores
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Obtener backups (versión sincrónica)
   */
  getBackupsSync(): BackupMetadata[] {
    return [...this.backups].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * Obtener todos los backups (fusionando locales + nube)
   */
  async getBackups(): Promise<BackupMetadata[]> {
    // Obtener backups locales
    const localBackups = this.getBackupsSync();
    
    // Obtener backups de la nube (si hay usuario autenticado)
    let cloudBackups: BackupMetadata[] = [];
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const cloudBackupList = await backupCloudService.getCloudBackups();
        cloudBackups = cloudBackupList.map(cloud => ({
          id: `cloud_${cloud.id}`,
          user_id: cloud.user_id,
          file_name: cloud.file_name,
          file_size: cloud.file_size,
          note_count: cloud.note_count,
          version: '1.0.0',
          is_accumulative: true,
          created_at: cloud.created_at,
          is_latest: false,
          source: 'cloud',
          cloud_id: cloud.id,
        }));
      }
    } catch (error) {
      console.error('Error loading cloud backups:', error);
    }
    
    // Fusionar y eliminar duplicados (por cloud_id)
    const allBackups = [...localBackups];
    const existingCloudIds = new Set(
      localBackups.filter(b => b.cloud_id).map(b => b.cloud_id)
    );
    
    for (const cloudBackup of cloudBackups) {
      if (!existingCloudIds.has(cloudBackup.cloud_id)) {
        allBackups.push(cloudBackup);
      }
    }
    
    // Ordenar por fecha (más reciente primero)
    return allBackups.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * Obtener información del límite de backups
   */
  async getBackupLimitInfo(): Promise<BackupLimitInfo> {
    const backups = await this.getBackups();
    const current = backups.length;
    const max = MAX_BACKUPS_LIMIT;
    const remaining = max - current;
    const totalSize = backups.reduce((sum, b) => sum + b.file_size, 0);
    
    return {
      current,
      max,
      remaining,
      isFull: remaining <= 0,
      isLow: remaining > 0 && remaining <= 2,
      totalSize
    };
  }

  /**
   * Verificar si se puede crear un nuevo backup
   * @returns { canCreate: boolean, limitInfo: BackupLimitInfo, message?: string }
   */
  async canCreateBackup(): Promise<{ canCreate: boolean; limitInfo: BackupLimitInfo; message?: string }> {
    const limitInfo = await this.getBackupLimitInfo();
    
    if (limitInfo.isFull) {
      return {
        canCreate: false,
        limitInfo,
        message: `Has alcanzado el límite de ${limitInfo.max} backups. Elimina algunos para continuar.`
      };
    }
    
    if (limitInfo.isLow) {
      return {
        canCreate: true,
        limitInfo,
        message: `Te quedan solo ${limitInfo.remaining} espacios de ${limitInfo.max} para backups.`
      };
    }
    
    return {
      canCreate: true,
      limitInfo
    };
  }

  /**
   * Eliminar los backups más antiguos (para liberar espacio)
   * @param keepCount - Número de backups a mantener (los más recientes)
   */
  async deleteOldestBackups(keepCount: number = 5): Promise<{ deleted: number; failed: number }> {
    const backups = await this.getBackups();
    
    if (backups.length <= keepCount) {
      return { deleted: 0, failed: 0 };
    }
    
    // Ordenar por fecha (más antiguos primero)
    const oldestFirst = [...backups].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    const toDelete = oldestFirst.slice(0, backups.length - keepCount);
    let deleted = 0;
    let failed = 0;
    
    for (const backup of toDelete) {
      try {
        await this.deleteBackup(backup.id);
        deleted++;
      } catch (error) {
        console.error(`Error deleting backup ${backup.id}:`, error);
        failed++;
      }
    }
    
    return { deleted, failed };
  }

  /**
   * Obtener un backup completo con sus datos
   */
  getBackupWithData(backupId: string): BackupWithData | null {
    const metadata = this.backups.find(b => b.id === backupId);
    if (!metadata) return null;

    const data = this.getBackupData(backupId);
    if (!data) return null;

    return {
      ...metadata,
      data
    };
  }

  /**
   * Obtener backup de la nube por ID
   */
  async getCloudBackupWithData(cloudId: string): Promise<BackupWithData | null> {
    try {
      const cloudBackup = await backupCloudService.getCloudBackup(cloudId);
      if (!cloudBackup) return null;
      
      return {
        id: `cloud_${cloudBackup.id}`,
        user_id: cloudBackup.user_id,
        file_name: cloudBackup.file_name,
        file_size: cloudBackup.file_size,
        note_count: cloudBackup.note_count,
        version: '1.0.0',
        is_accumulative: true,
        created_at: cloudBackup.created_at,
        is_latest: false,
        source: 'cloud',
        cloud_id: cloudBackup.id,
        data: cloudBackup.notes_data as BackupData,
      };
    } catch (error) {
      console.error('Error getting cloud backup:', error);
      return null;
    }
  }

  /**
   * Sincronizar backups locales con la nube
   */
  async syncWithCloud(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) {
      console.log('Sincronización ya en progreso...');
      return { synced: 0, failed: 0 };
    }
    
    this.isSyncing = true;
    let synced = 0;
    let failed = 0;
    
    try {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      let userEmail: string | null = null;
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userEmail = user.email;
        } catch (e) {
          console.warn('Error parsing stored user:', e);
        }
      }
      
      if (!token) {
        console.error('❌ No hay token de autenticación (auth_token)');
        return { synced: 0, failed: 0 };
      }
      
      console.log('✅ Token JWT encontrado en localStorage');
      console.log('✅ Usuario:', userEmail || 'desconocido');
      
      const localBackupsList = this.backups.map(backup => ({
        id: backup.id,
        file_name: backup.file_name,
        file_size: backup.file_size,
        note_count: backup.note_count,
        created_at: backup.created_at,
        source: backup.source || 'local'
      }));
      
      console.log(`📡 Enviando ${localBackupsList.length} backups locales al backend...`);
      
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const url = `${apiUrl}/api/v1/backup/cloud/sync`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ local_backups: localBackupsList })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error en respuesta del backend:', response.status, errorData);
        throw new Error(errorData.detail || `Error HTTP ${response.status}`);
      }
      
      const syncResult = await response.json();
      
      console.log(`📡 Respuesta del backend: ${syncResult.synced_count} reportados, ${syncResult.cloud_backups_to_download?.length || 0} para descargar`);
      
      if (syncResult.cloud_backups_to_download && syncResult.cloud_backups_to_download.length > 0) {
        for (const cloudBackup of syncResult.cloud_backups_to_download) {
          try {
            console.log(`☁️ Descargando backup de nube: ${cloudBackup.file_name}`);
            
            const existingBackup = this.backups.find(b => b.cloud_id === cloudBackup.id);
            
            if (!existingBackup) {
              const newBackupId = `cloud_${cloudBackup.id}`;
              const newBackup: BackupMetadata = {
                id: newBackupId,
                user_id: userEmail || 'unknown',
                file_name: cloudBackup.file_name,
                file_size: cloudBackup.file_size,
                note_count: cloudBackup.note_count,
                version: '1.0.0',
                is_accumulative: true,
                created_at: cloudBackup.created_at,
                is_latest: false,
                source: 'cloud',
                cloud_id: cloudBackup.id
              };
              
              this.saveBackupData(newBackupId, cloudBackup.notes_data);
              this.backups.unshift(newBackup);
              this.saveToStorage();
              synced++;
              console.log(`✅ Backup ${cloudBackup.file_name} descargado de la nube`);
            } else {
              console.log(`⏭️ Backup ${cloudBackup.file_name} ya existe localmente`);
            }
          } catch (error) {
            console.error(`❌ Error descargando backup ${cloudBackup.id}:`, error);
            failed++;
          }
        }
      } else {
        console.log('📡 No hay backups nuevos para descargar de la nube');
      }
      
      this.notifyListeners();
      
      console.log(`📡 Sincronización completada: ${synced} descargados, ${failed} fallidos`);
      
      return { synced, failed };
    } catch (error) {
      console.error('❌ Error en syncWithCloud:', error);
      return { synced: 0, failed: 0 };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Crear un nuevo backup (local + nube si hay usuario)
   * ✅ Ahora verifica el límite antes de crear
   */
  async createBackup(notes: Note[], isAccumulative: boolean = true): Promise<BackupMetadata> {
    // ✅ Verificar límite antes de crear
    const { canCreate, limitInfo, message } = await this.canCreateBackup();
    
    if (!canCreate) {
      throw new Error(`LÍMITE_ALCANZADO:${JSON.stringify(limitInfo)}`);
    }
    
    const timestamp = new Date();
    const fileName = this.generateFileName(notes.length, timestamp);
    
    const backupData: BackupData = {
      version: '1.0.0',
      timestamp: timestamp.toISOString(),
      total_notes: notes.length,
      notes: notes,
      metadata: {
        app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        export_date: timestamp.toISOString(),
      },
    };

    const jsonContent = JSON.stringify(backupData, null, 2);
    const fileSize = new Blob([jsonContent]).size;

    const backup: BackupMetadata = {
      id: `backup_${timestamp.getTime()}`,
      user_id: 'local',
      file_name: fileName,
      file_size: fileSize,
      note_count: notes.length,
      version: '1.0.0',
      is_accumulative: isAccumulative,
      created_at: timestamp.toISOString(),
      is_latest: true,
      source: 'local',
    };

    const updatedBackups = this.backups.map(b => ({
      ...b,
      is_latest: false
    }));

    updatedBackups.unshift(backup);
    this.backups = updatedBackups;
    
    this.saveBackupData(backup.id, backupData);
    this.saveToStorage();
    this.notifyListeners();

    this.downloadBackup(fileName, jsonContent);

    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('☁️ Usuario autenticado, sincronizando backup con la nube...');
        const cloudBackup = await backupCloudService.saveBackupToCloud(notes);
        if (cloudBackup && cloudBackup.id) {
          this.markAsSynced(backup.id, cloudBackup.id);
          console.log(`✅ Backup sincronizado con la nube (ID: ${cloudBackup.id})`);
        }
      }
    } catch (error) {
      console.warn('⚠️ No se pudo sincronizar el backup con la nube:', error);
    }

    return backup;
  }

  /**
   * Restaurar un backup desde el historial (local o nube)
   */
  async restoreBackup(backupId: string): Promise<Note[]> {
    if (backupId.startsWith('cloud_')) {
      const cloudId = backupId.replace('cloud_', '');
      const cloudBackup = await this.getCloudBackupWithData(cloudId);
      if (!cloudBackup) {
        throw new Error('Backup en la nube no encontrado');
      }
      return cloudBackup.data.notes;
    }
    
    const backupWithData = this.getBackupWithData(backupId);
    if (!backupWithData) {
      throw new Error('Backup no encontrado o datos corruptos');
    }

    return backupWithData.data.notes;
  }

  /**
   * Restaurar desde archivo subido
   */
  async restoreFromFile(file: File): Promise<Note[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content) as BackupData;
          
          if (!data.notes || !Array.isArray(data.notes)) {
            reject(new Error('Formato de backup inválido'));
            return;
          }

          const backup: BackupMetadata = {
            id: `upload_${Date.now()}`,
            user_id: 'local',
            file_name: file.name,
            file_size: file.size,
            note_count: data.notes.length,
            version: data.version || '1.0.0',
            is_accumulative: false,
            created_at: data.timestamp || new Date().toISOString(),
            is_latest: false,
            source: 'local',
          };

          this.saveBackupData(backup.id, data);

          const updatedBackups = [backup, ...this.backups];
          this.backups = updatedBackups;
          this.saveToStorage();
          this.notifyListeners();

          resolve(data.notes);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  }

  /**
   * Descargar un backup del historial
   */
  async downloadBackupFromHistory(backupId: string): Promise<void> {
    if (backupId.startsWith('cloud_')) {
      const cloudId = backupId.replace('cloud_', '');
      const cloudBackup = await this.getCloudBackupWithData(cloudId);
      if (!cloudBackup) {
        throw new Error('Backup en la nube no encontrado');
      }
      const jsonContent = JSON.stringify(cloudBackup.data, null, 2);
      this.downloadBackup(cloudBackup.file_name, jsonContent);
      return;
    }
    
    const backupWithData = this.getBackupWithData(backupId);
    if (!backupWithData) {
      throw new Error('Backup no encontrado');
    }

    const jsonContent = JSON.stringify(backupWithData.data, null, 2);
    this.downloadBackup(backupWithData.file_name, jsonContent);
  }

  /**
   * Eliminar un backup
   */
  async deleteBackup(backupId: string): Promise<void> {
    if (backupId.startsWith('cloud_')) {
      const cloudId = backupId.replace('cloud_', '');
      try {
        await backupCloudService.deleteCloudBackup(cloudId);
        console.log(`✅ Backup en la nube ${cloudId} eliminado`);
      } catch (error) {
        console.error('Error deleting cloud backup:', error);
      }
      return;
    }
    
    this.backups = this.backups.filter(b => b.id !== backupId);
    this.deleteBackupData(backupId);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Obtener estadísticas de backups
   */
  async getBackupStats(currentNotes: Note[]): Promise<BackupStats> {
    const sortedBackups = this.getBackupsSync();
    const lastBackup = sortedBackups.length > 0 ? sortedBackups[0] : null;
    
    let notesSinceLastBackup = 0;
    if (lastBackup) {
      notesSinceLastBackup = currentNotes.length - lastBackup.note_count;
    }

    return {
      totalNotes: currentNotes.length,
      lastBackup,
      notesSinceLastBackup: Math.max(0, notesSinceLastBackup),
      needsBackup: !lastBackup || notesSinceLastBackup > 0,
    };
  }

  /**
   * Limpiar todos los backups (útil para pruebas)
   */
  async clearAllBackups(): Promise<void> {
    for (const backup of this.backups) {
      this.deleteBackupData(backup.id);
    }
    this.backups = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Generar nombre de archivo
   */
  private generateFileName(noteCount: number, date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `quicknote_backup_${year}-${month}-${day}_${hours}-${minutes}_${noteCount}notas.json`;
  }

  /**
   * Descargar backup
   */
  private downloadBackup(fileName: string, content: string): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Exportar instancia única
export const backupService = new BackupService();