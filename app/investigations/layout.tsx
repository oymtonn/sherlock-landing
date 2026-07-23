import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { requireDashboardUser } from "@/lib/auth/require-dashboard-user";

export const metadata = { title: "Investigation" };
export const dynamic = "force-dynamic";

export default async function InvestigationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side auth gate — same contract as the dashboard shell.
  await requireDashboardUser();

  return (
    <div className="flex min-h-screen min-w-0 bg-background text-foreground lg:bg-surface-subtle">
      <Sidebar />

      {/* The root layout already renders the page <main>; this is the shell's
          content pane. */}
      <div className="min-w-0 flex-1 overflow-x-hidden bg-background px-5 py-2.5 lg:m-1 lg:rounded lg:border lg:border-border">
        {children}
      </div>
    </div>
  );
}
