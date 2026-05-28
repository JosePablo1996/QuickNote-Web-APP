// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useNotes } from '../hooks/useNotes';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { 
  Lock, ChevronDown, ChevronUp, KeyRound, AlertCircle,
  Moon, Bell, SortAsc, Save, Download, 
  User, Info, Heart, Shield, 
  ArrowLeft, ChevronRight, Fingerprint, Trash2, Loader2,
  AlertTriangle, LogOut, CheckCircle, Mail, Smartphone,
  BadgeCheck, ShieldCheck, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PasskeyLogin } from '../contexts/components/auth/PasskeyLogin';
import { TwoFactorSetup } from '../contexts/components/auth/TwoFactorSetup';
import { api, PasskeyCredential } from '../services/api';

// Componente separado de la tarjeta de usuario (ruta corregida)
import UserProfileCard from '../contexts/components/settings/UserProfileCard';

// ============================================
// FUNCIÓN PARA DETECTAR SI ESTAMOS EN PRODUCCIÓN
// ============================================

const isProduction = (): boolean => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || 
                      hostname === '127.0.0.1' || 
                      hostname.startsWith('192.168.') ||
                      hostname.startsWith('10.') ||
                      hostname.endsWith('.local');
  
  const isRenderProduction = window.location.hostname.includes('onrender.com');
  const isEnvProduction = process.env.NODE_ENV === 'production';
  
  const result = !isLocalhost && (isRenderProduction || isEnvProduction);
  
  console.log(`🔍 Modo: ${result ? 'PRODUCCIÓN' : 'DESARROLLO'} (hostname: ${hostname})`);
  
  return result;
};

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const SectionHeader = ({ title, centered = false }: { title: string; centered?: boolean }) => (
  <div className={`flex items-center gap-2 mb-3 ${centered ? 'justify-center' : ''}`}>
    <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {title}
    </h2>
  </div>
);

const GlassCard = ({ children, centered = false }: { children: React.ReactNode; centered?: boolean }) => (
  <div className={`rounded-2xl backdrop-blur-lg border-2 overflow-hidden mb-6 bg-white/80 dark:bg-gray-800/60 border-white/90 dark:border-gray-700/40 ${centered ? 'flex flex-col items-center text-center' : ''}`}>
    {children}
  </div>
);

const SettingsTile = ({
  icon,
  iconColor,
  title,
  subtitle,
  trailing,
  onClick,
  showArrow = true,
  danger = false,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  showArrow?: boolean;
  danger?: boolean;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors border-b last:border-b-0 border-gray-200 dark:border-gray-700 ${danger ? 'hover:bg-red-50/50 dark:hover:bg-red-900/20' : ''}`}
  >
    <div className={`p-3 rounded-xl ${iconColor}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className={`font-medium ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
        {title}
      </h3>
      {subtitle && (
        <p className={`text-sm truncate ${danger ? 'text-red-400 dark:text-red-300/70' : 'text-gray-500 dark:text-gray-400'}`}>
          {subtitle}
        </p>
      )}
    </div>
    {trailing || (showArrow && (
      <ChevronRight className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-gray-400'}`} />
    ))}
  </div>
);

const ThemeToggle = ({ isDarkMode, toggleTheme }: { isDarkMode: boolean; toggleTheme: () => void }) => (
  <button
    onClick={toggleTheme}
    className={`
      w-14 h-8 rounded-2xl relative transition-all duration-300
      ${isDarkMode 
        ? 'bg-gradient-to-r from-indigo-800 to-purple-800' 
        : 'bg-gradient-to-r from-orange-400 to-amber-600'
      }
      border ${isDarkMode ? 'border-white/20' : 'border-white/50'}
    `}
    aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
  >
    <div
      className={`
        absolute top-1 w-6 h-6 rounded-full bg-white shadow-md
        transition-all duration-300 flex items-center justify-center
        ${isDarkMode ? 'left-7' : 'left-1'}
      `}
    >
      <span className="text-xs">
        {isDarkMode ? '🌙' : '☀️'}
      </span>
    </div>
  </button>
);

