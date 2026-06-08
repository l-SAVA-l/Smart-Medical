'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAlert } from '@/components/common/SMAlert/AlertProvider';

const NOTIFICATION_CHECK_INTERVAL = 30000; // 30 секунд
const NOTIFIED_LETTERS_KEY = 'chief-doctor-notifications-notified';

interface UnreadLetter {
  id: number;
  subject: string;
  has_new_patient_message: boolean;
  is_read: boolean;
  patient: {
    id: number;
    name: string;
  };
}

export function useChiefDoctorNotifications() {
  const { data: session, status } = useSession();
  const alert = useAlert();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Инициализация аудио элемента
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.5;
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Audio play failed - browser may block autoplay
      });
    }
  }, []);

  const checkForUnreadLetters = useCallback(async () => {
    // Проверяем только если пользователь - главный врач
    if (status !== 'authenticated' || !session) return;

    const userRole = session?.user?.role;
    if (userRole !== 'CHIEF_DOCTOR') return;

    try {
      const response = await fetch('/api/admin/letters/unread');
      if (!response.ok) return;

      const data = await response.json();
      const unreadLetters: UnreadLetter[] = data.letters || [];

      if (unreadLetters.length === 0) return;

      // Получаем список уже уведомленных писем
      const notifiedLetters = JSON.parse(
        localStorage.getItem(NOTIFIED_LETTERS_KEY) || '[]'
      ) as number[];

      // Находим новые непрочитанные письма (ещё не уведомляли)
      const newLetters = unreadLetters.filter(
        (letter) => !notifiedLetters.includes(letter.id)
      );

      // Письма с новыми сообщениями от пациентов
      const lettersWithNewMessages = unreadLetters.filter(
        (letter) => letter.has_new_patient_message && !notifiedLetters.includes(letter.id + 10000) // +10000 чтобы различать новые письма от новых сообщений
      );

      const hasNewNotifications = newLetters.length > 0 || lettersWithNewMessages.length > 0;

      if (hasNewNotifications) {
        // Воспроизводим звук уведомления
        playNotificationSound();

        // Показываем уведомление
        const newLettersCount = newLetters.filter(l => !l.is_read && !l.has_new_patient_message).length;
        const newMessagesCount = lettersWithNewMessages.length;

        if (newLettersCount > 0 && newMessagesCount > 0) {
          alert.info(
            `У вас ${newLettersCount} новых писем и ${newMessagesCount} новых ответов от пациентов. Просмотрите админ-панель.`,
            'Новые сообщения'
          );
        } else if (newLettersCount > 0) {
          alert.info(
            newLettersCount === 1
              ? `Новое письмо от пациента "${newLetters[0].patient.name}". Просмотрите админ-панель.`
              : `У вас ${newLettersCount} новых писем от пациентов. Просмотрите админ-панель.`,
            'Новые письма'
          );
        } else if (newMessagesCount > 0) {
          alert.info(
            newMessagesCount === 1
              ? `Новый ответ от пациента "${lettersWithNewMessages[0].patient.name}" в переписке. Просмотрите админ-панель.`
              : `У вас ${newMessagesCount} новых ответов от пациентов. Просмотрите админ-панель.`,
            'Новые ответы'
          );
        }

        // Отмечаем письма как уведомленные
        const updatedNotified = [
          ...notifiedLetters,
          ...newLetters.map((l) => l.id),
          ...lettersWithNewMessages.map((l) => l.id + 10000),
        ];
        localStorage.setItem(
          NOTIFIED_LETTERS_KEY,
          JSON.stringify(updatedNotified)
        );
      }
    } catch (error) {
    }
  }, [session, status, alert, playNotificationSound]);

  // Проверка при первом входе или возврате на сайт
  useEffect(() => {
    if (status !== 'authenticated') return;

    const userRole = session?.user?.role;
    if (userRole !== 'CHIEF_DOCTOR') return;

    // Небольшая задержка для загрузки страницы
    const initialCheckTimeout = setTimeout(() => {
      checkForUnreadLetters();
    }, 2000);

    return () => clearTimeout(initialCheckTimeout);
  }, [status, session, checkForUnreadLetters]);

  // Периодическая проверка
  useEffect(() => {
    if (status !== 'authenticated') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const userRole = session?.user?.role;
    if (userRole !== 'CHIEF_DOCTOR') return;

    // Запускаем периодическую проверку
    intervalRef.current = setInterval(
      checkForUnreadLetters,
      NOTIFICATION_CHECK_INTERVAL
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, session, checkForUnreadLetters]);

  // Очистка уведомления при прочтении письма
  const clearNotifiedLetter = useCallback((letterId: number) => {
    const notifiedLetters = JSON.parse(
      localStorage.getItem(NOTIFIED_LETTERS_KEY) || '[]'
    ) as number[];
    const updated = notifiedLetters.filter((id) => id !== letterId && id !== letterId + 10000);
    localStorage.setItem(NOTIFIED_LETTERS_KEY, JSON.stringify(updated));
  }, []);

  return {
    checkForUnreadLetters,
    clearNotifiedLetter,
  };
}
