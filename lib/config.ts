/**
 * Server-side configuration that loads DATABASE_URL from:
 * 1. Environment variables (set by Amplify)
 * 2. .env files (for local development)
 * 3. Falls back to error if in production
 */

let databaseUrl: string | undefined;

// Try to get from process.env (should be set by Amplify at build time or runtime)
if (process.env.DATABASE_URL) {
  databaseUrl = process.env.DATABASE_URL;
}

// For local development, .env.local is loaded automatically by Next.js
if (!databaseUrl && process.env.NODE_ENV === 'development') {
  databaseUrl = process.env.DATABASE_URL;
}

// In production on Amplify, DATABASE_URL must be available
if (!databaseUrl && process.env.NODE_ENV === 'production') {
  console.error(
    'CRITICAL: DATABASE_URL not found in production environment. ' +
    'Make sure it is set in AWS Amplify Console > App settings > Environment variables'
  );
}

export const config = {
  databaseUrl,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
