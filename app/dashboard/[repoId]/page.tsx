import { notFound } from "next/navigation";
import RepositoryIssuesWorkspace from "@/features/repositories/components/RepositoryIssuesWorkspace";
import { requireDashboardUser } from "@/lib/auth/require-dashboard-user";

export default async function RepositoryPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  await requireDashboardUser();
  const { repoId } = await params;
  if (!/^[1-9]\d*$/.test(repoId)) {
    notFound();
  }

  return <RepositoryIssuesWorkspace repositoryId={repoId} />;
}
