import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('should render search input with placeholder', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} placeholder="Search movies..." />);
    
    const input = screen.getByPlaceholderText('Search movies...');
    expect(input).toBeInTheDocument();
  });

  it('should call onSearch with debounced value', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    
    render(<SearchBar onSearch={onSearch} />);
    
    const input = screen.getByPlaceholderText('Search movies...');
    await user.type(input, 'test');
    
    // Should not call immediately
    expect(onSearch).not.toHaveBeenCalledWith('test');
    
    // Wait for debounce
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test');
    }, { timeout: 600 });
  });

  it('should display clear button when there is text', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    
    render(<SearchBar onSearch={onSearch} />);
    
    const input = screen.getByPlaceholderText('Search movies...');
    
    // No clear button initially
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    
    // Type text
    await user.type(input, 'test');
    
    // Clear button should appear
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  it('should clear search when clear button is clicked', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    
    render(<SearchBar onSearch={onSearch} />);
    
    const input = screen.getByPlaceholderText('Search movies...');
    await user.type(input, 'test');
    
    // Wait for clear button to appear
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    
    // Click clear button
    const clearButton = screen.getByRole('button');
    await user.click(clearButton);
    
    // Input should be cleared
    expect(input).toHaveValue('');
    
    // onSearch should be called with empty string
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('should render with initial value', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} initialValue="initial" />);
    
    const input = screen.getByPlaceholderText('Search movies...');
    expect(input).toHaveValue('initial');
  });
});