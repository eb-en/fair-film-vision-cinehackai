import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TheaterSearch } from "@/components/TheaterSearch";
import { TheaterSearchResult } from "@/services/theaterService";
import { ArrowLeft, Plus, MapPin, Trash2, Search, Building2 } from "lucide-react";

interface Theater {
  id: string;
  name: string;
  region: string;
}

const DistributorDetails = () => {
  const { id, distributorId } = useParams();
  const navigate = useNavigate();

  const [theaters, setTheaters] = useState<Theater[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const handleTheatersSelect = (theaterResults: TheaterSearchResult[]) => {
    const newTheaters: Theater[] = theaterResults.map(result => ({
      id: result.id,
      name: result.title,
      region: result.region,
    }));

    // Filter out theaters that are already added
    const uniqueTheaters = newTheaters.filter(
      newTheater => !theaters.some(existing => existing.id === newTheater.id)
    );

    setTheaters([...theaters, ...uniqueTheaters]);
    setIsDialogOpen(false);
  };

  const removeTheater = (theaterId: string) => {
    setTheaters(theaters.filter(theater => theater.id !== theaterId));
  };

  const filteredTheaters = theaters.filter(theater =>
    theater.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    theater.region.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const existingTheaterIds = theaters.map(t => t.id);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/movies/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Distributors
        </Button>

        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Metro Distributors
            </h1>
            <p className="text-muted-foreground">Manage theaters for this distributor</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Theaters
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[600px] flex flex-col">
              <DialogHeader>
                <DialogTitle>Add Theaters</DialogTitle>
              </DialogHeader>
              <div className="flex-1 mt-4 min-h-0">
                <TheaterSearch
                  onTheatersSelect={handleTheatersSelect}
                  existingTheaterIds={existingTheaterIds}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Theater List */}
        <div className="border border-border rounded-md bg-card">
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Theaters ({theaters.length})</h2>
            </div>
            {theaters.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search theaters..."
                  className="pl-10"
                />
              </div>
            )}
          </div>

          {theaters.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">No Theaters Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Add Theaters" to start building your distribution network
                  </p>
                </div>
              </div>
            </div>
          ) : filteredTheaters.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">No Results Found</h3>
                  <p className="text-sm text-muted-foreground">
                    No theaters found matching "{searchFilter}"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTheaters.map((theater, idx) => (
                <div
                  key={theater.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="font-medium">{theater.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {theater.region}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTheater(theater.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistributorDetails;
