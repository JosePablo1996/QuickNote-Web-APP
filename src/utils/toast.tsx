import { useState, useEffect } from 'react';

// ============================================
// TIPOS
// ============================================

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================
// CONFIGURACIÓN
// ============================================

const DEFAULT_DURATION = 4000;
let activeToasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

// ============================================
// FUNCIONES PRIVADAS
// ============================================

const notifyListeners = () => {
  listeners.forEach(listener => listener([...activeToasts]));
};

const generateId = () => Math.random().toString(36).substring(2, 9);

// ============================================
// API PÚBLICA
// ============================================

export const showSuccess = (message: string, options?: ToastOptions): string => {
  const id = generateId();
  const duration = options?.duration ?? DEFAULT_DURATION;
  
  const newToast: Toast = {
    id,
    message,
    type: 'success',
    duration,
    action: options?.action,
  };
  
  activeToasts = [newToast, ...activeToasts].slice(0, 5);
  notifyListeners();
  
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }
  
  return id;
};

export const showError = (message: string, options?: ToastOptions): string => {
  const id = generateId();
  const duration = options?.duration ?? DEFAULT_DURATION;
  
  const newToast: Toast = {
    id,
    message,
    type: 'error',
    duration,
    action: options?.action,
  };
  
  activeToasts = [newToast, ...activeToasts].slice(0, 5);
  notifyListeners();
  
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }
  
  return id;
};

export const showInfo = (message: string, options?: ToastOptions): string => {
  const id = generateId();
  const duration = options?.duration ?? DEFAULT_DURATION;
  
  const newToast: Toast = {
    id,
    message,
    type: 'info',
    duration,
    action: options?.action,
  };
  
  activeToasts = [newToast, ...activeToasts].slice(0, 5);
  notifyListeners();
  
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }
  
  return id;
};

export const showWarning = (message: string, options?: ToastOptions): string => {
  const id = generateId();
  const duration = options?.duration ?? DEFAULT_DURATION;
  
  const newToast: Toast = {
    id,
    message,
    type: 'warning',
    duration,
    action: options?.action,
  };
  
  activeToasts = [newToast, ...activeToasts].slice(0, 5);
  notifyListeners();
  
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }
  
  return id;
};

export const dismissToast = (id: string): void => {
  activeToasts = activeToasts.filter(t => t.id !== id);
  notifyListeners();
};

export const dismissAll = (): void => {
  activeToasts = [];
  notifyListeners();
};

export const updateToast = (id: string, updates: Partial<Toast>): void => {
  activeToasts = activeToasts.map(t => 
    t.id === id ? { ...t, ...updates } : t
  );
  notifyListeners();
};

// ============================================
// HOOK PERSONALIZADO
// ============================================

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Agregar listener
    listeners.push(setToasts);
    
    // Actualizar con el estado actual
    setToasts([...activeToasts]);

    return () => {
      listeners = listeners.filter(l => l !== setToasts);
    };
  }, []);

  return {
    toasts,
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
    dismiss: dismissToast,
    dismissAll,
    update: updateToast,
  };
};

// ============================================
// EXPORTACIONES
// ============================================

export const toast = {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
  dismiss: dismissToast,
  dismissAll,
  update: updateToast,
};

export default toast;