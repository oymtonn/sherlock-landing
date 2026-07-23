import { proxyDashboardRequest } from "@/lib/backend/dashboard-proxy";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ repositoryId: string; issueNumber: string }>;
  },
) {
  const { repositoryId, issueNumber } = await params;
  if (!/^[0-9]+$/.test(repositoryId) || !/^[1-9][0-9]*$/.test(issueNumber)) {
    return Response.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
  }
  return proxyDashboardRequest(
    `/api/repositories/${encodeURIComponent(repositoryId)}/issues/${encodeURIComponent(issueNumber)}/investigation`,
  );
}
