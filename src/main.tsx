// src/main.tsx
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthProvider';
import { NoteProvider } from './contexts/NoteContext';
import './styles/globals.css';
import './index.css';

// Crear cliente de React Query con configuración optimizada
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

// Definir interfaces para Service Worker con tipos correctos
interface ServiceWorkerWithSync extends ServiceWorkerRegistration {
  sync?: {
    register(tag: string): Promise<void>;
  };
  periodicSync?: {
    register(tag: string, options: { minInterval: number }): Promise<void>;
  };
}

interface ExtendedNavigator extends Navigator {
  serviceWorker: ServiceWorkerContainer;
  standalone?: boolean;
}

/**
 * Verificar si el Service Worker debe registrarse
 * ✅ CORREGIDO: Respeta la flag de limpieza y solo registra en desarrollo
 */
const shouldRegisterServiceWorker = (): boolean => {
  // Detectar si estamos en producción
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' &&
                       !window.location.hostname.includes('192.168');
  
  // Verificar si el SW fue deshabilitado por el script de limpieza
  const isSWDisabled = sessionStorage.getItem('sw_disabled') === 'true' ||
                       localStorage.getItem('sw_disabled_production') === 'true';
  
  // Verificar si es desarrollo
  const isDevelopment = !isProduction;
  
  // Verificar si se forzó manualmente
  const isForced = localStorage.getItem('register_sw') === 'true';
  
  // ✅ LÓGICA CORREGIDA:
  // - En producción: NUNCA registrar SW (a menos que se fuerce manualmente)
  // - En desarrollo: Registrar SW (para pruebas)
  // - Si el SW fue deshabilitado por limpieza: NO registrar
  
  if (isSWDisabled) {
    console.log('🔧 Service Worker deshabilitado por script de limpieza');
    return false;
  }
  
  if (isProduction && !isForced) {
    console.log('🔧 Service Worker deshabilitado en producción');
    return false;
  }
  
  if (isDevelopment) {
    console.log('🔧 Service Worker habilitado en desarrollo');
    return true;
  }
  
  if (isForced) {
    console.log('🔧 Service Worker forzado manualmente');
    return true;
  }
  
  return false;
};

/**
 * Registrar Service Worker para PWA y modo offline
 * ✅ CORREGIDO: Solo se registra cuando debe
 */
const registerServiceWorker = async (): Promise<void> => {
  // Verificar si el navegador soporta Service Workers
  if (!('serviceWorker' in navigator)) {
    console.log('⚠️ Service Worker no soportado en este navegador');
    return;
  }

  // Verificar si debe registrarse
  if (!shouldRegisterServiceWorker()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    }) as ServiceWorkerWithSync;

    console.log('✅ Service Worker registrado exitosamente:', registration.scope);

    // Verificar actualizaciones
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('🔄 Nueva versión del Service Worker encontrada');

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('📦 Nueva versión disponible. Recarga la página para actualizar.');
            
            // Mostrar notificación al usuario (opcional)
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('QuickNote Actualizado', {
                body: 'Hay una nueva versión disponible. Recarga la página para obtener las últimas mejoras.',
                icon: '/favicon.ico',
              });
            }
          }
        });
      }
    });

    // Verificar si hay una nueva versión al cargar la página
    await registration.update();
    
  } catch (error) {
    console.error('❌ Error registrando Service Worker:', error);
  }
};

/**
 * Configurar sincronización periódica en segundo plano
 * ✅ CORREGIDO: Solo se ejecuta si hay SW registrado
 */
const setupBackgroundSync = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    console.log('⚠️ Service Worker no soportado');
    return;
  }

  // Solo ejecutar si el SW está registrado
  if (!shouldRegisterServiceWorker()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready as ServiceWorkerWithSync;
    
    // Verificar soporte de Periodic Background Sync
    if ('periodicSync' in registration && registration.periodicSync) {
      // Verificar permisos para periodic sync
      if ('permissions' in navigator) {
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync' as PermissionName
        });
        
        if (status.state === 'granted') {
          await registration.periodicSync.register('sync-notes', {
            minInterval: 24 * 60 * 60 * 1000, // 24 horas
          });
          console.log('✅ Periodic background sync registrado');
        } else {
          console.log('⚠️ Permiso no concedido para periodic background sync');
        }
      }
    } else {
      console.log('⚠️ Periodic background sync no soportado');
    }
    
    // Verificar soporte de One-time Background Sync
    if ('sync' in registration && registration.sync) {
      await registration.sync.register('sync-notes-queue');
      console.log('✅ One-time background sync registrado');
    } else {
      console.log('⚠️ One-time background sync no soportado');
    }
    
  } catch (error) {
    console.warn('⚠️ Error configurando background sync:', error);
  }
};

/**
 * Solicitar permisos de notificación (opcional)
 */
const requestNotificationPermission = async (): Promise<void> => {
  if (!('Notification' in window)) {
    console.log('⚠️ Notificaciones no soportadas');
    return;
  }

  if (Notification.permission === 'default') {
    // Esperar a que el usuario interactúe con la app
    const handleUserInteraction = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('✅ Permiso de notificaciones concedido');
        }
      } catch (error) {
        console.warn('Error solicitando permiso de notificaciones:', error);
      } finally {
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      }
    };
    
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
  }
};

/**
 * Limpiar datos corruptos de localStorage
 */
