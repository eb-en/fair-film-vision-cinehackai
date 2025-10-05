import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { distributorApi, Distributor } from '@/services/api';
import { mockDistributors, useMockData } from '@/services/mockData';
import { useState, useEffect } from 'react';

// In-memory store for mock mode
let mockDistributorStore: Record<string, Distributor[]> = { ...mockDistributors };

export const useDistributors = (movieId: string) => {
  const queryClient = useQueryClient();
  const shouldUseMock = useMockData();
  const [, forceUpdate] = useState({});

  // Load from localStorage for mock mode
  useEffect(() => {
    if (shouldUseMock && movieId) {
      const stored = localStorage.getItem(`distributors_movie_${movieId}`);
      if (stored) {
        try {
          mockDistributorStore[movieId] = JSON.parse(stored);
          forceUpdate({});
        } catch {
          // Silent fail
        }
      }
    }
  }, [movieId, shouldUseMock]);

  // Mock implementation
  if (shouldUseMock) {
    const distributors = mockDistributorStore[movieId] || [];

    const createDistributor = (distributor: Omit<Distributor, 'id' | 'movieId'>) => {
      const newDistributor = {
        ...distributor,
        id: Date.now().toString(),
        movieId,
      };
      mockDistributorStore[movieId] = [...distributors, newDistributor];
      localStorage.setItem(`distributors_movie_${movieId}`, JSON.stringify(mockDistributorStore[movieId]));
      forceUpdate({});
    };

    const deleteDistributor = (distributorId: string) => {
      mockDistributorStore[movieId] = distributors.filter(d => d.id !== distributorId);
      localStorage.setItem(`distributors_movie_${movieId}`, JSON.stringify(mockDistributorStore[movieId]));
      forceUpdate({});
    };

    return {
      distributors,
      isLoading: false,
      error: null,
      createDistributor,
      deleteDistributor,
      isCreating: false,
      isDeleting: false,
    };
  }

  // Real API implementation
  const { data: distributors = [], isLoading, error } = useQuery({
    queryKey: ['distributors', movieId],
    queryFn: () => distributorApi.getByMovie(movieId),
    enabled: !!movieId,
  });

  const createMutation = useMutation({
    mutationFn: (distributor: Omit<Distributor, 'id' | 'movieId'>) =>
      distributorApi.create(movieId, distributor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors', movieId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (distributorId: string) =>
      distributorApi.delete(movieId, distributorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors', movieId] });
    },
  });

  return {
    distributors,
    isLoading,
    error,
    createDistributor: createMutation.mutate,
    deleteDistributor: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
