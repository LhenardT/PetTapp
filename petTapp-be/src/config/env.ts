import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment-specific config
const envPath = process.env.DOTENV_CONFIG_PATH ||
  (process.env.NODE_ENV === 'production' ? '.env.prod' : '.env');
dotenv.config({ path: envPath });
console.log(`🔧 Loading environment from: ${envPath}`);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),

  // Database
  MONGODB_URI: z.string().default('mongodb://localhost:27017/'),
  MONGODB_NAME: z.string().default('pettapp-dev'),

  // Security
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),

  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),

  // API
  API_URL: z.string().url().optional(),
  CORS_ORIGIN: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((err: any) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const config = parseEnv();

export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

export default config;