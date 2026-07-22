"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { startInstallation, validateInstallationUrl } from "@/lib/backend/client";
import { safeMessageFor } from "@/lib/backend/errors";

// Starts GitHub App installation. The URL always comes from the backend
// (which binds it to this user with an opaque state) — the frontend never
// constructs it. Returns `{ error }` for useActionState on failure; the
// redirect() call sits outside the try block so its control-flow signal is
// never swallowed.
export async function startInstallationAction() {
  const { accessToken } = await requireUser();

  let installationUrl;
  try {
    const result = await startInstallation(accessToken);
    installationUrl = validateInstallationUrl(result?.url);
  } catch (error) {
    return { error: safeMessageFor(error) };
  }

  redirect(installationUrl);
}
