import { useQuery } from '@tanstack/react-query';

// Custom hook for system metrics with intelligent caching
export function useSystemMetrics() {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/system-metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch system metrics');
      }
      return response.json();
    },
    staleTime: 10000, // Data is fresh for 10 seconds
    gcTime: 300000, // Keep data in cache for 5 minutes
    refetchInterval: 15000, // Auto-refetch every 15 seconds
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Custom hook for security events with intelligent caching
export function useSecurityEvents() {
  return useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const response = await fetch('/api/security-events');
      if (!response.ok) {
        throw new Error('Failed to fetch security events');
      }
      return response.json();
    },
    staleTime: 20000, // Data is fresh for 20 seconds
    gcTime: 600000, // Keep data in cache for 10 minutes
    refetchInterval: 30000, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}