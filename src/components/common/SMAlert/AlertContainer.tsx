'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { SMAlert, AlertProps } from './SMAlert';
import { createPortal } from 'react-dom';

export interface AlertItem extends AlertProps {
  id: string;
}

interface AlertContainerProps {
  alerts: AlertItem[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const positionClasses = {
  'top-right': 'top-4 right-4 items-end',
  'top-left': 'top-4 left-4 items-start',
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
};

export function AlertContainer({
  alerts,
  onRemove,
  position = 'bottom-left',
}: AlertContainerProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const container = (
    <div
      className={`fixed z-[9999] flex flex-col gap-3 max-h-screen overflow-hidden pointer-events-none ${positionClasses[position]}`}
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <SMAlert
            key={alert.id}
            {...alert}
            onClose={() => onRemove(alert.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );

  return createPortal(container, document.body);
}
