import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground lg:bg-surface-subtle">
      <Sidebar />

      {/* The root layout already renders the page <main>; this is the shell's
          content pane. */}
      <div className="flex-1 bg-background px-5 py-2.5 lg:m-1 lg:rounded lg:border lg:border-border">
        {children}
      </div>
    </div>
  );
}
