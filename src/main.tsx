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
 * Registrar Service Worker para PWA y modo offline
 * ✅ CORREGIDO: Solo se registra en desarrollo, NO en producción
 */
const registerServiceWorker = async (): Promise<void> => {
  // Verificar si el navegador soporta Service Workers
  if (!('serviceWorker' in navigator)) {
    console.log('⚠️ Service Worker no soportado en este navegador');
    return;
  }

  // ✅ DETECTAR SI ESTAMOS EN PRODUCCIÓN
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' &&
                       !window.location.hostname.includes('192.168');
  
  // ✅ SOLO registrar en desarrollo (localhost) o si se fuerza manualmente
  const shouldRegister = !isProduction || localStorage.getItem('register_sw') === 'true';

  if (!shouldRegister) {
    console.log('🔧 Service Worker deshabilitado en producción');
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
 */
const setupBackgroundSync = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    console.log('⚠️ Service Worker no soportado');
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

// ✅ SIN React.StrictMode para evitar dobles renders en desarrollo
// que causan bucles de peticiones al cargar notas

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
    
    // Registrar Service Worker (solo en desarrollo)
    registerServiceWorker();
    
    // Configurar background sync (solo si hay SW)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
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

// Escuchar mensajes del Service Worker
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
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