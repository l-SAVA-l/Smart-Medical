import { useState, useEffect } from 'react';

export interface Feedback {
  id: number;
  name: string;
  text: string;
  date: string;
  grade: number;
  image_url: string;
  verified: boolean;
  service_id: number | null;
}

export function useFeedbacks(limit = 3) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/clinic-reviews?limit=${limit}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch feedbacks');
        return res.json();
      })
      .then(data => {
        setFeedbacks(data.reviews || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [limit]);

  return { feedbacks, loading, error };
}
