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
   * Guardar backup en Supabase
   */
  async saveBackupToCloud(notes: Note[]): Promise<CloudBackupMetadata | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

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

    // 1. Insertar metadatos
    const { data: backup, error: backupError } = await supabase
      .from('backups')
      .insert({
        user_id: user.id,
        file_name: fileName,
        file_size: fileSize,
        note_count: notes.length,
        version: '1.0.0',
        is_accumulative: true,
      })
      .select()
      .single();

    if (backupError) {
      console.error('❌ Error guardando metadata en Supabase:', backupError);
      throw new Error('Error al guardar backup en la nube');
    }

    // 2. Insertar datos completos
    const { error: dataError } = await supabase
      .from('backup_data')
      .insert({
        backup_id: backup.id,
        data: backupData,
      });

    if (dataError) {
      console.error('❌ Error guardando datos en Supabase:', dataError);
      // Limpiar el registro de metadata si falla
      await supabase.from('backups').delete().eq('id', backup.id);
      throw new Error('Error al guardar datos del backup');
    }

    console.log('✅ Backup guardado en la nube:', backup.id);
    return backup;
  }

  /**
   * Obtener lista de backups desde Supabase
   */
  async getCloudBackups(): Promise<CloudBackupMetadata[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('backups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error cargando backups de Supabase:', error);
      return [];
    }

    console.log(`✅ ${data?.length || 0} backups encontrados en la nube`);
    return data || [];
  }

  /**
   * Restaurar backup desde Supabase
   */
  async restoreCloudBackup(backupId: string): Promise<Note[]> {
    const { data: backupData, error } = await supabase
      .from('backup_data')
      .select('data')
      .eq('backup_id', backupId)
      .single();

    if (error || !backupData) {
      console.error('❌ Error cargando datos del backup:', error);
      throw new Error('Backup no encontrado en la nube');
    }

    const data = backupData.data as BackupData;
    
    if (!data.notes || !Array.isArray(data.notes)) {
      throw new Error('Formato de backup inválido');
    }

    console.log(`✅ ${data.notes.length} notas recuperadas de la nube`);
    return data.notes;
  }

  /**
   * Eliminar backup de Supabase
   */
  async deleteCloudBackup(backupId: string): Promise<boolean> {
    // Primero eliminar los datos del backup
    const { error: dataError } = await supabase
      .from('backup_data')
      .delete()
      .eq('backup_id', backupId);

    if (dataError) {
      console.error('❌ Error eliminando datos del backup:', dataError);
      return false;
    }

    // Luego eliminar los metadatos
    const { error } = await supabase
      .from('backups')
      .delete()
      .eq('id', backupId);

    if (error) {
      console.error('❌ Error eliminando backup:', error);
      return false;
    }

    console.log('✅ Backup eliminado de la nube:', backupId);
    return true;
  }

  /**
   * Obtener cantidad de backups en la nube
   */
  async getCloudBackupCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('backups')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error contando backups:', error);
      return 0;
    }

    return count || 0;
  }
}

// Exportar instancia única
export const backupCloudService = new BackupCloudService();