// src/pages/NoteCustomizePage.tsx
// ============================================================================
// PÁGINA DE PERSONALIZACIÓN DE NOTAS (COMPLETAMENTE RESPONSIVA)
// ============================================================================
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Check, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { useToast } from '../hooks/useToast';
import NoteCustomizer from '../contexts/components/notes/NoteCustomizer';
import LoadingSpinner from '../contexts/components/ui/LoadingSpinner';
import { Note, NoteCreate } from '../models/Note';

// ============================================================================
// TIPOS
// ============================================================================
interface UnsavedChangesModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// ============================================================================
// ESTADO INICIAL POR DEFECTO
// ============================================================================
const getDefaultDraft = (): NoteCreate => ({
  title: '',
  content: '',
  color: '#3B82F6',
  shape: 'rounded',
  icon: 'default',
  size: 'normal',
  colorIntensity: 'medium',
  is_favorite: false,
  is_archived: false,
  tags: [],
});

// ============================================================================
// COMPONENTE: MODAL DE CAMBIOS NO GUARDADOS
// ============================================================================
const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({ isOpen, onConfirm, onCancel }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm sm:max-w-md rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 py-3 sm:py-4">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              Cambios sin guardar
            </h3>
          </div>
          
          <div className="p-4 sm:p-5 md:p-6">
            <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-800/30 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-amber-500" />
              </div>
            </div>
            
            <div className="text-center mb-4 sm:mb-5 md:mb-6">
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
                ¿Tienes cambios sin guardar?
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Si sales ahora, perderás los cambios realizados en la personalización.
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-500 text-white rounded-lg sm:rounded-xl hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base order-2 xs:order-1"
              >
                Seguir editando
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base order-1 xs:order-2"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Descartar cambios</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ============================================================================
// COMPONENTE: BOTÓN DE ACCIÓN RESPONSIVE
// ============================================================================
const ActionButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant: 'primary' | 'secondary';
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ onClick, disabled, isLoading, variant, icon, children }) => {
  const baseStyles = "rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg";
  const sizeStyles = "px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700",
    secondary: "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 hover:from-gray-300 hover:to-gray-400",
  };
  
  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variants[variant]} ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
      ) : (
        icon
      )}
      <span className="hidden xs:inline">{children}</span>
      <span className="xs:hidden">{variant === 'primary' ? 'Guardar' : 'Aplicar'}</span>
    </motion.button>
  );
};

