import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, LogOut, Search, Plus, Trash2 } from "lucide-react";
import { showsApi, movieApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/utils/storage";
import { searchTheaters } from "@/services/theaterService";
import type { CreateBookingInput, TheaterSearchResult, TicketType } from "@/types";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    movieId: "",
    movieName: "",
    theaterName: "",
    theaterData: {} as Record<string, any>,
    screenName: "",
    showDateTime: new Date().toISOString().slice(0, 16), // Default to now in YYYY-MM-DDTHH:mm format
  });

  // Fetch movies
  const { data: movies = [], isLoading: isLoadingMovies } = useQuery({
    queryKey: ['movies'],
    queryFn: movieApi.getAll,
  });

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { type: "", price: 0, quantity: 0, totalPrice: 0 }
  ]);

  // Theater search state
  const [theaterSearchQuery, setTheaterSearchQuery] = useState("");
  const [theaterSearchResults, setTheaterSearchResults] = useState<TheaterSearchResult[]>([]);
  const [showTheaterResults, setShowTheaterResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const theaterInputRef = useRef<HTMLInputElement>(null);
  const theaterDropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    storage.clearAuth();
    navigate("/", { replace: true });
  };

  // Theater search effect
  useEffect(() => {
    const abortController = new AbortController();

    const performSearch = async () => {
      if (theaterSearchQuery.trim().length >= 2) {
        setIsSearching(true);
        setHighlightedIndex(-1);
        try {
          const results = await searchTheaters(theaterSearchQuery, abortController.signal);
          setTheaterSearchResults(results);
          setShowTheaterResults(true);
        } catch {
          setTheaterSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setTheaterSearchResults([]);
        setShowTheaterResults(false);
        setHighlightedIndex(-1);
      }
    };

    performSearch();

    return () => {
      abortController.abort();
    };
  }, [theaterSearchQuery]);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0) {
      const element = document.getElementById(`theater-result-${highlightedIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Click-away detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        theaterDropdownRef.current &&
        theaterInputRef.current &&
        !theaterDropdownRef.current.contains(event.target as Node) &&
        !theaterInputRef.current.contains(event.target as Node)
      ) {
        setShowTheaterResults(false);
        setHighlightedIndex(-1);
      }
    };

    if (showTheaterResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTheaterResults]);

  const handleTheaterSelect = (theater: TheaterSearchResult) => {
    setFormData({
      ...formData,
      theaterName: theater.title,
      theaterData: {
        id: theater.id,
        title: theater.title,
        region: theater.region,
        slug: theater.slug,
        groupTitle: theater.groupTitle,
      }
    });
    setTheaterSearchQuery("");
    setShowTheaterResults(false);
    setHighlightedIndex(-1);
  };

  const handleTheaterKeyDown = (e: React.KeyboardEvent) => {
    if (!showTheaterResults || theaterSearchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < theaterSearchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < theaterSearchResults.length) {
          handleTheaterSelect(theaterSearchResults[highlightedIndex]);
        } else if (theaterSearchResults.length > 0) {
          // If nothing highlighted, select first result
          handleTheaterSelect(theaterSearchResults[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowTheaterResults(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { type: "", price: 0, quantity: 0, totalPrice: 0 }]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index));
    }
  };

  const updateTicketType = (index: number, field: keyof TicketType, value: string | number) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };

    // Calculate totalPrice when price or quantity changes
    if (field === 'price' || field === 'quantity') {
      updated[index].totalPrice = updated[index].price * updated[index].quantity;
    }

    setTicketTypes(updated);
  };

  const calculateTotals = () => {
    const totalTickets = ticketTypes.reduce((sum, ticket) => sum + ticket.quantity, 0);
    const totalAmount = ticketTypes.reduce((sum, ticket) => sum + ticket.totalPrice, 0);
    return { totalTickets, totalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { totalTickets, totalAmount } = calculateTotals();

    try {
      // Convert show datetime to timestamp
      const timestamp = new Date(formData.showDateTime);

      // Convert ticket types to seat categories
      const seatCategories = ticketTypes.map(ticket => ({
        category: ticket.type,
        booked: ticket.quantity,
        price: ticket.price,
      }));

      const showData = {
        timestamp,
        screen: formData.screenName,
        theatre: formData.theaterName,
        theatreData: formData.theaterData,
        movieId: formData.movieId,
        seatCategories,
      };

      await showsApi.create(showData);

      // Invalidate analytics cache to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['shows'] });

      toast({
        title: "Show Recorded",
        description: `Successfully recorded ${totalTickets} tickets for ${formData.theaterName} (₹${totalAmount})`,
      });

      // Reset form
      setFormData({
        movieId: "",
        movieName: "",
        theaterName: "",
        theaterData: {},
        screenName: "",
        showDateTime: new Date().toISOString().slice(0, 16), // Reset to current date/time
      });
      setTicketTypes([{ type: "", price: 0, quantity: 0, totalPrice: 0 }]);
      setTheaterSearchQuery("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record show",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Booking Entry</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Record ticket sales</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        {/* Booking Form */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">New Booking</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Enter the details of the ticket booking
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Movie Selection */}
              <div className="space-y-2">
                <Label htmlFor="movieId">Movie</Label>
                <Select
                  value={formData.movieId}
                  onValueChange={(value) => {
                    const selectedMovie = movies.find(m => m.id === value);
                    setFormData({
                      ...formData,
                      movieId: value,
                      movieName: selectedMovie?.name || "",
                    });
                  }}
                  disabled={isSubmitting || isLoadingMovies}
                >
                  <SelectTrigger id="movieId">
                    <SelectValue placeholder={isLoadingMovies ? "Loading movies..." : "Select a movie"} />
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

              {/* Theater Name */}
              <div className="space-y-2">
                <Label htmlFor="theaterName">Theater Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={theaterInputRef}
                    id="theaterName"
                    value={formData.theaterName || theaterSearchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (formData.theaterName) {
                        setFormData({ ...formData, theaterName: "" });
                      }
                      setTheaterSearchQuery(value);
                    }}
                    onKeyDown={handleTheaterKeyDown}
                    placeholder="Search theater..."
                    required
                    disabled={isSubmitting}
                    className="pl-10"
                    autoComplete="off"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  )}

                  {/* Search Results Dropdown */}
                  {showTheaterResults && theaterSearchResults.length > 0 && (
                    <div
                      ref={theaterDropdownRef}
                      className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
                    >
                      {theaterSearchResults.map((theater, index) => (
                        <div
                          key={theater.id}
                          id={`theater-result-${index}`}
                          onClick={() => handleTheaterSelect(theater)}
                          className={`p-3 cursor-pointer border-b border-border last:border-b-0 transition-colors ${
                            highlightedIndex === index
                              ? 'bg-accent'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="font-medium text-sm">{theater.title}</div>
                          <div className="text-xs text-muted-foreground">{theater.region}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showTheaterResults && theaterSearchResults.length === 0 && theaterSearchQuery.length >= 2 && !isSearching && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3">
                      <div className="text-sm text-muted-foreground">No theaters found</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Screen Name & Show Date/Time - Side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="screenName">Screen Name</Label>
                  <Input
                    id="screenName"
                    value={formData.screenName}
                    onChange={(e) => setFormData({ ...formData, screenName: e.target.value })}
                    placeholder="e.g., Screen 1, IMAX"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="showDateTime">Show Date & Time</Label>
                  <Input
                    id="showDateTime"
                    type="datetime-local"
                    value={formData.showDateTime}
                    onChange={(e) => setFormData({ ...formData, showDateTime: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Ticket Types Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Label className="text-base">Ticket Types</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTicketType}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="text-xs sm:text-sm">Add Type</span>
                  </Button>
                </div>

                {ticketTypes.map((ticket, index) => (
                  <Card key={index} className="p-3 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-medium">Ticket Type {index + 1}</span>
                      {ticketTypes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTicketType(index)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2 space-y-2">
                        <Label htmlFor={`type-${index}`} className="text-xs sm:text-sm">Type Name</Label>
                        <Input
                          id={`type-${index}`}
                          value={ticket.type}
                          onChange={(e) => updateTicketType(index, 'type', e.target.value)}
                          placeholder="e.g., Gold, Silver"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`price-${index}`} className="text-xs sm:text-sm">Price (₹)</Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={ticket.price || ""}
                          onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`quantity-${index}`} className="text-xs sm:text-sm">Quantity</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="0"
                          value={ticket.quantity || ""}
                          onChange={(e) => updateTicketType(index, 'quantity', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between p-2 bg-muted rounded-md">
                        <Label className="text-xs sm:text-sm">Total:</Label>
                        <div className="text-base sm:text-lg font-semibold text-primary">
                          ₹{ticket.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Summary */}
                <Card className="p-3 sm:p-4 bg-muted">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-medium">Total Tickets:</span>
                      <span className="text-base sm:text-lg font-semibold">{calculateTotals().totalTickets}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-medium">Total Amount:</span>
                      <span className="text-base sm:text-lg font-semibold text-primary">₹{calculateTotals().totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full text-sm sm:text-base" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Recording..."
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Record Booking
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default StaffDashboard;
