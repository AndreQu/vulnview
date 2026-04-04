import axios from 'axios';
import { useEffect, useState } from 'react';

export function useApi<T>(url: string, fallbackData: T) {
  const [data, setData] = useState<T>(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        const response = await axios.get<T>(url);
        if (active) {
          setData(response.data);
        }
      } catch {
        if (active) {
          setData(fallbackData);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [url, fallbackData]);

  return { data, loading };
}
