import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../supabase/server";

// Server-only auth gate for protected pages, actions and route handlers.
// Authorization comes from `getUser()` (validated against Supabase);
// `getSession()` is used afterwards only to obtain the access token that
// gets forwarded to the Sherlock backend. The token must never reach a
// Client Component.
export async function requireUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/");

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) redirect("/");

  return { user, accessToken };
}
