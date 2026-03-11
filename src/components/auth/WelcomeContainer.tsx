import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeScreen from './WelcomeScreen';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';

interface WelcomeContainerProps {
  /**
   * Tiempo en milisegundos antes de redirigir automáticamente
   * @default 5000
   */
  redirectDelay?: number;
  
  /**
   * Si debe redirigir automáticamente después del tiempo
   * @default true
   */
  autoRedirect?: boolean;
  
  /**
   * Ruta a la que redirigir después de la bienvenida
   * @default "/notes"
   */
  redirectTo?: string;
  
  /**
   * Callback opcional cuando se completa la bienvenida
   */
  onComplete?: () => void;
}

export const WelcomeContainer: React.FC<WelcomeContainerProps> = ({
  redirectDelay = 5000,
  autoRedirect = true,
  redirectTo = '/notes',
  onComplete,
}) => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Efecto para verificar autenticación con reintentos
  useEffect(() => {
    console.log('🎯 WelcomeContainer montado');
    console.log('📊 Estado:', { 
      isLoading, 
      isAuthenticated, 
      userEmail: user?.email,
      retryCount 
    });

    // Si está cargando, esperar
    if (isLoading) {
      console.log('⏳ Esperando carga de autenticación...');
      return;
    }

    // Si no está autenticado después de cargar
    if (!isAuthenticated || !user) {
      console.log('⚠️ Usuario no autenticado');
      
      // Intentar obtener usuario del localStorage como fallback
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedUser && storedToken && retryCount < 3) {
        console.log(`🔄 Reintento ${retryCount + 1}/3 - Hay datos en localStorage`);
        setRetryCount(prev => prev + 1);
        
        // Esperar y reintentar
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      }
      
      // No hay datos, redirigir al login
      setError('No hay sesión activa. Redirigiendo al login...');
      
      // Limpiar cualquier dato residual
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
      
      return;
    }

    // Usuario autenticado exitosamente
    console.log('✅ Usuario autenticado:', user.email);
    
  }, [isLoading, isAuthenticated, user, navigate, retryCount]);

  // Función para obtener el nombre a mostrar
  const getDisplayName = (): string => {
    if (!user) return 'Usuario';
    
    // Intentar obtener de user_metadata
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    // Intentar obtener de app_metadata
    if (user.app_metadata?.full_name) {
      return user.app_metadata.full_name;
    }
    
    // Usar el email (parte antes del @)
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'Usuario';
  };

  // Función para obtener el email
  const getEmail = (): string => {
    return user?.email || 'usuario@quicknote.app';
  };

  // Función para obtener el avatar (opcional)
  const getAvatar = (): string | undefined => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    return undefined;
  };

  // Manejar finalización de bienvenida
  const handleWelcomeComplete = () => {
    console.log('🎉 Bienvenida completada');
    
    if (onComplete) {
      onComplete();
    }
    
    navigate(redirectTo, { replace: true });
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    console.log('🚪 Cerrando sesión desde WelcomeContainer');
    
    // Limpiar todo
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    
    // Redirigir al login
    navigate('/login', { replace: true });
  };

  // Manejar reintento manual
  const handleRetry = () => {
    console.log('🔄 Reintentando verificación');
    window.location.reload();
  };

  // Si hay error, mostrar pantalla de error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex p-4 bg-red-500/30 rounded-full mb-6">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Error de Autenticación
            </h2>
            
            <p className="text-white/90 mb-6">
              {error}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-white text-red-600 hover:bg-red-50 font-bold py-3 px-4 rounded-xl transition-colors"
              >
                Reintentar
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-4 rounded-xl transition-colors"
              >
                Volver al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras verifica
  if (isLoading || retryCount > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 animate-ping">
              <Loader2 className="w-16 h-16 text-white/30 mx-auto mb-4" />
            </div>
          </div>
          <p className="text-white text-lg font-medium mb-2">
            Verificando autenticación...
          </p>
          {retryCount > 0 && (
            <p className="text-white/80 text-sm">
              Reintentando ({retryCount}/3)
            </p>
          )}
        </div>
      </div>
    );
  }

  // Si no hay usuario (después de verificar), no mostrar nada
  if (!user) {
    return null;
  }

  // Preparar datos del usuario para WelcomeScreen
  const userData = {
    name: getDisplayName(),
    email: getEmail(),
    avatar: getAvatar(),
  };

  console.log('🎨 Renderizando WelcomeScreen con usuario:', userData);

  // Mostrar pantalla de bienvenida
  return (
    <WelcomeScreen
      userName={userData.name}
      userEmail={userData.email}
      userAvatar={userData.avatar}
      onComplete={handleWelcomeComplete}
      autoRedirect={autoRedirect}
      redirectDelay={redirectDelay}
      onLogout={handleLogout}
    />
  );
};

// Exportar también como default para compatibilidad
export default WelcomeContainer;