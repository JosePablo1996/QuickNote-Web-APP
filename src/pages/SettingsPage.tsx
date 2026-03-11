import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useNotes } from '../hooks/useNotes';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { 
  Lock, ChevronDown, ChevronUp, KeyRound, AlertCircle,
  Moon, Sun, Bell, SortAsc, Save, Grid, List, 
  Download, User, Info, Heart, Shield, 
  ArrowLeft, ChevronRight
} from 'lucide-react'; // Eliminado Trash2
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// COMPONENTES AUXILIARES (FUERA DEL COMPONENTE PRINCIPAL)
// ============================================

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {title}
    </h2>
  </div>
);

const GlassCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl backdrop-blur-lg border-2 overflow-hidden mb-6 bg-white/80 dark:bg-gray-800/60 border-white/90 dark:border-gray-700/40">
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
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  showArrow?: boolean;
}) => (
  <div
    onClick={onClick}
    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors border-b last:border-b-0 border-gray-200 dark:border-gray-700"
  >
    <div className={`p-3 rounded-xl ${iconColor}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-medium text-gray-800 dark:text-gray-200">{title}</h3>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
      )}
    </div>
    {trailing || (showArrow && (
      <ChevronRight className="w-5 h-5 text-gray-400" />
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
// COMPONENTE PRINCIPAL
// ============================================

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { notes } = useNotes(); // Solo usamos notes para estadísticas
  const { user } = useAuth();
  const { success } = useToast(); // Eliminado error: showError que no se usa
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedSortOrder, setSelectedSortOrder] = useState('Fecha de modificación');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [defaultView, setDefaultView] = useState<'grid' | 'list'>('grid');
  
  // Estado para el dropdown de contraseña
  const [showPasswordDropdown, setShowPasswordDropdown] = useState(false);

  const sortOptions = [
    'Fecha de modificación',
    'Fecha de creación',
    'Título (A-Z)',
    'Título (Z-A)',
  ];

  // Función para ir a recuperar contraseña - CORREGIDA
  const handleResetPassword = () => {
    navigate('/forgot-password');
    setShowPasswordDropdown(false);
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

      {/* Contenido */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* APARIENCIA */}
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

        {/* NOTIFICACIONES */}
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

        {/* ORDENAR NOTAS */}
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
                className={`
                  px-3 py-1.5 rounded-lg text-sm
                  ${isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                  }
                  border focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
                onClick={(e) => e.stopPropagation()}
                aria-label="Seleccionar orden de notas"
                title="Ordenar notas"
              >
                {sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            }
            showArrow={false}
          />
        </GlassCard>

        {/* AJUSTES GENERALES */}
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

          <SettingsTile
            icon={defaultView === 'grid' ? <Grid className="w-5 h-5 text-teal-500" /> : <List className="w-5 h-5 text-teal-500" />}
            iconColor="bg-teal-500/10"
            title="Vista predeterminada"
            subtitle={defaultView === 'grid' ? 'Grid' : 'Lista'}
            trailing={
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDefaultView('grid');
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    defaultView === 'grid'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                  }`}
                  aria-label="Vista grid"
                  title="Vista grid"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDefaultView('list');
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    defaultView === 'list'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                  }`}
                  aria-label="Vista lista"
                  title="Vista lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            }
            showArrow={false}
          />
        </GlassCard>

        {/* RESPALDO */}
        <SectionHeader title="Respaldo" />
        <GlassCard>
          <SettingsTile
            icon={<Download className="w-5 h-5 text-green-500" />}
            iconColor="bg-green-500/10"
            title="Respaldo manual"
            subtitle="Crear y restaurar copias de seguridad de tus notas"
            onClick={() => navigate('/backup')}
          />
        </GlassCard>

        {/* SECCIÓN DE SEGURIDAD - CON DROPDOWN Y REDIRECCIÓN CORREGIDA */}
        <SectionHeader title="Seguridad" />
        <GlassCard>
          {/* Tile principal con indicador de dropdown */}
          <div
            onClick={() => setShowPasswordDropdown(!showPasswordDropdown)}
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Lock className="w-5 h-5 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Cambiar contraseña</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'Gestiona la seguridad de tu cuenta'}
              </p>
            </div>
            <div className="text-gray-400">
              {showPasswordDropdown ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>

          {/* Dropdown con mensaje y botón - CORREGIDO */}
          <AnimatePresence>
            {showPasswordDropdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-amber-500/20 rounded-full">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">¿Olvidaste tu contraseña?</span>
                        <br />
                        No te preocupes, puedes recuperar el acceso a tu cuenta fácilmente.
                        Te enviaremos un enlace seguro a tu correo electrónico para que puedas establecer una nueva contraseña.
                      </p>
                    </div>
                  </div>
                  
                  {/* ✅ BOTÓN CORREGIDO - navega directamente a /forgot-password */}
                  <button
                    onClick={handleResetPassword}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg"
                  >
                    <KeyRound className="w-5 h-5" />
                    <span className="font-medium">Recuperar contraseña</span>
                  </button>

                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                    Recibirás un correo en {user?.email || 'tu dirección de correo'} con las instrucciones
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* ACERCA DE */}
        <SectionHeader title="Acerca de" />
        <GlassCard>
          <SettingsTile
            icon={<Info className="w-5 h-5 text-blue-400" />}
            iconColor="bg-blue-400/10"
            title="Versión"
            subtitle="QuickNote v2.0.0"
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

        {/* INFORMACIÓN DEL DESARROLLADOR */}
        <SectionHeader title="Información del desarrollador" />
        <div className="rounded-2xl p-8 backdrop-blur-lg border-2 mb-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Desarrollado con ❤️ por</h3>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
              José Pablo Miranda Quintanilla
            </p>
          </div>

          <button
            onClick={() => navigate('/developer')}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
            aria-label="Ver perfil del desarrollador"
            title="Perfil del desarrollador"
          >
            <User className="w-5 h-5" />
            Ver perfil del desarrollador
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;