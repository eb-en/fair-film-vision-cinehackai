/**
 * Storage utility for managing localStorage with error handling
 */

const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  IS_AUTHENTICATED: 'isAuthenticated',
  SELECTED_MOVIE_ID: 'selectedMovieId',
} as const;

class StorageService {
  // Auth methods
  getAuthToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch {
      return null;
    }
  }

  setAuthToken(token: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch {
      // Silent fail
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch {
      return null;
    }
  }

  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch {
      // Silent fail
    }
  }

  getIsAuthenticated(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
    } catch {
      return false;
    }
  }

  setIsAuthenticated(value: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, String(value));
    } catch {
      // Silent fail
    }
  }

  clearAuth(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
    } catch {
      // Silent fail
    }
  }

  // Movie selection
  getSelectedMovieId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_MOVIE_ID);
    } catch {
      return null;
    }
  }

  setSelectedMovieId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_MOVIE_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_MOVIE_ID);
      }
    } catch {
      // Silent fail
    }
  }
}

export const storage = new StorageService();
