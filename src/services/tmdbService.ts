import { Movie, MoviesResponse } from "@/types/movie";

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
  genres?: Array<{ id: number; name: string }>;
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// TMDB API credentials from environment or defaults
const DEFAULT_CREDENTIALS = {
  API_KEY: import.meta.env.VITE_TMDB_API_KEY || '069d26af2b300fa0d08cb2e5b41239d8',
  ACCESS_TOKEN: import.meta.env.VITE_TMDB_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNjlkMjZhZjJiMzAwZmEwZDA4Y2IyZTViNDEyMzlkOCIsIm5iZiI6MTc1NTc5ODAzNS44OCwic3ViIjoiNjhhNzVhMTMxN2I5MzljZmM5M2U4YjU4Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.fA5n8eBlJtbLPVCx53hZr_CmSet6elT75SXL7LkPtmk'
} as const;

// Storage keys for localStorage
const STORAGE_KEYS = {
  API_KEY: 'tmdb_api_key',
  ACCESS_TOKEN: 'tmdb_access_token'
} as const;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class TMDBService {
  private cache = new Map<string, CacheItem<unknown>>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(endpoint: string, params: Record<string, string | number>): string {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  private getStoredCredentials() {
    const storedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    const storedAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    return {
      apiKey: storedApiKey || DEFAULT_CREDENTIALS.API_KEY,
      accessToken: storedAccessToken || DEFAULT_CREDENTIALS.ACCESS_TOKEN
    };
  }

  public setCredentials(apiKey: string, accessToken: string) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  }

  public hasCredentials(): boolean {
    // Always return true since we have default credentials
    return true;
  }

  public clearCredentials() {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  private async makeRequest(endpoint: string, params: Record<string, string | number> = {}): Promise<unknown> {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cachedData = this.getFromCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const { accessToken } = this.getStoredCredentials();
    
    if (!accessToken) {
      throw new Error('TMDB credentials not found. Please set your API credentials.');
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });

    const url = `${TMDB_BASE_URL}${endpoint}?${searchParams}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API credentials. Please check your TMDB API key.');
      }
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.setCache(cacheKey, data);
    return data;
  }

  private transformMovie(movie: TMDBMovie): Movie {
    return {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder-movie.jpg',
      backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
      overview: movie.overview,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      genre_ids: movie.genre_ids || [],
      adult: movie.adult,
      original_language: movie.original_language,
      original_title: movie.original_title,
      popularity: movie.popularity,
      video: movie.video
    };
  }

  async getPopularMovies(page: number = 1): Promise<MoviesResponse> {
    const response = await this.makeRequest('/movie/popular', { page });
    const data = response as { page: number; results: TMDBMovie[]; total_pages: number; total_results: number };
    
    return {
      page: data.page,
      results: data.results.map((movie) => this.transformMovie(movie)),
      total_pages: Math.min(data.total_pages, 500), // TMDB limits to 500 pages
      total_results: data.total_results
    };
  }

  async searchMovies(query: string, page: number = 1): Promise<MoviesResponse> {
    const response = await this.makeRequest('/search/movie', { query, page });
    const data = response as { page: number; results: TMDBMovie[]; total_pages: number; total_results: number };
    
    return {
      page: data.page,
      results: data.results.map((movie) => this.transformMovie(movie)),
      total_pages: Math.min(data.total_pages, 500), // TMDB limits to 500 pages
      total_results: data.total_results
    };
  }

  async getMovieDetails(movieId: number): Promise<Movie & { genres: Array<{ id: number; name: string }> }> {
    const response = await this.makeRequest(`/movie/${movieId}`);
    const data = response as TMDBMovie;
    
    return {
      ...this.transformMovie(data),
      genres: data.genres || []
    };
  }

  async getMovieCredits(movieId: number): Promise<{ cast: unknown[], crew: unknown[] }> {
    const response = await this.makeRequest(`/movie/${movieId}/credits`);
    const data = response as { cast: unknown[]; crew: unknown[] };
    
    return {
      cast: data.cast || [],
      crew: data.crew || []
    };
  }

  async getMovieRecommendations(movieId: number, page: number = 1): Promise<MoviesResponse> {
    const response = await this.makeRequest(`/movie/${movieId}/recommendations`, { page });
    const data = response as { page: number; results: TMDBMovie[]; total_pages: number; total_results: number };
    
    return {
      page: data.page,
      results: data.results.map((movie) => this.transformMovie(movie)),
      total_pages: Math.min(data.total_pages, 500),
      total_results: data.total_results
    };
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<MoviesResponse> {
    const response = await this.makeRequest(`/trending/movie/${timeWindow}`, { page });
    const data = response as { page: number; results: TMDBMovie[]; total_pages: number; total_results: number };
    
    return {
      page: data.page,
      results: data.results.map((movie) => this.transformMovie(movie)),
      total_pages: Math.min(data.total_pages, 500),
      total_results: data.total_results
    };
  }
}

export const tmdbService = new TMDBService();