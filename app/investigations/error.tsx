"use client";

export default function InvestigationRouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section>
      <div className="flex min-h-8 items-center">
        <h1 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Investigation
        </h1>
      </div>
      <div className="mt-6 max-w-3xl rounded-sm border border-red-900/70 bg-red-950/30 p-5">
        <h2 className="text-lg font-semibold text-red-100">
          Sherlock is temporarily unavailable
        </h2>
        <p className="mt-2 text-sm text-red-200">
          The investigation could not be loaded. Try the request again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 h-9 rounded-sm border border-border px-3 text-sm font-semibold hover:bg-surface"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
