import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SelectedMovieProvider } from "@/contexts/SelectedMovieContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const DistributorDetails = lazy(() => import("./pages/DistributorDetails"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <SelectedMovieProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/home" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/movies/:id" element={<ProtectedRoute><MovieDetails /></ProtectedRoute>} />
                <Route path="/movies/:id/distributors/:distributorId" element={<ProtectedRoute><DistributorDetails /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </SelectedMovieProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
