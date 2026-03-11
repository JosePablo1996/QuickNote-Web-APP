import { Note } from './Note';

export interface BackupHistory {
  file_name: string;
  timestamp: string;
  total_notes: number;
  note_ids: string[];
  based_on?: string;
  new_notes_ids: string[];
  version?: string;
  file_size?: number;
}

export interface BackupData {
  version: string;
  timestamp: string;
  total_notes: number;
  notes: Note[];
  based_on?: string;
  new_notes?: string[];
  metadata?: {
    app_version: string;
    export_date: string;
    user_id?: string;
  };
}

export interface BackupFileInfo {
  file_name: string;
  file_size: number;
  modified: string;
  note_count: number;
  timestamp: string;
  version: string;
  is_accumulative: boolean;
  new_notes: number;
}

export const BackupUtils = {
  // Crear entrada de historial
  createHistoryEntry: (
    fileName: string,
    notes: Note[],
    newNoteIds: string[] = [],
    basedOn?: string
  ): BackupHistory => ({
    file_name: fileName,
    timestamp: new Date().toISOString(),
    total_notes: notes.length,
    note_ids: notes.map(n => n.id).filter(Boolean),
    based_on: basedOn,
    new_notes_ids: newNoteIds,
    version: '1.0.0',
  }),

  // Formatear tamaño de archivo
  formatFileSize: (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  },

  // Formatear fecha
  formatDate: (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Ordenar historial (más reciente primero)
  sortByDate: (history: BackupHistory[]): BackupHistory[] => {
    return [...history].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  // Obtener último backup
  getLatestBackup: (history: BackupHistory[]): BackupHistory | undefined => {
    if (history.length === 0) return undefined;
    return BackupUtils.sortByDate(history)[0];
  },

  // Calcular notas nuevas entre backups
  getNewNotesCount: (current: BackupHistory, previous?: BackupHistory): number => {
    if (!previous) return current.total_notes;
    
    const currentIds = new Set(current.note_ids);
    const previousIds = new Set(previous.note_ids);
    
    let newCount = 0;
    currentIds.forEach(id => {
      if (!previousIds.has(id)) newCount++;
    });
    
    return newCount;
  },

  // Verificar si un backup es acumulativo
  isAccumulative: (backup: BackupHistory): boolean => {
    return !!backup.based_on;
  },

  // Obtener estadísticas de backups
  getStats: (history: BackupHistory[]): {
    total: number;
    total_size: number;
    avg_notes: number;
    last_backup: BackupHistory | null;
    first_backup: BackupHistory | null;
  } => {
    if (history.length === 0) {
      return {
        total: 0,
        total_size: 0,
        avg_notes: 0,
        last_backup: null,
        first_backup: null,
      };
    }

    const sorted = BackupUtils.sortByDate(history);
    const totalNotes = sorted.reduce((sum, h) => sum + h.total_notes, 0);

    return {
      total: history.length,
      total_size: 0, // Esto se calcularía con los archivos reales
      avg_notes: Math.round(totalNotes / history.length),
      last_backup: sorted[0],
      first_backup: sorted[sorted.length - 1],
    };
  },

  // Extraer notas del backup data
  extractNotesFromBackup: (backupData: BackupData): Note[] => {
    return backupData.notes.map(noteData => ({
      id: noteData.id,
      title: noteData.title || '',
      content: noteData.content || '',
      color: noteData.color || '#3B82F6',
      is_favorite: noteData.is_favorite || false,
      is_archived: noteData.is_archived || false,
      tags: noteData.tags || [],
      created_at: noteData.created_at || new Date().toISOString(),
      updated_at: noteData.updated_at || new Date().toISOString(),
      deleted_at: noteData.deleted_at,
      user_id: noteData.user_id,
    }));
  },

  // Crear datos de backup
  createBackupData: (notes: Note[], version: string = '1.0.0', basedOn?: string): BackupData => ({
    version,
    timestamp: new Date().toISOString(),
    total_notes: notes.length,
    notes: notes,
    based_on: basedOn,
    metadata: {
      app_version: version,
      export_date: new Date().toISOString(),
    },
  }),
};