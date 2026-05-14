// src/contexts/components/backup/SelectiveBackupModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CloudUpload, 
  Search, 
  Check,
  Star,
  Archive,
  Tag,
  HardDrive,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useSelectiveBackup } from '../../../hooks/useSelectiveBackup';
import LoadingSpinner from '../ui/LoadingSpinner';

const SelectiveBackupModal: React.FC = () => {
  const { isDarkMode } = useTheme();
  const {
    state,
    isSaving,
    closeModal,
    toggleNote,
    selectAll,
    clearSelection,
    selectFavorites,
    saveBackup
  } = useSelectiveBackup();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'archived' | 'tags'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // ✅ Aumentado a 12 notas por página
  const itemsPerPage = 12;

  const { isOpen, notes, selectedIds } = state;

  // Filtrar notas
  const filteredNotes = notes.filter(note => {
    if (note.deleted_at) return false;
    
    const matchSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchFilter = true;
    if (activeFilter === 'favorites') matchFilter = note.is_favorite === true;
    if (activeFilter === 'archived') matchFilter = note.is_archived === true;
    if (activeFilter === 'tags') matchFilter = (note.tags?.length || 0) > 0;
    
    return matchSearch && matchFilter;
  });

  // Paginación
  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const selectedCount = selectedIds.size;
  const selectedNotesData = notes.filter(n => selectedIds.has(n.id));
  const totalSize = JSON.stringify(selectedNotesData).length;
  
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // Resetear al abrir
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setActiveFilter('all');
      setCurrentPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);

  // Verificar si todas las notas filtradas están seleccionadas
  const allFilteredSelected = filteredNotes.length > 0 && 
    filteredNotes.every(n => selectedIds.has(n.id));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}
          style={{ maxHeight: '90vh' }}
        >
          {/* Header - más grande */}
          <div className={`px-6 py-5 border-b flex items-center justify-between ${
            isDarkMode ? 'border-gray-800' : 'border-gray-100'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <CloudUpload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Backup Selectivo
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Selecciona las notas que quieres respaldar en la nube
                </p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            {/* Search - más grande */}
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Buscar notas por título o contenido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 text-base rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                }`}
              />
            </div>

            {/* Filters - más grandes */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'all', label: 'Todas las notas', icon: null, color: 'purple' },
                { id: 'favorites', label: '⭐ Favoritas', icon: null, color: 'amber' },
                { id: 'archived', label: '📦 Archivadas', icon: null, color: 'blue' },
                { id: 'tags', label: '🏷️ Con etiquetas', icon: null, color: 'green' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeFilter === filter.id
                      ? filter.color === 'amber'
                        ? 'bg-amber-500 text-white'
                        : filter.color === 'blue'
                        ? 'bg-blue-500 text-white'
                        : filter.color === 'green'
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Actions bar - más grande */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={selectAll}
                className="px-4 py-2 text-sm rounded-xl bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors flex items-center gap-2 font-medium"
              >
                <CheckSquare className="w-4 h-4" />
                Seleccionar todas
              </button>
              <button
                onClick={selectFavorites}
                className="px-4 py-2 text-sm rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors flex items-center gap-2 font-medium"
              >
                <Star className="w-4 h-4" />
                Seleccionar favoritas
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-2 text-sm rounded-xl bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 transition-colors flex items-center gap-2 font-medium"
              >
                <Square className="w-4 h-4" />
                Limpiar selección
              </button>
            </div>

            {/* Stats card - más grande y visible */}
            <div className={`flex items-center justify-between p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedCount > 0 ? 'bg-purple-500/20' : 'bg-gray-500/20'}`}>
                  <HardDrive className={`w-5 h-5 ${selectedCount > 0 ? 'text-purple-400' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedCount} nota(s) seleccionada(s)
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Tamaño estimado: {formatSize(totalSize)}
                  </p>
                </div>
              </div>
              {selectedCount > 0 && (
                <div className="px-3 py-1.5 rounded-lg bg-purple-500/20">
                  <span className="text-purple-400 text-sm font-medium">
                    Listo para respaldar
                  </span>
                </div>
              )}
            </div>

            {/* Notes grid - más ancho y mejor visualización */}
            {paginatedNotes.length === 0 ? (
              <div className="text-center py-16">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <AlertCircle className={`w-10 h-10 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
                <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay notas para mostrar
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-3 text-sm text-purple-500 hover:underline"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paginatedNotes.map(note => {
                  const isSelected = selectedIds.has(note.id);
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => toggleNote(note.id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-purple-500/20 border-2 border-purple-500/50'
                            : 'bg-purple-50 border-2 border-purple-300'
                          : isDarkMode
                            ? 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                            : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5">
                          {isSelected ? (
                            <div className="w-6 h-6 rounded-md bg-purple-500 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className={`w-6 h-6 rounded-md border-2 ${
                              isDarkMode ? 'border-gray-500' : 'border-gray-400'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-base font-semibold truncate ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {note.title || 'Sin título'}
                            </span>
                            {note.is_favorite && (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            )}
                            {note.is_archived && (
                              <Archive className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          {note.content && (
                            <p className={`text-sm mt-1 line-clamp-2 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {note.content.substring(0, 100)}
                              {note.content.length > 100 ? '...' : ''}
                            </p>
                          )}
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {note.tags.slice(0, 3).map(tag => (
                                <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${
                                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  #{tag}
                                </span>
                              ))}
                              {note.tags.length > 3 && (
                                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  +{note.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pagination - más visible */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-purple-500 text-white'
                            : isDarkMode
                              ? 'hover:bg-gray-800 text-gray-400'
                              : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="w-10 h-10 flex items-center justify-center">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === totalPages
                            ? 'bg-purple-500 text-white'
                            : isDarkMode
                              ? 'hover:bg-gray-800 text-gray-400'
                              : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Footer - más grande */}
          <div className={`px-6 py-5 border-t flex gap-4 ${
            isDarkMode ? 'border-gray-800' : 'border-gray-100'
          }`}>
            <button
              onClick={closeModal}
              className={`flex-1 py-3 rounded-xl font-medium text-base transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={saveBackup}
              disabled={selectedCount === 0 || isSaving}
              className="flex-1 py-3 rounded-xl font-medium text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-lg"
            >
              {isSaving ? <LoadingSpinner size="sm" /> : <CloudUpload className="w-5 h-5" />}
              <span>Guardar {selectedCount} nota(s)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SelectiveBackupModal;