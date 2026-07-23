import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Supabase → frontend callback after the GitHub-provider exchange. This is
// NOT the GitHub App installation callback (the backend owns that one).
// Success always lands on /onboarding — no caller-controlled `next`/
// `returnTo` destinations, so there is no open-redirect surface. The
// one-time code and the resulting tokens are never logged or re-emitted.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?code=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?code=oauth_exchange_failed`
    );
  }

  return NextResponse.redirect(`${origin}/onboarding`);
}
