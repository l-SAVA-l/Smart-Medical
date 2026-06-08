'use client';

import { useChiefDoctorNotifications } from '@/hooks/useChiefDoctorNotifications';

// Компонент для инициализации уведомлений главного врача
// Сам по себе ничего не рендерит, только активирует хук
export function ChiefDoctorNotifications() {
  useChiefDoctorNotifications();
  return null;
}
