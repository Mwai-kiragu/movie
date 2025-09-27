import { Movie } from "@/types/movie";

export interface WatchlistMovie extends Movie {
  addedAt: string;
  watched: boolean;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

class WatchlistService {
  private readonly STORAGE_KEY = 'movie_watchlist';

  getWatchlist(): WatchlistMovie[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse watchlist data:', error);
      // Clear corrupted data
      localStorage.removeItem(this.STORAGE_KEY);
      return [];
    }
  }

  isInWatchlist(movieId: number): boolean {
    const watchlist = this.getWatchlist();
    return watchlist.some(movie => movie.id === movieId);
  }

  addToWatchlist(movie: Movie, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    const watchlist = this.getWatchlist();

    // Check if already in watchlist
    if (this.isInWatchlist(movie.id)) {
      return;
    }

    const watchlistMovie: WatchlistMovie = {
      ...movie,
      addedAt: new Date().toISOString(),
      watched: false,
      priority,
      notes: ''
    };

    watchlist.push(watchlistMovie);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(watchlist));
  }

  removeFromWatchlist(movieId: number): void {
    const watchlist = this.getWatchlist();
    const filtered = watchlist.filter(movie => movie.id !== movieId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  toggleWatched(movieId: number): void {
    const watchlist = this.getWatchlist();
    const updated = watchlist.map(movie =>
      movie.id === movieId ? { ...movie, watched: !movie.watched } : movie
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  updatePriority(movieId: number, priority: 'high' | 'medium' | 'low'): void {
    const watchlist = this.getWatchlist();
    const updated = watchlist.map(movie =>
      movie.id === movieId ? { ...movie, priority } : movie
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  updateNotes(movieId: number, notes: string): void {
    const watchlist = this.getWatchlist();
    const updated = watchlist.map(movie =>
      movie.id === movieId ? { ...movie, notes } : movie
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }
}

export const watchlistService = new WatchlistService();