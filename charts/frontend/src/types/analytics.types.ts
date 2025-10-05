export interface DistributorPerformance {
  distributorId: string;
  distributorName: string;
  revenue: number;
  ticketsSold: number;
}

export interface Analytics {
  movieId: string;
  totalRevenue: number;
  totalTicketsSold: number;
  averageRating: number;
  distributorPerformance: DistributorPerformance[];
}
