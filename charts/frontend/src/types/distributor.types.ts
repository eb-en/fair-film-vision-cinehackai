export interface Distributor {
  id: string;
  name: string;
  tax: number;
  commission: number;
  movieId: string;
}

export type CreateDistributorInput = Omit<Distributor, 'id' | 'movieId'>;
