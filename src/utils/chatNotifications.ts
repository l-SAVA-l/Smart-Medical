const NOTIFIED_CHATS_KEY = 'chat-notifications-notified';

/**
 * Clear notification flag for a specific chat
 * Call this when user opens and reads a chat
 */
export function clearChatNotification(chatId: number): void {
  if (typeof window === 'undefined') return;

  const notifiedChats = JSON.parse(
    localStorage.getItem(NOTIFIED_CHATS_KEY) || '[]'
  ) as number[];

  const updated = notifiedChats.filter((id) => id !== chatId);
  localStorage.setItem(NOTIFIED_CHATS_KEY, JSON.stringify(updated));
}

/**
 * Clear all chat notifications
 */
export function clearAllChatNotifications(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(NOTIFIED_CHATS_KEY);
}
