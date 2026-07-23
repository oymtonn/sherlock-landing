export default function InvestigationRouteLoading() {
  return (
    <section
      aria-label="Loading investigation"
      role="status"
      className="min-w-0 animate-pulse pb-5"
    >
      <div className="flex min-h-8 items-center justify-between gap-4">
        <div className="h-4 w-28 rounded-sm bg-surface" />
        <div className="h-5 w-20 rounded-sm bg-surface" />
      </div>
      <div className="mt-6 h-7 w-64 max-w-full rounded-sm bg-surface" />
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="h-[420px] rounded-sm border border-border bg-surface/60" />
        <div className="h-[420px] rounded-sm border border-border bg-surface/60" />
      </div>
    </section>
  );
}
