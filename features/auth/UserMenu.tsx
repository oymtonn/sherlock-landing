"use client";

import { LogOut, UserCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

function getDisplayName(user: User | null) {
  const metadata = user?.user_metadata;
  const name =
    metadata?.user_name ||
    metadata?.preferred_username ||
    metadata?.name ||
    metadata?.full_name ||
    user?.email;

  return typeof name === "string" && name.trim() ? name : "GitHub user";
}

function getAvatarUrl(user: User | null) {
  const avatarUrl = user?.user_metadata?.avatar_url;

  return typeof avatarUrl === "string" && avatarUrl.startsWith("https://")
    ? avatarUrl
    : null;
}

export default function UserMenu() {
  // browser.js is untyped JS; pin the client type at this boundary.
  const supabase: SupabaseClient = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setUser(data.user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex h-8 items-center text-xs text-muted">Loading...</div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = getDisplayName(user);
  const avatarUrl = getAvatarUrl(user);

  return (
    <div className="flex h-8 min-w-0 flex-1 items-center gap-2 pl-1">
      <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-background">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <UserCircle className="h-6 w-6 text-muted" aria-hidden="true" />
        )}
      </div>
      <span className="min-w-0 max-w-32 truncate text-xs font-medium">
        {displayName}
      </span>
      {/* Sign-out goes through the existing POST-only /logout route so the
          server clears the session cookies. */}
      <form action="/logout" method="post" className="shrink-0">
        <button
          type="submit"
          aria-label="Sign out"
          className="flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
