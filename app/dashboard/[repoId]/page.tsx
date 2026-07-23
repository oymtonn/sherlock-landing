import { notFound } from "next/navigation";
import RepositoryIssuesWorkspace from "@/features/repositories/components/RepositoryIssuesWorkspace";

export default async function RepositoryPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  if (!/^[1-9]\d*$/.test(repoId) || !Number.isSafeInteger(Number(repoId))) {
    notFound();
  }

  return <RepositoryIssuesWorkspace repositoryId={Number(repoId)} />;
}
