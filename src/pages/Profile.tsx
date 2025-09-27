import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import {
  Film,
  Calendar,
  Mail,
  User,
  Star,
  Clock,
  TrendingUp,
  Heart,
  Award,
  BarChart3,
  Settings,
  Edit
} from "lucide-react";
import { tmdbService } from "@/services/tmdbService";
import { Movie } from "@/types/movie";

interface UserStats {
  moviesWatched: number;
  watchlistCount: number;
  averageRating: number;
  totalWatchTime: number;
  favoriteGenre: string;
  joinedDate: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentlyWatched, setRecentlyWatched] = useState<Movie[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [userStats, setUserStats] = useState<UserStats>({
    moviesWatched: 42,
    watchlistCount: 15,
    averageRating: 4.2,
    totalWatchTime: 126,
    favoriteGenre: "Sci-Fi",
    joinedDate: user?.created_at || new Date().toISOString()
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const popularMovies = await tmdbService.getPopularMovies(1);
        setRecentlyWatched(popularMovies.results.slice(0, 6));
        setFavoriteMovies(popularMovies.results.slice(6, 10));
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const formatJoinDate = () => {
    const date = new Date(userStats.joinedDate);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />

      <EditProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="relative mb-8">
          <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 rounded-lg" />

          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 translate-y-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage
                  src={user.user_metadata?.avatar_url}
                  alt={user.user_metadata?.full_name || user.email}
                />
                <AvatarFallback className="text-3xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-1">
                  {user.user_metadata?.full_name || 'Movie Enthusiast'}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2 justify-center md:justify-start">
                  <Calendar className="h-4 w-4" />
                  Joined {formatJoinDate()}
                </p>
              </div>

              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-20 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Movies Watched
                  </p>
                  <p className="text-2xl font-bold">{userStats.moviesWatched}</p>
                </div>
                <Film className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Watchlist
                  </p>
                  <p className="text-2xl font-bold">{userStats.watchlistCount}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg. Rating
                  </p>
                  <p className="text-2xl font-bold">{userStats.averageRating}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Watch Time
                  </p>
                  <p className="text-2xl font-bold">{userStats.totalWatchTime}h</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recently Watched */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recently Watched
                </CardTitle>
                <CardDescription>
                  Your latest movie adventures
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {recentlyWatched.map((movie) => (
                      <Link
                        key={movie.id}
                        to={`/movie/${movie.id}`}
                        className="group relative aspect-[2/3] overflow-hidden rounded-lg"
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs font-medium truncate">
                              {movie.title}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorite Movies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Favorite Movies
                </CardTitle>
                <CardDescription>
                  Movies you've rated highest
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-4">
                    {favoriteMovies.map((movie, index) => (
                      <div key={movie.id} className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-muted-foreground w-8">
                          {index + 1}
                        </span>
                        <Link
                          to={`/movie/${movie.id}`}
                          className="flex items-center gap-4 flex-1 group"
                        >
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            className="w-12 h-18 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium group-hover:text-primary transition-colors">
                              {movie.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(movie.release_date).getFullYear()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Viewing Statistics
                </CardTitle>
                <CardDescription>
                  Your movie watching patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Action</span>
                    <span className="text-sm text-muted-foreground">12 movies</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Drama</span>
                    <span className="text-sm text-muted-foreground">8 movies</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Sci-Fi</span>
                    <span className="text-sm text-muted-foreground">15 movies</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Comedy</span>
                    <span className="text-sm text-muted-foreground">7 movies</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm">Watched <span className="font-medium">Inception</span></p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-2 w-2 mt-2 rounded-full bg-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm">Rated <span className="font-medium">The Matrix</span> 5 stars</p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-2 w-2 mt-2 rounded-full bg-red-500" />
                    <div className="flex-1">
                      <p className="text-sm">Added <span className="font-medium">Dune: Part Two</span> to watchlist</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  Your movie milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Movie Critic</h4>
                      <p className="text-sm text-muted-foreground">Rated 25 movies</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Film className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Binge Watcher</h4>
                      <p className="text-sm text-muted-foreground">Watched 5 movies in a week</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Trendsetter</h4>
                      <p className="text-sm text-muted-foreground">First to watch 10 new releases</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg opacity-50">
                    <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Award className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Genre Master</h4>
                      <p className="text-sm text-muted-foreground">Watch 50 movies from one genre</p>
                      <Progress value={30} className="h-1 mt-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;