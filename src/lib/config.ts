export const getRedirectUrl = () => {
  // Check if we're running in development
  const isDevelopment = import.meta.env.DEV;

  // Get the current origin
  const origin = window.location.origin;

  // For production builds, always use the current origin
  // This ensures the correct domain is used whether it's Netlify, Vercel, or any other host
  if (!isDevelopment) {
    return `${origin}/`;
  }

  // For development, use localhost
  return `${origin}/`;
};

export const config = {
  // Site URL for production deployment
  siteUrl: 'https://onesmus-movie.netlify.app',

  // Development URL
  devUrl: 'http://localhost:5173',

  // Get the appropriate base URL
  getBaseUrl: () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return import.meta.env.DEV ? 'http://localhost:5173' : 'https://onesmus-movie.netlify.app';
  },

  // Get redirect URL for auth
  getRedirectUrl,
};