import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { Note, NoteCreate, NoteUpdate } from '../models/Note';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export interface NoteContextType {
  notes: Note[];           // Notas activas (no archivadas, no eliminadas)
  archivedNotes: Note[];    // Notas archivadas
  deletedNotes: Note[];     // Notas en papelera
  isLoading: boolean;
  error: string | null;
  
  // Operaciones CRUD
  loadNotes: () => Promise<void>;
  loadArchivedNotes: () => Promise<void>;
  loadDeletedNotes: () => Promise<void>;
  createNote: (note: NoteCreate) => Promise<Note | null>;
  updateNote: (id: string, note: NoteUpdate) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<boolean>;
  
  // Operaciones específicas
  toggleFavorite: (id: string) => Promise<boolean>;
  toggleArchive: (id: string) => Promise<boolean>;
  restoreNote: (id: string) => Promise<boolean>;
  deletePermanently: (id: string) => Promise<boolean>;
  replaceAllNotes: (newNotes: Note[]) => Promise<void>;
  
  // Utilidades
  getNoteById: (id: string) => Note | undefined;
  getNotesByTag: (tag: string) => Note[];
  searchNotes: (query: string) => Note[];
  clearAllNotes: () => Promise<void>;
  syncNotes: () => Promise<void>;
  clearUserData: () => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  
  // Refs para controlar cargas
  const isMounted = useRef(true);
  const loadingRef = useRef(false);
  const initialLoadRef = useRef(false);
  const prevUserIdRef = useRef<string | undefined>();
  const clearingDataRef = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ============== FUNCIÓN DE UTILIDAD ==============

  /**
   * Normalizar una nota para asegurar que todos los campos estén en el formato correcto
   */
  const normalizeNote = (note: any): Note => {
    if (!note) return note;
    
    return {
      ...note,
      // ✅ Asegurar que user_id sea string (si viene del backend)
      user_id: note.user_id ? String(note.user_id) : null,
      // ✅ Asegurar que tags sea array
      tags: Array.isArray(note.tags) ? note.tags : [],
      // ✅ Asegurar valores booleanos
      is_favorite: !!note.is_favorite,
      is_archived: !!note.is_archived,
      // ✅ Asegurar que fechas sean strings
      created_at: note.created_at || new Date().toISOString(),
      updated_at: note.updated_at || note.created_at || new Date().toISOString(),
    };
  };

  /**
   * Normalizar un array de notas
   */
  const normalizeNotes = (notesArray: any[]): Note[] => {
    if (!Array.isArray(notesArray)) return [];
    return notesArray.map(normalizeNote).filter(Boolean);
  };

  const ensureArray = (data: any): Note[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.notes)) return data.notes;
    }
    console.warn('⚠️ La respuesta de la API no es un array:', data);
    return [];
  };

  // ============== LIMPIEZA DE DATOS ==============

  /**
   * Limpiar todos los datos del usuario actual
   */
  const clearUserData = useCallback(() => {
    // Evitar limpiezas múltiples
    if (clearingDataRef.current) return;
    
    clearingDataRef.current = true;
    console.log('🧹 Limpiando datos del usuario anterior');
    
    setNotes([]);
    setArchivedNotes([]);
    setDeletedNotes([]);
    initialLoadRef.current = false;
    prevUserIdRef.current = undefined;
    
    // Resetear el ref después de un tiempo
    setTimeout(() => {
      clearingDataRef.current = false;
    }, 100);
  }, []);

  // ============== CARGA DE NOTAS ==============

  const loadNotes = useCallback(async () => {
    if (!isAuthenticated || !user || loadingRef.current) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📥 Cargando notas para usuario:', user.id);
      const data = await api.getNotes(false);
      
      if (!isMounted.current) return;
      
      const allNotes = ensureArray(data);
      
      // ✅ Normalizar todas las notas
      const normalizedNotes = normalizeNotes(allNotes);
      
      // Clasificamos las notas
      const active = normalizedNotes.filter((note: Note) => !note.is_archived);
      const archived = normalizedNotes.filter((note: Note) => note.is_archived);

      setNotes(active);
      setArchivedNotes(archived);
      
      console.log(`✅ ${active.length} activas, ${archived.length} archivadas cargadas`);
    } catch (err) {
      if (!isMounted.current) return;
      const message = err instanceof Error ? err.message : 'Error al cargar notas';
      setError(message);
      toast.error(message);
      console.error('Error loading notes:', err);
    } finally {
      if (isMounted.current) setIsLoading(false);
      loadingRef.current = false;
    }
  }, [isAuthenticated, user, toast]);

  const loadArchivedNotes = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    await loadNotes();
  }, [isAuthenticated, user, loadNotes]);

  const loadDeletedNotes = useCallback(async () => {
    console.log(`🗑️ ${deletedNotes.length} notas en papelera local`);
  }, [deletedNotes.length]);

  // Carga inicial - SOLO cuando el usuario cambia
  useEffect(() => {
    // Si no hay usuario autenticado, limpiar datos
    if (!isAuthenticated || !user) {
      if (prevUserIdRef.current !== undefined) {
        clearUserData();
      }
      return;
    }

    // Si el usuario cambió, limpiar datos anteriores y cargar nuevos
    if (user.id !== prevUserIdRef.current) {
      console.log('👤 Usuario cambió, limpiando notas anteriores');
      
      // Limpiar antes de cargar nuevas notas
      if (prevUserIdRef.current !== undefined) {
        clearUserData();
      }
      
      prevUserIdRef.current = user.id;
      initialLoadRef.current = true;
      
      // Pequeño retraso para asegurar que la limpieza termine
      setTimeout(() => {
        if (isMounted.current) {
          loadNotes();
        }
      }, 50);
    }
  }, [isAuthenticated, user, loadNotes, clearUserData]);

  // ============== OPERACIONES CRUD ==============

  const createNote = async (noteData: NoteCreate): Promise<Note | null> => {
    if (!isAuthenticated || !user) {
      toast.error('Debes iniciar sesión para crear notas');
      return null;
    }
    setIsLoading(true);
    setError(null);
    try {
      // ✅ Asegurar que noteData tenga el formato correcto
      // Nota: NO incluimos user_id, el backend lo asigna desde el token
      const noteToSend: NoteCreate = {
        title: noteData.title,
        content: noteData.content || '',
        color: noteData.color || '#3B82F6',
        is_favorite: !!noteData.is_favorite,
        is_archived: !!noteData.is_archived,
        tags: Array.isArray(noteData.tags) ? noteData.tags : [],
      };
      
      const newNote = await api.createNote(noteToSend);
      if (!newNote) throw new Error('Error al crear nota');
      
      // ✅ Normalizar la nota recibida
      const normalizedNote = normalizeNote(newNote);
      
      if (isMounted.current) {
        if (normalizedNote.is_archived) {
          setArchivedNotes(prev => [normalizedNote, ...prev]);
        } else {
          setNotes(prev => [normalizedNote, ...prev]);
        }
        toast.success('Nota creada correctamente');
      }
      return normalizedNote;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear nota';
      setError(message); 
      toast.error(message);
      return null;
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const updateNote = async (id: string, noteData: NoteUpdate): Promise<Note | null> => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para actualizar notas');
      return null;
    }
    setIsLoading(true);
    setError(null);
    try {
      // ✅ Construir objeto de actualización limpio
      const updateData: NoteUpdate = {};
      if (noteData.title !== undefined) updateData.title = noteData.title;
      if (noteData.content !== undefined) updateData.content = noteData.content;
      if (noteData.color !== undefined) updateData.color = noteData.color;
      if (noteData.is_favorite !== undefined) updateData.is_favorite = !!noteData.is_favorite;
      if (noteData.is_archived !== undefined) updateData.is_archived = !!noteData.is_archived;
      if (noteData.tags !== undefined) updateData.tags = Array.isArray(noteData.tags) ? noteData.tags : [];
      if (noteData.deleted_at !== undefined) updateData.deleted_at = noteData.deleted_at;
      
      const updatedNote = await api.updateNote(id, updateData);
      if (!updatedNote) throw new Error('Error al actualizar nota');

      // ✅ Normalizar la nota actualizada
      const normalizedNote = normalizeNote(updatedNote);

      if (isMounted.current) {
        setNotes(prev => prev.map(n => n.id === id ? normalizedNote : n));
        setArchivedNotes(prev => prev.map(n => n.id === id ? normalizedNote : n));
        
        toast.success('Nota actualizada correctamente');
      }
      return normalizedNote;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar nota';
      setError(message); 
      toast.error(message);
      return null;
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const deleteNote = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para eliminar notas');
      return false;
    }
    setError(null);
    try {
      const deletedNote = await api.softDeleteNote(id);
      if (!deletedNote) throw new Error('Error al mover a papelera');
      
      // ✅ Normalizar la nota eliminada
      const normalizedNote = normalizeNote(deletedNote);
      
      if (isMounted.current) {
        setDeletedNotes(prev => [normalizedNote, ...prev]);
        setNotes(prev => prev.filter(n => n.id !== id));
        setArchivedNotes(prev => prev.filter(n => n.id !== id));
        toast.info('Nota movida a la papelera');
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar nota';
      setError(message); 
      toast.error(message);
      return false;
    }
  };

  // ============== OPERACIONES ESPECÍFICAS ==============

  const toggleFavorite = async (id: string): Promise<boolean> => {
    try {
      const note = notes.find(n => n.id === id) || archivedNotes.find(n => n.id === id);
      if (!note) return false;

      const updatedNote = await api.updateNote(id, { is_favorite: !note.is_favorite });
      if (!updatedNote) throw new Error('Error al actualizar favorito');

      // ✅ Normalizar la nota actualizada
      const normalizedNote = normalizeNote(updatedNote);

      if (isMounted.current) {
        setNotes(prev => prev.map(n => n.id === id ? normalizedNote : n));
        setArchivedNotes(prev => prev.map(n => n.id === id ? normalizedNote : n));
        const message = normalizedNote.is_favorite ? '⭐ Añadida a favoritos' : '☆ Eliminada de favoritos';
        toast.success(message);
      }
      return true;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error('Error al actualizar favorito');
      return false;
    }
  };

  const toggleArchive = async (id: string): Promise<boolean> => {
    try {
      const note = notes.find(n => n.id === id) || archivedNotes.find(n => n.id === id);
      if (!note) return false;

      const updatedNote = await api.updateNote(id, { is_archived: !note.is_archived });
      if (!updatedNote) throw new Error('Error al archivar/desarchivar');

      // ✅ Normalizar la nota actualizada
      const normalizedNote = normalizeNote(updatedNote);

      if (isMounted.current) {
        if (normalizedNote.is_archived) {
          setNotes(prev => prev.filter(n => n.id !== id));
          setArchivedNotes(prev => [normalizedNote, ...prev]);
        } else {
          setArchivedNotes(prev => prev.filter(n => n.id !== id));
          setNotes(prev => [normalizedNote, ...prev]);
        }
        
        const message = normalizedNote.is_archived ? '📦 Nota archivada' : '📂 Nota desarchivada';
        toast.info(message);
      }
      return true;
    } catch (err) {
      console.error('Error toggling archive:', err);
      toast.error('Error al archivar/desarchivar');
      return false;
    }
  };

  const restoreNote = async (id: string): Promise<boolean> => {
    try {
      const restoredNote = await api.restoreNote(id);
      if (!restoredNote) throw new Error('Error al restaurar nota');

      // ✅ Normalizar la nota restaurada
      const normalizedNote = normalizeNote(restoredNote);

      if (isMounted.current) {
        setDeletedNotes(prev => prev.filter(n => n.id !== id));
        if (normalizedNote.is_archived) {
          setArchivedNotes(prev => [normalizedNote, ...prev]);
        } else {
          setNotes(prev => [normalizedNote, ...prev]);
        }
        toast.success('Nota restaurada correctamente');
      }
      return true;
    } catch (err) {
      console.error('Error restoring note:', err);
      toast.error('Error al restaurar nota');
      return false;
    }
  };

  const deletePermanently = async (id: string): Promise<boolean> => {
    try {
      const successResult = await api.deleteNote(id);
      if (!successResult) throw new Error('Error al eliminar permanentemente');

      if (isMounted.current) {
        setDeletedNotes(prev => prev.filter(n => n.id !== id));
        toast.success('Nota eliminada permanentemente');
      }
      return true;
    } catch (err) {
      console.error('Error deleting permanently:', err);
      toast.error('Error al eliminar nota');
      return false;
    }
  };

  const replaceAllNotes = async (newNotes: Note[]): Promise<void> => {
    try {
      console.log('🔄 Reemplazando todas las notas');
      
      // Eliminar todas las notas actuales
      for (const note of notes) {
        await api.deleteNote(note.id);
      }
      for (const note of archivedNotes) {
        await api.deleteNote(note.id);
      }
      for (const note of deletedNotes) {
        await api.deleteNote(note.id);
      }
      
      // Crear las nuevas notas
      for (const note of newNotes) {
        const noteData: NoteCreate = {
          title: note.title,
          content: note.content,
          color: note.color,
          is_favorite: note.is_favorite,
          is_archived: note.is_archived,
          tags: Array.isArray(note.tags) ? note.tags : [],
        };
        await api.createNote(noteData);
      }
      
      await loadNotes();
      toast.success('Notas sincronizadas correctamente');
    } catch (err) {
      console.error('Error replacing notes:', err);
      toast.error('Error al sincronizar notas');
    }
  };

  const syncNotes = async (): Promise<void> => {
    try {
      console.log('🔄 Sincronizando notas con el servidor');
      await loadNotes();
      toast.success('Notas sincronizadas correctamente');
    } catch (err) {
      console.error('Error syncing notes:', err);
      toast.error('Error al sincronizar notas');
    }
  };

  const getNoteById = (id: string): Note | undefined => {
    return notes.find(n => n.id === id) || 
           archivedNotes.find(n => n.id === id) || 
           deletedNotes.find(n => n.id === id);
  };

  const getNotesByTag = (tag: string): Note[] => {
    return notes.filter(note => note.tags?.includes(tag));
  };

  const searchNotes = (query: string): Note[] => {
    if (!query.trim()) return notes;
    
    const lowerQuery = query.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };

  const clearAllNotes = async (): Promise<void> => {
    try {
      console.log('🧹 Eliminando todas las notas');
      
      for (const note of notes) {
        await api.deleteNote(note.id);
      }
      for (const note of archivedNotes) {
        await api.deleteNote(note.id);
      }
      
      setNotes([]);
      setArchivedNotes([]);
      toast.success('Todas las notas han sido eliminadas');
    } catch (err) {
      console.error('Error clearing notes:', err);
      toast.error('Error al eliminar notas');
    }
  };

  const value = {
    notes,
    archivedNotes,
    deletedNotes,
    isLoading,
    error,
    loadNotes,
    loadArchivedNotes,
    loadDeletedNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    toggleArchive,
    restoreNote,
    deletePermanently,
    replaceAllNotes,
    getNoteById,
    getNotesByTag,
    searchNotes,
    clearAllNotes,
    syncNotes,
    clearUserData,
  };

  return (
    <NoteContext.Provider value={value}>
      {children}
    </NoteContext.Provider>
  );
};

export { NoteContext };