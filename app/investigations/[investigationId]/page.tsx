import InvestigationDetail from "@/features/repositories/components/InvestigationDetail";
import { requireDashboardUser } from "@/lib/auth/require-dashboard-user";

export default async function InvestigationPage({
  params,
}: {
  params: Promise<{ investigationId: string }>;
}) {
  await requireDashboardUser();
  const { investigationId } = await params;

  return <InvestigationDetail investigationId={investigationId} />;
}
