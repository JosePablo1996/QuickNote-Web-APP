// src/contexts/components/auth/TwoFactorBackupCodes.tsx
import { useState } from 'react';
import { Shield, Copy, Check, Download, X, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';

interface TwoFactorBackupCodesProps {
  isOpen: boolean;
  onClose: () => void;
  backupCodes: string[];
  onRegenerate?: () => void;
}

export const TwoFactorBackupCodes = ({
  isOpen,
  onClose,
  backupCodes,
  onRegenerate
}: TwoFactorBackupCodesProps) => {
  const { isDarkMode } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Colores QuickNote
  const gradientStart = '#8B5CF6';
  const gradientEnd = '#6366F1';

  if (!isOpen) return null;

  const copyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCodes = () => {
    const element = document.createElement('a');
    const content = backupCodes.join('\n');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `quicknote_backup_codes_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRegenerateClick = () => {
    setShowRegenerateConfirm(true);
  };

  const handleRegenerateConfirm = () => {
    setShowRegenerateConfirm(false);
    if (onRegenerate) onRegenerate();
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`
        rounded-2xl shadow-2xl w-full max-w-md
        ${isDarkMode 
          ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border border-gray-700/50' 
          : 'bg-gradient-to-br from-white/95 to-gray-50/95 border border-gray-200/50'
        }
        backdrop-blur-lg
      `}>
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${gradientStart}20` }}
            >
              <Shield className="w-5 h-5" style={{ color: gradientStart }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Códigos de Respaldo
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {backupCodes.length} códigos disponibles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Cerrar"
            aria-label="Cerrar códigos de respaldo"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Advertencia */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-400 text-sm mb-1">
                  Importante
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-500">
                  Guarda estos códigos en un lugar seguro. Cada código solo puede usarse una vez. 
                  Si pierdes acceso a Google Authenticator, estos códigos te permitirán acceder a tu cuenta.
                </p>
              </div>
            </div>
          </div>

          {/* Códigos (ocultos/mostrados) */}
          <div className="mb-4">
            <button
              onClick={() => setShowCodes(!showCodes)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all mb-3"
              style={{
                backgroundColor: `${gradientStart}10`,
                border: `1px solid ${gradientStart}30`,
                color: gradientStart
              }}
              title={showCodes ? "Ocultar códigos" : "Mostrar códigos"}
              aria-label={showCodes ? "Ocultar códigos de respaldo" : "Mostrar códigos de respaldo"}
            >
              {showCodes ? (
                <>
                  <EyeOff size={16} />
                  Ocultar códigos
                </>
              ) : (
                <>
                  <Eye size={16} />
                  Mostrar códigos
                </>
              )}
            </button>

            <div className={`bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all duration-300 ${
              showCodes ? '' : 'blur-sm select-none'
            }`}>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, i) => (
                  <div 
                    key={i}
                    className="py-2 px-3 bg-white dark:bg-gray-700 rounded-lg text-center font-mono text-sm tracking-wider text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            {!showCodes && backupCodes.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Haz clic en "Mostrar códigos" para verlos
              </p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={copyCodes}
              disabled={backupCodes.length === 0}
              className="flex-1 text-xs font-medium flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition disabled:opacity-50"
              style={{ 
                color: gradientStart, 
                border: `1px solid ${gradientStart}50`,
                backgroundColor: `${gradientStart}08`
              }}
              title="Copiar todos los códigos"
              aria-label="Copiar códigos de respaldo al portapapeles"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? '¡Copiado!' : 'Copiar todos'}
            </button>
            <button
              onClick={downloadCodes}
              disabled={backupCodes.length === 0}
              className="flex-1 text-xs font-medium flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition disabled:opacity-50"
              style={{ 
                color: gradientStart, 
                border: `1px solid ${gradientStart}50`,
                backgroundColor: `${gradientStart}08`
              }}
              title="Descargar códigos como archivo"
              aria-label="Descargar códigos de respaldo"
            >
              <Download size={14} />
              Descargar
            </button>
          </div>

          {/* Regenerar códigos */}
          {onRegenerate && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {!showRegenerateConfirm ? (
                <button
                  onClick={handleRegenerateClick}
                  className="w-full text-xs font-medium flex items-center justify-center gap-2 py-2.5 rounded-lg transition text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                  title="Regenerar códigos de respaldo"
                  aria-label="Regenerar códigos de respaldo"
                >
                  <RefreshCw size={14} />
                  Regenerar códigos
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3">
                    <p className="text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      <span>
                        Los códigos anteriores dejarán de funcionar. Asegúrate de guardar los nuevos códigos.
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRegenerateConfirm(false)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleRegenerateConfirm}
                      className="flex-1 py-2 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition"
                    >
                      Sí, regenerar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorBackupCodes;