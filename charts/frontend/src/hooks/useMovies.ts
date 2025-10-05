import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movieApi, Movie } from '@/services/api';
import { mockMovies, useMockData } from '@/services/mockData';
import { useState } from 'react';

// In-memory store for mock mode
let mockMovieStore = [...mockMovies];

export const useMovies = () => {
  const queryClient = useQueryClient();
  const shouldUseMock = useMockData();
  const [, forceUpdate] = useState({});

  // Mock implementation
  if (shouldUseMock) {
    const createMovie = (movie: Omit<Movie, 'id'>) => {
      const newMovie = { ...movie, id: Date.now().toString() };
      mockMovieStore = [...mockMovieStore, newMovie];
      forceUpdate({});
    };

    const updateMovie = ({ id, data }: { id: string; data: Partial<Movie> }) => {
      mockMovieStore = mockMovieStore.map(m =>
        m.id === id ? { ...m, ...data } : m
      );
      forceUpdate({});
    };

    const deleteMovie = (id: string) => {
      mockMovieStore = mockMovieStore.filter(m => m.id !== id);
      forceUpdate({});
    };

    return {
      movies: mockMovieStore,
      isLoading: false,
      error: null,
      createMovie,
      updateMovie,
      deleteMovie,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    };
  }

  // Real API implementation
  const { data: movies = [], isLoading, error } = useQuery({
    queryKey: ['movies'],
    queryFn: movieApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: movieApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Movie> }) =>
      movieApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: movieApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });

  return {
    movies,
    isLoading,
    error,
    createMovie: createMutation.mutate,
    updateMovie: updateMutation.mutate,
    deleteMovie: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useMovie = (id: string) => {
  const shouldUseMock = useMockData();

  if (shouldUseMock) {
    const movie = mockMovieStore.find(m => m.id === id);
    return {
      data: movie,
      isLoading: false,
      error: null,
    };
  }

  return useQuery({
    queryKey: ['movies', id],
    queryFn: () => movieApi.getById(id),
    enabled: !!id,
  });
};
