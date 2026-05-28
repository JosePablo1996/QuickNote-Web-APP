// src/services/offlineStorage.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Interfaz para las estadísticas de sincronización
export interface SyncStats {
  pendingNotes: number;
  queueItems: number;
  lastSync?: Date;
}

// Interfaz para una nota en el almacenamiento offline
export interface OfflineNote {
  id: string;
  title: string;
  content: string;
  color: string;
  is_favorite: boolean;
  is_archived: boolean;
  tags: string[];
  updated_at: string;
  created_at: string;
  deleted_at?: string | null;
  sync_status: 'synced' | 'pending' | 'failed';
  sync_version: number;
}

// Interfaz para un item en la cola de sincronización
export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retry_count: number;
}

interface QuickNoteDB extends DBSchema {
  notes: {
    key: string;
    value: OfflineNote;
    indexes: { 
      'sync_status': string;
      'updated_at': string;
      'created_at': string;
    };
  };
  sync_queue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 
      'timestamp': number;
      'retry_count': number;
    };
  };
}

class OfflineStorage {
  private db: IDBPDatabase<QuickNoteDB> | null = null;
  private dbReady: Promise<IDBPDatabase<QuickNoteDB>> | null = null;

  async init(): Promise<IDBPDatabase<QuickNoteDB>> {
    if (this.dbReady) {
      return this.dbReady;
    }

    this.dbReady = openDB<QuickNoteDB>('quicknote-offline', 2, {
      upgrade(db, oldVersion) {
        // Crear stores si no existen
        if (!db.objectStoreNames.contains('notes')) {
          const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
          noteStore.createIndex('sync_status', 'sync_status');
          noteStore.createIndex('updated_at', 'updated_at');
          noteStore.createIndex('created_at', 'created_at');
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp');
          syncStore.createIndex('retry_count', 'retry_count');
        }
      },
    });

    this.db = await this.dbReady;
    return this.db;
  }

  private async getDB(): Promise<IDBPDatabase<QuickNoteDB>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // ============ NOTAS ============
  
  async saveNote(note: Partial<OfflineNote>): Promise<OfflineNote> {
    const db = await this.getDB();
    const existingNote = note.id ? await this.getNote(note.id) : null;
    
    const noteWithSync: OfflineNote = {
      id: note.id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: note.title || 'Nueva nota',
      content: note.content || '',
      color: note.color || '#ffffff',
      is_favorite: note.is_favorite || false,
      is_archived: note.is_archived || false,
      tags: note.tags || [],
      created_at: existingNote?.created_at || note.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: note.deleted_at || null,
      sync_status: existingNote?.sync_status === 'synced' ? 'pending' : (note.sync_status || 'pending'),
      sync_version: Date.now(),
    };
    
    await db.put('notes', noteWithSync);
    return noteWithSync;
  }

  async getNote(id: string): Promise<OfflineNote | undefined> {
    const db = await this.getDB();
    return await db.get('notes', id);
  }

  async getAllNotes(): Promise<OfflineNote[]> {
    const db = await this.getDB();
    return await db.getAll('notes');
  }

  async deleteNote(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('notes', id);
  }

  async getPendingNotes(): Promise<OfflineNote[]> {
    const db = await this.getDB();
    const index = db.transaction('notes').store.index('sync_status');
    return await index.getAll('pending');
  }

  async getFailedNotes(): Promise<OfflineNote[]> {
    const db = await this.getDB();
    const index = db.transaction('notes').store.index('sync_status');
    return await index.getAll('failed');
  }

  async getSyncedNotes(): Promise<OfflineNote[]> {
    const db = await this.getDB();
    const index = db.transaction('notes').store.index('sync_status');
    return await index.getAll('synced');
  }

  async markAsSynced(id: string): Promise<void> {
    const note = await this.getNote(id);
    if (note) {
      note.sync_status = 'synced';
      const db = await this.getDB();
      await db.put('notes', note);
    }
  }

  async markAsFailed(id: string): Promise<void> {
    const note = await this.getNote(id);
    if (note) {
      note.sync_status = 'failed';
      const db = await this.getDB();
      await db.put('notes', note);
    }
  }

  async resetSyncStatus(id: string): Promise<void> {
    const note = await this.getNote(id);
    if (note) {
      note.sync_status = 'pending';
      const db = await this.getDB();
      await db.put('notes', note);
    }
  }

  // ============ COLA DE SINCRONIZACIÓN ============

