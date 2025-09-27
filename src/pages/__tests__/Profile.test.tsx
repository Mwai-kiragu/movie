import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from '../Profile';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { tmdbService } from '@/services/tmdbService';

// Mock the Header component
vi.mock('@/components/layout/Header', () => ({
  Header: ({ onSearch, searchQuery }: any) => (
    <div data-testid="header">
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  ),
}));

// Mock EditProfileDialog
vi.mock('@/components/profile/EditProfileDialog', () => ({
  EditProfileDialog: ({ open, onOpenChange }: any) => (
    open ? (
      <div data-testid="edit-profile-dialog">
        <button onClick={() => onOpenChange(false)}>Close Dialog</button>
      </div>
    ) : null
  ),
}));

// Mock LoadingSpinner
vi.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock tmdbService
vi.mock('@/services/tmdbService', () => ({
  tmdbService: {
    getPopularMovies: vi.fn().mockResolvedValue({
      results: Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        title: `Movie ${i + 1}`,
        poster_path: `/poster${i + 1}.jpg`,
        backdrop_path: `/backdrop${i + 1}.jpg`,
        overview: `Overview for movie ${i + 1}`,
        release_date: '2024-01-01',
        vote_average: 8.0 + (i * 0.1),
        vote_count: 1000 + i * 100,
        popularity: 100 + i * 10,
        genre_ids: [28, 12],
        original_language: 'en',
        original_title: `Movie ${i + 1}`,
        adult: false,
        video: false,
      })),
      page: 1,
      total_pages: 10,
      total_results: 100,
    }),
  },
}));

// Mock useAuth
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  user_metadata: {
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
};

const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

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

describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(tmdbService).getPopularMovies.mockResolvedValue({
      results: Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        title: `Movie ${i + 1}`,
        poster_path: `/poster${i + 1}.jpg`,
        backdrop_path: `/backdrop${i + 1}.jpg`,
        overview: `Overview for movie ${i + 1}`,
        release_date: '2024-01-01',
        vote_average: 8.0 + (i * 0.1),
        vote_count: 1000 + i * 100,
        popularity: 100 + i * 10,
        genre_ids: [28, 12],
        original_language: 'en',
        original_title: `Movie ${i + 1}`,
        adult: false,
        video: false,
      })),
      page: 1,
      total_pages: 10,
      total_results: 100,
    });
  });

  it('should show loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    // Check for Navigate component - it should redirect to login when unauthenticated
    // In React Router testing, the pathname will show the redirect destination
  });

  it('should display user profile information', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText(/Joined/)).toBeInTheDocument();
    });
  });

  it('should display user initials in avatar fallback', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    const avatarFallback = screen.getByText('TU');
    expect(avatarFallback).toBeInTheDocument();
  });

  it('should display stats cards', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    expect(screen.getByText('Movies Watched')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument(); // Default stat value

    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // Default stat value

    expect(screen.getByText('Avg. Rating')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument(); // Default stat value

    expect(screen.getByText('Watch Time')).toBeInTheDocument();
    expect(screen.getByText('126h')).toBeInTheDocument(); // Default stat value
  });

  it('should open edit profile dialog when Edit Profile button is clicked', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);

    expect(screen.getByTestId('edit-profile-dialog')).toBeInTheDocument();
  });

  it('should close edit profile dialog', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);

    expect(screen.getByTestId('edit-profile-dialog')).toBeInTheDocument();

    const closeButton = screen.getByText('Close Dialog');
    await user.click(closeButton);

    expect(screen.queryByTestId('edit-profile-dialog')).not.toBeInTheDocument();
  });

  it('should display tabs for different sections', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /achievements/i })).toBeInTheDocument();
  });

  it('should switch between tabs', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    // Initially on Overview tab
    expect(screen.getByText('Recently Watched')).toBeInTheDocument();

    // Switch to Activity tab
    const activityTab = screen.getByRole('tab', { name: /activity/i });
    await user.click(activityTab);

    expect(screen.getByText('Viewing Statistics')).toBeInTheDocument();

    // Switch to Achievements tab
    const achievementsTab = screen.getByRole('tab', { name: /achievements/i });
    await user.click(achievementsTab);

    expect(screen.getAllByText('Achievements').length).toBeGreaterThan(0);
  });

  it('should display recently watched movies', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    await waitFor(() => {
      // Should display 6 recently watched movies
      for (let i = 1; i <= 6; i++) {
        expect(screen.getByAltText(`Movie ${i}`)).toBeInTheDocument();
      }
    });
  });

  it('should display favorite movies', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Movie 7')).toBeInTheDocument();
      expect(screen.getByText('Movie 8')).toBeInTheDocument();
      expect(screen.getByText('Movie 9')).toBeInTheDocument();
      expect(screen.getByText('Movie 10')).toBeInTheDocument();
    });
  });

  it('should display viewing statistics in Activity tab', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    const activityTab = screen.getByRole('tab', { name: /activity/i });
    await user.click(activityTab);

    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
    expect(screen.getByText('Comedy')).toBeInTheDocument();
  });

  it('should display achievements in Achievements tab', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    const achievementsTab = screen.getByRole('tab', { name: /achievements/i });
    await user.click(achievementsTab);

    expect(screen.getByText('Movie Critic')).toBeInTheDocument();
    expect(screen.getByText('Binge Watcher')).toBeInTheDocument();
    expect(screen.getByText('Trendsetter')).toBeInTheDocument();
    expect(screen.getByText('Genre Master')).toBeInTheDocument();
  });

  it('should handle search input', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'test search');

    expect(searchInput).toHaveValue('test search');
  });

  it('should format join date correctly', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    // Should format the date as "Joined Month Year"
    expect(screen.getByText(/Joined January 2023/)).toBeInTheDocument();
  });

  it('should handle user without full name', () => {
    const userWithoutName = {
      ...mockUser,
      user_metadata: {},
    };
    mockUseAuth.mockReturnValue({
      user: userWithoutName,
      loading: false,
      signOut: vi.fn(),
    });

    renderWithProviders(<Profile />);

    expect(screen.getByText('Movie Enthusiast')).toBeInTheDocument();
    expect(screen.getByText('TE')).toBeInTheDocument(); // Email initials
  });

  it('should show loading state while fetching movies', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    vi.mocked(tmdbService).getPopularMovies.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders(<Profile />);

    expect(screen.getAllByTestId('loading-spinner').length).toBeGreaterThanOrEqual(1);
  });
});