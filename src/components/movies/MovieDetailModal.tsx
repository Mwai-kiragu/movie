import { X, Star, Calendar, Clock, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Movie } from "@/types/movie";

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MovieDetailModal = ({ movie, isOpen, onClose }: MovieDetailModalProps) => {
  if (!movie) return null;

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder-movie.jpg";

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : posterUrl;

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "TBA";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-card border-border/50">
        <div className="relative">
          {/* Backdrop Image */}
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = posterUrl;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-background/80 hover:bg-background"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="relative -mt-20 px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-32 md:w-48 aspect-[2/3] object-cover rounded-lg shadow-elegant border border-border/50"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-movie.jpg";
                  }}
                />
              </div>

              {/* Movie Info */}
              <div className="flex-1 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight">
                    {movie.title}
                  </DialogTitle>
                </DialogHeader>

                {/* Metadata */}
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-background/80">
                    <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                    {movie.vote_average.toFixed(1)}
                  </Badge>
                  <Badge variant="secondary">
                    <Calendar className="h-3 w-3 mr-1" />
                    {releaseYear}
                  </Badge>
                  <Badge variant="outline">
                    <Globe className="h-3 w-3 mr-1" />
                    {movie.original_language.toUpperCase()}
                  </Badge>
                </div>

                {/* Overview */}
                <ScrollArea className="h-32 pr-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {movie.overview || "No description available for this movie."}
                  </p>
                </ScrollArea>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm font-medium">Vote Count</p>
                    <p className="text-lg text-primary">{movie.vote_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Popularity</p>
                    <p className="text-lg text-primary">{movie.popularity.toFixed(0)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button className="bg-gradient-primary text-primary-foreground font-medium">
                    Add to Watchlist
                  </Button>
                  <Button variant="outline">
                    View More Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};