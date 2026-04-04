import axios from 'axios';
import { useCallback, useEffect, useState, type DependencyList } from 'react';

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type UseApiResult<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  retry: () => void;
};

const apiClient = axios.create({
  baseURL:
    (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL ?? '/api',
  timeout: 15000,
});

export async function getApiData<T>(url: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const response = await apiClient.get<ApiEnvelope<T>>(url, { params });
  const payload = response.data;
  if (!payload.success) {
    throw new Error(payload.error || 'Request failed');
  }
  if (payload.data === undefined) {
    throw new Error('No data returned from API');
  }
  return payload.data;
}

export function useApi<T>(fetcher: () => Promise<T>, initialData: T, deps: DependencyList = []): UseApiResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  const retry = useCallback(() => {
    setRetryTick((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const nextData = await fetcher();
        if (active) {
          setData(nextData);
        }
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : 'Unexpected API error';
          setError(message);
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
  }, [fetcher, retryTick, ...deps]);

  return { data, loading, error, retry };
}
