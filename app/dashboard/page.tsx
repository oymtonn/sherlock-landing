export default function RepositoriesPage() {
  return (
    <section className="flex min-h-[calc(100vh-1.75rem)] items-center justify-center">
      <div className="max-w-sm text-center">
        <h1 className="text-sm font-semibold text-foreground">
          Select a repository
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Open the sidebar and choose a repository to view its issues.
        </p>
      </div>
    </section>
  );
}