const Switch = ({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`
      w-12 h-6 rounded-full relative transition-all duration-300
      ${enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
    `}
    aria-label={enabled ? 'Desactivar' : 'Activar'}
    title={enabled ? 'Desactivar' : 'Activar'}
  >
    <div
      className={`
        absolute top-1 w-4 h-4 rounded-full bg-white shadow-md
        transition-all duration-300
        ${enabled ? 'left-7' : 'left-1'}
      `}
    />
  </button>
);

// ============================================
// COMPONENTE: PASSKEY MANAGEMENT SECTION (SOLO DESARROLLO)
// ============================================

const PasskeyManagementSection: React.FC = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [loadingPasskeys, setLoadingPasskeys] = useState(false);
  const [showPasskeyDropdown, setShowPasskeyDropdown] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [registerKey, setRegisterKey] = useState(0);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  useEffect(() => {
    loadPasskeys();
  }, []);

  const loadPasskeys = async () => {
    setLoadingPasskeys(true);
    try {
      const data = await api.getPasskeys();
      setPasskeys(data);
    } catch (err) {
      console.error('Error cargando passkeys:', err);
    } finally {
      setLoadingPasskeys(false);
    }
  };

  const handleDeletePasskey = async (credentialId: string) => {
    if (!user?.id) return;
    
    setDeletingId(credentialId);
    try {
      const deleted = await api.deletePasskey(credentialId, user.id);
      if (deleted) {
        setPasskeys(prev => prev.filter(p => p.id !== credentialId && p.credential_id !== credentialId));
        success('Passkey eliminada correctamente');
      } else {
        showError('No se pudo eliminar la passkey');
      }
    } catch (err) {
      console.error('Error eliminando passkey:', err);
      showError('Error al eliminar la passkey');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAllPasskeys = async () => {
    if (!user?.id || passkeys.length === 0) return;
    
    setDeletingAll(true);
    let deletedCount = 0;
    let failedCount = 0;
    
    for (const passkey of passkeys) {
      try {
        const deleted = await api.deletePasskey(passkey.credential_id || passkey.id, user.id);
        if (deleted) {
          deletedCount++;
        } else {
          failedCount++;
        }
      } catch (err) {
        failedCount++;
      }
    }
    
    if (deletedCount > 0) {
      setPasskeys([]);
      success(`Eliminadas ${deletedCount} passkey${deletedCount !== 1 ? 's' : ''}${failedCount > 0 ? ` (${failedCount} fallaron)` : ''}`);
    } else {
      showError('No se pudo eliminar ninguna passkey');
    }
    
    setDeletingAll(false);
    setShowDeleteAllConfirm(false);
  };

  const handlePasskeyRegistered = () => {
    setShowRegisterForm(false);
    setDeviceName('');
    setRegisterKey(prev => prev + 1);
    loadPasskeys();
    success('Passkey registrada exitosamente!');
  };

  const handlePasskeyError = (error: string) => {
    showError(error);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getDeviceIcon = (deviceName: string) => {
    const name = deviceName.toLowerCase();
    if (name.includes('windows') || name.includes('pc')) return '💻';
    if (name.includes('mac') || name.includes('laptop')) return '💻';
    if (name.includes('iphone') || name.includes('android')) return '📱';
    if (name.includes('ipad') || name.includes('tablet')) return '📱';
    return '🔑';
  };

  return (
    <div className="space-y-4 text-left">
      <button
        onClick={() => setShowPasskeyDropdown(!showPasskeyDropdown)}
        className="w-full flex items-center gap-4 p-3 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-xl transition-colors text-left"
      >
        <div className="p-3 rounded-xl bg-purple-500/10 flex-shrink-0">
          <Fingerprint className="w-5 h-5 text-purple-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              Claves de acceso (Passkeys)
            </h3>
            {passkeys.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                {passkeys.length}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Usa tu huella digital, reconocimiento facial o PIN
          </p>
        </div>
        <motion.span
          animate={{ rotate: showPasskeyDropdown ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {showPasskeyDropdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2 pl-4 md:pl-14">
              <button
                onClick={() => {
                  setShowRegisterForm(!showRegisterForm);
                  setDeviceName('');
                  setRegisterKey(prev => prev + 1);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg font-medium text-sm"
              >
                <Fingerprint className="w-4 h-4" />
                <span>{showRegisterForm ? 'Cancelar registro' : '+ Nueva Passkey'}</span>
                <motion.span
                  animate={{ rotate: showRegisterForm ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </button>

              <AnimatePresence>
                {showRegisterForm && (
                  <motion.div
                    key={`register-form-${registerKey}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-purple-200 dark:border-purple-700 shadow-lg">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div>
                          <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Fingerprint className="w-5 h-5 text-purple-500" />
                            Registrar nueva Passkey
                          </h4>
                          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Vincula tu dispositivo biométrico
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setShowRegisterForm(false);
                            setDeviceName('');
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                          title="Cerrar"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre del dispositivo
                        </label>
                        <input
                          type="text"
                          value={deviceName}
                          onChange={(e) => setDeviceName(e.target.value)}
                          placeholder="Ej: Mi PC del trabajo, Laptop personal"
                          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>

                      <div className="w-full">
                        <PasskeyLogin 
                          key={`passkey-register-${registerKey}`}
                          onSuccess={handlePasskeyRegistered} 
                          mode="register"
                          onError={handlePasskeyError}
                          deviceName={deviceName}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {loadingPasskeys ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : passkeys.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1 flex-wrap gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dispositivos registrados ({passkeys.length})
                    </span>
                    <button
                      onClick={() => setShowDeleteAllConfirm(true)}
                      disabled={deletingAll}
                      className="px-3 py-1.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center gap-1.5 border border-red-200 dark:border-red-800 disabled:opacity-50"
                    >
                      {deletingAll ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      <span>Eliminar todas</span>
                    </button>
                  </div>
                  {passkeys.map((passkey) => (
                    <motion.div
                      key={passkey.id || passkey.credential_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 group"
                    >
                      <div className="text-2xl flex-shrink-0">
                        {getDeviceIcon(passkey.device_name || '')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {passkey.device_name || 'Dispositivo'}
                        </p>
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>Creado: {formatDate(passkey.created_at)}</span>
                          {passkey.last_used_at && (
                            <span>Último uso: {formatDate(passkey.last_used_at)}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('¿Estás seguro de eliminar esta passkey?')) {
                            handleDeletePasskey(passkey.credential_id || passkey.id);
                          }
                        }}
                        disabled={deletingId === (passkey.credential_id || passkey.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100 self-end sm:self-center"
                        title="Eliminar passkey"
                      >
                        {deletingId === (passkey.credential_id || passkey.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                  <Fingerprint className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Sin dispositivos registrados
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 px-4">
                    Registra una passkey para iniciar sesión con tu huella digital
                  </p>
                </div>
              )}

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300">
                    Las passkeys son más seguras que las contraseñas tradicionales. Utilizan autenticación biométrica.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete All Confirmation Modal */}
      <AnimatePresence>
        {showDeleteAllConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-80 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-2xl"
            >
              <div className="flex justify-center pt-6 pb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Eliminar todas
              </h3>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4 px-6">
                ¿Eliminar TODAS las passkeys?
              </p>
              <p className="text-center text-xs text-gray-500 dark:text-gray-500 mb-6 px-6">
                Se eliminarán <span className="font-bold text-red-500">{passkeys.length}</span> passkey{passkeys.length !== 1 ? 's' : ''}
              </p>
              <div className="flex border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="flex-1 py-3 text-center text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-r border-gray-200 dark:border-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAllPasskeys}
                  disabled={deletingAll}
                  className="flex-1 py-3 text-center text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {deletingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Eliminar todo'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// COMPONENTE: 2FA MANAGEMENT SECTION
// ============================================

const TwoFactorManagementSection: React.FC = () => {
  const { success, error: showError } = useToast();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  useEffect(() => {
    if (showDropdown) {
      checkTwoFactorStatus();
    }
  }, [showDropdown]);

  const checkTwoFactorStatus = async () => {
    setCheckingStatus(true);
    try {
      const status = await api.getTwoFactorStatus();
      console.log('🔍 Estado 2FA recibido:', status);
      if (status) {
        setTwoFactorEnabled(status.enabled === true);
      }
    } catch (err) {
      console.error('Error verificando estado 2FA:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    try {
      await api.disableTwoFactor();
      setTwoFactorEnabled(false);
      success('2FA desactivado correctamente');
      setShowDisableConfirm(false);
      setTimeout(() => checkTwoFactorStatus(), 500);
    } catch (err: any) {
      showError(err.message || 'Error al desactivar 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    setTwoFactorEnabled(true);
    success('2FA activado correctamente');
    setTimeout(() => checkTwoFactorStatus(), 1000);
  };

  const handleSetupCancel = () => {
    setShowSetup(false);
    checkTwoFactorStatus();
  };

  if (twoFactorEnabled === null) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center gap-4 p-3 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-xl transition-colors text-left"
      >
        <div className="p-3 rounded-xl bg-blue-500/10 flex-shrink-0">
          <ShieldCheck className={`w-5 h-5 ${twoFactorEnabled ? 'text-emerald-500' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              Autenticación en Dos Pasos (2FA)
            </h3>
            {twoFactorEnabled ? (
              <span className="px-2 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                Activado
              </span>
            ) : (
              <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                Desactivado
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Añade una capa extra de seguridad con Google Authenticator
          </p>
        </div>
        <motion.span
          animate={{ rotate: showDropdown ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2 pl-4 md:pl-14">
              {checkingStatus ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : twoFactorEnabled ? (
                <>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 md:p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="w-12 h-12 text-emerald-500 flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <h4 className="text-base md:text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                        ¡2FA Activado!
                      </h4>
                      <p className="text-xs md:text-sm text-emerald-600 dark:text-emerald-400">
                        La autenticación en dos pasos está activada.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDisableConfirm(true)}
                    className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm border border-red-200 dark:border-red-800"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Desactivar 2FA</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 md:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <Smartphone className="w-12 h-12 text-blue-500 flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <h4 className="text-base md:text-lg font-semibold text-blue-700 dark:text-blue-300 mb-1">
                        2FA Desactivado
                      </h4>
                      <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400">
                        La autenticación en dos pasos añade seguridad a tu cuenta.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSetup(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg font-medium text-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Configurar 2FA</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSetup && (
          <TwoFactorSetup
            onComplete={handleSetupComplete}
            onCancel={handleSetupCancel}
          />
        )}
      </AnimatePresence>

      {/* Disable 2FA Confirmation Modal */}
      <AnimatePresence>
        {showDisableConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-80 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-2xl"
            >
              <div className="flex justify-center pt-6 pb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Desactivar 2FA
              </h3>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4 px-6">
                ¿Estás seguro de desactivar 2FA?
              </p>
              <p className="text-center text-xs text-gray-500 dark:text-gray-500 mb-6 px-6">
                Tu cuenta será menos segura.
              </p>
              <div className="flex border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDisableConfirm(false)}
                  className="flex-1 py-3 text-center text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-r border-gray-200 dark:border-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDisable2FA}
                  disabled={loading}
                  className="flex-1 py-3 text-center text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Desactivar'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// MODAL DE CERRAR SESIÓN (INCLUIDO DIRECTAMENTE)
// ============================================

const LogoutModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}> = ({ isOpen, onClose, onConfirm, isLoading = false }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [avatarError, setAvatarError] = useState(false);

  const fullName = user?.name || user?.email?.split('@')[0] || 'Usuario';
  const email = user?.email || '';
  const avatarUrl = user?.avatar || '';

  const getInitials = (name?: string) => {
    if (!name || name === 'Usuario') return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name?: string) => {
    const colors = [
      'from-purple-500 to-indigo-500',
      'from-violet-500 to-purple-500',
      'from-blue-500 to-indigo-500',
      'from-fuchsia-500 to-purple-500',
    ];
    const index = (name || 'user').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[Math.abs(index) % colors.length];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`relative w-80 rounded-2xl overflow-hidden shadow-2xl ${
                isDarkMode 
                  ? 'bg-gray-800' 
                  : 'bg-white'
              }`}
            >
              {/* Icono superior */}
              <div className="flex justify-center pt-6 pb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                  <LogOut className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Título */}
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Cerrar sesión
              </h3>

              {/* Avatar miniatura */}
              <div className="flex justify-center mb-2">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(fullName)} flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-md`}>
                  {(avatarUrl && !avatarError) ? (
                    <img 
                      src={avatarUrl} 
                      alt={fullName}
                      className="w-full h-full object-cover rounded-xl"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="text-lg font-bold text-white">
                      {getInitials(fullName)}
                    </span>
                  )}
                </div>
              </div>

              {/* Nombre del usuario */}
              <p className="text-center text-gray-900 dark:text-white font-semibold">
                {fullName}
              </p>

              {/* Email del usuario */}
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4 px-6 break-all">
                {email}
              </p>

              {/* Mensaje de confirmación */}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2 px-6">
                ¿Estás seguro de que deseas cerrar sesión?
              </p>
              <p className="text-center text-xs text-gray-500 dark:text-gray-500 mb-6 px-6">
                Podrás volver a iniciar sesión cuando quieras
              </p>

              {/* Botones */}
              <div className="flex border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-3 text-center text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-r border-gray-200 dark:border-gray-700 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 py-3 text-center text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cerrando...</span>
                    </>
                  ) : (
                    'Cerrar sesión'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================
// COMPONENTE PRINCIPAL SETTINGS PAGE
// ============================================

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedSortOrder, setSelectedSortOrder] = useState('Fecha de modificacion');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showPasswordDropdown, setShowPasswordDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // ✅ Detectar si estamos en producción
  const [showPasskeys, setShowPasskeys] = useState(false);
  
  useEffect(() => {
    // Mostrar passkeys solo en desarrollo
    const prod = isProduction();
    setShowPasskeys(!prod);
  }, []);

  const sortOptions = [
    'Fecha de modificacion',
    'Fecha de creacion',
    'Titulo (A-Z)',
    'Titulo (Z-A)',
  ];

  const handleResetPassword = () => {
    navigate('/forgot-password');
    setShowPasswordDropdown(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/notes')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Volver a notas"
              title="Volver a notas"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Configuración</h1>
          </div>
        </div>
      </div>

      {/* Contenido - Responsive */}
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Perfil de usuario - Componente separado */}
        <UserProfileCard />

        {/* Apariencia */}
        <SectionHeader title="Apariencia" />
        <GlassCard>
          <SettingsTile
            icon={<Moon className="w-5 h-5 text-blue-500" />}
            iconColor="bg-blue-500/10"
            title="Modo oscuro"
            subtitle="Cambiar entre tema claro y oscuro"
            trailing={<ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
            showArrow={false}
          />
        </GlassCard>

        {/* Notificaciones */}
        <SectionHeader title="Notificaciones" />
        <GlassCard>
          <SettingsTile
            icon={<Bell className="w-5 h-5 text-orange-500" />}
            iconColor="bg-orange-500/10"
            title="Notificaciones"
            subtitle="Recibir alertas de recordatorios"
            trailing={<Switch enabled={notificationsEnabled} onChange={setNotificationsEnabled} />}
            showArrow={false}
          />
        </GlassCard>

        {/* Ordenar notas */}
        <SectionHeader title="Ordenar notas" />
        <GlassCard>
          <SettingsTile
            icon={<SortAsc className="w-5 h-5 text-purple-500" />}
            iconColor="bg-purple-500/10"
            title="Ordenar por"
            subtitle={selectedSortOrder}
            trailing={
              <select
                value={selectedSortOrder}
                onChange={(e) => setSelectedSortOrder(e.target.value)}
                className={`px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}
                onClick={(e) => e.stopPropagation()}
                aria-label="Seleccionar orden de notas"
              >
                {sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            }
            showArrow={false}
          />
        </GlassCard>

        {/* Ajustes generales */}
        <SectionHeader title="Ajustes generales" />
        <GlassCard>
          <SettingsTile
            icon={<Save className="w-5 h-5 text-green-500" />}
            iconColor="bg-green-500/10"
            title="Auto-guardado"
            subtitle="Guardar automáticamente al escribir"
            trailing={<Switch enabled={autoSaveEnabled} onChange={setAutoSaveEnabled} />}
            showArrow={false}
          />
        </GlassCard>

        {/* Seguridad */}
        <SectionHeader title="Seguridad" />
        <GlassCard>
          {/* Cambiar contraseña */}
          <div className="w-full border-b border-gray-200 dark:border-gray-700">
            <div
              onClick={() => setShowPasswordDropdown(!showPasswordDropdown)}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="p-3 rounded-xl bg-purple-500/10 flex-shrink-0">
                <KeyRound className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Cambiar contraseña</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'Gestiona la seguridad de tu cuenta'}
                </p>
              </div>
              <div className="text-gray-400 flex-shrink-0">
                {showPasswordDropdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            <AnimatePresence>
              {showPasswordDropdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 md:p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-500/20 rounded-full flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          ¿Olvidaste tu contraseña?
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          Te enviaremos un enlace seguro a tu correo electrónico.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleResetPassword}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <KeyRound className="w-5 h-5" />
                      <span className="font-medium">Recuperar contraseña</span>
                    </button>
                    <p className="text-xs text-left text-gray-500 dark:text-gray-400 mt-3">
                      Recibirás un correo en {user?.email || 'tu dirección de correo'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ✅ Passkey Manager - SOLO EN DESARROLLO */}
          {showPasskeys && (
            <div className="w-full p-4 border-b border-gray-200 dark:border-gray-700">
              <PasskeyManagementSection />
            </div>
          )}

          {/* 2FA Manager - SIEMPRE VISIBLE */}
          <div className="w-full p-4 border-b border-gray-200 dark:border-gray-700">
            <TwoFactorManagementSection />
          </div>

          {/* Copias de seguridad */}
          <SettingsTile
            icon={<Download className="w-5 h-5 text-green-500" />}
            iconColor="bg-green-500/10"
            title="Copias de seguridad"
            subtitle="Crear y restaurar copias de seguridad de tus notas"
            onClick={() => navigate('/backup')}
          />

          {/* ✅ Cerrar sesión - AHORA DENTRO DE SEGURIDAD */}
          <SettingsTile
            icon={<LogOut className="w-5 h-5 text-red-500" />}
            iconColor="bg-red-500/10"
            title="Cerrar sesión"
            subtitle="Salir de tu cuenta actual"
            onClick={() => setShowLogoutModal(true)}
            danger={true}
          />
        </GlassCard>

        {/* Acerca de */}
        <SectionHeader title="Acerca de" />
        <GlassCard>
          <SettingsTile
            icon={<Info className="w-5 h-5 text-blue-400" />}
            iconColor="bg-blue-400/10"
            title="Versión"
            subtitle="QuickNote v2.6.0"
            showArrow={false}
          />
          <SettingsTile
            icon={<Heart className="w-5 h-5 text-amber-500" />}
            iconColor="bg-amber-500/10"
            title="Registro de cambios"
            subtitle="Ver todas las novedades de QuickNote"
            onClick={() => navigate('/changelog')}
          />
        </GlassCard>

        {/* Información del desarrollador */}
        <SectionHeader title="Información del desarrollador" centered />
        <div className="rounded-2xl p-6 md:p-8 backdrop-blur-lg border-2 mb-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 flex flex-col items-center text-center">
          <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-semibold text-base md:text-lg mb-1 text-gray-900 dark:text-white">Desarrollado con ❤️ por</h3>
          <p className="text-lg md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-6">
            Jose Pablo Miranda Quintanilla
          </p>
          <button
            onClick={() => navigate('/developer')}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            Ver perfil del desarrollador
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal de cerrar sesión - INCLUIDO DIRECTAMENTE */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );
};

export default SettingsPage;