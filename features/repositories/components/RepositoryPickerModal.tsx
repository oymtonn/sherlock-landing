"use client";

import { Check, Lock, Plus, Search, Settings, Unlock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { filterRepositories } from "../github-state";
import type { ConnectedRepository, GitHubInstallation } from "../types";

export default function RepositoryPickerModal({
  repositories,
  installations,
  selectedRepositoryIds,
  onToggleRepository,
  onClose,
}: {
  repositories: ConnectedRepository[];
  installations: GitHubInstallation[];
  selectedRepositoryIds: string[];
  onToggleRepository: (repositoryId: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const filteredRepositories = filterRepositories(repositories, query);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="repository-picker-title"
        className="flex max-h-[min(720px,calc(100vh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 id="repository-picker-title" className="text-lg font-semibold">
              Add repositories
            </h2>
            <p className="mt-1 text-sm text-muted">
              Choose repositories to keep in your sidebar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close repository picker"
            className="rounded-sm p-1 text-muted hover:bg-surface hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b border-border p-4">
          <label className="relative block">
            <span className="sr-only">Search repositories</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by owner or repository name"
              autoFocus
              className="h-10 w-full rounded-sm border border-border bg-surface pl-9 pr-3 text-sm outline-none transition-colors focus:border-muted"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {filteredRepositories.length > 0 ? (
            <div className="grid gap-1">
              {filteredRepositories.map((repository) => {
                const isSelected = selectedRepositoryIds.includes(
                  repository.id,
                );

                return (
                  <button
                    key={repository.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onToggleRepository(repository.id)}
                    className="flex w-full items-center gap-3 rounded-sm px-3 py-3 text-left hover:bg-surface"
                  >
                    {repository.ownerAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={repository.ownerAvatarUrl}
                        alt=""
                        className="size-9 rounded-full bg-surface-subtle"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="size-9 rounded-full bg-surface-subtle"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {repository.fullName}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                        {repository.private ? (
                          <Lock className="size-3" aria-hidden="true" />
                        ) : (
                          <Unlock className="size-3" aria-hidden="true" />
                        )}
                        {repository.private ? "Private" : "Public"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex h-8 min-w-20 items-center justify-center gap-1.5 rounded-sm border px-2.5 text-xs font-medium ${
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-foreground"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Plus className="size-3.5" aria-hidden="true" />
                      )}
                      {isSelected ? "Added" : "Add"}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-medium">No repositories found</p>
              <p className="mt-1 text-sm text-muted">
                Try a different owner or repository name.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-subtle px-5 py-4">
          <p className="text-xs text-muted">
            {selectedRepositoryIds.length} selected
          </p>
          {installations[0] ? (
            <a
              href={installations[0].manageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            >
              <Settings className="size-3.5" aria-hidden="true" />
              Manage GitHub access
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
