'use client';

import { useLetterNotifications } from '@/hooks/useLetterNotifications';
import { useChiefDoctorNotifications } from '@/hooks/useChiefDoctorNotifications';

/**
 * This component initializes the letter notification system.
 * It should be included in the main layout to enable notifications:
 * - For users: notifications when chief doctor replies
 * - For chief doctor: notifications when patients send messages
 */
export function LetterNotifications() {
  // Initialize user notifications (for letter replies from chief doctor)
  useLetterNotifications();

  // Initialize chief doctor notifications (for new patient messages)
  useChiefDoctorNotifications();

  // This component doesn't render anything visible
  return null;
}
