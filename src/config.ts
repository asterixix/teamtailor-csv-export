import dotenv from 'dotenv';

dotenv.config();

/**
 * Helper function to get required environment variable
 * Throws error if the variable is not set
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Configuration object with loaded and validated environment variables
 */
export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  teamtailor: {
    apiKey: requireEnv('TEAMTAILOR_API_KEY'),
    baseUrl: process.env.TEAMTAILOR_BASE_URL || 'https://api.teamtailor.com/v1',
    apiVersion: process.env.TEAMTAILOR_API_VERSION || 'v1',
    pageSize: parseInt(process.env.TEAMTAILOR_PAGE_SIZE || '100', 10),
  },
} as const;
