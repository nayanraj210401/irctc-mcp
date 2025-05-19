import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

const envSchema = z.object({
  RAPIDAPI_KEY: isDevelopment
    ? z.string().default('development_key')
    : z.string().min(1, 'RapidAPI key is required'),
  RAPIDAPI_HOST: z.string().default('irctc1.p.rapidapi.com'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

export const config = envSchema.parse({
  RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
  RAPIDAPI_HOST: process.env.RAPIDAPI_HOST,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
});

export type Config = typeof config;

// Log a warning if using development key
if (config.RAPIDAPI_KEY === 'development_key') {
  console.warn('⚠️ Using development API key. API calls will not work in production.');
}
