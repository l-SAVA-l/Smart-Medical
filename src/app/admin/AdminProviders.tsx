'use client';

import { SessionProvider } from 'next-auth/react';
import { AlertProvider } from '@/components/common/SMAlert/AlertProvider';
import { UnreadCountsProvider } from '@/contexts/UnreadCountsContext';
import { useOperatorChatNotifications } from '@/hooks/useOperatorChatNotifications';

function AdminNotifications({ children }: { children: React.ReactNode }) {
  // Initialize operator chat notifications
  useOperatorChatNotifications();

  return <>{children}</>;
}

export function AdminProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AlertProvider>
        <UnreadCountsProvider>
          <AdminNotifications>
            <div className="min-h-screen bg-gray-50">
              {children}
            </div>
          </AdminNotifications>
        </UnreadCountsProvider>
      </AlertProvider>
    </SessionProvider>
  );
}
