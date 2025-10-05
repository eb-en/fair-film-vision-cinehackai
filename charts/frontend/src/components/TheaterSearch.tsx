import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { searchTheaters, TheaterSearchResult } from "@/services/theaterService";
import { Search, MapPin, Plus } from "lucide-react";

interface TheaterSearchProps {
  onTheatersSelect: (theaters: TheaterSearchResult[]) => void;
  existingTheaterIds?: string[];
}

export const TheaterSearch = ({ onTheatersSelect, existingTheaterIds = [] }: TheaterSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TheaterSearchResult[]>([]);
  const [selectedTheaters, setSelectedTheaters] = useState<TheaterSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    const abortController = new AbortController();

    const performSearch = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsLoading(true);
        setHighlightedIndex(-1);
        try {
          const results = await searchTheaters(searchQuery, abortController.signal);
          setSearchResults(results);
          setShowResults(true);
        } catch {
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
        setHighlightedIndex(-1);
      }
    };

    performSearch();

    return () => {
      abortController.abort();
    };
  }, [searchQuery]);

  const toggleTheaterSelection = (theater: TheaterSearchResult) => {
    setSelectedTheaters(prev => {
      const exists = prev.find(t => t.id === theater.id);
      if (exists) {
        return prev.filter(t => t.id !== theater.id);
      } else {
        return [...prev, theater];
      }
    });
  };

  const handleAddSelected = () => {
    if (selectedTheaters.length > 0) {
      onTheatersSelect(selectedTheaters);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedTheaters([]);
      setShowResults(false);
    }
  };

  const isSelected = (theaterId: string) => {
    return selectedTheaters.some(t => t.id === theaterId);
  };

  const isAlreadyAdded = (theaterId: string) => {
    return existingTheaterIds.includes(theaterId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        // If nothing is highlighted, select the first selectable theater
        if (highlightedIndex === -1) {
          const firstSelectable = searchResults.find(theater => !isAlreadyAdded(theater.id));
          if (firstSelectable) {
            toggleTheaterSelection(firstSelectable);
          }
        } else if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
          const theater = searchResults[highlightedIndex];
          if (!isAlreadyAdded(theater.id)) {
            toggleTheaterSelection(theater);
          }
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (highlightedIndex >= 0) {
      const element = document.getElementById(`theater-item-${highlightedIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-3">
        <div>
          <Label htmlFor="theater-search" className="text-sm font-medium">
            Search Theaters
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Type at least 2 characters to search. Select multiple theaters to add them at once.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="theater-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by name or location..."
            className="pl-10"
            autoFocus
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 mt-4 min-h-0">
        {searchQuery.length === 0 && (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            Start typing to search for theaters
          </div>
        )}

        {searchQuery.length > 0 && searchQuery.length < 2 && (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            Type at least 2 characters to search
          </div>
        )}

        {isLoading && searchQuery.length >= 2 && (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            Searching...
          </div>
        )}

        {!isLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            No theaters found for "{searchQuery}"
          </div>
        )}

        {!isLoading && searchResults.length > 0 && (
          <div className="border border-border rounded-md overflow-hidden">
            <div className="overflow-y-auto max-h-[320px]">
              {searchResults.map((theater, index) => {
                const alreadyAdded = isAlreadyAdded(theater.id);
                return (
                  <div
                    key={theater.id}
                    id={`theater-item-${index}`}
                    onClick={() => !alreadyAdded && toggleTheaterSelection(theater)}
                    className={`flex items-start gap-3 p-3 border-b border-border last:border-b-0 transition-colors ${
                      alreadyAdded
                        ? 'opacity-50 cursor-not-allowed bg-muted/30'
                        : highlightedIndex === index
                          ? 'bg-accent cursor-pointer'
                          : 'hover:bg-muted cursor-pointer'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected(theater.id)}
                      disabled={alreadyAdded}
                      onCheckedChange={() => !alreadyAdded && toggleTheaterSelection(theater)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">{theater.title}</div>
                        {alreadyAdded && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
                            Already added
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{theater.region}</span>
                      </div>
                      {theater.groupTitle !== theater.title && (
                        <div className="text-xs text-muted-foreground/80 mt-1">
                          {theater.groupTitle}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      {selectedTheaters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between p-3 bg-muted rounded-md">
            <span className="text-sm font-medium">
              {selectedTheaters.length} theater{selectedTheaters.length !== 1 ? 's' : ''} selected
            </span>
            <Button onClick={handleAddSelected} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};