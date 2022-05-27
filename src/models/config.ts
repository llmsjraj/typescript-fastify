import { string, z } from 'zod';

const Env = ['development', 'staging', 'production'] as const;

export const ConfigItem = z.object({
  NODE_ENV: z.enum(Env),
  API_PORT: z.number(),
  DB_HOST: z.string(),
  DB_PORT: z.number(),
  POSTGRES_USER: string(),
  POSTGRES_DB: z.string(),
  DATABASE_URL: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.number(),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
});
