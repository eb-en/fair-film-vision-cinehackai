import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Film, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMovies } from "@/hooks/useMovies";
import { useSelectedMovie } from "@/contexts/SelectedMovieContext";
import { MovieForm } from "@/components/forms/MovieForm";
import type { CreateMovieInput } from "@/types";

const Movies = () => {
  const navigate = useNavigate();
  const { movies, createMovie, isLoading } = useMovies();
  const { setSelectedMovieId } = useSelectedMovie();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (movie: CreateMovieInput) => {
    createMovie(movie);
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            Movies
          </h1>
          <p className="text-muted-foreground">Manage your movie catalog</p>
        </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Movie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Movie</DialogTitle>
              </DialogHeader>
              <MovieForm
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map((movie, idx) => (
            <div
              key={movie.id}
              className="animate-scale-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <GlassCard
                className="cursor-pointer h-full card-hover group"
                onClick={() => {
                  setSelectedMovieId(movie.id);
                  navigate('/home');
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-md flex-shrink-0 icon-pop">
                    <Film className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2 truncate">{movie.name}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{movie.director}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{movie.language} • {movie.duration} min</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {movie.genre.split(',').map((g, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-1 rounded-md">
                            {g.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm mt-3 line-clamp-2 text-muted-foreground">{movie.description}</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
    </>
  );
};

export default Movies;
