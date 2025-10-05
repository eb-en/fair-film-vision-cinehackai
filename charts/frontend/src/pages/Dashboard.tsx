import { GlassCard } from "@/components/GlassCard";
import { Navigation } from "@/components/Navigation";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, DollarSign, Ticket, Building2, Film, Info, ChevronRight, Plus } from "lucide-react";
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
import Movies from "./Movies";
import type { CreateMovieInput } from "@/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const { movies, isLoading: moviesLoading, error: moviesError, createMovie } = useMovies();
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
        change: "+0%",
      },
      {
        label: "Total Revenue",
        value: analytics?.stats.totalRevenue
          ? `₹${(analytics.stats.totalRevenue / 1000000).toFixed(1)}M`
          : "₹0",
        icon: DollarSign,
        change: "+0%",
      },
      {
        label: "Net Profit",
        value: analytics?.stats.netProfit
          ? `₹${(analytics.stats.netProfit / 1000000).toFixed(1)}M`
          : "₹0",
        icon: TrendingUp,
        change: "+0%",
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Select a Movie</h1>
            <p className="text-muted-foreground">
              {movies.length === 0
                ? "Add your first movie to get started"
                : "Choose a movie to view its analytics"}
            </p>
          </div>

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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Producer Dashboard
              </h1>
              <p className="text-muted-foreground">Real-time analytics and insights</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
            <Film className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Movie:</span>
            <Select value={selectedMovieId || undefined} onValueChange={setSelectedMovieId}>
              <SelectTrigger className="w-[300px]">
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
            <div className="ml-auto text-sm text-muted-foreground">
              <span className="font-medium">Director:</span> {selectedMovie.director}
              <span className="mx-3">•</span>
              <span className="font-medium">Released:</span> {new Date(selectedMovie.releaseDate).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddMovieDialogOpen} onOpenChange={setIsAddMovieDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Movie
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
              >
                <Building2 className="h-4 w-4 mr-2" />
                Manage Distributors
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedMovieId(null);
                }}
              >
                Change
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
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
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
                    <div className="flex items-center gap-1">
                      <Statistic
                        value={stat.change.replace(/[+-]/g, '')}
                        prefix={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        valueStyle={{
                          fontSize: '14px',
                          color: isPositive ? '#3f8600' : '#cf1322'
                        }}
                      />
                      <span className="text-xs text-muted-foreground ml-1">vs last week</span>
                    </div>
                  </Space>
                </AntCard>
              </div>
            );
          })}
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
              ₹0M
            </p>
            <p className="text-xs text-muted-foreground">Average commission: 18%</p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-sm font-medium text-muted-foreground">Producer Net Profit</h4>
            </div>
            <p className="text-2xl font-bold mb-1">
              ₹0M
            </p>
            <p className="text-xs text-muted-foreground">After all deductions</p>
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
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="region" stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: number) => `₹${(value / 1000000).toFixed(1)}M`}
                />
                <Bar dataKey="sales" fill="hsl(var(--chart-2))" radius={[0, 8, 8, 0]} />
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
                          dataIndex: 'totalSales',
                          key: 'totalSales',
                          render: (value: number) => (
                            <span className="font-medium text-primary">
                              ₹{(value / 100000).toFixed(1)}L
                            </span>
                          ),
                          sorter: (a, b) => a.totalSales - b.totalSales,
                        },
                        {
                          title: 'Theater Earnings',
                          dataIndex: 'earnings',
                          key: 'earnings',
                          render: (value: number) => `₹${(value / 100000).toFixed(1)}L`,
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
              totalSales: theater.totalSales,
              earnings: theater.earnings
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
                dataIndex: 'totalSales',
                key: 'totalSales',
                render: (value: number) => (
                  <span className="font-medium text-primary">₹{(value / 100000).toFixed(1)}L</span>
                ),
              },
              {
                title: 'Theater Earnings',
                dataIndex: 'earnings',
                key: 'earnings',
                render: (value: number) => `₹${(value / 100000).toFixed(1)}L`,
              }
            ]}
            pagination={false}
            size="small"
          />
        </AntCard>

      </div>
    </div>
  );
};

export default Dashboard;
