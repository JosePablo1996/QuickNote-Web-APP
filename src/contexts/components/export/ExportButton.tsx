// src/contexts/components/export/ExportButton.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  FileText, 
  FileJson, 
  File, 
  ChevronDown,
  Check,
  Loader2,
  Settings
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useNotes } from '../../../hooks/useNotes';
import { useToast } from '../../../hooks/useToast';
import { exportNotes, ExportFormat, ExportResult } from '../../../services/exportService';
import { Note } from '../../../models/Note';
import ExportModal from './ExportModal';

interface ExportButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  notesToExport?: Note[];
  selectedNoteIds?: string[];
  onExportComplete?: (result: ExportResult) => void;
  showLabel?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  notesToExport,
  selectedNoteIds = [],
  onExportComplete,
  showLabel = true
}) => {
  const { isDarkMode } = useTheme();
  const { notes } = useNotes();
  const { success, error: showError, info } = useToast();
  
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [quickExportFormat, setQuickExportFormat] = useState<ExportFormat | null>(null);
  const [isQuickExporting, setIsQuickExporting] = useState(false);

  // Determinar notas a exportar
  const getNotesToExport = (): Note[] => {
    if (notesToExport && notesToExport.length > 0) {
      return notesToExport;
    }
    if (selectedNoteIds.length > 0) {
      return notes.filter(n => selectedNoteIds.includes(n.id));
    }
    return notes;
  };

  const availableNotes = getNotesToExport();
  const noteCount = availableNotes.length;

  // Exportación rápida (sin modal)
  const handleQuickExport = async (format: ExportFormat) => {
    if (noteCount === 0) {
      info('No hay notas para exportar');
      return;
    }

    setIsQuickExporting(true);
    setQuickExportFormat(format);

    try {
      const result = await exportNotes(availableNotes, {
        format,
        scope: selectedNoteIds.length > 0 ? 'selected' : 'all',
        includeMetadata: true,
        includeTags: true,
        includeDates: true,
        orientation: 'portrait',
        filename: `quicknote_export_${new Date().toISOString().split('T')[0]}`
      });

      if (result.success) {
        success(result.message);
        onExportComplete?.(result);
      } else {
        showError(result.message);
      }
    } catch (error: any) {
      showError(error.message || 'Error durante la exportación');
    } finally {
      setIsQuickExporting(false);
      setQuickExportFormat(null);
      setShowMenu(false);
    }
  };

  // Abrir modal para exportación avanzada
  const handleOpenModal = () => {
    setShowMenu(false);
    setShowModal(true);
  };

  // Estilos según variante
  const getButtonStyles = (): string => {
    const baseStyles = `rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${className}`;
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-2.5 text-lg'
    };

    const variantStyles = {
      primary: `bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-lg`,
      secondary: isDarkMode 
        ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      outline: `border-2 ${isDarkMode 
        ? 'border-purple-500 text-purple-400 hover:bg-purple-500/10' 
        : 'border-purple-500 text-purple-600 hover:bg-purple-50'}`,
      icon: `p-2 ${isDarkMode 
        ? 'hover:bg-gray-800 text-gray-400' 
        : 'hover:bg-gray-100 text-gray-600'}`
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`;
  };

  // Si es solo icono
  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleOpenModal}
          className={getButtonStyles()}
          title="Exportar notas"
          aria-label="Exportar notas"
        >
          <Download className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </button>
        <ExportModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          notes={notes}
          selectedNoteIds={selectedNoteIds}
        />
      </>
    );
  }

  return (
    <>
      {/* Menú desplegable */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={getButtonStyles()}
          disabled={isQuickExporting}
        >
          {isQuickExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Exportando {quickExportFormat?.toUpperCase()}...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              {showLabel && <span>Exportar</span>}
              <ChevronDown className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute right-0 mt-2 w-64 rounded-xl shadow-lg overflow-hidden z-50 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="p-2">
                {/* Opción de exportación avanzada */}
                <button
                  onClick={handleOpenModal}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors text-left ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-200' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Configuración avanzada</p>
                    <p className="text-xs text-gray-500">Personaliza la exportación</p>
                  </div>
                </button>

                <div className={`my-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`} />

                {/* Exportación rápida PDF */}
                <button
                  onClick={() => handleQuickExport('pdf')}
                  disabled={noteCount === 0}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors text-left ${
                    noteCount === 0 ? 'opacity-50 cursor-not-allowed' : isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-200' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <File className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Exportar a PDF</p>
                    <p className="text-xs text-gray-500">Documento profesional</p>
                  </div>
                </button>

                {/* Exportación rápida Markdown */}
                <button
                  onClick={() => handleQuickExport('markdown')}
                  disabled={noteCount === 0}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors text-left ${
                    noteCount === 0 ? 'opacity-50 cursor-not-allowed' : isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-200' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Exportar a Markdown</p>
                    <p className="text-xs text-gray-500">Formato texto plano</p>
                  </div>
                </button>

                {/* Exportación rápida JSON */}
                <button
                  onClick={() => handleQuickExport('json')}
                  disabled={noteCount === 0}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors text-left ${
                    noteCount === 0 ? 'opacity-50 cursor-not-allowed' : isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-200' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <FileJson className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Exportar a JSON</p>
                    <p className="text-xs text-gray-500">Backup completo</p>
                  </div>
                </button>

                {/* Indicador de notas */}
                <div className={`mt-2 pt-2 text-center text-xs ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {noteCount} nota(s) disponible(s)
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de exportación avanzada */}
      <ExportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        notes={notes}
        selectedNoteIds={selectedNoteIds}
      />
    </>
  );
};

export default ExportButton;