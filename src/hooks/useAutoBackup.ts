// src/hooks/useAutoBackup.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNotes } from './useNotes';
import { useAuth } from './useAuth';
import { backupService } from '../services/backup';
import { useToast } from './useToast';

interface UseAutoBackupOptions {
  enabled?: boolean;
  delay?: number; // ms de debounce (default: 30000 - 30 segundos)
  minNotesToBackup?: number; // Mínimo de notas para hacer backup automático
}

export const useAutoBackup = (options: UseAutoBackupOptions = {}) => {
  const { 
    enabled = true, 
    delay = 30000, // 30 segundos después del último cambio
    minNotesToBackup = 1 
  } = options;
  
  const { notes, isLoading } = useNotes();
  const { user, isAuthenticated } = useAuth();
  const { success, info, error: showError } = useToast();
  
  const [lastBackupTime, setLastBackupTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem('auto_backup_last_time');
    return saved ? new Date(saved) : null;
  });
  
  const [pendingChanges, setPendingChanges] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [notesHash, setNotesHash] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousNotesCountRef = useRef<number>(notes.length);

  // Calcular hash de las notas para detectar cambios
  const calculateNotesHash = useCallback(() => {
    const notesData = notes.map(n => ({
      id: n.id,
      updated_at: n.updated_at,
      title: n.title,
      content_hash: n.content?.length || 0
    }));
    return JSON.stringify(notesData);
  }, [notes]);

  // Verificar si hay cambios
  const hasNotesChanged = useCallback(() => {
    const currentHash = calculateNotesHash();
    const hasChanged = currentHash !== notesHash;
    
    if (hasChanged && notes.length > 0) {
      const notesAdded = notes.length - previousNotesCountRef.current;
      console.log(`📝 Detectado cambio: +${notesAdded} notas, total: ${notes.length}`);
    }
    
    return hasChanged;
  }, [calculateNotesHash, notesHash, notes.length]);

  // Realizar backup automático
  const performAutoBackup = useCallback(async (isManual: boolean = false) => {
    if (!enabled || !isAuthenticated || !user) {
      console.log('⏸️ Auto-backup deshabilitado o usuario no autenticado');
      return;
    }
    
    if (notes.length < minNotesToBackup) {
      console.log(`⏸️ Auto-backup omitido: solo ${notes.length} notas (mínimo ${minNotesToBackup})`);
      return;
    }
    
    if (isBackingUp) {
      console.log('⏸️ Auto-backup ya en progreso');
      return;
    }
    
    setIsBackingUp(true);
    
    try {
      // Crear nuevo backup con las notas actualizadas
      const backup = await backupService.createBackup(notes, true);
      
      if (backup) {
        const now = new Date();
        setLastBackupTime(now);
        localStorage.setItem('auto_backup_last_time', now.toISOString());
        setNotesHash(calculateNotesHash());
        previousNotesCountRef.current = notes.length;
        setPendingChanges(false);
        
        if (!isManual) {
          console.log(`✅ Auto-backup completado: ${backup.note_count} notas guardadas`);
        }
      }
    } catch (error) {
      console.error('❌ Error en auto-backup:', error);
      if (isManual) {
        showError('Error al guardar backup automático');
      }
    } finally {
      setIsBackingUp(false);
    }
  }, [enabled, isAuthenticated, user, notes, minNotesToBackup, isBackingUp, calculateNotesHash, showError]);

  // Detectar cambios en las notas
  useEffect(() => {
    if (!enabled || !isAuthenticated || isLoading) return;
    
    const hasChanges = hasNotesChanged();
    
    if (hasChanges && notes.length > 0) {
      setPendingChanges(true);
      
      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Programar backup después del delay
      timeoutRef.current = setTimeout(() => {
        if (pendingChanges) {
          console.log('🔄 Programando backup automático por cambios detectados...');
          performAutoBackup(false);
        }
      }, delay);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [notes, enabled, isAuthenticated, isLoading, hasNotesChanged, pendingChanges, delay, performAutoBackup]);

  // Inicializar hash al cargar
  useEffect(() => {
    if (!isLoading && notes.length > 0 && !notesHash) {
      const initialHash = calculateNotesHash();
      setNotesHash(initialHash);
      previousNotesCountRef.current = notes.length;
    }
  }, [isLoading, notes, calculateNotesHash, notesHash]);

  // Backup manual forzado
  const forceBackup = useCallback(async () => {
    if (notes.length === 0) {
      info('No hay notas para respaldar');
      return false;
    }
    await performAutoBackup(true);
    return true;
  }, [notes.length, performAutoBackup, info]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    pendingChanges,
    isBackingUp,
    lastBackupTime,
    forceBackup,
    notesCount: notes.length
  };
};