import { z } from "zod";

/**
 * Runtime environment for the application.
 *
 * This schema is parsed at import time, so every variable declared as required
 * here becomes a hard requirement for the build as well as the running app.
 * Keep it to variables the *application* genuinely needs:
 *
 *  - Seed-only variables (ADMIN_EMAIL, ADMIN_PASSWORD, DIRECT_URL) are read
 *    directly by `bin/SeedAdmin.ts` and deliberately not declared here, so
 *    they never have to exist in a production deployment.
 *  - GEMINI_API_KEY is optional so unrelated static pages still build without
 *    it; the roast pipeline validates it at call time and fails with a clear
 *    message (see src/Infrastructure/Services/LlmClient.ts).
 *  - Google OAuth credentials are optional; when absent the provider is not
 *    registered and the sign-in button is hidden.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  DATABASE_URL: z.string(),
  DB_SYNCHRONIZE: z.string().default("false"),
  DB_LOGGING: z.string().default("false"),

  // Auth
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),

  // AI
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_FREE_MODEL: z.string().default("gemini-flash-lite-latest"),
  GEMINI_PREMIUM_MODEL: z.string().default("gemini-3.6-flash"),

  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform((v) => Number(v)),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string(),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE,
  DB_LOGGING: process.env.DB_LOGGING,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_FREE_MODEL: process.env.GEMINI_FREE_MODEL,
  GEMINI_PREMIUM_MODEL: process.env.GEMINI_PREMIUM_MODEL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

/**
 * Google sign-in is only offered when both credentials are present. Server-side
 * only — pass the result to client components as a prop rather than importing
 * this module from the browser bundle.
 */
export const isGoogleAuthConfigured = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
);
