'use client';

import { usePatientChatNotifications } from '@/hooks/usePatientChatNotifications';

/**
 * This component initializes the patient chat notification system.
 * It should be included in the main layout to enable notifications
 * for patients when operators send messages.
 *
 * Note: Operator notifications are handled in AdminProviders.
 */
export function ChatNotifications() {
  // Initialize patient chat notifications (only when NOT in admin panel)
  usePatientChatNotifications();

  // This component doesn't render anything visible
  return null;
}
