import { useQuery } from '@tanstack/react-query';
import { tmdbService } from '@/services/tmdbService';
import { MoviesResponse } from '@/types/movie';

export const usePopularMovies = (page: number = 1) => {
  return useQuery({
    queryKey: ['movies', 'popular', page],
    queryFn: () => tmdbService.getPopularMovies(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTrendingMovies = (timeWindow: 'day' | 'week' = 'week', page: number = 1) => {
  return useQuery({
    queryKey: ['movies', 'trending', timeWindow, page],
    queryFn: () => tmdbService.getTrendingMovies(timeWindow, page),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSearchMovies = (query: string, page: number = 1) => {
  return useQuery({
    queryKey: ['movies', 'search', query, page],
    queryFn: () => tmdbService.searchMovies(query, page),
    enabled: query.length > 0, // Only run when there's a search query
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useMovieDetails = (movieId: number) => {
  return useQuery({
    queryKey: ['movie', 'details', movieId],
    queryFn: () => tmdbService.getMovieDetails(movieId),
    staleTime: 15 * 60 * 1000, // 15 minutes - movie details change less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useMovieCredits = (movieId: number) => {
  return useQuery({
    queryKey: ['movie', 'credits', movieId],
    queryFn: () => tmdbService.getMovieCredits(movieId),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useMovieRecommendations = (movieId: number, page: number = 1) => {
  return useQuery({
    queryKey: ['movie', 'recommendations', movieId, page],
    queryFn: () => tmdbService.getMovieRecommendations(movieId, page),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};