import { describe, it, expect, beforeEach, vi } from 'vitest';
import { watchlistService } from '../watchlistService';
import { Movie } from '@/types/movie';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/test.jpg',
  backdrop_path: '/backdrop.jpg',
  overview: 'Test overview',
  release_date: '2024-01-01',
  vote_average: 8.5,
  vote_count: 1000,
  popularity: 100,
  genre_ids: [28, 12],
  original_language: 'en',
  original_title: 'Test Movie',
  adult: false,
  video: false,
};

describe('WatchlistService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getWatchlist', () => {
    it('should return empty array when no watchlist exists', () => {
      const result = watchlistService.getWatchlist();
      expect(result).toEqual([]);
    });

    it('should return stored watchlist', () => {
      const watchlist = [
        {
          ...mockMovie,
          addedAt: '2024-01-01T00:00:00.000Z',
          watched: false,
          priority: 'medium' as const,
        },
      ];
      localStorage.setItem('movie_watchlist', JSON.stringify(watchlist));

      const result = watchlistService.getWatchlist();
      expect(result).toEqual(watchlist);
    });
  });

  describe('isInWatchlist', () => {
    it('should return false when movie is not in watchlist', () => {
      const result = watchlistService.isInWatchlist(1);
      expect(result).toBe(false);
    });

    it('should return true when movie is in watchlist', () => {
      const watchlist = [
        {
          ...mockMovie,
          addedAt: '2024-01-01T00:00:00.000Z',
          watched: false,
          priority: 'medium' as const,
        },
      ];
      localStorage.setItem('movie_watchlist', JSON.stringify(watchlist));

      const result = watchlistService.isInWatchlist(1);
      expect(result).toBe(true);
    });
  });

  describe('addToWatchlist', () => {
    it('should add movie to empty watchlist', () => {
      watchlistService.addToWatchlist(mockMovie);

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist).toHaveLength(1);
      expect(watchlist[0].id).toBe(mockMovie.id);
      expect(watchlist[0].title).toBe(mockMovie.title);
      expect(watchlist[0].watched).toBe(false);
      expect(watchlist[0].priority).toBe('medium');
      expect(watchlist[0].addedAt).toBeDefined();
    });

    it('should add movie with custom priority', () => {
      watchlistService.addToWatchlist(mockMovie, 'high');

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist[0].priority).toBe('high');
    });

    it('should not add duplicate movies', () => {
      watchlistService.addToWatchlist(mockMovie);
      watchlistService.addToWatchlist(mockMovie);

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist).toHaveLength(1);
    });

    it('should add multiple different movies', () => {
      const movie2 = { ...mockMovie, id: 2, title: 'Test Movie 2' };

      watchlistService.addToWatchlist(mockMovie);
      watchlistService.addToWatchlist(movie2);

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist).toHaveLength(2);
      expect(watchlist[0].id).toBe(1);
      expect(watchlist[1].id).toBe(2);
    });
  });

  describe('removeFromWatchlist', () => {
    beforeEach(() => {
      watchlistService.addToWatchlist(mockMovie);
      watchlistService.addToWatchlist({ ...mockMovie, id: 2, title: 'Movie 2' });
    });

    it('should remove movie from watchlist', () => {
      watchlistService.removeFromWatchlist(1);

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist).toHaveLength(1);
      expect(watchlist[0].id).toBe(2);
    });

    it('should handle removing non-existent movie', () => {
      watchlistService.removeFromWatchlist(999);

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist).toHaveLength(2);
    });

    it('should handle removing from empty watchlist', () => {
      localStorage.clear();
      watchlistService.removeFromWatchlist(1);

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist).toEqual([]);
    });
  });

  describe('toggleWatched', () => {
    beforeEach(() => {
      watchlistService.addToWatchlist(mockMovie);
    });

    it('should toggle watched status from false to true', () => {
      watchlistService.toggleWatched(1);

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist[0].watched).toBe(true);
    });

    it('should toggle watched status from true to false', () => {
      watchlistService.toggleWatched(1);
      watchlistService.toggleWatched(1);

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist[0].watched).toBe(false);
    });

    it('should not affect other movies', () => {
      watchlistService.addToWatchlist({ ...mockMovie, id: 2 });
      watchlistService.toggleWatched(1);

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist[0].watched).toBe(true);
      expect(watchlist[1].watched).toBe(false);
    });

    it('should handle toggling non-existent movie', () => {
      watchlistService.toggleWatched(999);

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist[0].watched).toBe(false);
    });
  });

  describe('updatePriority', () => {
    beforeEach(() => {
      watchlistService.addToWatchlist(mockMovie);
    });

    it('should update movie priority', () => {
      watchlistService.updatePriority(1, 'high');

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist[0].priority).toBe('high');
    });

    it('should handle all priority levels', () => {
      watchlistService.updatePriority(1, 'low');
      let watchlist = watchlistService.getWatchlist();
      expect(watchlist[0].priority).toBe('low');

      watchlistService.updatePriority(1, 'medium');
      watchlist = watchlistService.getWatchlist();
      expect(watchlist[0].priority).toBe('medium');

      watchlistService.updatePriority(1, 'high');
      watchlist = watchlistService.getWatchlist();
      expect(watchlist[0].priority).toBe('high');
    });

    it('should not affect other movies', () => {
      watchlistService.addToWatchlist({ ...mockMovie, id: 2 });
      watchlistService.updatePriority(1, 'high');

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist[0].priority).toBe('high');
      expect(watchlist[1].priority).toBe('medium');
    });
  });

  describe('updateNotes', () => {
    beforeEach(() => {
      watchlistService.addToWatchlist(mockMovie);
    });

    it('should update movie notes', () => {
      watchlistService.updateNotes(1, 'Great movie to watch!');

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist[0].notes).toBe('Great movie to watch!');
    });

    it('should handle empty notes', () => {
      watchlistService.updateNotes(1, '');

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist[0].notes).toBe('');
    });

    it('should not affect other movies', () => {
      watchlistService.addToWatchlist({ ...mockMovie, id: 2 });
      watchlistService.updateNotes(1, 'Note for movie 1');

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist[0].notes).toBe('Note for movie 1');
      expect(watchlist[1].notes).toBe('');
    });
  });

  describe('localStorage persistence', () => {
    it('should persist data across service instances', () => {
      watchlistService.addToWatchlist(mockMovie);

      // Simulate creating a new instance by directly accessing localStorage
      const storedData = localStorage.getItem('movie_watchlist');
      expect(storedData).toBeDefined();

      const parsedData = JSON.parse(storedData!);
      expect(parsedData).toHaveLength(1);
      expect(parsedData[0].id).toBe(1);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('movie_watchlist', 'invalid json');

      const watchlist = watchlistService.getWatchlist();
      expect(watchlist).toEqual([]);
    });
  });
});