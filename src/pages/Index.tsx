import { useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { MovieDetailModal } from "@/components/movies/MovieDetailModal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { Movie } from "@/types/movie";
import { SearchBar } from "@/components/movies/SearchBar";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Star, Film } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePopularMovies, useTrendingMovies, useSearchMovies } from "@/hooks/useMovies";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");
  const { toast } = useToast();

  // TanStack Query hooks
  const {
    data: popularMoviesData,
    isLoading: isLoadingPopular,
    error: popularError
  } = usePopularMovies(currentPage);

  const {
    data: trendingMoviesData,
    isLoading: isLoadingTrending,
    error: trendingError
  } = useTrendingMovies('week', currentPage);

  const {
    data: searchMoviesData,
    isLoading: isLoadingSearch,
    error: searchError
  } = useSearchMovies(searchQuery, currentPage);

  // Determine current data and loading state
  const getCurrentMovieData = () => {
    if (searchQuery.trim()) {
      return {
        data: searchMoviesData,
        isLoading: isLoadingSearch,
        error: searchError
      };
    } else if (activeTab === "trending") {
      return {
        data: trendingMoviesData,
        isLoading: isLoadingTrending,
        error: trendingError
      };
    } else {
      return {
        data: popularMoviesData,
        isLoading: isLoadingPopular,
        error: popularError
      };
    }
  };

  const { data: currentMovieData, isLoading, error } = getCurrentMovieData();
  const movies = currentMovieData?.results || [];
  const totalPages = Math.min(currentMovieData?.total_pages || 1, 50); // Limit to 50 pages for better UX

  // Handle errors
  if (error && user) {
    toast({
      title: "Error",
      description: "Failed to fetch movies. Please check your API credentials.",
      variant: "destructive",
    });
  }

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (query.trim()) {
      setActiveTab("search");
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header onSearch={() => {}} searchQuery="" />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <Film className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Welcome to Onesmus Movie Quest</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to access our extensive movie database and get personalized recommendations.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" onClick={() => window.location.href = '/login'}>
                  Sign In
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.location.href = '/register'}>
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-12 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Movies
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore thousands of movies, get recommendations, and build your perfect watchlist
          </p>
        </section>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search for movies..."
            initialValue={searchQuery}
          />
        </div>

        {/* Movies Section */}
        <section>
          {!searchQuery && (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="popular" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Popular
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {searchQuery ? `Search Results for "${searchQuery}"` : activeTab === "trending" ? "Trending Movies" : "Popular Movies"}
            </h2>
            
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <LoadingSpinner size="sm" />
                <span className="text-sm">Loading movies...</span>
              </div>
            )}
          </div>

          <MovieGrid
            movies={movies}
            onMovieClick={handleMovieClick}
            isLoading={isLoading}
          />

          {/* Enhanced Pagination */}
          {!isLoading && totalPages > 1 && (
            <Pagination className="mt-12">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {/* First page */}
                <PaginationItem>
                  <PaginationLink 
                    onClick={() => handlePageChange(1)}
                    isActive={currentPage === 1}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {/* Ellipsis after first page */}
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Pages around current page */}
                {(() => {
                  const pages = [];
                  const startPage = Math.max(2, currentPage - 2);
                  const endPage = Math.min(totalPages - 1, currentPage + 2);

                  for (let page = startPage; page <= endPage; page++) {
                    if (page > 1 && page < totalPages) {
                      pages.push(
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  }

                  return pages;
                })()}

                {/* Ellipsis before last page */}
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Last page */}
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(totalPages)}
                      isActive={currentPage === totalPages}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </section>
      </main>

      {/* Movie Detail Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Index;
