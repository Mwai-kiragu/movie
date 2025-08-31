# Onesmus Movie Quest - Web Developer Assessment

A modern movie recommendation application built for the Onesmus Informatics Frontend Engineer Assessment. This application demonstrates proficiency in React, TypeScript, state management, API integration, and modern web development practices.

## 🎬 Features

### Core Features
- **Movie Discovery**: Browse popular and trending movies
- **Advanced Search**: Real-time search with debouncing for optimal performance
- **Detailed Movie Information**: View comprehensive movie details including cast, crew, ratings, and genres
- **Smart Recommendations**: Get personalized movie recommendations based on selected movies
- **Responsive Design**: Fully responsive UI that works seamlessly across all devices

### Technical Features
- **Authentication**: Secure authentication using Supabase with Google and GitHub providers
- **Data Caching**: 5-minute cache duration for API responses to minimize requests
- **Pagination**: Advanced pagination with ellipsis for better navigation
- **Loading States**: Skeleton screens and loading indicators for better UX
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 🚀 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query (TanStack Query) for server state
- **Authentication**: Supabase Auth
- **API Integration**: TMDB (The Movie Database) API
- **Testing**: Vitest with React Testing Library
- **CI/CD**: GitHub Actions with Vercel deployment

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Onesmus-movie-quest.git
cd Onesmus-movie-quest
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables:
   - Set up a Supabase project at https://supabase.com
   - Get TMDB API credentials from https://www.themoviedb.org/settings/api
   - Update `.env` with your credentials

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── auth/         # Authentication components
│   ├── layout/       # Layout components
│   ├── movies/       # Movie-related components
│   └── ui/           # shadcn/ui components
├── contexts/         # React contexts
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
├── pages/            # Page components
├── services/         # API services
├── test/             # Test setup and utilities
└── types/            # TypeScript type definitions
```

## 🧪 Testing

The application includes comprehensive unit tests for:
- **Services**: TMDB service with caching and error handling
- **Components**: SearchBar with debouncing functionality
- **Hooks**: useDebounce hook for optimized search

Run tests:
```bash
npm test
```

## 🚢 Deployment

### CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

1. **CI Pipeline** (`ci.yml`): Runs on all pushes and PRs
   - Linting
   - Unit tests
   - Type checking
   - Build verification

2. **Deployment Pipeline** (`deploy.yml`): Runs on production branch
   - Test suite execution
   - Production build
   - Automatic deployment to Vercel

### Manual Deployment

1. Push to the `production` branch:
```bash
git checkout production
git merge main
git push origin production
```

2. The GitHub Actions workflow will automatically:
   - Run all tests
   - Build the application
   - Deploy to Vercel

## 🌿 Git Branches

- **main**: Primary development branch
- **development**: Feature development and testing
- **production**: Production-ready code (triggers deployment)

## 📋 Assessment Requirements Checklist

✅ **Data Fetching**
- Fetch movie data from TMDB API
- Service layer for API requests with caching

✅ **Authentication**
- Supabase authentication integration
- Support for Google and GitHub providers

✅ **User Interface**
- Movie list with poster, title, and overview
- Detailed movie page with cast, crew, and ratings
- Search functionality with debouncing
- Loading states and skeleton screens
- Pagination for performance optimization

✅ **State Management**
- React Query for server state management
- Context API for authentication state

✅ **Testing**
- Unit tests for components and services
- Test setup with Vitest and React Testing Library

✅ **Code Quality**
- TypeScript throughout the application
- Clean component architecture
- Proper error handling
- Conventional commit messages

✅ **CI/CD**
- GitHub Actions pipeline for testing and linting
- Automated deployment to Vercel
- Environment-based deployments

## 🔐 Security Notes

- API credentials are stored securely in environment variables
- Authentication tokens are managed by Supabase
- No sensitive data is committed to the repository

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Create a feature branch from `development`
2. Make your changes with descriptive commits
3. Add/update tests as needed
4. Create a pull request to `development`
5. After review, merge to `development`
6. For production deployment, merge `development` to `production`

## 📄 License

This project was created for assessment purposes for Onesmus Informatics.

## 🙏 Acknowledgments

- TMDB for providing the movie database API
- Supabase for authentication services
- shadcn/ui for beautiful UI components
- Vercel for hosting services

---

Built with ❤️ for Onesmus Informatics Frontend Engineer Assessment