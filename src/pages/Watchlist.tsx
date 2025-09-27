import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Film,
  Calendar,
  Star,
  Clock,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  Grid,
  List,
  Heart,
  Eye,
  EyeOff
} from "lucide-react";
import { tmdbService } from "@/services/tmdbService";
import { Movie } from "@/types/movie";
import { watchlistService, WatchlistMovie } from "@/services/watchlistService";

const Watchlist = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);
  const [filteredWatchlist, setFilteredWatchlist] = useState<WatchlistMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'watched' | 'unwatched'>('all');
  const [sortBy, setSortBy] = useState<'added' | 'release' | 'rating' | 'title'>('added');
  const [movieToDelete, setMovieToDelete] = useState<WatchlistMovie | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const loadWatchlist = () => {
      setIsLoading(true);
      try {
        const watchlistMovies = watchlistService.getWatchlist();
        setWatchlist(watchlistMovies);
        setFilteredWatchlist(watchlistMovies);
      } catch (error) {
        console.error("Error loading watchlist:", error);
        toast({
          title: "Error",
          description: "Failed to load watchlist. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWatchlist();
  }, [toast]);

  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...watchlist];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by watch status
    if (filterStatus === 'watched') {
      filtered = filtered.filter(movie => movie.watched);
    } else if (filterStatus === 'unwatched') {
      filtered = filtered.filter(movie => !movie.watched);
    }

    // Filter by priority (based on active tab)
    if (activeTab !== 'all') {
      filtered = filtered.filter(movie => movie.priority === activeTab);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'added':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'release':
          return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
        case 'rating':
          return b.vote_average - a.vote_average;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredWatchlist(filtered);
  }, [watchlist, searchQuery, filterStatus, sortBy, activeTab]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleWatched = (movie: WatchlistMovie) => {
    watchlistService.toggleWatched(movie.id);

    // Update local state
    setWatchlist(prev =>
      prev.map(m =>
        m.id === movie.id ? { ...m, watched: !m.watched } : m
      )
    );

    toast({
      title: movie.watched ? "Marked as unwatched" : "Marked as watched",
      description: `${movie.title} has been updated.`,
    });
  };

  const removeFromWatchlist = (movie: WatchlistMovie) => {
    watchlistService.removeFromWatchlist(movie.id);

    // Update local state
    setWatchlist(prev => prev.filter(m => m.id !== movie.id));
    setMovieToDelete(null);

    toast({
      title: "Removed from watchlist",
      description: `${movie.title} has been removed.`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityBadgeVariant = (priority: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const stats = {
    total: watchlist.length,
    watched: watchlist.filter(m => m.watched).length,
    unwatched: watchlist.filter(m => !m.watched).length,
    highPriority: watchlist.filter(m => m.priority === 'high').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
          <p className="text-muted-foreground">
            Keep track of movies you want to watch
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Film className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Watched</p>
                  <p className="text-2xl font-bold">{stats.watched}</p>
                </div>
                <Eye className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">To Watch</p>
                  <p className="text-2xl font-bold">{stats.unwatched}</p>
                </div>
                <EyeOff className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold">{stats.highPriority}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search watchlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Movies</SelectItem>
                <SelectItem value="watched">Watched</SelectItem>
                <SelectItem value="unwatched">Unwatched</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="added">Date Added</SelectItem>
                <SelectItem value="release">Release Date</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Priority Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="high">High Priority</TabsTrigger>
            <TabsTrigger value="medium">Medium Priority</TabsTrigger>
            <TabsTrigger value="low">Low Priority</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Movies Display */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredWatchlist.length === 0 ? (
          <div className="text-center py-12">
            <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No movies found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search or filters' : 'Start adding movies to your watchlist'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredWatchlist.map((movie) => (
              <div key={movie.id} className="relative group">
                <Link to={`/movie/${movie.id}`} className="block">
                  <div className="aspect-[2/3] overflow-hidden rounded-lg bg-muted relative">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    {movie.watched && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          Watched
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={getPriorityBadgeVariant(movie.priority)}>
                        {movie.priority}
                      </Badge>
                    </div>
                  </div>
                </Link>

                <div className="mt-2">
                  <h3 className="font-medium text-sm truncate">{movie.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs">{movie.vote_average.toFixed(1)}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => toggleWatched(movie)}
                      >
                        {movie.watched ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => setMovieToDelete(movie)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWatchlist.map((movie) => (
              <Card key={movie.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Link to={`/movie/${movie.id}`}>
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                    </Link>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link to={`/movie/${movie.id}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors">
                              {movie.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(movie.release_date).getFullYear()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              {movie.vote_average.toFixed(1)}
                            </span>
                            <Badge variant={getPriorityBadgeVariant(movie.priority)}>
                              {movie.priority} priority
                            </Badge>
                            {movie.watched && (
                              <Badge variant="outline" className="border-green-500 text-green-500">
                                <Check className="h-3 w-3 mr-1" />
                                Watched
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {movie.overview}
                          </p>
                          {movie.notes && (
                            <p className="text-sm italic mt-2">
                              Note: {movie.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={movie.watched ? "outline" : "default"}
                            onClick={() => toggleWatched(movie)}
                          >
                            {movie.watched ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Unwatch
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Watched
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setMovieToDelete(movie)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!movieToDelete} onOpenChange={() => setMovieToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from watchlist?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{movieToDelete?.title}" from your watchlist?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => movieToDelete && removeFromWatchlist(movieToDelete)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Watchlist;