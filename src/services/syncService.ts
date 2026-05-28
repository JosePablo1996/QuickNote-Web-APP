// src/services/syncService.ts
import { offlineStorage } from './offlineStorage';
import { api } from './api';
import { Note } from '../models/Note';

// Interfaz para el detalle de la operación
interface NoteChangedDetail {
  operation: 'create' | 'update' | 'delete';
  data: any;
}

// Interfaz para el evento de conexión restaurada
interface ConnectionRestoredEvent extends CustomEvent {
  type: 'connection-restored';
}

class SyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  // ✅ Refs para controlar operaciones en curso
  private pendingSyncPromise: Promise<void> | null = null;

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    // Escuchar cuando vuelva la conexión
    window.addEventListener('connection-restored', this.handleConnectionRestored as EventListener);

    // Escuchar cambios en las notas para ponerlos en cola
    window.addEventListener('note-changed', this.handleNoteChanged as EventListener);
  }

  private handleConnectionRestored = () => {
    console.log('🔄 Conexión recuperada, iniciando sincronización...');
    // ✅ Pequeño delay para evitar múltiples disparos
    setTimeout(() => this.sync(), 500);
  };

  private handleNoteChanged = (event: Event) => {
    const customEvent = event as CustomEvent<NoteChangedDetail>;
    if (!navigator.onLine) {
      this.queueOperation(customEvent.detail);
    }
  };

  private async queueOperation(detail: NoteChangedDetail) {
    await offlineStorage.addToQueue(
      detail.operation,
      detail.data
    );
    console.log(`📦 Operación ${detail.operation} encolada para sincronización`);
  }

  /**
   * ✅ Sincronización principal con protección contra múltiples llamadas
   */
  async sync(): Promise<void> {
    // ✅ Si ya hay una sincronización en curso, esperar a que termine
    if (this.pendingSyncPromise) {
      console.log('⏳ Sincronización ya en progreso, esperando...');
      return this.pendingSyncPromise;
    }

    if (this.isSyncing) {
      console.log('⏳ Sincronización ya en progreso, omitiendo...');
      return;
    }

    if (!navigator.onLine) {
      console.log('📡 Sin conexión, sincronización diferida');
      return;
    }

    this.isSyncing = true;
    console.log('🔄 Iniciando sincronización...');

    // ✅ Crear una promesa para la sincronización actual
    this.pendingSyncPromise = this.performSync();

    try {
      await this.pendingSyncPromise;
    } finally {
      this.isSyncing = false;
      this.pendingSyncPromise = null;
    }
  }

  /**
   * ✅ Ejecución real de la sincronización
   */
  private async performSync(): Promise<void> {
    try {
      // 1. Sincronizar notas pendientes
      await this.syncPendingNotes();

      // 2. Procesar cola de operaciones
      await this.processSyncQueue();

      // 3. Descargar notas nuevas del servidor
      await this.downloadLatestNotes();

      // Disparar evento de sincronización completada
      window.dispatchEvent(new CustomEvent('sync-complete'));

      console.log('✅ Sincronización completada');
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      throw error;
    }
  }

  /**
   * ✅ Sincronizar notas pendientes con protección por lote
   */
  private async syncPendingNotes(): Promise<void> {
    const pendingNotes = await offlineStorage.getPendingNotes();
    
    if (pendingNotes.length === 0) return;
    
    console.log(`📤 Sincronizando ${pendingNotes.length} notas pendientes...`);
    
    // ✅ Procesar en lotes pequeños para no sobrecargar
    const BATCH_SIZE = 5;
    for (let i = 0; i < pendingNotes.length; i += BATCH_SIZE) {
      const batch = pendingNotes.slice(i, i + BATCH_SIZE);
      
      await Promise.allSettled(
        batch.map(async (note) => {
          try {
            const response = await api.updateNote(note.id, note);
            if (response) {
              await offlineStorage.markAsSynced(note.id);
              console.log(`✅ Nota ${note.id} sincronizada`);
            }
          } catch (error) {
            console.error(`❌ Error sincronizando nota ${note.id}:`, error);
            await offlineStorage.markAsFailed(note.id);
          }
        })
      );
      
      // ✅ Pequeña pausa entre lotes
      if (i + BATCH_SIZE < pendingNotes.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * ✅ Procesar cola de operaciones con protección
   */
  private async processSyncQueue(): Promise<void> {
    const queue = await offlineStorage.getQueue();
    
    if (queue.length === 0) return;
    
    console.log(`📋 Procesando ${queue.length} operaciones en cola...`);
    
    for (const item of queue) {
      // ✅ Verificar si la operación ya fue procesada
      try {
        let success = false;
        
        switch (item.operation) {
          case 'create':
            const newNote = await api.createNote(item.data);
            success = !!newNote;
            break;
          case 'update':
            const updatedNote = await api.updateNote(item.data.id, item.data);
            success = !!updatedNote;
            break;
          case 'delete':
            success = await api.deleteNote(item.data.id);
            break;
        }
        
        if (success) {
          await offlineStorage.removeFromQueue(item.id);
          console.log(`✅ Operación ${item.operation} sincronizada`);
        } else {
          throw new Error('Operación fallida');
        }
      } catch (error) {
        console.error(`❌ Error en operación ${item.operation}:`, error);
        
        // Incrementar contador de reintentos
        item.retry_count++;
        if (item.retry_count >= 5) {
          console.error(`⚠️ Operación ${item.id} falló después de 5 intentos, eliminando...`);
          await offlineStorage.removeFromQueue(item.id);
        } else {
          await offlineStorage.incrementRetryCount(item.id);
          // ✅ Pequeño delay antes de reintentar
          await new Promise(resolve => setTimeout(resolve, 1000 * item.retry_count));
        }
      }
    }
  }

  /**
   * ✅ Descargar notas nuevas del servidor con deduplicación
   */
  private async downloadLatestNotes(): Promise<void> {
    try {
      const serverNotes = await api.getNotes();
      const localNotes = await offlineStorage.getAllNotes();
      
      const localIds = new Set(localNotes.map(n => n.id));
      let newNotesCount = 0;
      
      for (const serverNote of serverNotes) {
        if (!localIds.has(serverNote.id)) {
          await offlineStorage.saveNote(serverNote);
          newNotesCount++;
        }
      }
      
      if (newNotesCount > 0) {
        console.log(`📥 ${newNotesCount} nota(s) nueva(s) descargada(s) del servidor`);
      }
    } catch (error) {
      console.error('Error descargando notas del servidor:', error);
    }
  }

  /**
   * Disparar evento de cambio de nota (para encolar operaciones offline)
   */
  static emitNoteChanged(operation: 'create' | 'update' | 'delete', data: any): void {
    const event = new CustomEvent('note-changed', {
      detail: { operation, data }
    });
    window.dispatchEvent(event);
  }

  /**
   * Disparar evento de conexión restaurada
   */
  static emitConnectionRestored(): void {
    const event = new CustomEvent('connection-restored');
    window.dispatchEvent(event);
  }

  /**
   * ✅ Iniciar sincronización automática (con intervalo más largo)
   */
  startAutoSync(intervalMs: number = 300000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.sync();
      }
    }, intervalMs);
    
    console.log(`⏰ Sincronización automática iniciada (intervalo: ${intervalMs / 1000}s)`);
  }

  /**
   * Detener sincronización automática
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Sincronización automática detenida');
    }
  }

  /**
   * Limpiar todos los oyentes de eventos
   */
  cleanup(): void {
    this.stopAutoSync();
    window.removeEventListener('connection-restored', this.handleConnectionRestored as EventListener);
    window.removeEventListener('note-changed', this.handleNoteChanged as EventListener);
  }

  /**
   * ✅ Obtener estado actual de sincronización
   */
  getSyncStatus(): { isSyncing: boolean; hasPendingSync: boolean } {
    return {
      isSyncing: this.isSyncing,
      hasPendingSync: this.pendingSyncPromise !== null
    };
  }
}

export const syncService = new SyncService();