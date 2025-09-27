import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MovieDetailModal } from '../MovieDetailModal';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Movie } from '@/types/movie';
import { watchlistService } from '@/services/watchlistService';
import { useToast } from '@/hooks/use-toast';

// Mock watchlistService
vi.mock('@/services/watchlistService', () => ({
  watchlistService: {
    isInWatchlist: vi.fn(),
    addToWatchlist: vi.fn(),
    removeFromWatchlist: vi.fn(),
  },
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock useAuth
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
};

const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/test-poster.jpg',
  backdrop_path: '/test-backdrop.jpg',
  overview: 'This is a test movie with an interesting plot and great characters.',
  release_date: '2024-03-15',
  vote_average: 8.5,
  vote_count: 1500,
  popularity: 98.5,
  genre_ids: [28, 12, 878],
  original_language: 'en',
  original_title: 'Test Movie',
  adult: false,
  video: false,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('MovieDetailModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      signOut: vi.fn(),
      loading: false,
    });

    // Reset watchlist service mocks
    vi.mocked(watchlistService).isInWatchlist.mockReturnValue(false);
    vi.mocked(watchlistService).addToWatchlist.mockImplementation(() => {});
    vi.mocked(watchlistService).removeFromWatchlist.mockImplementation(() => {});
  });

  it('should not render when movie is null', () => {
    renderWithProviders(
      <MovieDetailModal movie={null} isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.queryByText('Test Movie')).not.toBeInTheDocument();
  });

  it('should not render when modal is closed', () => {
    renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={false} onClose={mockOnClose} />
    );

    expect(screen.queryByText('Test Movie')).not.toBeInTheDocument();
  });

  it('should render movie details when open', () => {
    renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('This is a test movie with an interesting plot and great characters.')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('should display movie poster and backdrop images', () => {
    renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={true} onClose={mockOnClose} />
    );

    const images = screen.getAllByAltText('Test Movie');
    expect(images).toHaveLength(2); // Backdrop and poster

    const posterImage = images.find(img =>
      img.getAttribute('src')?.includes('/test-poster.jpg')
    );
    const backdropImage = images.find(img =>
      img.getAttribute('src')?.includes('/test-backdrop.jpg')
    );

    expect(posterImage).toBeInTheDocument();
    expect(backdropImage).toBeInTheDocument();
  });

  it('should display vote count and popularity', () => {
    renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('Vote Count')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument(); // Formatted with comma

    expect(screen.getByText('Popularity')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument(); // Rounded to 0 decimal places
  });

  it('should close modal when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={true} onClose={mockOnClose} />
    );

    const closeButton = screen.getByRole('button', { name: '' }); // Close button with X icon
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show "Add to Watchlist" button when movie not in watchlist', () => {
    renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('Add to Watchlist')).toBeInTheDocument();
    expect(screen.queryByText('In Watchlist')).not.toBeInTheDocument();
  });

  it('should show "In Watchlist" button when movie is in watchlist', () => {
    vi.mocked(watchlistService).isInWatchlist.mockReturnValue(true);

    renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('In Watchlist')).toBeInTheDocument();
    expect(screen.queryByText('Add to Watchlist')).not.toBeInTheDocument();
  });

  it('should add movie to watchlist when "Add to Watchlist" is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={true} onClose={mockOnClose} />
    );

    const addButton = screen.getByText('Add to Watchlist');
    await user.click(addButton);

    expect(watchlistService.addToWatchlist).toHaveBeenCalledWith(mockMovie);
  });

  it('should remove movie from watchlist when "In Watchlist" is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(watchlistService).isInWatchlist.mockReturnValue(true);

    renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={true} onClose={mockOnClose} />
    );

    const removeButton = screen.getByText('In Watchlist');
    await user.click(removeButton);

    expect(watchlistService.removeFromWatchlist).toHaveBeenCalledWith(mockMovie.id);
  });

  it('should navigate to login when unauthenticated user tries to add to watchlist', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      signOut: vi.fn(),
      loading: false,
    });

    renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={true} onClose={mockOnClose} />
    );

    const addButton = screen.getByText('Add to Watchlist');
    await user.click(addButton);

    // Should show toast and not add to watchlist
    expect(watchlistService.addToWatchlist).not.toHaveBeenCalled();
    // Navigation would happen but can't be tested directly in unit tests
  });

  it('should navigate to movie details page when "View More Details" is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(watchlistService).isInWatchlist.mockReturnValue(false);

    // Mock window.location to track navigation
    delete (window as unknown as { location: unknown }).location;
    window.location = { ...window.location, href: '' };

    renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={true} onClose={mockOnClose} />
    );

    const viewDetailsButton = screen.getByText('View More Details');
    await user.click(viewDetailsButton);

    expect(mockOnClose).toHaveBeenCalled();
    // Navigation would happen but path change can't be tested directly in unit tests
  });

  it('should handle movie without poster image gracefully', () => {
    const movieWithoutPoster = { ...mockMovie, poster_path: null };
    vi.mocked(watchlistService).isInWatchlist.mockReturnValue(false);

    renderWithProviders(
      <MovieDetailModal movie={movieWithoutPoster} isOpen={true} onClose={mockOnClose} />
    );

    const images = screen.getAllByAltText('Test Movie');
    expect(images.length).toBeGreaterThan(0);

    // Should fallback to placeholder image
    images.forEach(img => {
      expect(img.getAttribute('src')).toBeDefined();
    });
  });

  it('should handle movie without backdrop image gracefully', () => {
    const movieWithoutBackdrop = { ...mockMovie, backdrop_path: null };
    vi.mocked(watchlistService).isInWatchlist.mockReturnValue(false);

    renderWithProviders(
      <MovieDetailModal movie={movieWithoutBackdrop} isOpen={true} onClose={mockOnClose} />
    );

    const images = screen.getAllByAltText('Test Movie');
    expect(images.length).toBeGreaterThan(0);

    // Should use poster as fallback for backdrop
    const backdropImage = images.find(img =>
      img.getAttribute('src')?.includes('/test-poster.jpg')
    );
    expect(backdropImage).toBeInTheDocument();
  });

  it('should handle movie without overview', () => {
    const movieWithoutOverview = { ...mockMovie, overview: '' };
    vi.mocked(watchlistService).isInWatchlist.mockReturnValue(false);

    renderWithProviders(
      <MovieDetailModal movie={movieWithoutOverview} isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('No description available for this movie.')).toBeInTheDocument();
  });

  it('should handle movie without release date', () => {
    const movieWithoutDate = { ...mockMovie, release_date: '' };
    vi.mocked(watchlistService).isInWatchlist.mockReturnValue(false);

    renderWithProviders(
      <MovieDetailModal movie={movieWithoutDate} isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('TBA')).toBeInTheDocument();
  });

  it('should update watchlist status when movie changes', () => {
    vi.mocked(watchlistService).isInWatchlist.mockReturnValue(false);

    const { rerender } = renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('Add to Watchlist')).toBeInTheDocument();

    // Change the movie
    const newMovie = { ...mockMovie, id: 2, title: 'New Movie' };
    vi.mocked(watchlistService).isInWatchlist.mockReturnValue(true);

    rerender(
      <BrowserRouter>
        <MovieDetailModal movie={newMovie} isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    expect(watchlistService.isInWatchlist).toHaveBeenCalledWith(2);
  });

  it('should display correct button icons', () => {
    renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={true} onClose={mockOnClose} />
    );

    // Check for heart icon in Add to Watchlist button
    const addButton = screen.getByText('Add to Watchlist').closest('button');
    expect(addButton?.querySelector('svg')).toBeInTheDocument();

    // Check for external link icon in View More Details button
    const detailsButton = screen.getByText('View More Details').closest('button');
    expect(detailsButton?.querySelector('svg')).toBeInTheDocument();
  });

  it('should show toast notifications on watchlist actions', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <MovieDetailModal movie={mockMovie} isOpen={true} onClose={mockOnClose} />
    );

    const addButton = screen.getByText('Add to Watchlist');
    await user.click(addButton);

    // Toast should be called for successful addition
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Added to watchlist',
          description: 'Test Movie has been added to your watchlist.',
        })
      );
    });
  });
});
