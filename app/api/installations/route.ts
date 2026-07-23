import { proxyDashboardRequest } from "@/lib/backend/dashboard-proxy";

export const dynamic = "force-dynamic";

export async function GET() {
  return proxyDashboardRequest("/api/installations");
}
