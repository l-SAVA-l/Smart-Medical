'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useAlert } from '@/components/common/SMAlert/AlertProvider';

const NOTIFICATION_CHECK_INTERVAL = 15000; // 15 seconds (more frequent for chat)
const NOTIFIED_CHATS_KEY = 'chat-notifications-notified';

interface UnreadChat {
  id: number;
  patient: {
    name: string;
  };
  messages: {
    content: string;
  }[];
}

export function useOperatorChatNotifications() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const alert = useAlert();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAdminRef = useRef(false);

  // Track if user is in admin panel
  useEffect(() => {
    isAdminRef.current = pathname?.startsWith('/admin') || false;
  }, [pathname]);

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

  const checkForUnreadChats = useCallback(async () => {
    // Only check if authenticated and in admin panel
    if (status !== 'authenticated' || !session || !isAdminRef.current) {
      return;
    }

    try {
      const response = await fetch('/api/operator-chat?unread_only=true');
      if (!response.ok) return;

      const data = await response.json();
      const unreadChats: UnreadChat[] = data.chats || [];

      if (unreadChats.length === 0) return;

      // Get previously notified chats
      const notifiedChats = JSON.parse(
        localStorage.getItem(NOTIFIED_CHATS_KEY) || '[]'
      ) as number[];

      // Find new unread chats (not yet notified)
      const newChats = unreadChats.filter(
        (chat) => !notifiedChats.includes(chat.id)
      );

      if (newChats.length > 0) {
        // Play notification sound
        playNotificationSound();

        // Show alert for new chats
        if (newChats.length === 1) {
          const chat = newChats[0];
          const lastMessage = chat.messages[0]?.content || '';
          const preview = lastMessage.length > 50
            ? lastMessage.substring(0, 50) + '...'
            : lastMessage;

          alert.info(
            `Новое сообщение от ${chat.patient.name}: "${preview}"`,
            'Новое сообщение в чате'
          );
        } else {
          alert.info(
            `У вас ${newChats.length} новых сообщений в чате. Проверьте раздел "Чат".`,
            'Новые сообщения'
          );
        }

        // Mark these chats as notified
        const updatedNotified = [
          ...notifiedChats,
          ...newChats.map((c) => c.id),
        ];
        localStorage.setItem(
          NOTIFIED_CHATS_KEY,
          JSON.stringify(updatedNotified)
        );
      }
    } catch (error) {
    }
  }, [session, status, alert, playNotificationSound]);

  // Check on first login when in admin panel
  useEffect(() => {
    if (status !== 'authenticated' || !isAdminRef.current) return;

    // Small delay to let the page load first
    const initialCheckTimeout = setTimeout(() => {
      checkForUnreadChats();
    }, 2000);

    return () => clearTimeout(initialCheckTimeout);
  }, [status, pathname, checkForUnreadChats]);

  // Set up periodic checking (only when in admin panel)
  useEffect(() => {
    if (status !== 'authenticated' || !isAdminRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start periodic checks
    intervalRef.current = setInterval(
      checkForUnreadChats,
      NOTIFICATION_CHECK_INTERVAL
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, pathname, checkForUnreadChats]);

  return {
    checkForUnreadChats,
  };
}
