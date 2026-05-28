// src/hooks/useOfflineNotes.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineStorage, SyncStats } from '../services/offlineStorage';
import { syncService } from '../services/syncService';
import { useOnlineStatus } from './useOnlineStatus';
import { Note, NoteShape, NoteIcon, NoteSize, ColorIntensity } from '../models/Note';

// Valores por defecto para propiedades del modelo Note
const DEFAULT_SHAPE: NoteShape = 'square';

// Interfaz para el retorno del hook
interface UseOfflineNotesReturn {
  notes: Note[];
  isLoading: boolean;
  isSyncing: boolean;
  pendingCount: number;
  queueCount: number;
  lastSync: Date | null;
  isOnline: boolean;
  wasOffline: boolean;
  createNote: (noteData: Partial<Note>) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<boolean>;
  forceSync: () => Promise<void>;
  getSyncStats: () => Promise<SyncStats>;
  clearAllOfflineData: () => Promise<void>;
}

/**
 * Convierte una nota del almacenamiento offline a una nota del modelo Note
 */
function toNoteModel(offlineNote: any): Note {
  let validShape: NoteShape = DEFAULT_SHAPE;
  if (offlineNote.shape && ['square', 'rounded', 'circle'].includes(offlineNote.shape)) {
    validShape = offlineNote.shape as NoteShape;
  }

  return {
    id: offlineNote.id,
    title: offlineNote.title || 'Nueva nota',
    content: offlineNote.content || '',
    color: offlineNote.color || '#ffffff',
    shape: validShape,
    icon: offlineNote.icon !== undefined ? offlineNote.icon : undefined,
    size: offlineNote.size !== undefined ? offlineNote.size : undefined,
    colorIntensity: offlineNote.colorIntensity !== undefined ? offlineNote.colorIntensity : undefined,
    is_favorite: offlineNote.is_favorite || false,
    is_archived: offlineNote.is_archived || false,
    tags: offlineNote.tags || [],
    created_at: offlineNote.created_at,
    updated_at: offlineNote.updated_at,
    deleted_at: offlineNote.deleted_at || null,
  };
}

/**
 * Convierte una nota del modelo Note a formato de almacenamiento offline
 */
function toOfflineNote(note: Note): any {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    color: note.color,
    shape: note.shape,
    icon: note.icon,
    size: note.size,
    colorIntensity: note.colorIntensity,
    is_favorite: note.is_favorite,
    is_archived: note.is_archived,
    tags: note.tags,
    created_at: note.created_at,
    updated_at: note.updated_at,
    deleted_at: note.deleted_at,
  };
}

/**
 * Hook personalizado para gestionar notas en modo offline
 * Proporciona funcionalidad completa de CRUD con soporte offline
 */
