// src/hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🟢 Conexión restaurada');
      setIsOnline(true);
      setWasOffline(true);
      // Disparar evento personalizado para sincronizar
      window.dispatchEvent(new CustomEvent('connection-restored'));
      
      // Resetear flag después de un tiempo
      setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      console.log('🔴 Sin conexión - Modo offline activado');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}