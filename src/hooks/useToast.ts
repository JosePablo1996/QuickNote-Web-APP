import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

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

interface UseToastReturn {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number, action?: { label: string; onClick: () => void }) => string;
  success: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => string;
  error: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => string;
  info: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => string;
  warning: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
}

// Duración por defecto según tipo
const DEFAULT_DURATION = {
  success: 3000,
  error: 5000,
  info: 4000,
  warning: 4000,
};

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useState<Map<string, NodeJS.Timeout>>(new Map())[0];

  const clearToastTimeout = (id: string) => {
    const timeout = timeoutsRef.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.delete(id);
    }
  };

  const dismiss = useCallback((id: string) => {
    clearToastTimeout(id);
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    timeoutsRef.forEach((_, id) => clearToastTimeout(id));
    timeoutsRef.clear();
    setToasts([]);
  }, []);

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration?: number,
    action?: { label: string; onClick: () => void }
  ): string => {
    const id = uuidv4();
    const toastDuration = duration ?? DEFAULT_DURATION[type] ?? 4000;
    
    const newToast: Toast = {
      id,
      message,
      type,
      duration: toastDuration,
      action,
    };

    setToasts(prev => [newToast, ...prev]);

    // Auto-dismiss después de la duración
    if (toastDuration > 0) {
      const timeout = setTimeout(() => {
        dismiss(id);
      }, toastDuration);
      
      timeoutsRef.set(id, timeout);
    }

    return id;
  }, [dismiss]);

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  }, []);

  const success = useCallback((
    message: string,
    duration?: number,
    action?: { label: string; onClick: () => void }
  ) => showToast(message, 'success', duration, action), [showToast]);

  const error = useCallback((
    message: string,
    duration?: number,
    action?: { label: string; onClick: () => void }
  ) => showToast(message, 'error', duration, action), [showToast]);

  const info = useCallback((
    message: string,
    duration?: number,
    action?: { label: string; onClick: () => void }
  ) => showToast(message, 'info', duration, action), [showToast]);

  const warning = useCallback((
    message: string,
    duration?: number,
    action?: { label: string; onClick: () => void }
  ) => showToast(message, 'warning', duration, action), [showToast]);

  return {
    toasts,
    showToast,
    success,
    error,
    info,
    warning,
    dismiss,
    dismissAll,
    updateToast,
  };
};