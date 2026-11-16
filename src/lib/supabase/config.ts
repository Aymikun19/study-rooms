/**
 * All of this app's tables live in their own Postgres schema ("studyrooms"), so several
 * demo apps can share one free Supabase project without their tables colliding.
 * The schema must be listed under Supabase → Settings → API → Exposed schemas.
 */
export const DB_SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || "studyrooms";

/** Public URL of the app: explicit env var, else Vercel's production URL, else localhost. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000";

/** Public (anon / publishable) key. The Vercel Supabase integration names it NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. */
export const SUPABASE_KEY = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;
