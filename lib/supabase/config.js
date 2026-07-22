// Server-side Supabase configuration. Values are read at request time so a
// misconfigured deployment fails with a clear error naming the variable —
// never the value.
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url) throw new Error("Missing required env var NEXT_PUBLIC_SUPABASE_URL");
  if (!key) {
    throw new Error(
      "Missing required env var NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }
  return { url, key };
}
