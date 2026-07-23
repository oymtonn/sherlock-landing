import { proxyDashboardRequest } from "@/lib/backend/dashboard-proxy";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ repositoryId: string }> },
) {
  const { repositoryId } = await params;
  if (!/^[0-9]+$/.test(repositoryId)) {
    return Response.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
  }

  const incoming = new URL(request.url).searchParams;
  const outgoing = new URLSearchParams();
  for (const key of ["state", "page", "perPage"]) {
    const value = incoming.get(key);
    if (value !== null) outgoing.set(key, value);
  }
  const query = outgoing.size > 0 ? `?${outgoing.toString()}` : "";
  return proxyDashboardRequest(
    `/api/repositories/${encodeURIComponent(repositoryId)}/issues${query}`,
  );
}
