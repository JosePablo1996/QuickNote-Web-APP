// src/contexts/components/notes/NoteActionsMenu.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Share2, Copy, Printer } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { Note } from '../../../models/Note';

interface NoteActionsMenuProps {
  note: Note;
  onShare: () => void;
}

const NoteActionsMenu: React.FC<NoteActionsMenuProps> = ({ note, onShare }) => {
  const { success } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.content || ''}`);
      success('✅ Contenido copiado al portapapeles');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = `${note.title}\n\n${note.content || ''}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      success('✅ Contenido copiado al portapapeles');
    }
    setIsOpen(false);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const noteColorHex = note.color || '#3B82F6';
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${note.title} - QuickNote</title>
          <style>
            body { font-family: Arial; max-width: 800px; margin: 40px auto; padding: 20px; }
            h1 { color: ${noteColorHex}; }
            .metadata { color: #666; margin-bottom: 30px; }
            .content { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>${note.title.replace(/</g, '&lt;')}</h1>
          <div class="metadata">📅 ${new Date(note.created_at).toLocaleString()}</div>
          <div class="content">${(note.content || '').replace(/\n/g, '<br>').replace(/</g, '&lt;')}</div>
          <script>window.print();</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Opciones de nota"
      >
        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            <div className="py-1">
              <button
                onClick={() => {
                  onShare();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Share2 className="w-4 h-4 text-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">Compartir</span>
              </button>
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Copy className="w-4 h-4 text-purple-500" />
                <span className="text-gray-700 dark:text-gray-300">Copiar</span>
              </button>
              <button
                onClick={handlePrint}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Printer className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Imprimir</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoteActionsMenu;