import { GlassCard } from "@/components/GlassCard";
import { Navigation } from "@/components/Navigation";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, DollarSign, Ticket, Building2, Film, Info, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Statistic, Card as AntCard, Table, Badge, Space } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useMovies } from "@/hooks/useMovies";
import { useSelectedMovie } from "@/contexts/SelectedMovieContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { MovieForm } from "@/components/forms/MovieForm";
import TheaterMap from "@/components/TheaterMap";
import Movies from "./Movies";
import type { CreateMovieInput } from "@/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const { movies, isLoading: moviesLoading, error: moviesError, createMovie, deleteMovie } = useMovies();
  const { selectedMovieId, setSelectedMovieId } = useSelectedMovie();
  const { analytics, isLoading: analyticsLoading } = useAnalytics(selectedMovieId || '');

  const [isTheaterDialogOpen, setIsTheaterDialogOpen] = useState(false);
  const [isAddMovieDialogOpen, setIsAddMovieDialogOpen] = useState(false);

  // All hooks must be called before any conditional returns
  const selectedMovie = useMemo(
    () => (selectedMovieId ? movies.find(m => m.id === selectedMovieId) : null),
    [selectedMovieId, movies]
  );

  const allTheatersData = useMemo(() => analytics?.allTheaters || [], [analytics]);
  const topTheaters = useMemo(() => analytics?.topTheaters || [], [analytics]);

  // Theater locations with proper coordinates based on region
  const theaterLocations = useMemo(() => {
    if (!topTheaters || topTheaters.length === 0) return [];

    // Region-based coordinates for Indian cities
    const regionCoordinates: Record<string, { lat: number; lng: number }> = {
      'Delhi': { lat: 28.6139, lng: 77.2090 },
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Lucknow': { lat: 26.8467, lng: 80.9462 },
      'Kanpur': { lat: 26.4499, lng: 80.3319 },
      'Nagpur': { lat: 21.1458, lng: 79.0882 },
      'Indore': { lat: 22.7196, lng: 75.8577 },
      'Bhopal': { lat: 23.2599, lng: 77.4126 },
      'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
      'Patna': { lat: 25.5941, lng: 85.1376 },
      'Vadodara': { lat: 22.3072, lng: 73.1812 },
      'Ludhiana': { lat: 30.9010, lng: 75.8573 },
      'Agra': { lat: 27.1767, lng: 78.0081 },
      'Nashik': { lat: 19.9975, lng: 73.7898 },
    };

    return topTheaters.slice(0, 5).map((theater, index) => {
      const region = (theater as any).region || 'Delhi';

      // Get coordinates based on region, fallback to index-based coordinates if region not found
      const coords = regionCoordinates[region] || {
        lat: [28.6139, 19.0760, 13.0827, 22.5726, 12.9716][index] || 20.5937,
        lng: [77.2090, 72.8777, 80.2707, 88.3639, 77.5946][index] || 78.9629,
      };

      return {
        id: `theater-${index}`,
        name: theater.name,
        revenue: theater.revenue || 0,
        tickets: theater.tickets || 0,
        lat: coords.lat,
        lng: coords.lng,
        region: region,
      };
    });
  }, [topTheaters]);


  const salesData = useMemo(
    () =>
      analytics?.salesTrend || [
        { date: "Mon", tickets: 0 },
        { date: "Tue", tickets: 0 },
        { date: "Wed", tickets: 0 },
        { date: "Thu", tickets: 0 },
        { date: "Fri", tickets: 0 },
        { date: "Sat", tickets: 0 },
        { date: "Sun", tickets: 0 },
      ],
    [analytics]
  );

  const distributorData = useMemo(
    () =>
      (analytics?.distributorBreakdown || []).map((d, idx) => ({
        ...d,
        color: `hsl(var(--chart-${(idx % 4) + 1}))`,
      })),
    [analytics]
  );

  const showTimingData = useMemo(
    () =>
      analytics?.showTimingSales || [
        { timing: "Morning", avgTickets: 0 },
        { timing: "Afternoon", avgTickets: 0 },
        { timing: "Evening", avgTickets: 0 },
        { timing: "Night", avgTickets: 0 },
      ],
    [analytics]
  );

  const regionalData = useMemo(
    () =>
      analytics?.regionalSales || [
        { region: "North", sales: 0 },
        { region: "South", sales: 0 },
        { region: "East", sales: 0 },
        { region: "West", sales: 0 },
      ],
    [analytics]
  );

  const stats = useMemo(
    () => [
      {
        label: "Total Tickets",
        value: analytics?.stats.totalTickets.toLocaleString() || "0",
        icon: Ticket,
        change: analytics?.stats.ticketsChange
          ? `${analytics.stats.ticketsChange > 0 ? '+' : ''}${analytics.stats.ticketsChange.toFixed(1)}%`
          : "0%",
      },
      {
        label: "Total Revenue",
        value: analytics?.stats.totalRevenue
          ? `₹${analytics.stats.totalRevenue.toLocaleString()}`
          : "₹0",
        icon: DollarSign,
        change: analytics?.stats.revenueChange
          ? `${analytics.stats.revenueChange > 0 ? '+' : ''}${analytics.stats.revenueChange.toFixed(1)}%`
          : "0%",
      },
      {
        label: "Net Profit",
        value: analytics?.stats.netProfit
          ? `₹${analytics.stats.netProfit.toLocaleString()}`
          : "₹0",
        icon: TrendingUp,
        change: analytics?.stats.profitChange
          ? `${analytics.stats.profitChange > 0 ? '+' : ''}${analytics.stats.profitChange.toFixed(1)}%`
          : "0%",
      },
      {
        label: "Active Theaters",
        value: analytics?.stats.activeTheaters.toString() || "0",
        icon: Users,
        change: "+0",
      },
    ],
    [analytics]
  );

  const handleAddMovie = (movie: CreateMovieInput) => {
    createMovie(movie);
    setIsAddMovieDialogOpen(false);
  };

  const handleDeleteMovie = () => {
    if (!selectedMovieId) return;

    if (confirm(`Are you sure you want to delete "${selectedMovie?.name}"? This action cannot be undone.`)) {
      deleteMovie(selectedMovieId);
      setSelectedMovieId(null);
    }
  };

  // Show loading state
  if (moviesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading movies...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (moviesError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <h1 className="mb-4 text-2xl font-bold text-destructive">Failed to Load Movies</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {moviesError instanceof Error ? moviesError.message : 'Unable to fetch movies from the server'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show movie selection if no movies or no movie selected
  if (movies.length === 0 || !selectedMovie) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-6">
          <Movies />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                Producer Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">Real-time analytics and insights</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3 bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 flex-1">
              <Film className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium text-muted-foreground flex-shrink-0">Movie:</span>
              <Select value={selectedMovieId || undefined} onValueChange={setSelectedMovieId}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {movies.map((movie) => (
                    <SelectItem key={movie.id} value={movie.id}>
                      {movie.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedMovie && (
              <div className="hidden xl:block text-sm text-muted-foreground">
                <span className="font-medium">Director:</span> {selectedMovie.director}
                <span className="mx-3">•</span>
                <span className="font-medium">Released:</span> {new Date(selectedMovie.releaseDate).toLocaleDateString()}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Dialog open={isAddMovieDialogOpen} onOpenChange={setIsAddMovieDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add Movie</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Movie</DialogTitle>
                  </DialogHeader>
                  <MovieForm
                    onSubmit={handleAddMovie}
                    onCancel={() => setIsAddMovieDialogOpen(false)}
                    isLoading={moviesLoading}
                  />
                </DialogContent>
              </Dialog>

              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(`/movies/${selectedMovieId}`)}
                className="flex-1 sm:flex-none"
              >
                <Building2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Manage Distributors</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedMovieId(null);
                }}
                className="flex-1 sm:flex-none"
              >
                Change
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteMovie}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Using Ant Design Statistic */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const isPositive = stat.change.startsWith('+');

            return (
              <div
                key={stat.label}
                className="animate-scale-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <AntCard
                  bordered={false}
                  className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <Statistic
                      title={stat.label}
                      value={stat.value}
                      valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                    />
                    <div className="bg-primary/10 p-2 rounded-md">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </AntCard>
              </div>
            );
          })}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <GlassCard>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Total Shows</h4>
            <p className="text-2xl font-bold">{analytics?.stats.totalShows || 0}</p>
          </GlassCard>
          <GlassCard>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Avg Ticket Price</h4>
            <p className="text-2xl font-bold">{analytics?.stats.avgTicketPrice ? `₹${Math.round(analytics.stats.avgTicketPrice).toLocaleString()}` : '₹0'}</p>
          </GlassCard>
          <GlassCard>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Revenue Per Show</h4>
            <p className="text-2xl font-bold">{analytics?.stats.revenuePerShow ? `₹${Math.round(analytics.stats.revenuePerShow).toLocaleString()}` : '₹0'}</p>
          </GlassCard>
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <GlassCard>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-sm font-medium text-muted-foreground">Distributor Earnings</h4>
            </div>
            <p className="text-2xl font-bold mb-1">
              {analytics?.stats.totalDistributorEarnings && !isNaN(analytics.stats.totalDistributorEarnings)
                ? `₹${Math.round(analytics.stats.totalDistributorEarnings).toLocaleString()}`
                : "₹0"}
            </p>
            <p className="text-xs text-muted-foreground">
              Commission: {analytics?.stats.distributorCommissionRate && !isNaN(analytics.stats.distributorCommissionRate)
                ? `${(analytics.stats.distributorCommissionRate * 100).toFixed(0)}%`
                : "10%"}
            </p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-sm font-medium text-muted-foreground">GST Collected</h4>
            </div>
            <p className="text-2xl font-bold mb-1">
              {analytics?.stats.totalGST && !isNaN(analytics.stats.totalGST)
                ? `₹${Math.round(analytics.stats.totalGST).toLocaleString()}`
                : "₹0"}
            </p>
            <p className="text-xs text-muted-foreground">
              Tax rate: {analytics?.stats.gstRate && !isNaN(analytics.stats.gstRate)
                ? `${(analytics.stats.gstRate * 100).toFixed(0)}%`
                : "18%"}
            </p>
          </GlassCard>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Sales Trend</h3>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-md">Last 7 days</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 5, strokeWidth: 2, stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Regional Sales</h3>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-md">By region</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                />
                <YAxis type="category" dataKey="region" stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                />
                <Bar dataKey="sales" fill="hsl(var(--chart-2))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Hourly Distribution */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Hourly Distribution</h3>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-md">By hour</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.hourlyDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hourLabel" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="tickets" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Theater Table - Using Ant Design Table */}
        <AntCard
          title={
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Top Theaters</span>
              <Dialog open={isTheaterDialogOpen} onOpenChange={setIsTheaterDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>All Theaters Running "The Great Adventure"</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <Table
                      dataSource={allTheatersData.map((t, idx) => ({ ...t, key: idx }))}
                      columns={[
                        {
                          title: 'Rank',
                          key: 'rank',
                          width: 80,
                          render: (_, __, index) => (
                            <Badge
                              count={index + 1}
                              style={{ backgroundColor: index < 3 ? '#3b82f6' : '#94a3b8' }}
                            />
                          )
                        },
                        {
                          title: 'Theater Name',
                          dataIndex: 'name',
                          key: 'name',
                        },
                        {
                          title: 'Total Sales',
                          dataIndex: 'revenue',
                          key: 'revenue',
                          render: (value: number) => (
                            <span className="font-medium text-primary">
                              ₹{value ? value.toLocaleString() : '0'}
                            </span>
                          ),
                          sorter: (a, b) => (a.revenue || 0) - (b.revenue || 0),
                        },
                        {
                          title: 'Tickets Sold',
                          dataIndex: 'tickets',
                          key: 'tickets',
                          render: (value: number) => value ? value.toLocaleString() : '0',
                        }
                      ]}
                      pagination={{ pageSize: 10 }}
                      size="small"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          }
          bordered={false}
          className="animate-fade-in"
          style={{ animationDelay: '0.6s' }}
        >
          <Table
            dataSource={topTheaters.map((theater, idx) => ({
              key: idx,
              name: theater.name,
              revenue: theater.revenue || 0,
              tickets: theater.tickets || 0
            }))}
            columns={[
              {
                title: 'Rank',
                key: 'rank',
                width: 80,
                render: (_, __, index) => (
                  <Badge
                    count={index + 1}
                    style={{ backgroundColor: '#3b82f6' }}
                  />
                )
              },
              {
                title: 'Theater Name',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: 'Total Sales',
                dataIndex: 'revenue',
                key: 'revenue',
                render: (value: number) => (
                  <span className="font-medium text-primary">₹{value ? value.toLocaleString() : '0'}</span>
                ),
              },
              {
                title: 'Tickets Sold',
                dataIndex: 'tickets',
                key: 'tickets',
                render: (value: number) => value ? value.toLocaleString() : '0',
              }
            ]}
            pagination={false}
            size="small"
          />
        </AntCard>

        {/* Top Theaters and Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in mt-6" style={{ animationDelay: '0.8s' }}>
          {/* Top 5 Theaters - Left Side */}
          <AntCard
            title={
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Top 5 Theaters</span>
              </div>
            }
            bordered={false}
            className="h-full"
          >
            <Table
              dataSource={topTheaters.slice(0, 5).map((theater, idx) => ({
                key: idx,
                name: theater.name,
                revenue: theater.revenue || 0,
                tickets: theater.tickets || 0
              }))}
              columns={[
                {
                  title: 'Rank',
                  key: 'rank',
                  width: 60,
                  render: (_, __, index) => (
                    <Badge
                      count={index + 1}
                      style={{ backgroundColor: '#3b82f6' }}
                    />
                  )
                },
                {
                  title: 'Theater Name',
                  dataIndex: 'name',
                  key: 'name',
                  ellipsis: true,
                },
                {
                  title: 'Sales',
                  dataIndex: 'revenue',
                  key: 'revenue',
                  width: 100,
                  render: (value: number) => (
                    <span className="font-medium text-primary">₹{value ? (value / 1000).toFixed(0) : '0'}k</span>
                  ),
                },
                {
                  title: 'Tickets',
                  dataIndex: 'tickets',
                  key: 'tickets',
                  width: 80,
                  render: (value: number) => (
                    <span className="text-sm">{value ? value.toLocaleString() : '0'}</span>
                  ),
                }
              ]}
              pagination={false}
              size="small"
              showHeader={true}
            />
          </AntCard>

          {/* Theater Map - Right Side */}
          <AntCard
            title={
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Theater Locations</span>
                <Badge
                  count={theaterLocations.length}
                  style={{ backgroundColor: '#3b82f6' }}
                />
              </div>
            }
            bordered={false}
            className="h-full"
          >
            <div className="h-[400px] rounded-lg overflow-hidden relative z-10">
              <TheaterMap
                theaters={theaterLocations}
              />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span>Low Sales</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span>Medium Sales</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>High Sales</span>
                </div>
              </div>
            </div>
          </AntCard>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
