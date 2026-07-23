import { proxyDashboardRequest } from "@/lib/backend/dashboard-proxy";

export const dynamic = "force-dynamic";

export async function POST() {
  return proxyDashboardRequest("/api/installations/start", {
    method: "POST",
    body: {},
  });
}
