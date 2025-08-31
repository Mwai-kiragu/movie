### 1. Clone the Repository

```bash
git clone https://github.com/Mwai-kiragu/movie.git
cd Onesmus-movie-quest
```

### 2. Install Dependencies

```bash
npm install
```

or if you prefer yarn:

```bash
yarn install
```

## Configuration

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

### 2. Supabase Setup

1. Create a new project at [app.supabase.com](https://app.supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key
4. Update `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Enable Authentication Providers in Supabase

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Enable Email provider:
   - Turn on "Enable Email provider"
   - Configure email templates if needed
4. Enable OAuth providers (optional):
   - **Google**: 
     - Enable Google provider
     - Add your Google OAuth credentials
     - Set redirect URL: `http://localhost:8080`
   - **GitHub**:
     - Enable GitHub provider
     - Add your GitHub OAuth App credentials
     - Set redirect URL: `http://localhost:8080`

### 4. TMDB API Setup

1. Create an account at [themoviedb.org](https://www.themoviedb.org)
2. Go to Settings → API
3. Request an API key (choose "Developer" option)
4. Copy your API key and Access Token
5. Update `.env` file:

```env
# TMDB API Configuration
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_TMDB_ACCESS_TOKEN=your_tmdb_access_token
```

**Note**: The application includes default TMDB credentials for demo purposes, but it's recommended to use your own.

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Production Build

Build for production:

```bash
npm run build
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run build:dev        # Build for development
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check

# Testing
npm test                 # Run tests in watch mode
npm test -- --run        # Run tests once
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage report
```

## Testing

The project includes comprehensive unit tests for components and services.

### Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Structure

Tests are located alongside their respective components:
- `src/components/**/__tests__/` - Component tests
- `src/services/__tests__/` - Service tests
- `src/hooks/__tests__/` - Hook tests