import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdbService } from '@/services/tmdbService';
import { Movie } from '@/types/movie';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Star, Calendar, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MovieDetailsData extends Movie {
  genres: Array<{ id: number; name: string }>;
}

interface Credits {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }>;
  crew: Array<{
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }>;
}

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movie, setMovie] = useState<MovieDetailsData | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [movieData, creditsData, recommendationsData] = await Promise.all([
          tmdbService.getMovieDetails(parseInt(id)),
          tmdbService.getMovieCredits(parseInt(id)),
          tmdbService.getMovieRecommendations(parseInt(id))
        ]);

        setMovie(movieData);
        setCredits(creditsData as Credits);
        setRecommendations(recommendationsData.results.slice(0, 6));
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load movie details. Please try again.',
          variant: 'destructive'
        });
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Movie not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const director = credits?.crew.find(person => person.job === 'Director');
  const mainCast = credits?.cast.slice(0, 10) || [];

  return (
    <div className="min-h-screen">
      <Header onSearch={() => navigate('/')} searchQuery="" />
      <div className="container mx-auto p-4 space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          {movie.poster_path && (
            <img
              src={movie.poster_path}
              alt={movie.title}
              className="w-full rounded-lg shadow-lg"
            />
          )}
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Movie Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{movie.vote_average.toFixed(1)}/10</span>
                <span className="text-sm text-muted-foreground">({movie.vote_count} votes)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="uppercase">{movie.original_language}</span>
              </div>

              {director && (
                <div>
                  <p className="text-sm text-muted-foreground">Director</p>
                  <p className="font-semibold">{director.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            {movie.original_title !== movie.title && (
              <p className="text-muted-foreground mb-4">{movie.original_title}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map(genre => (
                <Badge key={genre.id} variant="secondary">
                  {genre.name}
                </Badge>
              ))}
            </div>

            <p className="text-lg leading-relaxed">{movie.overview}</p>
          </div>

          <Tabs defaultValue="cast" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cast">Cast</TabsTrigger>
              <TabsTrigger value="crew">Crew</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cast">
              <Card>
                <CardHeader>
                  <CardTitle>Main Cast</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {mainCast.map(person => (
                        <div key={person.id} className="flex items-center gap-3">
                          {person.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${person.profile_path}`}
                              alt={person.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs">{person.name[0]}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{person.name}</p>
                            <p className="text-sm text-muted-foreground">{person.character}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="crew">
              <Card>
                <CardHeader>
                  <CardTitle>Crew</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {credits?.crew
                        .filter(person => ['Director', 'Producer', 'Writer', 'Screenplay', 'Director of Photography', 'Original Music Composer'].includes(person.job))
                        .map(person => (
                          <div key={`${person.id}-${person.job}`} className="flex items-center gap-3">
                            {person.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${person.profile_path}`}
                                alt={person.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-xs">{person.name[0]}</span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold">{person.name}</p>
                              <p className="text-sm text-muted-foreground">{person.job}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Movies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {recommendations.map(movie => (
                      <div
                        key={movie.id}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/movie/${movie.id}`)}
                      >
                        <img
                          src={movie.poster_path || '/placeholder-movie.jpg'}
                          alt={movie.title}
                          className="w-full rounded-lg mb-2"
                        />
                        <p className="text-sm font-semibold line-clamp-2">{movie.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">{movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </div>
    </div>
  );
}