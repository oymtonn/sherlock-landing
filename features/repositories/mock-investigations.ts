import type {
  BotActionTimelineStep,
  BotActionTimelineStepId,
  BotActionTimelineStepStatus,
  Investigation,
  PhaseEvidence,
  ReplayPhase,
} from "./types";

/* ------------------------------------------------------------------
   MOCK INVESTIGATION FIXTURES — UI-only phase.
   Deleted wholesale once `investigation-service.ts` talks to the real
   backend. The replay video is an external public sample clip so the
   native player has something seekable to play; screenshots are local
   SVG placeholders under public/mock-investigations/.
------------------------------------------------------------------- */

const SAMPLE_REPLAY_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

/* The six investigation stages, always rendered in this order. */
const STAGE_LABELS: Record<BotActionTimelineStepId, string> = {
  open_preview: "Open preview",
  reproduce: "Reproduce",
  diagnose: "Diagnose",
  apply_fix: "Apply fix",
  verify: "Verify",
  open_pr: "Open pull request",
};

export const INVESTIGATION_STAGE_IDS = Object.keys(
  STAGE_LABELS,
) as BotActionTimelineStepId[];

function buildTimeline(
  steps: Partial<
    Record<
      BotActionTimelineStepId,
      { status: BotActionTimelineStepStatus; message?: string }
    >
  >,
): BotActionTimelineStep[] {
  return INVESTIGATION_STAGE_IDS.map((id) => ({
    id,
    label: STAGE_LABELS[id],
    status: steps[id]?.status ?? "pending",
    message: steps[id]?.message ?? null,
  }));
}

function screenshot(
  phase: ReplayPhase,
  index: number,
  status: PhaseEvidence["screenshots"][number]["status"],
  error: string | null = null,
) {
  const title = `${phase === "before" ? "Before" : "After"} capture ${index + 1}`;

  return {
    id: `${phase}:${index}`,
    title,
    status,
    url:
      status === "ready"
        ? `/mock-investigations/${phase}-capture-${index + 1}.svg`
        : null,
    error,
  };
}

function availableReplay(phase: ReplayPhase) {
  return {
    status: "available" as const,
    videoUrl: SAMPLE_REPLAY_VIDEO_URL,
    posterUrl: `/mock-investigations/${phase}-capture-1.svg`,
    error: null,
  };
}

const COMPLETED_DIFF = `diff --git a/lib/session.ts b/lib/session.ts
index 4c2ba1f..9f31e02 100644
--- a/lib/session.ts
+++ b/lib/session.ts
@@ -12,10 +12,17 @@ const SESSION_COOKIE = "sherlock_session";
 export function readSession(cookieValue: string | null) {
-  const session = JSON.parse(cookieValue);
-  return session.user;
+  if (!cookieValue) {
+    return null;
+  }
+
+  try {
+    const session = JSON.parse(cookieValue);
+    return session?.user ?? null;
+  } catch {
+    return null;
+  }
 }

 export function isSessionStale(expiresAt: number) {
   return Date.now() > expiresAt;
 }
diff --git a/lib/__tests__/session.test.ts b/lib/__tests__/session.test.ts
new file mode 100644
index 0000000..7d1c3aa
--- /dev/null
+++ b/lib/__tests__/session.test.ts
@@ -0,0 +1,11 @@
+import { readSession } from "../session";
+
+describe("readSession", () => {
+  it("returns null for a missing cookie", () => {
+    expect(readSession(null)).toBeNull();
+  });
+
+  it("returns null for a corrupted cookie", () => {
+    expect(readSession("{not json")).toBeNull();
+  });
+});
diff --git a/lib/utils/cookies.ts b/lib/cookies.ts
similarity index 92%
rename from lib/utils/cookies.ts
rename to lib/cookies.ts
index 88aa123..21bc456 100644
--- a/lib/utils/cookies.ts
+++ b/lib/cookies.ts
@@ -1,4 +1,4 @@
-import { COOKIE_DOMAIN } from "./config";
+import { COOKIE_DOMAIN } from "./utils/config";

 export function serializeCookie(name: string, value: string) {
   return \`\${name}=\${encodeURIComponent(value)}; Domain=\${COOKIE_DOMAIN}\`;
diff --git a/lib/legacy-session.ts b/lib/legacy-session.ts
deleted file mode 100644
index 3e91b77..0000000
--- a/lib/legacy-session.ts
+++ /dev/null
@@ -1,5 +0,0 @@
-// Deprecated: replaced by lib/session.ts
-export function readLegacySession(raw: string) {
-  // eslint-disable-next-line no-eval
-  return eval(\`(\${raw})\`);
-}
diff --git a/public/debug-session.png b/public/debug-session.png
index a1b2c3d..d4e5f6a 100644
Binary files a/public/debug-session.png and b/public/debug-session.png differ
`;

