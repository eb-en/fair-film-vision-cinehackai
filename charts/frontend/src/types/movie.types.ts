export interface Movie {
  id: string;
  name: string;
  director: string;
  releaseDate: string;
  genre: string;
  description: string;
  language: string;
  duration: number;
}

export type CreateMovieInput = Omit<Movie, 'id'>;
export type UpdateMovieInput = Partial<Movie>;
