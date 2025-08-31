import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tmdbService } from '../tmdbService';

describe('TMDBService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tmdbService.clearCache();
    localStorage.clear();
  });

  describe('Credentials Management', () => {
    it('should set and retrieve credentials', () => {
      const apiKey = 'test-api-key';
      const accessToken = 'test-access-token';
      
      tmdbService.setCredentials(apiKey, accessToken);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('tmdb_api_key', apiKey);
      expect(localStorage.setItem).toHaveBeenCalledWith('tmdb_access_token', accessToken);
    });

    it('should check if credentials exist', () => {
      localStorage.getItem = vi.fn().mockReturnValue('valid-token');
      
      expect(tmdbService.hasCredentials()).toBe(true);
    });

    it('should always return true due to default credentials', () => {
      localStorage.getItem = vi.fn().mockReturnValue(null);
      
      // The service always returns true because it has default credentials
      expect(tmdbService.hasCredentials()).toBe(true);
    });

    it('should clear credentials', () => {
      tmdbService.clearCredentials();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('tmdb_api_key');
      expect(localStorage.removeItem).toHaveBeenCalledWith('tmdb_access_token');
    });
  });

  describe('API Requests', () => {
    it('should fetch popular movies', async () => {
      const mockResponse = {
        page: 1,
        results: [
          {
            id: 1,
            title: 'Test Movie',
            poster_path: '/test.jpg',
            overview: 'Test overview',
            release_date: '2024-01-01',
            vote_average: 8.5,
            vote_count: 100,
          },
        ],
        total_pages: 10,
        total_results: 100,
      };

      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await tmdbService.getPopularMovies(1);

      expect(result.results).toHaveLength(1);
      expect(result.results[0].title).toBe('Test Movie');
      expect(result.page).toBe(1);
    });

    it('should search for movies', async () => {
      const mockResponse = {
        page: 1,
        results: [
          {
            id: 2,
            title: 'Search Result',
            poster_path: '/search.jpg',
            overview: 'Search overview',
            release_date: '2024-02-01',
            vote_average: 7.5,
            vote_count: 50,
          },
        ],
        total_pages: 5,
        total_results: 50,
      };

      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await tmdbService.searchMovies('search', 1);

      expect(result.results).toHaveLength(1);
      expect(result.results[0].title).toBe('Search Result');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search/movie'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      await expect(tmdbService.getPopularMovies()).rejects.toThrow(
        'Invalid API credentials'
      );
    });
  });

  describe('Caching', () => {
    it('should cache API responses', async () => {
      const mockResponse = {
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0,
      };

      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // First call
      await tmdbService.getPopularMovies(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await tmdbService.getPopularMovies(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should clear cache', async () => {
      const mockResponse = {
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0,
      };

      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await tmdbService.getPopularMovies(1);
      tmdbService.clearCache();
      await tmdbService.getPopularMovies(1);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});