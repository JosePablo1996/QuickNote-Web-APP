import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

interface UseAuthRedirectOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  fallbackPath?: string;
}

export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const {
    redirectTo = '/notes',
    requireAuth = true,
    fallbackPath = '/login'
  } = options;

  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // No hacer nada mientras carga
    if (isLoading) return;

    // Si requiere autenticación y no está autenticado
    if (requireAuth && !isAuthenticated) {
      console.log('🔒 Redirigiendo a login desde:', location.pathname);
      
      // Guardar la ruta actual para redirigir después del login
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
      
      navigate(fallbackPath, { replace: true });
      return;
    }

    // Si no requiere autenticación y está autenticado
    if (!requireAuth && isAuthenticated) {
      console.log('✅ Usuario autenticado, redirigiendo a:', redirectTo);
      
      // Verificar si hay una ruta guardada para redirigir
      const savedPath = sessionStorage.getItem('redirectAfterLogin');
      if (savedPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(savedPath, { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
      return;
    }
  }, [isLoading, isAuthenticated, requireAuth, redirectTo, fallbackPath, navigate, location]);

  return { 
    user, 
    isLoading, 
    isAuthenticated,
    isRedirecting: isLoading
  };
};