const cleanupCorruptedData = (): void => {
  try {
    // Verificar token y usuario
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    // Si hay token pero no hay usuario, limpiar
    if (token && !user) {
      console.log('🧹 Limpiando token huérfano');
      localStorage.removeItem('auth_token');
    }
    
    // Si hay usuario pero no hay token, limpiar
    if (user && !token) {
      console.log('🧹 Limpiando usuario huérfano');
      localStorage.removeItem('user');
    }
    
    // Verificar datos de sesión corruptos
    const sessionKeys = [
      'temp_2fa_token',
      'login_in_progress',
      'temp_user_email',
      'temp_user_name',
      'temp_user_avatar',
      '2fa_user_data'
    ];
    
    // Limpiar datos de sesión antiguos (más de 1 hora)
    for (const key of sessionKeys) {
      const value = sessionStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          if (parsed && parsed.timestamp) {
            const age = Date.now() - parsed.timestamp;
            if (age > 3600000) { // 1 hora
              sessionStorage.removeItem(key);
              console.log(`🧹 Limpiado dato de sesión expirado: ${key}`);
            }
          }
        } catch {
          // Si no se puede parsear, mantener
        }
      }
    }
  } catch (error) {
    console.warn('Error limpiando datos corruptos:', error);
  }
};

// ✅ SIN React.StrictMode para evitar dobles renders en desarrollo
// que causan bucles de peticiones al cargar notas

// Limpiar datos corruptos antes de renderizar
cleanupCorruptedData();

// Renderizar la aplicación
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NoteProvider>
            <App />
          </NoteProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

// ============================================
// ✅ INICIALIZAR SERVICE WORKER Y FUNCIONALIDADES OFFLINE
// ============================================

// Esperar a que la página cargue completamente
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('🚀 QuickNote - Inicializando funcionalidades offline');
    
    // Registrar Service Worker (solo si debe)
    registerServiceWorker();
    
    // Configurar background sync (solo si hay SW registrado)
    if (shouldRegisterServiceWorker()) {
      setupBackgroundSync();
    }
    
    // Solicitar permisos de notificación (opcional)
    requestNotificationPermission();
  });
}

// ============================================
// ✅ MANEJO DE ACTUALIZACIONES DEL SERVICE WORKER
// ============================================

// Definir tipo para mensajes del Service Worker
interface ServiceWorkerMessage {
  type: string;
  urls?: string[];
  timestamp?: number;
}

// Escuchar mensajes del Service Worker (solo si hay SW)
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && shouldRegisterServiceWorker()) {
  navigator.serviceWorker.addEventListener('message', (event: MessageEvent<ServiceWorkerMessage>) => {
    console.log('📨 Mensaje del Service Worker:', event.data);
    
    if (event.data.type === 'CACHE_UPDATED') {
      console.log('🔄 Cache actualizado:', event.data.urls);
      
      // Mostrar notificación silenciosa al usuario
      const toast = document.createElement('div');
      toast.textContent = '📦 QuickNote se ha actualizado en segundo plano';
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
    
    if (event.data.type === 'OFFLINE_MODE') {
      console.log('📡 Aplicación en modo offline');
    }
    
    if (event.data.type === 'SYNC_STARTED') {
      console.log('🔄 Sincronización iniciada en segundo plano');
    }
  });
  
  // Manejar cuando el Service Worker toma control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Service Worker actualizado, recargando página...');
    window.location.reload();
  });
}

// ============================================
// ✅ MANEJO DE CONEXIÓN/DESCONEXIÓN
// ============================================

// Mostrar notificación cuando se pierde la conexión
if (typeof window !== 'undefined') {
  let offlineToast: HTMLDivElement | null = null;
  
  const showOfflineNotification = (): void => {
    if (offlineToast) return;
    
    offlineToast = document.createElement('div');
    offlineToast.textContent = '📡 Sin conexión a internet - Modo offline activado';
    offlineToast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #EF4444;
      color: white;
      padding: 10px 20px;
      border-radius: 12px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideDown 0.3s ease;
    `;
    document.body.appendChild(offlineToast);
    
    setTimeout(() => {
      if (offlineToast) {
        offlineToast.style.opacity = '0';
        setTimeout(() => {
          if (offlineToast) {
            offlineToast.remove();
            offlineToast = null;
          }
        }, 300);
      }
    }, 4000);
  };
  
  const hideOfflineNotification = (): void => {
    if (offlineToast) {
      offlineToast.remove();
      offlineToast = null;
    }
  };
  
  const showOnlineNotification = (): void => {
    const onlineToast = document.createElement('div');
    onlineToast.textContent = '✅ Conexión recuperada - Sincronizando datos...';
    onlineToast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #10B981;
      color: white;
      padding: 10px 20px;
      border-radius: 12px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideDown 0.3s ease;
    `;
    document.body.appendChild(onlineToast);
    
    setTimeout(() => {
      onlineToast.style.opacity = '0';
      setTimeout(() => onlineToast.remove(), 300);
    }, 3000);
  };
  
  window.addEventListener('offline', showOfflineNotification);
  window.addEventListener('online', () => {
    hideOfflineNotification();
    showOnlineNotification();
  });
}

// ============================================
// ✅ AGREGAR ESTILOS DE ANIMACIÓN
// ============================================

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// ✅ DETECTAR SI LA APP SE EJECUTA COMO PWA INSTALADA
// ============================================

if (typeof window !== 'undefined') {
  const isStandalone = (window.navigator as ExtendedNavigator).standalone || 
                       window.matchMedia('(display-mode: standalone)').matches;
  
  if (isStandalone) {
    console.log('📱 QuickNote ejecutándose como PWA instalada');
    document.body.classList.add('pwa-mode');
  }
}