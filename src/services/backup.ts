import { Note } from '../models/Note';

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
  data: BackupData; // Contenido completo del backup
}

export interface BackupStats {
  totalNotes: number;
  lastBackup: BackupMetadata | null;
  notesSinceLastBackup: number;
  needsBackup: boolean;
}

// Clave para guardar los datos completos de los backups
const BACKUP_DATA_PREFIX = 'quicknote_backup_data_';

class BackupService {
  private backups: BackupMetadata[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Cargar backups desde localStorage
   */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('quicknote_backups_metadata');
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
      localStorage.setItem('quicknote_backups_metadata', JSON.stringify(this.backups));
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
   * Obtener todos los backups del usuario (versión asincrónica)
   */
  async getBackups(): Promise<BackupMetadata[]> {
    return this.getBackupsSync();
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
   * Crear un nuevo backup
   */
  createBackup(notes: Note[], isAccumulative: boolean = true): BackupMetadata {
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
    };

    // Actualizar el flag is_latest de otros backups
    const updatedBackups = this.backups.map(b => ({
      ...b,
      is_latest: false
    }));

    updatedBackups.unshift(backup);
    this.backups = updatedBackups;
    
    // Guardar los datos completos del backup
    this.saveBackupData(backup.id, backupData);
    this.saveToStorage();
    this.notifyListeners();

    // Descargar el archivo
    this.downloadBackup(fileName, jsonContent);

    return backup;
  }

  /**
   * Restaurar un backup desde el historial
   */
  async restoreBackup(backupId: string): Promise<Note[]> {
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
          
          // Validar estructura
          if (!data.notes || !Array.isArray(data.notes)) {
            reject(new Error('Formato de backup inválido'));
            return;
          }

          // Registrar en el historial
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
          };

          // Guardar los datos del backup subido
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
    // Eliminar todos los datos de backups
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