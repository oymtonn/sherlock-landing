export default function DashboardLoading() {
  return (
    <section
      aria-label="Loading dashboard"
      role="status"
      className="min-h-[calc(100vh-1.75rem)] animate-pulse py-4"
    >
      <div className="h-5 w-36 rounded-sm bg-surface" />
      <div className="mt-6 h-12 w-72 max-w-full rounded-sm bg-surface" />
      <div className="mt-8 h-72 rounded-sm border border-border bg-surface/60" />
    </section>
  );
}
