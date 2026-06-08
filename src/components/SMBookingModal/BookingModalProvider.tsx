'use client';

import { useState, useEffect } from 'react';
import { SMBookingModal } from './SMBookingModal';

const OPEN_BOOKING_MODAL = 'openBookingModal';

export function BookingModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_BOOKING_MODAL, handler);
    return () => window.removeEventListener(OPEN_BOOKING_MODAL, handler);
  }, []);

  return (
    <>
      {children}
      <SMBookingModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={() => setOpen(false)}
      />
    </>
  );
}

export function openBookingModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_BOOKING_MODAL));
  }
}
