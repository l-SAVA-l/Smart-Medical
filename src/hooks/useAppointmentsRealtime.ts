'use client';

import { useEffect, useRef } from 'react';

const RECONNECT_MS = 5000;

interface UseAppointmentsRealtimeOptions {
  enabled: boolean;
  mode: 'patient' | 'admin';
  onUpdate: () => void;
}

export function useAppointmentsRealtime({
  enabled,
  mode,
  onUpdate,
}: UseAppointmentsRealtimeOptions) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const url =
      mode === 'admin'
        ? '/api/admin/appointments/stream'
        : '/api/appointments/stream';

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const connect = () => {
      if (closed) return;
      es = new EventSource(url, { withCredentials: true });

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'appointment_changed') {
            onUpdateRef.current();
          }
        } catch {
          // ignore malformed payloads
        }
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (!closed) {
          reconnectTimer = setTimeout(connect, RECONNECT_MS);
        }
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [enabled, mode]);
}
