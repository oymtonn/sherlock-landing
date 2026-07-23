import { proxyDashboardRequest } from "@/lib/backend/dashboard-proxy";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ investigationId: string }> },
) {
  const { investigationId } = await params;
  const etag = request.headers.get("if-none-match");
  return proxyDashboardRequest(
    `/api/investigations/${encodeURIComponent(investigationId)}`,
    { headers: etag ? { "If-None-Match": etag } : undefined },
  );
}
