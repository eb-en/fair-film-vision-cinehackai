import { useQuery } from '@tanstack/react-query';
import { showsApi, distributorApi } from '@/services/api';
import { useMemo } from 'react';

interface Show {
  id: string;
  movieId: string;
  theatre: string;
  theatreData: any;
  screen: string;
  timestamp: string;
  seatCategories: Array<{
    category: string;
    booked: number;
    price: number;
    total?: number;
    available?: number;
  }>;
}

export const useAnalytics = (movieId: string) => {
  const { data: allShows = [], isLoading: showsLoading, error } = useQuery({
    queryKey: ['shows'],
    queryFn: showsApi.getAll,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time data
  });

  const { data: distributors = [], isLoading: distributorsLoading } = useQuery({
    queryKey: ['distributors', movieId],
    queryFn: () => distributorApi.getByMovie(movieId),
    enabled: !!movieId,
  });

  const analytics = useMemo(() => {
    if (!movieId) return null;

    // Filter shows for the selected movie
    const allMovieShows: Show[] = allShows.filter((show: Show) => show.movieId === movieId);

    // Remove duplicates - same theater, same timestamp, same screen
    const seenShows = new Set<string>();
    const movieShows: Show[] = allMovieShows.filter(show => {
      const showKey = `${show.theatre}-${show.timestamp}-${show.screen}`;
      if (seenShows.has(showKey)) {
        return false; // Skip duplicate
      }
      seenShows.add(showKey);
      return true;
    });

    if (movieShows.length === 0) {
      return {
        stats: {
          totalTickets: 0,
          totalRevenue: 0,
          netProfit: 0,
          activeTheaters: 0,
        },
        salesTrend: [],
        regionalSales: [],
        showTimingSales: [],
        distributorBreakdown: [],
        topTheaters: [],
        allTheaters: [],
      };
    }

    // Calculate average tax and commission rates from distributors
    const avgTaxRate = distributors && distributors.length > 0
      ? distributors.reduce((sum, d) => sum + (d.tax || 0), 0) / distributors.length / 100
      : 0.18; // Default to 18% if no distributors

    const avgCommissionRate = distributors && distributors.length > 0
      ? distributors.reduce((sum, d) => sum + (d.commission || 0), 0) / distributors.length / 100
      : 0.10; // Default to 10% if no distributors

    // Calculate date ranges for week-over-week comparison
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Calculate stats
    let totalTickets = 0;
    let totalRevenue = 0;
    let netProfit = 0;
    let totalGST = 0;
    let totalDistributorEarnings = 0;

    // This week stats
    let thisWeekTickets = 0;
    let thisWeekRevenue = 0;
    let thisWeekProfit = 0;

    // Last week stats
    let lastWeekTickets = 0;
    let lastWeekRevenue = 0;
    let lastWeekProfit = 0;

    movieShows.forEach(show => {
      const showDate = new Date(show.timestamp);
      const isThisWeek = showDate >= weekAgo;
      const isLastWeek = showDate >= twoWeeksAgo && showDate < weekAgo;

      show.seatCategories.forEach(category => {
        const tickets = category.booked;
        const ticketPrice = category.price;
        const revenue = tickets * ticketPrice;

        // Calculate profit components
        const gstAmount = revenue * avgTaxRate;
        const afterGST = revenue - gstAmount;
        const distributorCommission = afterGST * avgCommissionRate;
        const producerShare = afterGST - distributorCommission;

        // Add to totals (all time)
        totalTickets += tickets;
        totalRevenue += revenue;
        totalGST += gstAmount;
        totalDistributorEarnings += distributorCommission;
        netProfit += producerShare;

        // Track this week
        if (isThisWeek) {
          thisWeekTickets += tickets;
          thisWeekRevenue += revenue;
          thisWeekProfit += producerShare;
        }

        // Track last week for comparison
        if (isLastWeek) {
          lastWeekTickets += tickets;
          lastWeekRevenue += revenue;
          lastWeekProfit += producerShare;
        }
      });
    });

    // Calculate percentage changes (this week vs last week)
    const ticketsChange = lastWeekTickets > 0
      ? ((thisWeekTickets - lastWeekTickets) / lastWeekTickets) * 100
      : 0;
    const revenueChange = lastWeekRevenue > 0
      ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100
      : 0;
    const profitChange = lastWeekProfit > 0
      ? ((thisWeekProfit - lastWeekProfit) / lastWeekProfit) * 100
      : 0;

    // Get unique theaters
    const uniqueTheaters = [...new Set(movieShows.map(s => s.theatre))];

    // Theater statistics
    const theaterStatsMap: Record<string, { name: string; tickets: number; revenue: number; region?: string }> = {};

    movieShows.forEach(show => {
      if (!theaterStatsMap[show.theatre]) {
        theaterStatsMap[show.theatre] = {
          name: show.theatre,
          tickets: 0,
          revenue: 0,
          region: show.theatreData?.region || 'Unknown',
        };
      }
      show.seatCategories.forEach(cat => {
        theaterStatsMap[show.theatre].tickets += cat.booked;
        theaterStatsMap[show.theatre].revenue += cat.booked * cat.price;
      });
    });

    const allTheaters = Object.values(theaterStatsMap);
    const topTheaters = [...allTheaters]
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 10);

    // Regional sales calculation
    const regionalStatsMap: Record<string, { region: string; sales: number; tickets: number }> = {};

    movieShows.forEach(show => {
      // Extract region from theatreData
      // The theater data is stored with lowercase keys: region, slug, etc.
      const region = show.theatreData?.region || 'Unknown';

      if (!regionalStatsMap[region]) {
        regionalStatsMap[region] = {
          region,
          sales: 0,
          tickets: 0,
        };
      }

      show.seatCategories.forEach(cat => {
        const revenue = cat.booked * cat.price;
        regionalStatsMap[region].sales += revenue;
        regionalStatsMap[region].tickets += cat.booked;
      });
    });

    const regionalSales = Object.values(regionalStatsMap)
      .sort((a, b) => b.sales - a.sales);

    // Overall metrics
    const totalShows = movieShows.length;
    const avgTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;
    const revenuePerShow = totalShows > 0 ? totalRevenue / totalShows : 0;

    // Hourly distribution
    const hourlyStatsMap: Record<number, { hour: number; tickets: number; revenue: number; shows: number }> = {};

    movieShows.forEach(show => {
      const hour = new Date(show.timestamp).getHours();
      if (!hourlyStatsMap[hour]) {
        hourlyStatsMap[hour] = { hour, tickets: 0, revenue: 0, shows: 0 };
      }
      hourlyStatsMap[hour].shows += 1;
      show.seatCategories.forEach(cat => {
        hourlyStatsMap[hour].tickets += cat.booked;
        hourlyStatsMap[hour].revenue += cat.booked * cat.price;
      });
    });

    const hourlyDistribution = Object.values(hourlyStatsMap)
      .map(h => ({
        ...h,
        hourLabel: `${h.hour.toString().padStart(2, '0')}:00`,
      }))
      .sort((a, b) => a.hour - b.hour);

    // Sales trend by day of week
    const salesByDay: Record<string, { date: string; tickets: number }> = {
      Mon: { date: 'Mon', tickets: 0 },
      Tue: { date: 'Tue', tickets: 0 },
      Wed: { date: 'Wed', tickets: 0 },
      Thu: { date: 'Thu', tickets: 0 },
      Fri: { date: 'Fri', tickets: 0 },
      Sat: { date: 'Sat', tickets: 0 },
      Sun: { date: 'Sun', tickets: 0 },
    };

    movieShows.forEach(show => {
      const date = new Date(show.timestamp);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      if (salesByDay[dayName]) {
        show.seatCategories.forEach(cat => {
          salesByDay[dayName].tickets += cat.booked;
        });
      }
    });

    // Show timing sales
    const timingMap: Record<string, { timing: string; avgTickets: number; count: number }> = {
      Morning: { timing: 'Morning', avgTickets: 0, count: 0 },
      Afternoon: { timing: 'Afternoon', avgTickets: 0, count: 0 },
      Evening: { timing: 'Evening', avgTickets: 0, count: 0 },
      Night: { timing: 'Night', avgTickets: 0, count: 0 },
    };

    movieShows.forEach(show => {
      const hour = new Date(show.timestamp).getHours();
      let timing = 'Morning';
      if (hour >= 12 && hour < 17) timing = 'Afternoon';
      else if (hour >= 17 && hour < 21) timing = 'Evening';
      else if (hour >= 21 || hour < 6) timing = 'Night';

      let tickets = 0;
      show.seatCategories.forEach(cat => {
        tickets += cat.booked;
      });

      timingMap[timing].avgTickets += tickets;
      timingMap[timing].count += 1;
    });

    // Calculate averages
    const showTimingSales = Object.values(timingMap).map(t => ({
      timing: t.timing,
      avgTickets: t.count > 0 ? Math.round(t.avgTickets / t.count) : 0,
    }));

    return {
      stats: {
        totalTickets,
        totalRevenue,
        netProfit,
        activeTheaters: uniqueTheaters.length,
        totalGST,
        totalDistributorEarnings,
        gstRate: avgTaxRate,
        distributorCommissionRate: avgCommissionRate,
        ticketsChange,
        revenueChange,
        profitChange,
        totalShows,
        avgTicketPrice,
        revenuePerShow,
      },
      salesTrend: Object.values(salesByDay),
      regionalSales,
      showTimingSales,
      distributorBreakdown: [],
      topTheaters,
      allTheaters,
      hourlyDistribution,
    };
  }, [allShows, movieId, distributors]);

  return {
    analytics,
    isLoading: showsLoading || distributorsLoading,
    error,
  };
};
