// src/hooks/useSelectiveBackup.ts
import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { Note } from '../models/Note';
import { useToast } from './useToast';

interface SelectiveBackupState {
  isOpen: boolean;
  notes: Note[];
  selectedIds: Set<string>;
}

let globalOpenModal: ((notes: Note[]) => void) | null = null;

export const useSelectiveBackup = () => {
  const [state, setState] = useState<SelectiveBackupState>({
    isOpen: false,
    notes: [],
    selectedIds: new Set()
  });
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: showError } = useToast();

  const openModal = useCallback((notes: Note[]) => {
    setState({
      isOpen: true,
      notes: notes,
      selectedIds: new Set()
    });
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const toggleNote = useCallback((noteId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedIds);
      if (newSelected.has(noteId)) {
        newSelected.delete(noteId);
      } else {
        newSelected.add(noteId);
      }
      return { ...prev, selectedIds: newSelected };
    });
  }, []);

  const selectAll = useCallback(() => {
    setState(prev => {
      const allIds = new Set(prev.notes.map(n => n.id));
      return { ...prev, selectedIds: allIds };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedIds: new Set() }));
  }, []);

  const selectFavorites = useCallback(() => {
    setState(prev => {
      const favoriteIds = new Set(prev.notes.filter(n => n.is_favorite).map(n => n.id));
      return { ...prev, selectedIds: favoriteIds };
    });
  }, []);

  const saveBackup = useCallback(async () => {
    const { notes, selectedIds } = state;
    
    if (selectedIds.size === 0) {
      showError('Selecciona al menos una nota');
      return;
    }

    const selectedNotes = notes.filter(n => selectedIds.has(n.id));
    
    setIsSaving(true);
    try {
      const backup = await api.saveCloudBackup(selectedNotes);
      if (backup) {
        success(`✅ ${backup.note_count} notas guardadas en la nube`);
        closeModal();
      } else {
        showError('Error al guardar el backup');
      }
    } catch (error: any) {
      showError(error.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  }, [state, closeModal, success, showError]);

  // Registrar el modal globalmente
  if (typeof window !== 'undefined') {
    globalOpenModal = openModal;
  }

  return {
    state,
    isSaving,
    openModal,
    closeModal,
    toggleNote,
    selectAll,
    clearSelection,
    selectFavorites,
    saveBackup
  };
};

// Función global para abrir el modal desde cualquier lugar
export const openSelectiveBackupModal = (notes: Note[]) => {
  if (globalOpenModal) {
    globalOpenModal(notes);
  } else {
    console.error('SelectiveBackupModal no está montado');
  }
};