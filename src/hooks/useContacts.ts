import { useState, useEffect } from 'react';

export interface Contacts {
  id: number;
  address: string;
  map_geo: string;
  work_hours_main: string;
  work_hours_sunday: string;
  phone_number: string;
  phone_number_sec: string | null;
  email: string;
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contacts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/contacts')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch contacts');
        return res.json();
      })
      .then(data => {
        setContacts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { contacts, loading, error };
}
