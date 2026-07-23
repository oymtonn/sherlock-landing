import { redirect } from "next/navigation";
import { activeInstallations, getInstallations } from "../backend/client";
import { BackendError } from "../backend/errors";
import { requireUser } from "./require-user";

// Protected product surfaces require both a validated Supabase user and an
// active, backend-confirmed GitHub installation. Repository membership is
// still rechecked by every backend read endpoint.
export async function requireDashboardUser() {
  const auth = await requireUser();

  let installations;
  try {
    installations = await getInstallations(auth.accessToken);
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) redirect("/");
    throw error;
  }

  if (activeInstallations(installations).length === 0) {
    redirect("/onboarding");
  }
  return auth;
}
