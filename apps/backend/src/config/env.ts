import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(32),

  FRONTEND_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);