import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./config";

// Refreshes the Supabase auth cookies on the way through. This keeps the
// cookie session alive; it is NOT the authorization boundary — protected
// pages re-validate with `requireUser()`.
export async function updateSession(request) {
  const { url, key } = getSupabaseEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Minimal call that triggers a token refresh when needed. The refreshed
  // cookies land on `response` via setAll above — always return that exact
  // response object.
  await supabase.auth.getUser();

  return response;
}
