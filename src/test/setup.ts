import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'https://cmigqnzurekjmlonnvmz.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtaWdxbnp1cmVram1sb25udm16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTAyNTcsImV4cCI6MjA3MjIyNjI1N30.L4p6FzTSkpfkrHpY0gwExwlpCqhUjB59V4Om5cidKg8');

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'> = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});