export function useOfflineNotes(): UseOfflineNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [queueCount, setQueueCount] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { isOnline, wasOffline } = useOnlineStatus();
  
  // ✅ Refs para controlar bucles y estado de montaje
  const isMountedRef = useRef(true);
  const initializedRef = useRef(false);
  const syncingRef = useRef(false);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialSyncDoneRef = useRef(false);

  /**
   * Cargar todas las notas desde el almacenamiento local
   */
  const loadNotes = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const storedNotes = await offlineStorage.getAllNotes();
      const validNotes: Note[] = storedNotes.map(toNoteModel);
      setNotes(validNotes);
    } catch (error) {
      console.error('Error cargando notas offline:', error);
    }
  }, []);

  /**
   * Actualizar estadísticas de sincronización
   */
  const updateSyncStats = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const stats = await offlineStorage.getSyncStats();
      setPendingCount(stats.pendingNotes);
      setQueueCount(stats.queueItems);
      
      const lastSyncStr = localStorage.getItem('last_sync_time');
      if (lastSyncStr) {
        setLastSync(new Date(lastSyncStr));
      }
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
    }
  }, []);

  /**
   * Forzar sincronización manual (con protección contra bucles)
   */
  const forceSync = useCallback(async (): Promise<void> => {
    // ✅ Evitar sincronización si ya está en progreso
    if (syncingRef.current) {
      console.log('⏳ Sincronización ya en progreso, omitiendo...');
      return;
    }

    if (!isOnline) {
      console.log('📡 Sin conexión, no se puede sincronizar');
      return;
    }

    syncingRef.current = true;
    setIsSyncing(true);
    
    try {
      await syncService.sync();
      
      if (isMountedRef.current) {
        await updateSyncStats();
        localStorage.setItem('last_sync_time', new Date().toISOString());
        setLastSync(new Date());
        console.log('✅ Sincronización forzada completada');
      }
    } catch (error) {
      console.error('❌ Error en sincronización forzada:', error);
    } finally {
      syncingRef.current = false;
      if (isMountedRef.current) {
        setIsSyncing(false);
      }
    }
  }, [isOnline, updateSyncStats]);

  /**
   * Crear una nueva nota (con soporte offline)
   */
  const createNote = useCallback(async (noteData: Partial<Note>): Promise<Note | null> => {
    try {
      const now = new Date().toISOString();
      
      let validShape: NoteShape = DEFAULT_SHAPE;
      if (noteData.shape && ['square', 'rounded', 'circle'].includes(noteData.shape as string)) {
        validShape = noteData.shape as NoteShape;
      } else if (noteData.shape) {
        validShape = noteData.shape;
      }
      
      const newNote: Note = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: noteData.title || 'Nueva nota',
        content: noteData.content || '',
        color: noteData.color || '#ffffff',
        shape: validShape,
        icon: noteData.icon !== undefined ? noteData.icon : undefined,
        size: noteData.size !== undefined ? noteData.size : undefined,
        colorIntensity: noteData.colorIntensity !== undefined ? noteData.colorIntensity : undefined,
        is_favorite: noteData.is_favorite || false,
        is_archived: noteData.is_archived || false,
        tags: noteData.tags || [],
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };

      await offlineStorage.saveNote(toOfflineNote(newNote));
      
      if (isOnline) {
        await offlineStorage.addToQueue('create', toOfflineNote(newNote));
      } else {
        await offlineStorage.addToQueue('create', toOfflineNote(newNote));
      }
      
      await loadNotes();
      await updateSyncStats();
      return newNote;
    } catch (error) {
      console.error('Error creando nota:', error);
      return null;
    }
  }, [isOnline, loadNotes, updateSyncStats]);

  /**
   * Actualizar una nota existente (con soporte offline)
   */
  const updateNote = useCallback(async (id: string, updates: Partial<Note>): Promise<Note | null> => {
    try {
      const existingOfflineNote = await offlineStorage.getNote(id);
      if (!existingOfflineNote) {
        console.error(`Nota ${id} no encontrada`);
        return null;
      }

      const existingNote = toNoteModel(existingOfflineNote);
      
      let validShape: NoteShape | undefined = undefined;
      if (updates.shape) {
        if (['square', 'rounded', 'circle'].includes(updates.shape as string)) {
          validShape = updates.shape as NoteShape;
        } else {
          validShape = updates.shape;
        }
      }
      
      const updatedNote: Note = {
        ...existingNote,
        ...updates,
        ...(validShape !== undefined ? { shape: validShape } : {}),
        updated_at: new Date().toISOString(),
      };

      await offlineStorage.saveNote(toOfflineNote(updatedNote));
      
      if (isOnline) {
        await offlineStorage.addToQueue('update', toOfflineNote(updatedNote));
      } else {
        await offlineStorage.addToQueue('update', toOfflineNote(updatedNote));
      }
      
      await loadNotes();
      await updateSyncStats();
      return updatedNote;
    } catch (error) {
      console.error('Error actualizando nota:', error);
      return null;
    }
  }, [isOnline, loadNotes, updateSyncStats]);

  /**
   * Eliminar una nota (con soporte offline)
   */
  const deleteNote = useCallback(async (id: string): Promise<boolean> => {
    try {
      const existingOfflineNote = await offlineStorage.getNote(id);
      if (!existingOfflineNote) {
        console.error(`Nota ${id} no encontrada`);
        return false;
      }

      const noteToDelete = { ...existingOfflineNote };
      
      await offlineStorage.deleteNote(id);
      
      if (isOnline) {
        await offlineStorage.addToQueue('delete', noteToDelete);
      } else {
        await offlineStorage.addToQueue('delete', noteToDelete);
      }
      
      await loadNotes();
      await updateSyncStats();
      return true;
    } catch (error) {
      console.error('Error eliminando nota:', error);
      return false;
    }
  }, [isOnline, loadNotes, updateSyncStats]);

  /**
   * Obtener estadísticas de sincronización
   */
  const getSyncStats = useCallback(async (): Promise<SyncStats> => {
    const stats = await offlineStorage.getSyncStats();
    return {
      pendingNotes: stats.pendingNotes,
      queueItems: stats.queueItems,
      lastSync: lastSync || undefined,
    };
  }, [lastSync]);

  /**
   * Limpiar todos los datos offline
   */
  const clearAllOfflineData = useCallback(async (): Promise<void> => {
    try {
      await offlineStorage.clearAllData();
      await loadNotes();
      await updateSyncStats();
      console.log('🗑️ Datos offline limpiados');
    } catch (error) {
      console.error('Error limpiando datos offline:', error);
    }
  }, [loadNotes, updateSyncStats]);

  /**
   * ✅ INICIALIZACIÓN ÚNICA (sin bucle)
   */
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    const init = async () => {
      setIsLoading(true);
      try {
        await offlineStorage.init();
        await Promise.all([loadNotes(), updateSyncStats()]);
        
        // Solo sincronizar una vez al inicio si hay conexión
        if (isOnline && !initialSyncDoneRef.current) {
          initialSyncDoneRef.current = true;
          setTimeout(() => forceSync(), 1000);
        }
      } catch (error) {
        console.error('Error en inicialización:', error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    init();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [isOnline, loadNotes, updateSyncStats, forceSync]);

  /**
   * ✅ ESCUCHAR CUANDO VUELVE LA CONEXIÓN (solo una vez)
   */
  useEffect(() => {
    const handleOnline = () => {
      if (initializedRef.current && isOnline) {
        console.log('🟢 Conexión recuperada, sincronizando...');
        forceSync();
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isOnline, forceSync]);

  /**
   * ✅ SINCRONIZACIÓN PERIÓDICA (cada 5 minutos, no 30 segundos)
   */
  useEffect(() => {
    if (!isOnline) return;
    
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    // Sincronizar cada 5 minutos
    syncIntervalRef.current = setInterval(() => {
      if (isOnline && (pendingCount > 0 || queueCount > 0) && !syncingRef.current) {
        forceSync();
      }
    }, 300000); // 5 minutos
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [isOnline, pendingCount, queueCount, forceSync]);

  return {
    notes,
    isLoading,
    isSyncing,
    pendingCount,
    queueCount,
    lastSync,
    isOnline,
    wasOffline,
    createNote,
    updateNote,
    deleteNote,
    forceSync,
    getSyncStats,
    clearAllOfflineData,
  };
}