// ============================================================================
// COMPONENTE: HEADER RESPONSIVE (CON TÍTULO EN DOS LÍNEAS)
// ============================================================================
const PageHeader: React.FC<{
  onBack: () => void;
  onApply: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}> = ({ onBack, onApply, onSave, isSaving, hasChanges }) => (
  <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      <div className="flex items-center justify-between min-h-14 sm:min-h-16 py-2 sm:py-0 gap-2">
        {/* Lado izquierdo - Título en dos líneas en móvil */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label="Volver"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              <span className="inline sm:hidden">🎨 Personaliza</span>
              <span className="hidden sm:inline">🎨 Personaliza tu nota</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden xs:block truncate">
              Configura icono, tamaño, color, forma y etiquetas
            </p>
          </div>
        </div>
        
        {/* Lado derecho - Botones de acción */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {hasChanges && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 rounded-full bg-amber-500 sm:hidden"
            />
          )}
          
          <ActionButton
            onClick={onApply}
            disabled={isSaving}
            variant="secondary"
            icon={<Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          >
            Aplicar cambios
          </ActionButton>
          
          <ActionButton
            onClick={onSave}
            disabled={isSaving}
            isLoading={isSaving}
            variant="primary"
            icon={<Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          >
            Guardar y volver
          </ActionButton>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// COMPONENTE: BANNER DE ESTADO
// ============================================================================
const StatusBanner: React.FC<{ message: string; type: 'success' | 'info' }> = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`fixed top-20 sm:top-24 left-1/2 transform -translate-x-1/2 z-30 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl shadow-lg backdrop-blur-md ${
      type === 'success' 
        ? 'bg-green-500/90 text-white' 
        : 'bg-blue-500/90 text-white'
    }`}
  >
    <div className="flex items-center gap-2 text-xs sm:text-sm">
      {type === 'success' ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
      <span>{message}</span>
    </div>
  </motion.div>
);

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const NoteCustomizePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success: toastSuccess, error: showError } = useToast();
  const { notes, updateNote, isLoading: notesLoading } = useNotes();
  
  // Estados
  const [draft, setDraft] = useState<NoteCreate>(getDefaultDraft());
  const [originalNote, setOriginalNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  
  // Ref para evitar actualizaciones durante el montaje
  const isMounted = useRef(true);

  // Limpiar en desmontaje
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Comparar si hay cambios sin guardar
  const checkForUnsavedChanges = useCallback((currentDraft: NoteCreate, original: Note | null) => {
    if (!original) {
      // Modo creación: verificar si hay algún valor no vacío
      const hasAnyValue = currentDraft.title !== '' || 
        currentDraft.content !== '' || 
        (currentDraft.tags && currentDraft.tags.length > 0) ||
        currentDraft.color !== '#3B82F6' ||
        currentDraft.shape !== 'rounded' ||
        currentDraft.icon !== 'default' ||
        currentDraft.size !== 'normal' ||
        currentDraft.colorIntensity !== 'medium';
      setHasUnsavedChanges(hasAnyValue);
    } else {
      // Modo edición: comparar con la nota original
      const hasChanges = 
        currentDraft.title !== original.title ||
        currentDraft.content !== original.content ||
        currentDraft.color !== original.color ||
        currentDraft.shape !== (original.shape || 'rounded') ||
        currentDraft.icon !== (original.icon || 'default') ||
        currentDraft.size !== (original.size || 'normal') ||
        currentDraft.colorIntensity !== (original.colorIntensity || 'medium') ||
        JSON.stringify(currentDraft.tags) !== JSON.stringify(original.tags || []);
      setHasUnsavedChanges(hasChanges);
    }
  }, []);

  // Mostrar mensaje de estado temporal
  const showStatusMessage = useCallback((message: string, type: 'success' | 'info') => {
    setStatusMessage({ message, type });
    setTimeout(() => {
      if (isMounted.current) {
        setStatusMessage(null);
      }
    }, 3000);
  }, []);

  // Cargar borrador desde sessionStorage o desde nota existente
  useEffect(() => {
    const loadDraft = async () => {
      const savedDraft = sessionStorage.getItem('noteDraft');
      const isEditMode = !!id;
      
      if (isEditMode && notes.length > 0) {
        const found = notes.find(n => n.id === id);
        if (found) {
          setOriginalNote(found);
          const newDraft = {
            title: found.title || '',
            content: found.content || '',
            color: found.color || '#3B82F6',
            shape: (found.shape as any) || 'rounded',
            icon: (found.icon as any) || 'default',
            size: (found.size as any) || 'normal',
            colorIntensity: (found.colorIntensity as any) || 'medium',
            is_favorite: found.is_favorite || false,
            is_archived: found.is_archived || false,
            tags: found.tags || [],
          };
          setDraft(newDraft);
          checkForUnsavedChanges(newDraft, found);
        }
        setLoading(false);
      } else if (savedDraft && !isEditMode) {
        try {
          const parsed = JSON.parse(savedDraft);
          const newDraft = {
            ...getDefaultDraft(),
            ...parsed,
            tags: parsed.tags || [],
          };
          setDraft(newDraft);
          checkForUnsavedChanges(newDraft, null);
        } catch (e) {
          console.error('Error parsing draft:', e);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    
    loadDraft();
  }, [id, notes, checkForUnsavedChanges]);

  // Actualizar estado de cambios cuando el draft cambia
  useEffect(() => {
    checkForUnsavedChanges(draft, originalNote);
  }, [draft, originalNote, checkForUnsavedChanges]);

  // Guardar en sessionStorage
  const saveToSessionStorage = useCallback(() => {
    sessionStorage.setItem('noteDraft', JSON.stringify(draft));
    showStatusMessage('✨ Cambios guardados en borrador', 'success');
  }, [draft, showStatusMessage]);

  // Aplicar cambios (solo guardar en sessionStorage)
  const handleApplyChanges = useCallback(() => {
    saveToSessionStorage();
  }, [saveToSessionStorage]);

  // Guardar y volver
  const handleSaveAndReturn = useCallback(async () => {
    setIsSaving(true);
    try {
      // Guardar en sessionStorage
      sessionStorage.setItem('noteDraft', JSON.stringify(draft));
      
      if (originalNote) {
        // Modo edición: actualizar nota
        const result = await updateNote(originalNote.id, draft);
        if (result) {
          showStatusMessage('✅ Personalización guardada correctamente', 'success');
          setHasUnsavedChanges(false);
          navigate(`/notes/${originalNote.id}`);
        } else {
          showError('❌ Error al guardar los cambios');
        }
      } else {
        // Modo creación: volver al formulario con los cambios
        showStatusMessage('✅ Personalización guardada, vuelve a crear tu nota', 'success');
        navigate('/notes/new');
      }
    } catch (error) {
      showError('❌ Ocurrió un error inesperado');
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
    }
  }, [draft, originalNote, updateNote, navigate, showError, showStatusMessage]);

  // Manejar navegación con verificación de cambios
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
      setPendingNavigation('back');
    } else {
      if (originalNote) {
        navigate(`/notes/${originalNote.id}`);
      } else {
        navigate('/notes/new');
      }
    }
  }, [hasUnsavedChanges, originalNote, navigate]);

  const handleConfirmDiscard = useCallback(() => {
    setShowUnsavedModal(false);
    if (pendingNavigation === 'back') {
      if (originalNote) {
        navigate(`/notes/${originalNote.id}`);
      } else {
        navigate('/notes/new');
      }
    }
    setPendingNavigation(null);
  }, [pendingNavigation, originalNote, navigate]);

  const handleCancelDiscard = useCallback(() => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  }, []);

  // Estado de carga
  if (notesLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando personalización..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <PageHeader
        onBack={handleBack}
        onApply={handleApplyChanges}
        onSave={handleSaveAndReturn}
        isSaving={isSaving}
        hasChanges={hasUnsavedChanges}
      />

      {/* Banner de estado flotante */}
      <AnimatePresence>
        {statusMessage && (
          <StatusBanner message={statusMessage.message} type={statusMessage.type} />
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        <NoteCustomizer
          draft={draft}
          setDraft={setDraft}
          isSaving={isSaving}
        />
      </div>

      {/* Modal de cambios no guardados */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelDiscard}
      />
    </div>
  );
};

export default NoteCustomizePage;