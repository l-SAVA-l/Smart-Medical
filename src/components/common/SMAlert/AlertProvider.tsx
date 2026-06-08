'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertContainer, AlertItem } from './AlertContainer';
import { AlertType } from './SMAlert';

interface ShowAlertOptions {
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
}

interface AlertContextValue {
  showAlert: (options: ShowAlertOptions) => string;
  hideAlert: (id: string) => void;
  clearAll: () => void;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const showAlert = useCallback((options: ShowAlertOptions): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newAlert: AlertItem = {
      id,
      ...options,
    };

    // Удаляем предыдущий алерт и показываем только новый
    // Это предотвращает накопление множества алертов
    setAlerts([newAlert]);
    return id;
  }, []);

  const hideAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setAlerts([]);
  }, []);

  const success = useCallback(
    (message: string, title?: string, duration?: number) => {
      return showAlert({ type: 'success', message, title, duration });
    },
    [showAlert]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => {
      return showAlert({ type: 'error', message, title, duration });
    },
    [showAlert]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) => {
      return showAlert({ type: 'warning', message, title, duration });
    },
    [showAlert]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => {
      return showAlert({ type: 'info', message, title, duration });
    },
    [showAlert]
  );

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        hideAlert,
        clearAll,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <AlertContainer alerts={alerts} onRemove={hideAlert} />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}
