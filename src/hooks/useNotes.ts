import { useContext } from 'react';
import { NoteContext } from '../contexts/NoteContext';

export const useNotes = () => {
  const context = useContext(NoteContext);
  
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  
  return context;
};