import { Star, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  runtime?: number;
}

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export const MovieCard = ({ movie, onClick }: MovieCardProps) => {
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder-movie.jpg";

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "TBA";

  return (
    <Card 
      className="group movie-card cursor-pointer bg-gradient-card border-border/50 overflow-hidden h-full"
      onClick={() => onClick(movie)}
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={posterUrl}
          alt={movie.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-movie.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2">
          <Badge className="bg-background/80 text-foreground border-border/50">
            <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
            {movie.vote_average.toFixed(1)}
          </Badge>
        </div>

        {/* Release Year */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-secondary/80">
            <Calendar className="h-3 w-3 mr-1" />
            {releaseYear}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
          {movie.overview || "No description available."}
        </p>
      </CardContent>
    </Card>
  );
};