  async addToQueue(operation: 'create' | 'update' | 'delete', data: any): Promise<SyncQueueItem> {
    const db = await this.getDB();
    const queueItem: SyncQueueItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operation,
      data,
      timestamp: Date.now(),
      retry_count: 0,
    };
    await db.add('sync_queue', queueItem);
    return queueItem;
  }

  async getQueue(): Promise<SyncQueueItem[]> {
    const db = await this.getDB();
    return await db.getAll('sync_queue');
  }

  async getPendingQueueItems(): Promise<SyncQueueItem[]> {
    return await this.getQueue();
  }

  async removeFromQueue(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('sync_queue', id);
  }

  async clearQueue(): Promise<void> {
    const db = await this.getDB();
    const allItems = await this.getQueue();
    for (const item of allItems) {
      await db.delete('sync_queue', item.id);
    }
  }

  async incrementRetryCount(id: string): Promise<void> {
    const db = await this.getDB();
    const item = await db.get('sync_queue', id);
    if (item) {
      item.retry_count++;
      await db.put('sync_queue', item);
    }
  }

  async getFailedQueueItems(): Promise<SyncQueueItem[]> {
    const allItems = await this.getQueue();
    return allItems.filter(item => item.retry_count >= 3);
  }

  // ============ ESTADÍSTICAS ============

  async getSyncStats(): Promise<SyncStats> {
    const pendingNotes = await this.getPendingNotes();
    const queue = await this.getQueue();
    
    let lastSync: Date | undefined;
    const lastSyncStr = localStorage.getItem('last_sync_time');
    if (lastSyncStr) {
      lastSync = new Date(lastSyncStr);
    }
    
    return {
      pendingNotes: pendingNotes.length,
      queueItems: queue.length,
      lastSync,
    };
  }

  async getDetailedStats(): Promise<{
    totalNotes: number;
    pendingNotes: number;
    syncedNotes: number;
    failedNotes: number;
    queueItems: number;
    failedQueueItems: number;
    totalSize: number;
  }> {
    const allNotes = await this.getAllNotes();
    const pendingNotes = await this.getPendingNotes();
    const syncedNotes = await this.getSyncedNotes();
    const failedNotes = await this.getFailedNotes();
    const queue = await this.getQueue();
    const failedQueue = await this.getFailedQueueItems();
    
    const totalSize = allNotes.reduce((sum, note) => {
      return sum + (note.title?.length || 0) + (note.content?.length || 0);
    }, 0);
    
    return {
      totalNotes: allNotes.length,
      pendingNotes: pendingNotes.length,
      syncedNotes: syncedNotes.length,
      failedNotes: failedNotes.length,
      queueItems: queue.length,
      failedQueueItems: failedQueue.length,
      totalSize,
    };
  }

  // ============ LIMPIEZA DE DATOS ============

  async clearAllData(): Promise<void> {
    const allNotes = await this.getAllNotes();
    for (const note of allNotes) {
      await this.deleteNote(note.id);
    }
    
    await this.clearQueue();
    localStorage.removeItem('last_sync_time');
    
    console.log('🗑️ Todos los datos offline han sido limpiados');
  }

  async clearFailedItems(): Promise<{ clearedNotes: number; clearedQueue: number }> {
    const failedNotes = await this.getFailedNotes();
    const failedQueue = await this.getFailedQueueItems();
    
    for (const note of failedNotes) {
      await this.deleteNote(note.id);
    }
    
    for (const item of failedQueue) {
      await this.removeFromQueue(item.id);
    }
    
    console.log(`🗑️ Limpiados: ${failedNotes.length} notas fallidas, ${failedQueue.length} items de cola fallidos`);
    
    return {
      clearedNotes: failedNotes.length,
      clearedQueue: failedQueue.length,
    };
  }

  // ============ SINCRONIZACIÓN MASIVA ============

  async syncAllPending(): Promise<{
    pendingNotes: number;
    queueItems: number;
  }> {
    const pendingNotes = await this.getPendingNotes();
    const queue = await this.getQueue();
    
    return {
      pendingNotes: pendingNotes.length,
      queueItems: queue.length,
    };
  }

  // ============ MANTENIMIENTO ============

  async cleanupOldData(maxAgeDays: number = 30): Promise<number> {
    const cutoffDate = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
    const allNotes = await this.getAllNotes();
    let deletedCount = 0;
    
    for (const note of allNotes) {
      const noteDate = new Date(note.updated_at).getTime();
      if (noteDate < cutoffDate && note.sync_status === 'synced') {
        await this.deleteNote(note.id);
        deletedCount++;
      }
    }
    
    console.log(`🗑️ Limpiados ${deletedCount} registros antiguos (${maxAgeDays} días)`);
    return deletedCount;
  }

  async getDatabaseSize(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  }
}

// Exportar instancia única
export const offlineStorage = new OfflineStorage();