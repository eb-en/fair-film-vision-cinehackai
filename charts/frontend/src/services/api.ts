import type {
  Movie,
  CreateMovieInput,
  UpdateMovieInput,
  Distributor,
  CreateDistributorInput,
  Theater,
  Analytics,
  LoginCredentials,
  AuthResponse,
} from '@/types';
import { storage } from '@/utils/storage';

// API base URL - update this to your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Generic fetch wrapper with error handling
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = storage.getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      storage.clearAuth();
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }

    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const movieApi = {
  getAll: () => apiFetch<Movie[]>('/api/movies'),

  getById: (id: string) => apiFetch<Movie>(`/api/movies/${id}`),

  create: (movie: CreateMovieInput) =>
    apiFetch<Movie>('/api/movies', {
      method: 'POST',
      body: JSON.stringify(movie),
    }),

  update: (id: string, movie: UpdateMovieInput) =>
    apiFetch<Movie>(`/api/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(movie),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/api/movies/${id}`, {
      method: 'DELETE',
    }),
};

export const distributorApi = {
  getByMovie: (movieId: string) =>
    apiFetch<Distributor[]>(`/api/movies/${movieId}/distributors`),

  create: (movieId: string, distributor: CreateDistributorInput) =>
    apiFetch<Distributor>(`/api/movies/${movieId}/distributors`, {
      method: 'POST',
      body: JSON.stringify(distributor),
    }),

  delete: (movieId: string, distributorId: string) =>
    apiFetch<void>(`/api/movies/${movieId}/distributors/${distributorId}`, {
      method: 'DELETE',
    }),
};

export const theaterApi = {
  getByDistributor: (movieId: string, distributorId: string) =>
    apiFetch<Theater[]>(`/api/movies/${movieId}/distributors/${distributorId}/theaters`),

  addTheaters: (movieId: string, distributorId: string, theaterIds: string[]) =>
    apiFetch<Theater[]>(`/api/movies/${movieId}/distributors/${distributorId}/theaters`, {
      method: 'POST',
      body: JSON.stringify({ theaterIds }),
    }),

  remove: (movieId: string, distributorId: string, theaterId: string) =>
    apiFetch<void>(`/api/movies/${movieId}/distributors/${distributorId}/theaters/${theaterId}`, {
      method: 'DELETE',
    }),
};

export const analyticsApi = {
  getByMovie: (movieId: string) =>
    apiFetch<Analytics>(`/api/analytics/${movieId}`),
};

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store tokens (API returns 'token' instead of 'access_token')
    if (response.token) {
      storage.setAuthToken(response.token);
      storage.setIsAuthenticated(true);
    } else {
      // Set authenticated anyway if login was successful
      storage.setIsAuthenticated(true);
    }

    return response;
  },

  refresh: async () => {
    const refreshToken = storage.getRefreshToken();

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    if (data.access_token) {
      storage.setAuthToken(data.access_token);
      if (data.refresh_token) {
        storage.setRefreshToken(data.refresh_token);
      }
    }

    return data;
  },

  logout: async () => {
    const token = storage.getAuthToken();

    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      // Silently fail - logout will still clear local storage
    } finally {
      // Clear tokens regardless of API call success
      storage.clearAuth();
    }
  },
};
