import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/api';

export const useAnalytics = (movieId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', movieId],
    queryFn: () => analyticsApi.getByMovie(movieId),
    enabled: !!movieId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time data
  });

  return {
    analytics: data,
    isLoading,
    error,
  };
};
