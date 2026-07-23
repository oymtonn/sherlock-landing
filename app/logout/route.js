import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Logout is POST-only — never a state-changing GET link. signOut() clears
// the auth cookies through the server client's cookie adapter.
export async function POST(request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
