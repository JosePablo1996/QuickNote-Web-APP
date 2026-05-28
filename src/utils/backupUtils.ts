// src/utils/backupUtils.ts
import { Note } from '../models/Note';

export type RestoreMode = 'replace' | 'merge' | 'add_new';

export interface RestoreOptions {
  mode: RestoreMode;
  onProgress?: (current: number, total: number) => void;
}

export interface RestoreStats {
  existingCount: number;
  backupCount: number;
  newCount: number;
  duplicateCount: number;
  replaceWillLose: number;
  mergeWillAdd: number;
  addNewWillAdd: number;
}

/**
 * Reemplaza TODAS las notas actuales con las del backup
 */
export function replaceNotes(
  existingNotes: Note[],
  backupNotes: Note[]
): Note[] {
  console.log(`🔄 Reemplazando: ${existingNotes.length} notas → ${backupNotes.length} notas del backup`);
  return [...backupNotes];
}

/**
 * Fusiona dos listas de notas conservando TODAS las notas existentes
 * y agregando las nuevas del backup que no existan
 */
export function mergeNotes(
  existingNotes: Note[],
  backupNotes: Note[],
  onProgress?: (current: number, total: number) => void
): Note[] {
  console.log(`🔄 Fusionando: ${existingNotes.length} existentes + ${backupNotes.length} del backup`);
  
  // Crear un Map de notas existentes por ID para búsqueda rápida
  const existingMap = new Map<string, Note>();
  for (const note of existingNotes) {
    existingMap.set(note.id, note);
  }
  
  // Contar cuántas notas nuevas se agregarán
  let newCount = 0;
  const mergedNotes = [...existingNotes];
  
  for (let i = 0; i < backupNotes.length; i++) {
    const backupNote = backupNotes[i];
    
    // Si la nota NO existe en las actuales, agregarla
    if (!existingMap.has(backupNote.id)) {
      mergedNotes.push(backupNote);
      newCount++;
    }
    
    // Reportar progreso cada 10 notas
    if (onProgress && (i + 1) % 10 === 0) {
      onProgress(i + 1, backupNotes.length);
    }
  }
  
  if (onProgress) {
    onProgress(backupNotes.length, backupNotes.length);
  }
  
  console.log(`✅ Fusión completada: +${newCount} notas nuevas, total: ${mergedNotes.length}`);
  return mergedNotes;
}

/**
 * Agrega SOLO notas nuevas (sin duplicados por ID)
 * Similar a merge, pero sin conservar las existentes (solo las nuevas del backup)
 */
export function addOnlyNewNotes(
  existingNotes: Note[],
  backupNotes: Note[],
  onProgress?: (current: number, total: number) => void
): Note[] {
  console.log(`✨ Agregando solo notas nuevas: ${existingNotes.length} existentes + ${backupNotes.length} del backup`);
  
  const existingIds = new Set<string>(existingNotes.map(n => n.id));
  let newCount = 0;
  
  const newNotes: Note[] = [];
  
  for (let i = 0; i < backupNotes.length; i++) {
    const backupNote = backupNotes[i];
    
    if (!existingIds.has(backupNote.id)) {
      newNotes.push(backupNote);
      newCount++;
    }
    
    if (onProgress && (i + 1) % 10 === 0) {
      onProgress(i + 1, backupNotes.length);
    }
  }
  
  if (onProgress) {
    onProgress(backupNotes.length, backupNotes.length);
  }
  
  const result = [...existingNotes, ...newNotes];
  console.log(`✅ ${newCount} notas nuevas agregadas, total: ${result.length}`);
  return result;
}

/**
 * Función principal que aplica el modo de restauración seleccionado
 */
export function applyRestoreMode(
  existingNotes: Note[],
  backupNotes: Note[],
  mode: RestoreMode,
  onProgress?: (current: number, total: number) => void
): Note[] {
  console.log(`🎯 Aplicando modo de restauración: ${mode}`);
  
  switch (mode) {
    case 'replace':
      return replaceNotes(existingNotes, backupNotes);
    case 'merge':
      return mergeNotes(existingNotes, backupNotes, onProgress);
    case 'add_new':
      return addOnlyNewNotes(existingNotes, backupNotes, onProgress);
    default:
      console.warn(`Modo desconocido: ${mode}, usando 'merge' por defecto`);
      return mergeNotes(existingNotes, backupNotes, onProgress);
  }
}

/**
 * Obtiene estadísticas de comparación entre notas existentes y backup
 */
export function getRestoreStats(
  existingNotes: Note[],
  backupNotes: Note[]
): RestoreStats {
  const existingIds = new Set<string>(existingNotes.map(n => n.id));
  
  let newCount = 0;
  let duplicateCount = 0;
  
  for (const note of backupNotes) {
    if (existingIds.has(note.id)) {
      duplicateCount++;
    } else {
      newCount++;
    }
  }
  
  return {
    existingCount: existingNotes.length,
    backupCount: backupNotes.length,
    newCount,
    duplicateCount,
    replaceWillLose: existingNotes.length,
    mergeWillAdd: newCount,
    addNewWillAdd: newCount,
  };
}

/**
 * Descripción de cada modo para mostrar al usuario
 */
export const restoreModeInfo: Record<RestoreMode, {
  title: string;
  description: string;
  icon: string;
  color: string;
  badgeColor: string;
  warning?: string;
}> = {
  replace: {
    title: 'Reemplazar todo',
    description: 'Tus notas actuales serán REEMPLAZADAS por las del backup. Perderás las notas que no estén en el backup.',
    icon: '🔄',
    color: 'from-red-500 to-orange-500',
    badgeColor: 'bg-red-500/20 text-red-500 border-red-500/30',
    warning: '⚠️ Atención: Perderás las notas actuales que no estén en el backup.'
  },
  merge: {
    title: 'Fusionar (Recomendado)',
    description: 'Conserva TODAS tus notas actuales Y agrega las del backup. No perderás nada.',
    icon: '🔀',
    color: 'from-green-500 to-teal-500',
    badgeColor: 'bg-green-500/20 text-green-500 border-green-500/30',
  },
  add_new: {
    title: 'Solo agregar nuevas',
    description: 'Agrega SOLO las notas del backup que NO existen actualmente. Evita duplicados.',
    icon: '✨',
    color: 'from-blue-500 to-cyan-500',
    badgeColor: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  },
};

/**
 * Obtener texto descriptivo del modo
 */
export function getModeDescription(mode: RestoreMode): string {
  switch (mode) {
    case 'replace':
      return 'Todas tus notas actuales serán eliminadas y reemplazadas por las del backup.';
    case 'merge':
      return 'Tus notas actuales se conservan y se agregan las notas del backup que no existen.';
    case 'add_new':
      return 'Solo se agregan las notas del backup que no existen actualmente.';
    default:
      return '';
  }
}

/**
 * Obtener el impacto del modo en el usuario
 */
export function getModeImpact(mode: RestoreMode, stats: RestoreStats): string {
  switch (mode) {
    case 'replace':
      return `Perderás ${stats.replaceWillLose} nota${stats.replaceWillLose !== 1 ? 's' : ''} actuales.`;
    case 'merge':
      return `Se agregarán ${stats.mergeWillAdd} nota${stats.mergeWillAdd !== 1 ? 's' : ''} nuevas.`;
    case 'add_new':
      return `Se agregarán ${stats.addNewWillAdd} nota${stats.addNewWillAdd !== 1 ? 's' : ''} nuevas.`;
    default:
      return '';
  }
}