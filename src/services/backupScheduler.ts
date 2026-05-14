// src/services/backupScheduler.ts
import { api } from './api';
import { Note } from '../models/Note';

export type ScheduleFrequency = 'daily' | 'weekly' | 'never';

export interface BackupSchedule {
  enabled: boolean;
  frequency: ScheduleFrequency;
  lastRun: string | null;
  nextRun: string | null;
  totalBackups: number;
  lastStatus: 'success' | 'error' | 'pending' | null;
  lastError: string | null;
}

const STORAGE_KEY = 'quicknote_backup_schedule';
const NOTIFICATION_KEY = 'quicknote_backup_notification_shown';

class BackupSchedulerService {
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: ((schedule: BackupSchedule) => void)[] = [];
  private schedule: BackupSchedule;

  constructor() {
    // Inicializar schedule con valores por defecto
    this.schedule = this.getDefaultSchedule();
    // Cargar configuración guardada
    this.loadSchedule();
    // Iniciar verificador cada minuto
    this.startChecker();
  }

  // Obtener schedule por defecto
  private getDefaultSchedule(): BackupSchedule {
    return {
      enabled: false,
      frequency: 'never',
      lastRun: null,
      nextRun: null,
      totalBackups: 0,
      lastStatus: null,
      lastError: null
    };
  }

  // Cargar configuración guardada
  private loadSchedule(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.schedule = { ...this.getDefaultSchedule(), ...parsed };
        // Recalcular próxima ejecución si está activo
        if (this.schedule.enabled && this.schedule.frequency !== 'never') {
          this.schedule.nextRun = this.calculateNextRun(this.schedule);
        }
      } else {
        this.schedule = this.getDefaultSchedule();
      }
      this.notifyListeners(this.schedule);
    } catch (error) {
      console.error('Error loading backup schedule:', error);
      this.schedule = this.getDefaultSchedule();
    }
  }

  // Obtener configuración actual
  getSchedule(): BackupSchedule {
    return { ...this.schedule };
  }

  // Guardar configuración
  private saveSchedule(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.schedule));
    this.notifyListeners(this.schedule);
  }

  // Actualizar configuración
  updateSchedule(updates: Partial<BackupSchedule>): BackupSchedule {
    this.schedule = { ...this.schedule, ...updates };
    
    // Recalcular próxima ejecución si cambió la frecuencia o enabled
    if (updates.frequency !== undefined || updates.enabled !== undefined) {
      if (this.schedule.enabled && this.schedule.frequency !== 'never') {
        this.schedule.nextRun = this.calculateNextRun(this.schedule);
      } else {
        this.schedule.nextRun = null;
      }
    }
    
    this.saveSchedule();
    return { ...this.schedule };
  }

  // Calcular próxima ejecución
  private calculateNextRun(schedule: BackupSchedule): string | null {
    if (!schedule.enabled || schedule.frequency === 'never') {
      return null;
    }

    const now = new Date();
    const next = new Date(now);

    switch (schedule.frequency) {
      case 'daily':
        next.setDate(now.getDate() + 1);
        next.setHours(2, 0, 0, 0); // 2 AM
        break;
      case 'weekly':
        next.setDate(now.getDate() + 7);
        next.setHours(2, 0, 0, 0);
        break;
      default:
        return null;
    }

    return next.toISOString();
  }

  // Verificar si debe ejecutar backup
  private shouldRun(): boolean {
    if (!this.schedule.enabled || this.schedule.frequency === 'never') {
      return false;
    }

    if (!this.schedule.nextRun) {
      return false;
    }

    const now = new Date();
    const nextRun = new Date(this.schedule.nextRun);
    
    return now >= nextRun;
  }

  // Ejecutar backup
  async executeBackup(notes: Note[]): Promise<boolean> {
    if (notes.length === 0) {
      console.log('No hay notas para respaldar');
      return false;
    }
    
    try {
      const backup = await api.saveCloudBackup(notes);
      
      if (backup) {
        // Actualizar schedule
        this.schedule.lastRun = new Date().toISOString();
        this.schedule.lastStatus = 'success';
        this.schedule.lastError = null;
        this.schedule.totalBackups += 1;
        
        // Recalcular próxima ejecución
        if (this.schedule.enabled && this.schedule.frequency !== 'never') {
          this.schedule.nextRun = this.calculateNextRun(this.schedule);
        }
        
        this.saveSchedule();
        
        // Mostrar notificación
        this.showNotification(
          'Backup Automático Completado',
          `${backup.note_count} notas guardadas en la nube`
        );
        
        return true;
      }
      return false;
    } catch (error: any) {
      // Actualizar con error
      this.schedule.lastStatus = 'error';
      this.schedule.lastError = error.message || 'Error desconocido';
      this.saveSchedule();
      
      this.showNotification(
        'Error en Backup Automático',
        error.message || 'No se pudo completar el backup'
      );
      
      return false;
    }
  }

  // Mostrar notificación del sistema
  private showNotification(title: string, body: string): void {
    // Verificar si ya mostramos notificación en esta sesión
    const lastShown = sessionStorage.getItem(NOTIFICATION_KEY);
    if (lastShown === new Date().toDateString()) {
      return; // Solo una notificación por día
    }
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
      sessionStorage.setItem(NOTIFICATION_KEY, new Date().toDateString());
    }
  }

  // Solicitar permiso de notificaciones
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }

  // Iniciar verificador periódico
  private startChecker(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    // Verificar cada minuto
    this.intervalId = setInterval(() => {
      if (this.shouldRun()) {
        // Emitir evento para que el componente principal ejecute el backup
        window.dispatchEvent(new CustomEvent('backup-scheduler-trigger'));
      }
    }, 60000); // 1 minuto
  }

  // Suscribirse a cambios
  subscribe(listener: (schedule: BackupSchedule) => void): () => void {
    this.listeners.push(listener);
    // Notificar inmediatamente el estado actual
    listener({ ...this.schedule });
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(schedule: BackupSchedule): void {
    this.listeners.forEach(listener => listener({ ...schedule }));
  }

  // Obtener texto descriptivo de la próxima ejecución
  getNextRunText(schedule: BackupSchedule): string {
    if (!schedule.enabled || !schedule.nextRun) {
      return 'No programado';
    }
    
    const next = new Date(schedule.nextRun);
    const now = new Date();
    const diffHours = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'En menos de 1 hora';
    } else if (diffHours < 24) {
      return `En ${diffHours} horas`;
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return `En ${diffDays} días`;
    }
  }

  // Limpiar recurso
  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Instancia única
export const backupScheduler = new BackupSchedulerService();