const ACTIVE_INVESTIGATION: Investigation = {
  investigationId: "inv-checkout-214",
  issueTitle: "TypeError: cart.items is undefined on /checkout",
  status: "active",
  error: null,
  timeline: buildTimeline({
    open_preview: {
      status: "completed",
      message: "Preview deployment ready at checkout-web-pr-preview.",
    },
    reproduce: {
      status: "completed",
      message: "Reproduced the crash with a stale cart cookie.",
    },
    diagnose: {
      status: "active",
      message: "Tracing cart state through checkout hydration...",
    },
  }),
  evidence: {
    before: {
      replay: availableReplay("before"),
      screenshots: [screenshot("before", 0, "ready")],
    },
    after: {
      replay: { status: "pending", videoUrl: null, posterUrl: null, error: null },
      screenshots: [screenshot("after", 0, "pending")],
    },
  },
  fix: null,
  pullRequest: null,
};

const COMPLETED_INVESTIGATION: Investigation = {
  investigationId: "inv-checkout-209",
  issueTitle: "Session crash on login when auth cookie is stale",
  status: "completed",
  error: null,
  timeline: buildTimeline({
    open_preview: { status: "completed" },
    reproduce: {
      status: "completed",
      message: "Crash reproduced with an expired session cookie.",
    },
    diagnose: {
      status: "completed",
      message: "readSession() parses the cookie without guarding null.",
    },
    apply_fix: { status: "completed" },
    verify: {
      status: "completed",
      message: "Login succeeds with stale, missing and corrupted cookies.",
    },
    open_pr: { status: "completed" },
  }),
  evidence: {
    before: {
      replay: availableReplay("before"),
      screenshots: [
        screenshot("before", 0, "ready"),
        screenshot("before", 1, "ready"),
      ],
    },
    after: {
      replay: availableReplay("after"),
      screenshots: [
        screenshot("after", 0, "ready"),
        screenshot("after", 1, "ready"),
      ],
    },
  },
  fix: {
    summary:
      "readSession() crashed when the auth cookie was missing or no longer valid JSON. The fix guards the null cookie, wraps parsing in a try/catch, and returns a null session so login falls back to the signed-out flow. A regression test covers both failure modes, and the legacy eval-based session reader is removed.",
    diff: COMPLETED_DIFF,
    diffTruncated: true,
  },
  pullRequest: {
    url: "https://github.com/acme/checkout-web/pull/88",
    title: "Fix session crash on login when auth cookie is stale",
  },
};

const FAILED_INVESTIGATION: Investigation = {
  investigationId: "inv-payments-87",
  issueTitle: "Stripe webhook retries exhausted on 500 responses",
  status: "failed",
  error:
    "Investigation failed while applying the fix: the sandbox could not install dependencies (registry timeout after 3 attempts).",
  timeline: buildTimeline({
    open_preview: { status: "completed" },
    reproduce: {
      status: "completed",
      message: "Webhook handler returned 500 under simulated load.",
    },
    diagnose: {
      status: "completed",
      message: "Handler awaits a non-idempotent write inside the retry loop.",
    },
    apply_fix: {
      status: "failed",
      message: "Sandbox dependency install timed out.",
    },
    verify: { status: "skipped" },
    open_pr: { status: "skipped" },
  }),
  evidence: {
    before: {
      replay: availableReplay("before"),
      screenshots: [screenshot("before", 0, "ready")],
    },
    after: {
      replay: {
        status: "unavailable",
        videoUrl: null,
        posterUrl: null,
        error: null,
      },
      screenshots: [
        screenshot(
          "after",
          0,
          "unavailable",
          "No after capture — the fix was not applied.",
        ),
      ],
    },
  },
  fix: null,
  pullRequest: {
    error: "No pull request was opened because the fix could not be verified.",
  },
};

export const MOCK_INVESTIGATIONS: Record<string, Investigation> = {
  [ACTIVE_INVESTIGATION.investigationId]: ACTIVE_INVESTIGATION,
  [COMPLETED_INVESTIGATION.investigationId]: COMPLETED_INVESTIGATION,
  [FAILED_INVESTIGATION.investigationId]: FAILED_INVESTIGATION,
};

/* Which mock issues have an investigation (repositoryId → issueNumber → id).
   Issues absent here exercise the workspace's 404 notice. */
export const MOCK_ISSUE_INVESTIGATION_IDS: Record<
  number,
  Record<number, string>
> = {
  101: {
    214: ACTIVE_INVESTIGATION.investigationId,
    209: COMPLETED_INVESTIGATION.investigationId,
  },
  102: {
    87: FAILED_INVESTIGATION.investigationId,
  },
};

export const MOCK_PREVIEW_FIXTURES: Record<
  "active" | "completed" | "failed",
  Investigation
> = {
  active: ACTIVE_INVESTIGATION,
  completed: COMPLETED_INVESTIGATION,
  failed: FAILED_INVESTIGATION,
};
