### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Onesmus-movie-quest.git
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

## ⚙️ Configuration

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

## 🏃‍♂️ Running the Application

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

Preview the production build:

```bash
npm run preview
```

## 📁 Project Structure

```
Onesmus-movie-quest/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/          # Authentication components
│   │   ├── layout/        # Layout components (Header, Footer)
│   │   ├── movies/        # Movie-related components
│   │   └── ui/            # shadcn/ui components
│   ├── contexts/          # React contexts (AuthContext)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries and configurations
│   ├── pages/             # Page components
│   ├── services/          # API services (TMDB integration)
│   ├── test/              # Test setup and utilities
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── .github/
│   └── workflows/         # GitHub Actions CI/CD pipelines
├── .env.example           # Environment variables template
├── package.json           # Project dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vitest.config.ts       # Vitest test configuration
```

## 📜 Available Scripts

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

## 🧪 Testing

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

## 🚢 Deployment

### GitHub Actions CI/CD

The project includes GitHub Actions workflows for:
- **CI Pipeline**: Runs on all pushes and PRs (linting, testing, type checking)
- **Deployment Pipeline**: Deploys to production on merge to `production` branch

### Manual Deployment to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project

### Environment Variables for Production

Make sure to set the following environment variables in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_TMDB_API_KEY`
- `VITE_TMDB_ACCESS_TOKEN`

## 🌿 Git Workflow

The project uses three main branches:
- `main` - Primary development branch
- `development` - Feature development and testing
- `production` - Production-ready code (triggers deployment)

### Creating a Feature

```bash
git checkout development
git checkout -b feature/your-feature-name
# Make your changes
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
# Create a pull request to development
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes using conventional commits (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Build process or auxiliary tool changes

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. **Port 8080 is already in use**
```bash
# Kill the process using port 8080
lsof -ti:8080 | xargs kill -9
# Or change the port in vite.config.ts
```

#### 2. **Supabase authentication not working**
- Verify your Supabase URL and anon key in `.env`
- Check if email confirmation is required in Supabase settings
- Ensure redirect URLs are correctly configured in Supabase

#### 3. **TMDB API errors**
- Verify your TMDB API key and access token
- Check if your TMDB account is active
- Ensure you're not exceeding rate limits

#### 4. **Build fails with TypeScript errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. **Tests failing**
```bash
# Clear test cache
npm test -- --clearCache
# Run tests with no cache
npm test -- --no-cache
```

### Getting Help

If you encounter issues not covered here:
1. Check existing [GitHub Issues](https://github.com/yourusername/Onesmus-movie-quest/issues)
2. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)

## 📄 License

This project was created for the Onesmus Informatics Frontend Engineer Assessment.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the movie database API
- [Supabase](https://supabase.com/) for authentication services
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Vercel](https://vercel.com/) for hosting services
- Onesmus Informatics for the assessment opportunity

## 📞 Contact

For questions or support regarding this project, please open an issue on GitHub.

---

Built with ❤️ for Onesmus Informatics Frontend Engineer Assessment