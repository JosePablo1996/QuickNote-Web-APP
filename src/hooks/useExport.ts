// src/hooks/useExport.ts
import { useState, useCallback } from 'react';
import { useNotes } from './useNotes';
import { useToast } from './useToast';
import { 
  exportNotes, 
  exportSingleNoteToPDF,
  exportToZip,
  ExportFormat, 
  ExportScope, 
  ExportOptions, 
  ExportResult,
  shareNote
} from '../services/exportService';
import { Note } from '../models/Note';

interface UseExportOptions {
  autoCloseModal?: boolean;
  showNotifications?: boolean;
}

interface ExportState {
  isExporting: boolean;
  progress: number;
  currentFormat: ExportFormat | null;
  error: string | null;
  result: ExportResult | null;
}

const initialState: ExportState = {
  isExporting: false,
  progress: 0,
  currentFormat: null,
  error: null,
  result: null
};

export const useExport = (options: UseExportOptions = {}) => {
  const { autoCloseModal = true, showNotifications = true } = options;
  const { notes } = useNotes();
  const { success, error: showError, info } = useToast();
  
  const [state, setState] = useState<ExportState>(initialState);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  // Resetear estado
  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  // Actualizar progreso
  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  // Exportar notas
  const exportNotesAsync = useCallback(async (
    notesToExport: Note[],
    exportOptions: ExportOptions
  ): Promise<ExportResult | null> => {
    if (!notesToExport || notesToExport.length === 0) {
      const errorMsg = 'No hay notas para exportar';
      if (showNotifications) info(errorMsg);
      setState(prev => ({ ...prev, error: errorMsg }));
      return null;
    }

    setState(prev => ({
      ...prev,
      isExporting: true,
      progress: 0,
      currentFormat: exportOptions.format,
      error: null
    }));

    // Simular progreso
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.progress >= 90) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, progress: prev.progress + Math.floor(Math.random() * 10) + 5 };
      });
    }, 200);

    try {
      const result = await exportNotes(notesToExport, exportOptions);
      
      clearInterval(interval);
      setState(prev => ({ ...prev, progress: 100, result, isExporting: false }));
      
      if (result.success && showNotifications) {
        success(result.message);
      } else if (!result.success && showNotifications) {
        showError(result.message);
      }
      
      if (autoCloseModal) {
        setShowExportModal(false);
      }
      
      return result;
    } catch (error: any) {
      clearInterval(interval);
      const errorMsg = error.message || 'Error durante la exportación';
      setState(prev => ({
        ...prev,
        isExporting: false,
        error: errorMsg,
        result: null
      }));
      if (showNotifications) showError(errorMsg);
      return null;
    }
  }, [success, showError, info, autoCloseModal, showNotifications]);

  // Exportar nota individual a PDF
  const exportSinglePDF = useCallback(async (
    note: Note,
    elementId?: string
  ): Promise<ExportResult | null> => {
    if (!note) {
      const errorMsg = 'Nota no válida';
      if (showNotifications) showError(errorMsg);
      return null;
    }

    setState(prev => ({
      ...prev,
      isExporting: true,
      progress: 0,
      currentFormat: 'pdf',
      error: null
    }));

    try {
      const result = await exportSingleNoteToPDF(note, elementId);
      
      setState(prev => ({ ...prev, progress: 100, result, isExporting: false }));
      
      if (result.success && showNotifications) {
        success(result.message);
      } else if (!result.success && showNotifications) {
        showError(result.message);
      }
      
      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'Error exportando a PDF';
      setState(prev => ({ ...prev, isExporting: false, error: errorMsg }));
      if (showNotifications) showError(errorMsg);
      return null;
    }
  }, [success, showError, showNotifications]);

  // Exportar a ZIP
  const exportToZipAsync = useCallback(async (
    notesToExport: Note[],
    format: ExportFormat
  ): Promise<ExportResult | null> => {
    if (!notesToExport || notesToExport.length === 0) {
      const errorMsg = 'No hay notas para exportar';
      if (showNotifications) info(errorMsg);
      return null;
    }

    setState(prev => ({
      ...prev,
      isExporting: true,
      progress: 0,
      currentFormat: format,
      error: null
    }));

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.progress >= 90) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, progress: prev.progress + Math.floor(Math.random() * 10) + 5 };
      });
    }, 200);

    try {
      const result = await exportToZip(notesToExport, format, {
        format,
        scope: 'all',
        includeMetadata: true,
        includeTags: true,
        includeDates: true
      });
      
      clearInterval(interval);
      setState(prev => ({ ...prev, progress: 100, result, isExporting: false }));
      
      if (result.success && showNotifications) {
        success(result.message);
      } else if (!result.success && showNotifications) {
        showError(result.message);
      }
      
      return result;
    } catch (error: any) {
      clearInterval(interval);
      const errorMsg = error.message || 'Error exportando a ZIP';
      setState(prev => ({ ...prev, isExporting: false, error: errorMsg }));
      if (showNotifications) showError(errorMsg);
      return null;
    }
  }, [success, showError, info, showNotifications]);

  // Compartir nota (Web Share API)
  const shareNoteAsync = useCallback(async (note: Note): Promise<boolean> => {
    if (!note) {
      if (showNotifications) showError('Nota no válida');
      return false;
    }

    try {
      const shared = await shareNote(note);
      if (shared && showNotifications) {
        success('Nota compartida correctamente');
      } else if (!shared && showNotifications) {
        info('Tu navegador no soporta compartir directamente');
      }
      return shared;
    } catch (error: any) {
      if (showNotifications) showError(error.message || 'Error al compartir');
      return false;
    }
  }, [success, showError, info, showNotifications]);

  // Exportar notas actuales (todas)
  const exportAllNotes = useCallback(async (format: ExportFormat): Promise<ExportResult | null> => {
    return exportNotesAsync(notes, {
      format,
      scope: 'all',
      includeMetadata: true,
      includeTags: true,
      includeDates: true,
      orientation: 'portrait'
    });
  }, [notes, exportNotesAsync]);

  // Exportar notas seleccionadas
  const exportSelectedNotes = useCallback(async (
    format: ExportFormat,
    selectedIds: string[]
  ): Promise<ExportResult | null> => {
    const selectedNotes = notes.filter(n => selectedIds.includes(n.id));
    return exportNotesAsync(selectedNotes, {
      format,
      scope: 'selected',
      includeMetadata: true,
      includeTags: true,
      includeDates: true,
      orientation: 'portrait'
    });
  }, [notes, exportNotesAsync]);

  // Abrir modal de exportación
  const openExportModal = useCallback((selectedIds: string[] = []) => {
    setSelectedNoteIds(selectedIds);
    setShowExportModal(true);
  }, []);

  // Cerrar modal de exportación
  const closeExportModal = useCallback(() => {
    setShowExportModal(false);
    resetState();
  }, [resetState]);

  // Obtener notas seleccionadas para exportación
  const getSelectedNotesForExport = useCallback((): Note[] => {
    if (selectedNoteIds.length > 0) {
      return notes.filter(n => selectedNoteIds.includes(n.id));
    }
    return notes;
  }, [notes, selectedNoteIds]);

  return {
    // Estado
    ...state,
    showExportModal,
    selectedNoteIds,
    notesToExport: getSelectedNotesForExport(),
    noteCount: getSelectedNotesForExport().length,
    
    // Acciones principales
    exportNotes: exportNotesAsync,
    exportSinglePDF,
    exportToZip: exportToZipAsync,
    shareNote: shareNoteAsync,
    exportAllNotes,
    exportSelectedNotes,
    
    // Control del modal
    openExportModal,
    closeExportModal,
    setSelectedNoteIds,
    
    // Utilidades
    resetState,
    updateProgress
  };
};

export default useExport;