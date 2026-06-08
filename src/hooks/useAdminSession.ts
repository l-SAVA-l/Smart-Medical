import { useState, useEffect, useCallback } from 'react';

const ADMIN_SESSION_KEY = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

interface AdminSession {
  verified: boolean;
  lastActivity: number;
}

export function useAdminSession() {
  const [sessionVerified, setSessionVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка валидности сессии
  const isSessionValid = useCallback((session: AdminSession | null): boolean => {
    if (!session || !session.verified) return false;

    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;

    return timeSinceLastActivity < SESSION_DURATION;
  }, []);

  // Загрузка сессии из localStorage
  useEffect(() => {
    const loadSession = () => {
      try {
        const stored = localStorage.getItem(ADMIN_SESSION_KEY);
        if (stored) {
          const session: AdminSession = JSON.parse(stored);
          if (isSessionValid(session)) {
            // Обновляем время последней активности
            updateActivity();
            setSessionVerified(true);
          } else {
            // Сессия истекла
            localStorage.removeItem(ADMIN_SESSION_KEY);
            setSessionVerified(false);
          }
        } else {
          setSessionVerified(false);
        }
      } catch (error) {
        setSessionVerified(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [isSessionValid]);

  // Обновление времени последней активности
  const updateActivity = useCallback(() => {
    try {
      const session: AdminSession = {
        verified: true,
        lastActivity: Date.now(),
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    } catch (error) {
    }
  }, []);

  // Верификация сессии (после ввода пароля)
  const verifySession = useCallback(() => {
    updateActivity();
    setSessionVerified(true);
  }, [updateActivity]);

  // Очистка сессии (выход)
  const clearSession = useCallback(() => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setSessionVerified(false);
  }, []);

  // Обновляем активность при взаимодействии
  useEffect(() => {
    if (!sessionVerified) return;

    const handleActivity = () => {
      updateActivity();
    };

    // Обновляем при кликах и нажатиях клавиш
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    // Также обновляем каждые 5 минут при активной вкладке
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateActivity();
      }
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearInterval(interval);
    };
  }, [sessionVerified, updateActivity]);

  return {
    sessionVerified,
    isLoading,
    verifySession,
    clearSession,
    updateActivity,
  };
}
