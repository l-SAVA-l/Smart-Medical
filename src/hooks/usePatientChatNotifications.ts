'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useAlert } from '@/components/common/SMAlert/AlertProvider';

const NOTIFICATION_CHECK_INTERVAL = 15000; // 15 seconds
const NOTIFIED_MESSAGES_KEY = 'patient-chat-notifications-notified';

interface ChatMessage {
  id: number;
  sender_type: 'patient' | 'operator';
  content: string;
  created_at: string;
}

interface Chat {
  id: number;
  status: 'WAITING' | 'ACTIVE' | 'CLOSED';
  has_unread_patient: boolean;
  operator: {
    name: string;
  } | null;
  messages: ChatMessage[];
}

export function usePatientChatNotifications() {
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

  const checkForNewMessages = useCallback(async () => {
    // Only check if authenticated and NOT in admin panel
    if (status !== 'authenticated' || !session || isAdminRef.current) {
      return;
    }

    try {
      const response = await fetch('/api/operator-chat/my-chat');
      if (!response.ok) return;

      const data = await response.json();
      const chat: Chat | null = data.chat;

      if (!chat || !chat.has_unread_patient) return;

      // Get previously notified message IDs
      const notifiedMessages = JSON.parse(
        localStorage.getItem(NOTIFIED_MESSAGES_KEY) || '[]'
      ) as number[];

      // Find new messages from operator (not yet notified)
      const newOperatorMessages = chat.messages.filter(
        (msg) => msg.sender_type === 'operator' && !notifiedMessages.includes(msg.id)
      );

      if (newOperatorMessages.length > 0) {
        // Play notification sound
        playNotificationSound();

        // Show alert for new messages
        const operatorName = chat.operator?.name || 'Оператор';

        if (newOperatorMessages.length === 1) {
          const msg = newOperatorMessages[0];
          const preview = msg.content.length > 50
            ? msg.content.substring(0, 50) + '...'
            : msg.content;

          alert.info(
            `${operatorName}: "${preview}"`,
            'Новое сообщение в чате'
          );
        } else {
          alert.info(
            `У вас ${newOperatorMessages.length} новых сообщений от ${operatorName}`,
            'Новые сообщения в чате'
          );
        }

        // Mark these messages as notified
        const updatedNotified = [
          ...notifiedMessages,
          ...newOperatorMessages.map((m) => m.id),
        ];
        localStorage.setItem(
          NOTIFIED_MESSAGES_KEY,
          JSON.stringify(updatedNotified)
        );
      }
    } catch (error) {
    }
  }, [session, status, alert, playNotificationSound]);

  // Check on first login when NOT in admin panel
  useEffect(() => {
    if (status !== 'authenticated' || isAdminRef.current) return;

    // Small delay to let the page load first
    const initialCheckTimeout = setTimeout(() => {
      checkForNewMessages();
    }, 2000);

    return () => clearTimeout(initialCheckTimeout);
  }, [status, pathname, checkForNewMessages]);

  // Set up periodic checking (only when NOT in admin panel)
  useEffect(() => {
    if (status !== 'authenticated' || isAdminRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start periodic checks
    intervalRef.current = setInterval(
      checkForNewMessages,
      NOTIFICATION_CHECK_INTERVAL
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, pathname, checkForNewMessages]);

  return {
    checkForNewMessages,
  };
}
