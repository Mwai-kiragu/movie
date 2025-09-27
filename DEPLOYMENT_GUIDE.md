# Deployment Guide for Onesmus Movie Quest

## Fixing Email Verification Redirect Issues

When deploying to production (Netlify, Vercel, etc.), you need to configure Supabase with the correct redirect URLs.

### 1. Update Supabase Authentication Settings

Go to your Supabase project dashboard:

1. **Navigate to Authentication → URL Configuration**
2. **Add the following URLs to "Redirect URLs":**
   - Production: `https://onesmus-movie.netlify.app/`
   - Development: `http://localhost:5173/`
   - Alternative dev: `http://localhost:3000/`

3. **Set "Site URL" to:**
   - Production: `https://onesmus-movie.netlify.app`

### 2. Environment Variables

Make sure these environment variables are set in your hosting platform:

#### For Netlify:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# TMDB API Configuration
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_TMDB_ACCESS_TOKEN=your_tmdb_read_access_token_here
```

#### For Vercel:
Same environment variables as above, but set in Vercel dashboard under Project Settings → Environment Variables.

### 3. Build Configuration

The application automatically detects the environment and uses the correct redirect URLs:

- **Development**: Uses `http://localhost:5173/`
- **Production**: Uses the current domain (e.g., `https://onesmus-movie.netlify.app/`)

### 4. Common Issues and Solutions

#### Issue: Email verification still redirects to localhost

**Solutions:**
1. **Clear browser cache and cookies**
2. **Check Supabase Auth settings:**
   - Ensure production URL is in "Redirect URLs"
   - Ensure "Site URL" is set to production domain
3. **Re-deploy the application** after updating Supabase settings
4. **Wait 5-10 minutes** for Supabase settings to propagate

#### Issue: OAuth providers redirect to localhost

**Solutions:**
1. **Update OAuth provider settings** (Google, GitHub) with production callback URLs
2. **Ensure Supabase Site URL** matches your production domain exactly

### 5. Testing the Fix

1. **Deploy the updated code** to your hosting platform
2. **Register a new user** or request password reset
3. **Check email and click verification link**
4. **Verify redirect** goes to your production domain, not localhost

### 6. Docker Deployment

If using Docker, the application will automatically use the container's domain for redirects.

#### Build and run with Docker Compose:
```bash
# Production build
docker-compose up --build movie-quest-app

# Development build
docker-compose --profile dev up --build movie-quest-dev
```

## Additional Notes

- The application uses `window.location.origin` to automatically detect the current domain
- No hardcoded URLs in the authentication flow
- Works with any domain without code changes
- Environment-aware configuration ensures proper behavior in all environments