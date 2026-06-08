'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';

interface UnreadCountsContextType {
  counts: { feedbacks: number; letters: number; chats: number };
  loading: boolean;
  refetch: () => Promise<void>;
}

const UnreadCountsContext = createContext<UnreadCountsContextType | undefined>(undefined);

export function UnreadCountsProvider({ children }: { children: ReactNode }) {
  const { counts, loading, refetch } = useUnreadCounts(30000);

  return (
    <UnreadCountsContext.Provider value={{ counts, loading, refetch }}>
      {children}
    </UnreadCountsContext.Provider>
  );
}

export function useUnreadCountsContext() {
  const context = useContext(UnreadCountsContext);
  if (!context) {
    // Возвращаем дефолтные значения если контекст не доступен
    return {
      counts: { feedbacks: 0, letters: 0, chats: 0 },
      loading: false,
      refetch: async () => {},
    };
  }
  return context;
}
