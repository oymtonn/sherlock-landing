import { proxyDashboardRequest } from "@/lib/backend/dashboard-proxy";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ investigationId: string }> },
) {
  const { investigationId } = await params;
  return proxyDashboardRequest(
    `/api/investigations/${encodeURIComponent(investigationId)}/diff`,
  );
}
