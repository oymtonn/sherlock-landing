"use client";

import { createBrowserClient } from "@supabase/ssr";

let client = null;

// One shared browser client for the whole app. Auth-only: the frontend never
// queries application data (installations, investigations, replays) from
// Supabase directly — that all goes through the Sherlock backend.
export function getSupabaseBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }

  client = createBrowserClient(url, key);
  return client;
}
