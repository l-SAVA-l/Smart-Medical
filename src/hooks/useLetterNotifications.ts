'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAlert } from '@/components/common/SMAlert/AlertProvider';

const NOTIFICATION_CHECK_INTERVAL = 30000; // 30 seconds
const LAST_CHECK_KEY = 'letter-notifications-last-check';
const NOTIFIED_LETTERS_KEY = 'letter-notifications-notified';

interface UnreadReply {
  id: number;
  subject: string;
  replied_at: string | null;
  hasNewMessages?: boolean;
}

export function useLetterNotifications() {
  const { data: session, status } = useSession();
  const alert = useAlert();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
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

  const checkForUnreadReplies = useCallback(async () => {
    if (status !== 'authenticated' || !session) return;

    try {
      const response = await fetch('/api/letters/unread');
      if (!response.ok) return;

      const data = await response.json();
      const unreadReplies: UnreadReply[] = data.letters || [];

      if (unreadReplies.length === 0) return;

      // Get previously notified letters (we use different keys for first reply vs thread messages)
      const notifiedLetters = JSON.parse(
        localStorage.getItem(NOTIFIED_LETTERS_KEY) || '[]'
      ) as number[];

      // Find new first replies (not yet notified)
      const newFirstReplies = unreadReplies.filter(
        (reply) => !reply.hasNewMessages && !notifiedLetters.includes(reply.id)
      );

      // Find letters with new thread messages (use offset +10000 to distinguish from first reply notification)
      const newThreadMessages = unreadReplies.filter(
        (reply) => reply.hasNewMessages && !notifiedLetters.includes(reply.id + 10000)
      );

      const hasNewNotifications = newFirstReplies.length > 0 || newThreadMessages.length > 0;

      if (hasNewNotifications) {
        // Play notification sound
        playNotificationSound();

        // Show alert for new notifications
        const totalNew = newFirstReplies.length + newThreadMessages.length;

        if (totalNew === 1) {
          const letter = newFirstReplies[0] || newThreadMessages[0];
          const messageType = newThreadMessages.length > 0 ? 'новое сообщение' : 'ответил';
          alert.info(
            `Главный врач ${messageType} на ваше письмо "${letter.subject}". Просмотрите личный кабинет.`,
            'Новое сообщение'
          );
        } else {
          alert.info(
            `У вас ${totalNew} новых сообщений от главного врача. Просмотрите личный кабинет.`,
            'Новые сообщения'
          );
        }

        // Mark these letters as notified
        const updatedNotified = [
          ...notifiedLetters,
          ...newFirstReplies.map((r) => r.id),
          ...newThreadMessages.map((r) => r.id + 10000), // +10000 for thread messages
        ];
        localStorage.setItem(
          NOTIFIED_LETTERS_KEY,
          JSON.stringify(updatedNotified)
        );
      }

      // Update last check time
      localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
    } catch (error) {
    }
  }, [session, status, alert, playNotificationSound]);

  // Check on first login or when user returns to site
  useEffect(() => {
    if (status !== 'authenticated') return;

    // Small delay to let the page load first
    const initialCheckTimeout = setTimeout(() => {
      checkForUnreadReplies();
    }, 2000);

    return () => clearTimeout(initialCheckTimeout);
  }, [status, checkForUnreadReplies]);

  // Set up periodic checking
  useEffect(() => {
    if (status !== 'authenticated') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start periodic checks
    intervalRef.current = setInterval(
      checkForUnreadReplies,
      NOTIFICATION_CHECK_INTERVAL
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, checkForUnreadReplies]);

  return {
    checkForUnreadReplies,
  };
}
