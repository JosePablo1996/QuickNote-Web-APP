import { supabase } from './supabase';
import { Note } from '../models/Note';
import { BackupData } from '../models/BackupHistory';

export interface BackupMetadata {
  id: string;
  file_name: string;
  file_size: number;
  note_count: number;
  version: string;
  is_accumulative: boolean;
  created_at: string;
  is_latest: boolean;
}

class BackupSupabaseWebService {
  /**
   * Obtener todos los backups del usuario actual
   */
  async getBackups(): Promise<BackupMetadata[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('backups')
        .select('id, file_name, file_size, note_count, version, is_accumulative, created_at, is_latest')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(backup => ({
        id: backup.id,
        file_name: backup.file_name,
        file_size: backup.file_size,
        note_count: backup.note_count,
        version: backup.version,
        is_accumulative: backup.is_accumulative,
        created_at: backup.created_at,
        is_latest: backup.is_latest,
      }));
    } catch (error) {
      console.error('Error obteniendo backups:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo backup en Supabase
   */
  async createBackup(notes: Note[], isAccumulative: boolean = true): Promise<BackupMetadata> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

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
          user_id: user.id,
        },
      };

      const jsonString = JSON.stringify(backupData);
      const fileSize = new Blob([jsonString]).size;

      // Verificar si es el primer backup del usuario
      const { data: existingBackups } = await supabase
        .from('backups')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      const isFirstBackup = !existingBackups || existingBackups.length === 0;

      // Si no es el primer backup, marcar el anterior como no latest
      if (!isFirstBackup) {
        await supabase
          .from('backups')
          .update({ is_latest: false })
          .eq('user_id', user.id)
          .eq('is_latest', true);
      }

      const { data, error } = await supabase
        .from('backups')
        .insert({
          user_id: user.id,
          file_name: fileName,
          file_size: fileSize,
          note_count: notes.length,
          backup_data: backupData,
          version: '1.0.0',
          is_accumulative: isAccumulative,
          is_latest: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Descargar copia local
      this.downloadBackup(fileName, jsonString);

      return {
        id: data.id,
        file_name: data.file_name,
        file_size: data.file_size,
        note_count: data.note_count,
        version: data.version,
        is_accumulative: data.is_accumulative,
        created_at: data.created_at,
        is_latest: data.is_latest,
      };
    } catch (error) {
      console.error('Error creando backup:', error);
      throw error;
    }
  }

  /**
   * Restaurar notas desde un backup
   */
  async restoreBackup(backupId: string): Promise<Note[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('backups')
        .select('backup_data')
        .eq('id', backupId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return data.backup_data.notes;
    } catch (error) {
      console.error('Error restaurando backup:', error);
      throw error;
    }
  }

  /**
   * Eliminar un backup específico
   */
  async deleteBackup(backupId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('backups')
        .delete()
        .eq('id', backupId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error eliminando backup:', error);
      throw error;
    }
  }

  /**
   * Obtener el último backup del usuario
   */
  async getLatestBackup(): Promise<BackupMetadata | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('backups')
        .select('id, file_name, file_size, note_count, version, is_accumulative, created_at, is_latest')
        .eq('user_id', user.id)
        .eq('is_latest', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No hay resultados
        throw error;
      }

      return {
        id: data.id,
        file_name: data.file_name,
        file_size: data.file_size,
        note_count: data.note_count,
        version: data.version,
        is_accumulative: data.is_accumulative,
        created_at: data.created_at,
        is_latest: data.is_latest,
      };
    } catch (error) {
      console.error('Error obteniendo último backup:', error);
      return null;
    }
  }

  /**
   * Comparar notas actuales con el último backup
   */
  async getBackupStats(notes: Note[]): Promise<{
    totalNotes: number;
    lastBackup: BackupMetadata | null;
    notesSinceLastBackup: number;
    needsBackup: boolean;
  }> {
    const lastBackup = await this.getLatestBackup();
    
    if (!lastBackup) {
      return {
        totalNotes: notes.length,
        lastBackup: null,
        notesSinceLastBackup: notes.length,
        needsBackup: notes.length > 0,
      };
    }

    const notesSinceLastBackup = notes.length - lastBackup.note_count;
    
    return {
      totalNotes: notes.length,
      lastBackup,
      notesSinceLastBackup: Math.max(0, notesSinceLastBackup),
      needsBackup: notesSinceLastBackup > 0,
    };
  }

  /**
   * Generar nombre de archivo para el backup
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
   * Descargar backup como archivo JSON
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
export const backupSupabaseWeb = new BackupSupabaseWebService();