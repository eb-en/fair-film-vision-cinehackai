import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateMovieInput } from "@/types";

interface MovieFormProps {
  onSubmit: (movie: CreateMovieInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MovieForm = ({ onSubmit, onCancel, isLoading = false }: MovieFormProps) => {
  const [formData, setFormData] = useState<CreateMovieInput>({
    name: "",
    director: "",
    releaseDate: "",
    genre: "",
    description: "",
    language: "",
    duration: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: "",
      director: "",
      releaseDate: "",
      genre: "",
      description: "",
      language: "",
      duration: 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <Label htmlFor="name">Movie Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1.5"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="director">Director</Label>
        <Input
          id="director"
          value={formData.director}
          onChange={(e) => setFormData({ ...formData, director: e.target.value })}
          className="mt-1.5"
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="releaseDate">Release Date</Label>
          <Input
            id="releaseDate"
            type="date"
            value={formData.releaseDate}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
            className="mt-1.5"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="genre">Genre</Label>
          <Input
            id="genre"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            className="mt-1.5"
            placeholder="Action, Drama"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="mt-1.5"
            placeholder="English, Hindi"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration || ""}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
            className="mt-1.5"
            placeholder="148"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1.5 min-h-[100px]"
          required
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Movie"}
        </Button>
      </div>
    </form>
  );
};
