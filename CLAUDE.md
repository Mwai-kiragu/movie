# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based movie browsing application called "Onesmus Movie Quest" that uses The Movie Database (TMDB) API. Built with Vite, TypeScript, React, shadcn/ui components, and Tailwind CSS.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview

# Run tests
npm test                    # Run tests in watch mode
npm test -- --run          # Run tests once
npm run test:ui            # Run tests with UI
npm run test:coverage      # Run tests with coverage
```

## Architecture

### Core Technologies
- **Build Tool**: Vite with React SWC plugin
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query) for server state
- **UI Components**: shadcn/ui (Radix UI primitives with Tailwind CSS)
- **Styling**: Tailwind CSS with animations
- **Testing**: Vitest with React Testing Library
- **Authentication**: Supabase Auth

### Project Structure
- `/src/components/ui/` - shadcn/ui components
- `/src/components/auth/` - Authentication components (LoginForm, ProtectedRoute, ApiKeySetup)
- `/src/components/layout/` - Layout components (Header)
- `/src/components/movies/` - Movie-related components (MovieCard, MovieGrid, SearchBar, MovieDetailModal)
- `/src/contexts/` - React contexts (AuthContext for Supabase authentication)
- `/src/services/` - API services (TMDB integration)
- `/src/pages/` - Route page components (Index, Login, Register, MovieDetails, NotFound)
- `/src/hooks/` - Custom React hooks
- `/src/types/` - TypeScript type definitions
- `/src/lib/` - Utility functions
- `/src/test/` - Test setup and utilities

### Key Configuration
- **Path Alias**: `@/` maps to `./src/` directory
- **TypeScript**: Relaxed type checking (no implicit any, unused parameters/locals, and strict null checks disabled)
- **Port**: Development server runs on port 8080
- **Testing**: Vitest configured with jsdom environment and global test utilities

### TMDB API Integration

The application requires TMDB API credentials to function. The service is located in `src/services/tmdbService.ts` and manages:
- API key and access token storage in localStorage
- Movie search, popular movies, trending movies, and movie details endpoints
- Automatic image URL transformation
- Built-in caching with 5-minute TTL
- Credential management through the UI

Default TMDB credentials are included for development, but users should:
1. Create a TMDB account at https://www.themoviedb.org/
2. Generate API credentials in their TMDB settings
3. Either update the default credentials in `src/services/tmdbService.ts` or input them through the app interface

### Supabase Authentication

The application uses Supabase for authentication with:
- Email/password authentication
- OAuth providers (Google, GitHub) support
- Protected routes via AuthContext
- Session management

Environment variables needed:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

The project is configured for Vercel deployment with:
- Automatic SPA routing configuration (`vercel.json`)
- Framework detection set to Vite
- Output directory set to `dist`

## Important Notes

- This is a Lovable project with automatic deployment capabilities
- The project uses component tagging in development mode for Lovable integration
- Maximum of 500 pages returned from TMDB API (API limitation)
- Test suite is configured with Vitest and React Testing Library