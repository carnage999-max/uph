/**
 * This file must be imported before any Prisma usage
 * It ensures DATABASE_URL is available in the Node process
 */

import fs from 'fs';
import path from 'path';

// Check if .env.production.local exists in the current directory or nearby
const possiblePaths = [
  '.env.production.local',
  '../.env.production.local',
  '../../.env.production.local',
];

for (const filePath of possiblePaths) {
  try {
    const fullPath = path.resolve(filePath);
    if (fs.existsSync(fullPath)) {
      const envContent = fs.readFileSync(fullPath, 'utf-8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        if (line.trim() && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=');
          if (key && value && !process.env[key]) {
            process.env[key] = value.trim();
            console.log(`[env-loader] Loaded ${key} from ${fullPath}`);
          }
        }
      }
      break;
    }
  } catch (e) {
    // Continue to next path
  }
}

// Also check if DATABASE_URL is available via environment
if (!process.env.DATABASE_URL) {
  console.warn('[env-loader] WARNING: DATABASE_URL is not set');
} else {
  console.log('[env-loader] DATABASE_URL is available');
}

export {};
