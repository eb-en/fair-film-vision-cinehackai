import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theaterApi } from '@/services/api';

export const useTheaters = (movieId: string, distributorId: string) => {
  const queryClient = useQueryClient();

  const { data: theaters = [], isLoading, error } = useQuery({
    queryKey: ['theaters', movieId, distributorId],
    queryFn: () => theaterApi.getByDistributor(movieId, distributorId),
    enabled: !!movieId && !!distributorId,
  });

  const addTheatersMutation = useMutation({
    mutationFn: (theaterIds: string[]) =>
      theaterApi.addTheaters(movieId, distributorId, theaterIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theaters', movieId, distributorId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (theaterId: string) =>
      theaterApi.remove(movieId, distributorId, theaterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theaters', movieId, distributorId] });
    },
  });

  return {
    theaters,
    isLoading,
    error,
    addTheaters: addTheatersMutation.mutate,
    removeTheater: removeMutation.mutate,
    isAdding: addTheatersMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
};
