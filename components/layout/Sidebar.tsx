"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  FolderGit2,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import UserMenu from "@/features/auth/UserMenu";
import RepositoryPickerModal from "@/features/repositories/components/RepositoryPickerModal";
import {
  getConnectedRepositories,
  getGitHubInstallUrl,
} from "@/features/repositories/github-service";
import {
  beginGitHubInstallation,
  getAddRepositoryAction,
  getGitHubCallbackNotice,
  getSelectedRepositories,
  INITIAL_REPOSITORY_LOAD_STATE,
  removeGitHubCallbackParams,
  toggleSelectedRepositoryId,
  type RepositoryLoadState,
} from "@/features/repositories/github-state";

const SELECTED_REPOSITORY_IDS_KEY = "sherlock:selected-repository-ids";
type Notice = NonNullable<ReturnType<typeof getGitHubCallbackNotice>>;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const callbackHandled = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [repositoriesOpen, setRepositoriesOpen] = useState(true);
  const [repositoryState, setRepositoryState] = useState<RepositoryLoadState>(
    INITIAL_REPOSITORY_LOAD_STATE,
  );
  const [selectedRepositoryIds, setSelectedRepositoryIds] = useState<number[]>(
    [],
  );
  const [isRepositoryPickerOpen, setIsRepositoryPickerOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const showRepositories = repositoriesOpen;

  const loadRepositories = useCallback(async () => {
    setRepositoryState({ status: "loading" });

    try {
      const response = await getConnectedRepositories();
      setRepositoryState({ status: "ready", ...response });
      return true;
    } catch (error) {
      setRepositoryState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load GitHub repositories.",
      });
      return false;
    }
  }, []);

  useEffect(() => {
    if (callbackHandled.current) return;
    callbackHandled.current = true;

    async function initialize() {
      const loaded = await loadRepositories();
      setSelectedRepositoryIds(readSelectedRepositoryIds());
      const githubCallback = new URL(window.location.href).searchParams.get(
        "github",
      );
      const callbackNotice = getGitHubCallbackNotice(
        githubCallback || undefined,
      );

      if (callbackNotice && (callbackNotice.type === "error" || loaded)) {
        setNotice(callbackNotice);
      }

      if (callbackNotice) {
        router.replace(removeGitHubCallbackParams(window.location.href), {
          scroll: false,
        });
      }
    }

    void initialize();
  }, [loadRepositories, router]);

  async function handleInstall() {
    setNotice(null);
    setIsInstalling(true);

    try {
      await beginGitHubInstallation(getGitHubInstallUrl, (installUrl) => {
        window.location.assign(installUrl);
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to start GitHub installation.",
      });
      setIsInstalling(false);
    }
  }

  function handleAddRepository() {
    const action = getAddRepositoryAction(repositoryState);

    if (action === "install") {
      void handleInstall();
    } else if (action === "browse") {
      setIsRepositoryPickerOpen(true);
    } else if (repositoryState.status === "error") {
      void loadRepositories();
    }
  }

  function handleToggleRepository(repositoryId: number) {
    setSelectedRepositoryIds((currentIds) => {
      const nextIds = toggleSelectedRepositoryId(currentIds, repositoryId);
      window.localStorage.setItem(
        SELECTED_REPOSITORY_IDS_KEY,
        JSON.stringify(nextIds),
      );
      return nextIds;
    });
  }

  const repositories =
    repositoryState.status === "ready" ? repositoryState.repositories : [];
  const installations =
    repositoryState.status === "ready" ? repositoryState.installations : [];
  const selectedRepositories = getSelectedRepositories(
    repositories,
    selectedRepositoryIds,
  );

  const toggleRepositories = () => {
    if (!isOpen) {
      setIsOpen(true);
      setRepositoriesOpen(true);
      return;
    }

    setRepositoriesOpen((current) => !current);
  };

  return (
    <>
      {notice ? (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`fixed right-5 top-5 z-50 flex max-w-sm items-start gap-3 rounded-sm border px-4 py-3 text-sm shadow-xl ${
            notice.type === "success"
              ? "border-emerald-800 bg-emerald-950 text-emerald-100"
              : "border-red-900 bg-red-950 text-red-100"
          }`}
        >
          <span className="flex-1">{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="text-current opacity-70 hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      <aside
        className={`flex min-h-screen shrink-0 flex-col overflow-hidden px-2 py-2 text-foreground transition-[width,background-color] duration-300 ease-out ${
          isOpen
            ? "w-64 bg-surface-subtle"
            : "w-12 bg-background lg:bg-surface-subtle"
        }`}
      >
        <div
          className={`mb-4 flex h-8 items-center ${isOpen ? "gap-2" : "gap-0"}`}
        >
          <button
            type="button"
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-muted transition-colors duration-200 hover:bg-surface hover:text-foreground ${
              isOpen ? "order-2" : "order-1"
            }`}
          >
            <PanelLeftOpen
              className={`absolute h-4.5 w-4.5 transition-all duration-300 ease-out ${
                isOpen
                  ? "scale-75 rotate-90 opacity-0"
                  : "scale-100 rotate-0 opacity-100"
              }`}
            />
            <X
              className={`absolute h-4.5 w-4.5 transition-all duration-300 ease-out ${
                isOpen
                  ? "scale-100 rotate-0 opacity-100"
                  : "scale-75 -rotate-90 opacity-0"
              }`}
            />
          </button>

          <div
            className={`order-1 min-w-0 overflow-hidden transition-all duration-300 ease-out ${
              isOpen
                ? "flex-1 translate-x-0 opacity-100"
                : "max-w-0 -translate-x-2 opacity-0"
            }`}
          >
            <UserMenu />
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          <button
            type="button"
            aria-expanded={showRepositories}
            onClick={toggleRepositories}
            className="flex h-9 w-full items-center gap-3 rounded-sm px-2 text-left text-xs font-medium text-muted transition-colors duration-200 hover:bg-surface hover:text-foreground"
          >
            <FolderGit2 className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out" />
            <span
              className={`min-w-0 flex-1 whitespace-nowrap transition-all duration-300 ease-out ${
                isOpen
                  ? "max-w-40 translate-x-0 opacity-100"
                  : "max-w-0 -translate-x-2 opacity-0"
              }`}
            >
              Repositories
            </span>
            <span
              className={`shrink-0 text-muted transition-all duration-300 ease-out ${
                isOpen ? "scale-100 opacity-100" : "w-0 scale-75 opacity-0"
              }`}
            >
              {showRepositories ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </button>

          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
              isOpen && showRepositories
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="relative ml-4 py-1 pl-4">
                <span
                  aria-hidden="true"
                  className="absolute bottom-5 left-0 top-1 w-px bg-border"
                />
                {selectedRepositories.map((repository) => {
                  const href = `/dashboard/${repository.id}`;
                  // trailingSlash is on, so the live pathname ends with "/".
                  const isActive =
                    pathname === href || pathname === `${href}/`;

                  return (
                    <Link
                      key={repository.id}
                      href={href}
                      title={repository.fullName}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative flex h-8 w-full items-center rounded-sm px-2 text-left text-xs font-medium transition-colors duration-200 before:absolute before:-left-4 before:top-1/2 before:h-px before:w-3 before:bg-border hover:bg-surface hover:text-foreground ${
                        isActive ? "bg-surface text-foreground" : "text-muted"
                      }`}
                    >
                      <span className="truncate">{repository.fullName}</span>
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={handleAddRepository}
                  disabled={
                    isInstalling || repositoryState.status === "loading"
                  }
                  className="relative mt-1 flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-xs font-medium text-muted transition-colors duration-200 before:absolute before:-left-4 before:top-1/2 before:h-px before:w-3 before:bg-border hover:bg-surface hover:text-foreground disabled:cursor-wait disabled:opacity-60"
                >
                  {isInstalling ? "Opening GitHub..." : "Add repository"}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {isRepositoryPickerOpen && repositoryState.status === "ready" ? (
        <RepositoryPickerModal
          repositories={repositories}
          installations={installations}
          selectedRepositoryIds={selectedRepositoryIds}
          onToggleRepository={handleToggleRepository}
          onClose={() => setIsRepositoryPickerOpen(false)}
        />
      ) : null}
    </>
  );
}

function readSelectedRepositoryIds() {
  try {
    const storedIds = JSON.parse(
      window.localStorage.getItem(SELECTED_REPOSITORY_IDS_KEY) || "[]",
    ) as unknown;

    if (
      Array.isArray(storedIds) &&
      storedIds.every((id) => Number.isSafeInteger(id))
    ) {
      return storedIds as number[];
    }
  } catch {
    window.localStorage.removeItem(SELECTED_REPOSITORY_IDS_KEY);
  }

  return [];
}
