import { createBrowserClient } from "@supabase/ssr";
import { DB_SCHEMA, SUPABASE_KEY } from "./config";

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, SUPABASE_KEY, {
    db: { schema: DB_SCHEMA },
  });
}
