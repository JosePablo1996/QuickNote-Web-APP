// src/contexts/components/export/ExportModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  FileJson, 
  File, 
  Download, 
  Check,
  ChevronRight,
  Tag,
  Calendar,
  Info,
  Settings,
  Printer,
  Smartphone,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../hooks/useToast';
import { 
  exportNotes, 
  ExportFormat, 
  ExportScope, 
  ExportOptions,
  ExportResult 
} from '../../../services/exportService';
import { Note } from '../../../models/Note';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  selectedNoteIds?: string[];
  title?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  notes,
  selectedNoteIds = [],
  title = 'Exportar Notas'
}) => {
  const { isDarkMode } = useTheme();
  const { success, error: showError, info } = useToast();
  
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [selectedScope, setSelectedScope] = useState<ExportScope>('all');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);
  const [includeDates, setIncludeDates] = useState(true);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Determinar notas a exportar según el alcance
  const getNotesToExport = (): Note[] => {
    switch (selectedScope) {
      case 'single':
        if (selectedNoteIds.length === 1) {
          return notes.filter(n => n.id === selectedNoteIds[0]);
        }
        return notes.slice(0, 1);
      case 'selected':
        if (selectedNoteIds.length > 0) {
          return notes.filter(n => selectedNoteIds.includes(n.id));
        }
        return notes;
      case 'all':
      default:
        return notes;
    }
  };

  const notesToExport = getNotesToExport();
  const noteCount = notesToExport.length;

  // Calcular tamaño estimado
  const getEstimatedSize = (): string => {
    const data = JSON.stringify(notesToExport);
    const bytes = data.length;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Manejar exportación
  const handleExport = async () => {
    if (noteCount === 0) {
      showError('No hay notas para exportar');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    // Simular progreso
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 200);

    const exportOptions: ExportOptions = {
      format: selectedFormat,
      scope: selectedScope,
      includeMetadata: includeMetadata,
      includeTags: includeTags,
      includeDates: includeDates,
      orientation: orientation,
      filename: `quicknote_export_${new Date().toISOString().split('T')[0]}`
    };

    try {
      const result = await exportNotes(notesToExport, exportOptions);
      
      clearInterval(interval);
      setExportProgress(100);
      
      setTimeout(() => {
        if (result.success) {
          success(result.message);
          onClose();
        } else {
          showError(result.message);
        }
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    } catch (error: any) {
      clearInterval(interval);
      showError(error.message || 'Error durante la exportación');
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Resetear al abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedFormat('pdf');
      setSelectedScope(selectedNoteIds.length > 0 ? 'selected' : 'all');
      setIncludeMetadata(true);
      setIncludeTags(true);
      setIncludeDates(true);
      setOrientation('portrait');
      setShowAdvanced(false);
      setExportProgress(0);
    }
  }, [isOpen, selectedNoteIds.length]);

  if (!isOpen) return null;

  const formats = [
    { id: 'pdf', label: 'PDF', icon: <File className="w-5 h-5" />, description: 'Documento profesional para imprimir/compartir', color: 'from-red-500 to-orange-500' },
    { id: 'markdown', label: 'Markdown', icon: <FileText className="w-5 h-5" />, description: 'Formato texto plano con etiquetas', color: 'from-blue-500 to-cyan-500' },
    { id: 'json', label: 'JSON', icon: <FileJson className="w-5 h-5" />, description: 'Backup completo para restaurar', color: 'from-green-500 to-emerald-500' }
  ];

  const scopes = [
    { id: 'all', label: 'Todas las notas', description: `${notes.length} notas disponibles` },
    { id: 'selected', label: 'Solo seleccionadas', description: `${selectedNoteIds.length} notas seleccionadas`, disabled: selectedNoteIds.length === 0 },
    { id: 'single', label: 'Solo primera nota', description: 'Exportar solo la primera nota' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`px-6 py-5 border-b flex items-center justify-between ${
            isDarkMode ? 'border-gray-800' : 'border-gray-100'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Elige el formato y las opciones
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Formato */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Formato de exportación
              </label>
              <div className="grid grid-cols-3 gap-3">
                {formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id as ExportFormat)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      selectedFormat === format.id
                        ? isDarkMode
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-purple-500 bg-purple-50'
                        : isDarkMode
                          ? 'border-gray-700 hover:border-gray-600'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`flex justify-center mb-2 ${
                      selectedFormat === format.id ? 'text-purple-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {format.icon}
                    </div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {format.label}
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {format.description.split(' ').slice(0, 3).join(' ')}...
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Alcance */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Notas a exportar
              </label>
              <div className="space-y-2">
                {scopes.map((scope) => (
                  <button
                    key={scope.id}
                    onClick={() => !scope.disabled && setSelectedScope(scope.id as ExportScope)}
                    disabled={scope.disabled}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                      selectedScope === scope.id
                        ? isDarkMode
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-purple-500 bg-purple-50'
                        : scope.disabled
                          ? isDarkMode
                            ? 'border-gray-700 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 opacity-50 cursor-not-allowed'
                          : isDarkMode
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {scope.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {scope.description}
                      </p>
                    </div>
                    {selectedScope === scope.id && (
                      <Check className="w-5 h-5 text-purple-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

    {/* Opciones avanzadas - Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                isDarkMode
                  ? 'border-gray-700 hover:border-gray-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Opciones avanzadas
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
            </button>

            {/* Opciones avanzadas - Contenido */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {/* Metadatos */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Incluir metadatos
                      </span>
                    </div>
                    <button
                      onClick={() => setIncludeMetadata(!includeMetadata)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        includeMetadata ? 'bg-purple-500' : 'bg-gray-400'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        includeMetadata ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Etiquetas */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-purple-400" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Incluir etiquetas
                      </span>
                    </div>
                    <button
                      onClick={() => setIncludeTags(!includeTags)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        includeTags ? 'bg-purple-500' : 'bg-gray-400'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        includeTags ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Orientación (solo para PDF) */}
                  {selectedFormat === 'pdf' && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5">
                      <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-purple-400" />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Orientación {orientation === 'portrait' ? 'Vertical' : 'Horizontal'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setOrientation('portrait')}
                          className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                            orientation === 'portrait'
                              ? 'bg-purple-500 text-white'
                              : isDarkMode
                                ? 'bg-gray-700 text-gray-400'
                                : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          Vertical
                        </button>
                        <button
                          onClick={() => setOrientation('landscape')}
                          className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                            orientation === 'landscape'
                              ? 'bg-purple-500 text-white'
                              : isDarkMode
                                ? 'bg-gray-700 text-gray-400'
                                : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          Horizontal
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resumen */}
            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Resumen
                </span>
                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Tamaño estimado: {getEstimatedSize()}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  📄 {noteCount} nota(s) a exportar
                </p>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  🎨 Formato: {selectedFormat.toUpperCase()}
                </p>
                {includeMetadata && (
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    📅 Incluyendo fechas de creación/actualización
                  </p>
                )}
                {includeTags && (
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    🏷️ Incluyendo etiquetas
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer con progreso */}
          <div className={`px-6 py-5 border-t ${
            isDarkMode ? 'border-gray-800' : 'border-gray-100'
          }`}>
            {isExporting && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    Exportando...
                  </span>
                  <span className="text-purple-500 font-medium">{exportProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isExporting}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || noteCount === 0}
                className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-lg"
              >
                {isExporting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>Exportar {noteCount} nota(s)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExportModal;