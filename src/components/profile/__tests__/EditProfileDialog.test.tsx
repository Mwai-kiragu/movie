import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditProfileDialog } from '../EditProfileDialog';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/avatar.jpg' }
        }),
      }),
    },
  },
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
    username: 'testuser',
    bio: 'Test bio',
    favorite_genre: 'Action',
    avatar_url: 'https://example.com/old-avatar.jpg',
  },
};

// Mock useAuth
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      session: null,
      signOut: vi.fn(),
      loading: false,
    }),
  };
});

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

describe('EditProfileDialog', () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when open', () => {
    renderWithProviders(
      <EditProfileDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Update your profile information and preferences')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    renderWithProviders(
      <EditProfileDialog open={false} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });

  it('should populate form fields with user data', () => {
    renderWithProviders(
      <EditProfileDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.getByLabelText('Full Name')).toHaveValue('Test User');
    expect(screen.getByLabelText('Username')).toHaveValue('testuser');
    expect(screen.getByLabelText('Bio')).toHaveValue('Test bio');
    expect(screen.getByLabelText('Favorite Genre')).toHaveValue('Action');
  });

  it('should display user initials in avatar', () => {
    renderWithProviders(
      <EditProfileDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    const avatarFallback = screen.getByText('TU');
    expect(avatarFallback).toBeInTheDocument();
  });

  it('should update form fields when user types', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <EditProfileDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    const fullNameInput = screen.getByLabelText('Full Name');
    const usernameInput = screen.getByLabelText('Username');
    const bioInput = screen.getByLabelText('Bio');
    const genreInput = screen.getByLabelText('Favorite Genre');

    await user.clear(fullNameInput);
    await user.type(fullNameInput, 'New Name');
    expect(fullNameInput).toHaveValue('New Name');

    await user.clear(usernameInput);
    await user.type(usernameInput, 'newusername');
    expect(usernameInput).toHaveValue('newusername');

    await user.clear(bioInput);
    await user.type(bioInput, 'New bio text');
    expect(bioInput).toHaveValue('New bio text');

    await user.clear(genreInput);
    await user.type(genreInput, 'Drama');
    expect(genreInput).toHaveValue('Drama');
  });

  it('should call onOpenChange when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <EditProfileDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should handle form submission successfully', async () => {
    const { supabase } = await import('@/lib/supabase');
    supabase.auth.updateUser = vi.fn().mockResolvedValue({ error: null });

    // Mock window.location.reload
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    const user = userEvent.setup();

    renderWithProviders(
      <EditProfileDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    const fullNameInput = screen.getByLabelText('Full Name');
    await user.clear(fullNameInput);
    await user.type(fullNameInput, 'Updated Name');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: {
          full_name: 'Updated Name',
          username: 'testuser',
          bio: 'Test bio',
          favorite_genre: 'Action',
          avatar_url: 'https://example.com/old-avatar.jpg',
        },
      });
    });
  });

  it('should handle form submission error', async () => {
    const { supabase } = await import('@/lib/supabase');
    supabase.auth.updateUser = vi.fn().mockResolvedValue({
      error: new Error('Update failed')
    });

    const user = userEvent.setup();
    renderWithProviders(
      <EditProfileDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalled();
    });
  });

  it('should disable buttons when loading', async () => {
    const { supabase } = await import('@/lib/supabase');
    supabase.auth.updateUser = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const user = userEvent.setup();
    renderWithProviders(
      <EditProfileDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('should handle avatar upload', async () => {
    const { supabase } = await import('@/lib/supabase');
    const uploadMock = vi.fn().mockResolvedValue({ error: null });
    const getPublicUrlMock = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/new-avatar.jpg' }
    });

    supabase.storage.from = vi.fn().mockReturnValue({
      upload: uploadMock,
      getPublicUrl: getPublicUrlMock,
    });

    renderWithProviders(
      <EditProfileDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });

    await waitFor(() => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(uploadMock).toHaveBeenCalled();
    });
  });

  it('should reject large files', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <EditProfileDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Create a file larger than 5MB
    const largeFile = new File(
      [new ArrayBuffer(6 * 1024 * 1024)],
      'large.jpg',
      { type: 'image/jpeg' }
    );

    await waitFor(() => {
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
    });

    // The component should show an error for files over 5MB
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
    });
  });

  it('should handle avatar upload error', async () => {
    const { supabase } = await import('@/lib/supabase');
    const uploadMock = vi.fn().mockResolvedValue({
      error: new Error('Upload failed')
    });

    supabase.storage.from = vi.fn().mockReturnValue({
      upload: uploadMock,
      getPublicUrl: vi.fn(),
    });

    renderWithProviders(
      <EditProfileDialog open={true} onOpenChange={mockOnOpenChange} />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });

    await waitFor(() => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(uploadMock).toHaveBeenCalled();
    });
  });
});