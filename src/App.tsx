// src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { ToastContainer } from "./contexts/components/ui/ToastContainer";
import CloudRestorePrompt from './contexts/components/backup/CloudRestorePrompt';
import SelectiveBackupModal from './contexts/components/backup/SelectiveBackupModal';

// ============================================
// IMPORTACIÓN DE PÁGINAS
// ============================================

// Páginas principales
import NotesPage from './pages/NotesPage';
import NoteDetailPage from './pages/NoteDetailPage';
import NoteFormPage from './pages/NoteFormPage';
import NoteCustomizePage from './pages/NoteCustomizePage';
import ArchivedPage from './pages/ArchivedPage';
import FavoritesPage from './pages/FavoritesPage';
import TrashPage from './pages/TrashPage';
import CalendarPage from './pages/CalendarPage';
import TagsPage from './pages/TagsPage';
import TagNotesPage from './pages/TagNotesPage';

// Páginas de autenticación
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OtpLoginPage from './pages/OtpLoginPage';
import { WelcomeContainer } from "./contexts/components/auth/WelcomeContainer";

// Páginas de configuración y utilidades
import SettingsPage from './pages/SettingsPage';
import ProfileUserPage from './pages/ProfileUserPage';
import BackupPage from './pages/BackupPage';
import HelpPage from './pages/HelpPage';
import DeveloperPage from './pages/DeveloperPage';
import ChangelogPage from './pages/ChangelogPage';

// ============================================
// COMPONENTE PROTECTED ROUTE
// ============================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Solo redirigir si YA terminó de cargar y NO está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// ============================================
// COMPONENTE PUBLIC ROUTE MEJORADO
// ============================================

interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children, restricted = true }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Solo redirigir si la ruta es restringida Y el usuario está autenticado
  if (restricted && isAuthenticated) {
    return <Navigate to="/notes" replace />;
  }

  // En cualquier otro caso, mostrar la página
  return <>{children}</>;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function App() {
  const { isDarkMode } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  // Aplicar clase dark al HTML cuando cambie el tema
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <>
      <Routes>
        {/* ======================================== */}
        {/* RUTAS PÚBLICAS NO RESTRINGIDAS */}
        {/* ======================================== */}
        
        {/* Recuperar contraseña - accesible incluso para usuarios autenticados */}
        <Route
          path="/forgot-password"
          element={
            <PublicRoute restricted={false}>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />

        {/* Restablecer contraseña - accesible incluso para usuarios autenticados */}
        <Route
          path="/reset-password"
          element={
            <PublicRoute restricted={false}>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        {/* Login con OTP - accesible para todos */}
        <Route
          path="/otp-login"
          element={
            <PublicRoute restricted={true}>
              <OtpLoginPage />
            </PublicRoute>
          }
        />

        {/* Verificación 2FA - accesible con token temporal */}
        <Route
          path="/verify-2fa"
          element={
            <PublicRoute restricted={false}>
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500">
                <div className="text-center text-white">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-lg">Redirigiendo a verificación 2FA...</p>
                </div>
              </div>
            </PublicRoute>
          }
        />

        {/* ======================================== */}
        {/* RUTAS PÚBLICAS RESTRINGIDAS */}
        {/* ======================================== */}
        
        {/* Splash Screen - Página de inicio */}
        <Route
          path="/"
          element={
            <PublicRoute restricted={true}>
              <SplashScreen />
            </PublicRoute>
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            <PublicRoute restricted={true}>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Registro */}
        <Route
          path="/register"
          element={
            <PublicRoute restricted={true}>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* ======================================== */}
        {/* RUTAS PROTEGIDAS */}
        {/* ======================================== */}

        {/* Welcome Screen después del login */}
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <WelcomeContainer />
            </ProtectedRoute>
          }
        />

        {/* Página principal de notas */}
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesPage />
            </ProtectedRoute>
          }
        />

        {/* Detalle de nota */}
        <Route
          path="/notes/:id"
          element={
            <ProtectedRoute>
              <NoteDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* RUTAS DE CREACIÓN Y PERSONALIZACIÓN */}
        {/* ======================================== */}

        {/* Crear nueva nota - Formulario simplificado */}
        <Route
          path="/notes/new"
          element={
            <ProtectedRoute>
              <NoteFormPage />
            </ProtectedRoute>
          }
        />

        {/* Personalizar nueva nota - Configuración visual */}
        <Route
          path="/notes/new/customize"
          element={
            <ProtectedRoute>
              <NoteCustomizePage />
            </ProtectedRoute>
          }
        />

        {/* Editar nota - Formulario simplificado */}
        <Route
          path="/notes/:id/edit"
          element={
            <ProtectedRoute>
              <NoteFormPage />
            </ProtectedRoute>
          }
        />

        {/* Personalizar nota existente - Configuración visual */}
        <Route
          path="/notes/:id/edit/customize"
          element={
            <ProtectedRoute>
              <NoteCustomizePage />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* OTRAS RUTAS PROTEGIDAS */}
        {/* ======================================== */}

        {/* Notas archivadas */}
        <Route
          path="/archived"
          element={
            <ProtectedRoute>
              <ArchivedPage />
            </ProtectedRoute>
          }
        />

        {/* Notas favoritas */}
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />

        {/* Papelera */}
        <Route
          path="/trash"
          element={
            <ProtectedRoute>
              <TrashPage />
            </ProtectedRoute>
          }
        />

        {/* Calendario */}
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />

        {/* Gestión de etiquetas */}
        <Route
          path="/tags"
          element={
            <ProtectedRoute>
              <TagsPage />
            </ProtectedRoute>
          }
        />

        {/* Notas por etiqueta */}
        <Route
          path="/tags/:tag"
          element={
            <ProtectedRoute>
              <TagNotesPage />
            </ProtectedRoute>
          }
        />

        {/* Configuración */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Perfil de usuario */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileUserPage />
            </ProtectedRoute>
          }
        />

        {/* Backups */}
        <Route
          path="/backup"
          element={
            <ProtectedRoute>
              <BackupPage />
            </ProtectedRoute>
          }
        />

        {/* Centro de ayuda */}
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <HelpPage />
            </ProtectedRoute>
          }
        />

        {/* Página del desarrollador */}
        <Route
          path="/developer"
          element={
            <ProtectedRoute>
              <DeveloperPage />
            </ProtectedRoute>
          }
        />

        {/* Historial de cambios */}
        <Route
          path="/changelog"
          element={
            <ProtectedRoute>
              <ChangelogPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Contenedor de notificaciones Toast */}
      <ToastContainer />

      {/* Componente de restauración automática desde la nube */}
      {isAuthenticated && !isLoading && <CloudRestorePrompt />}

      {/* Modal global de Backup Selectivo */}
      <SelectiveBackupModal />

      {/* ❌ Widget de Auto-Backup eliminado - Ahora solo aparece en NotesPage.tsx */}
    </>
  );
}

export default App;