import { useState, useEffect } from 'react';

interface UnreadCounts {
  feedbacks: number;
  letters: number;
  chats: number;
}

export function useUnreadCounts(refreshInterval = 30000) {
  const [counts, setCounts] = useState<UnreadCounts>({ feedbacks: 0, letters: 0, chats: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    try {
      const res = await fetch('/api/admin/unread-counts');
      if (res.ok) {
        const data = await res.json();
        setCounts(data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();

    // Периодически обновляем счетчики
    const interval = setInterval(fetchCounts, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { counts, loading, refetch: fetchCounts };
}
