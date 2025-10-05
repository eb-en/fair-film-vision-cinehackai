// Mock data for development when backend is not available
import { Movie, Distributor, Theater, Analytics } from './api';

export const mockMovies: Movie[] = [
  {
    id: "1",
    name: "The Great Adventure",
    director: "Christopher Nolan",
    releaseDate: "2025-01-15",
    genre: "Action, Thriller",
    description: "An epic journey through time and space",
  },
];

export const mockDistributors: Record<string, Distributor[]> = {
  "1": [
    {
      id: "1",
      name: "Metro Distributors",
      tax: 18,
      commission: 15,
      movieId: "1",
    },
  ],
};

export const mockTheaters: Record<string, Theater[]> = {};

export const mockAnalytics: Analytics = {
  stats: {
    totalTickets: 0,
    totalRevenue: 0,
    netProfit: 0,
    activeTheaters: 0,
  },
  salesTrend: [
    { date: "Mon", tickets: 0 },
    { date: "Tue", tickets: 0 },
    { date: "Wed", tickets: 0 },
    { date: "Thu", tickets: 0 },
    { date: "Fri", tickets: 0 },
    { date: "Sat", tickets: 0 },
    { date: "Sun", tickets: 0 },
  ],
  regionalSales: [
    { region: "North", sales: 0 },
    { region: "South", sales: 0 },
    { region: "East", sales: 0 },
    { region: "West", sales: 0 },
  ],
  showTimingSales: [
    { timing: "Morning", avgTickets: 0 },
    { timing: "Afternoon", avgTickets: 0 },
    { timing: "Evening", avgTickets: 0 },
    { timing: "Night", avgTickets: 0 },
  ],
  distributorBreakdown: [],
  topTheaters: [],
  allTheaters: [],
};

// Helper to check if we should use mock data
export const useMockData = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  // Use mock if explicitly enabled OR if no API URL is set
  return useMock || !apiUrl || apiUrl.includes('localhost:3000');
};
