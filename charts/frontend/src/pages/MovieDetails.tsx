import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/GlassCard";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Building2, Percent, DollarSign, Trash2 } from "lucide-react";
import { useMovie } from "@/hooks/useMovies";
import { useDistributors } from "@/hooks/useDistributors";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: movie } = useMovie(id || '');
  const { distributors, createDistributor, deleteDistributor: removeDistributor } = useDistributors(id || '');

  const [newDistributor, setNewDistributor] = useState({
    name: "",
    tax: "",
    commission: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDistributor({
      name: newDistributor.name,
      tax: parseFloat(newDistributor.tax),
      commission: parseFloat(newDistributor.commission),
    });
    setNewDistributor({ name: "", tax: "", commission: "" });
    setIsDialogOpen(false);
  };

  const deleteDistributor = (distributorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this distributor?')) {
      removeDistributor(distributorId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 animate-slide-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              {movie?.name || "Movie"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage distributors for this movie</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Distributor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Distributor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Distributor Name</Label>
                  <Input
                    id="name"
                    value={newDistributor.name}
                    onChange={(e) => setNewDistributor({ ...newDistributor, name: e.target.value })}
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tax">Tax (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    value={newDistributor.tax}
                    onChange={(e) => setNewDistributor({ ...newDistributor, tax: e.target.value })}
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="commission">Commission from Net Profit (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    value={newDistributor.commission}
                    onChange={(e) => setNewDistributor({ ...newDistributor, commission: e.target.value })}
                    className="mt-1.5"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Distributor
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {distributors.map((distributor, idx) => (
            <div
              key={distributor.id}
              className="animate-scale-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div
                className="border border-border rounded-md bg-card p-4 cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate(`/movies/${id}/distributors/${distributor.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-3">{distributor.name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Tax
                          </span>
                          <span className="font-medium">{distributor.tax}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Commission
                          </span>
                          <span className="font-medium">{distributor.commission}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => deleteDistributor(distributor.id, e)}
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
