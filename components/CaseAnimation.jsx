"use client";

import { useEffect, useRef, useState } from "react";

// The hero motion asset, built in code instead of video so every panel is a
// crisp, real-looking artifact. Seven stages, auto-advancing, clickable rail,
// loops forever. Respects prefers-reduced-motion (no auto-advance).

const STAGES = [
  { id: "issue", label: "Issue filed" },
  { id: "investigate", label: "Investigate" },
  { id: "map", label: "Map repo" },
  { id: "reproduce", label: "Reproduce" },
  { id: "patch", label: "Patch" },
  { id: "verify", label: "Verify" },
  { id: "pr", label: "Open PR" },
];

const STAGE_MS = 2600;
const TICK_MS = 40;

export default function CaseAnimation() {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const t = setInterval(() => {
      if (pausedRef.current) return;
      setProgress((p) => {
        if (p >= 100) {
          setStage((s) => (s + 1) % STAGES.length);
          return 0;
        }
        return p + (TICK_MS / STAGE_MS) * 100;
      });
    }, TICK_MS);
    return () => clearInterval(t);
  }, []);

  const goto = (i) => {
    setStage(i);
    setProgress(0);
  };

  return (
    <div
      className="panel"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <div className="panel-bar">
        <div className="panel-dots">
          <i /> <i /> <i />
        </div>
        <span>sherlock · investigation SLK-4127</span>
        <span className="chip chip-warn ml-auto">
          live
        </span>
      </div>

      <div className="case">
        <div className="case-rail">
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              className={`case-step ${i === stage ? "active" : ""} ${
                i < stage ? "done" : ""
              }`}
              onClick={() => goto(i)}
              style={{
                background: "none",
                border: "none",
                borderLeft: undefined,
                cursor: "pointer",
                textAlign: "left",
                font: "inherit",
              }}
            >
              <span className="dot" />
              {s.label}
            </button>
          ))}
        </div>

        <div className="case-stage">
          {/* 0 — GitHub issue appears */}
          <Scene on={stage === 0}>
            <div className="gh-card">
              <div className="gh-card-head">
                <span className="chip">issue #482</span>
                <span>opened by dana-oh</span>
              </div>
              <div className="gh-title">
                Bug: Completed tasks still show in Active filter
              </div>
              <div className="gh-body">
                Mark any task done, switch to the Active tab — the completed
                task is still listed until a hard refresh.
              </div>
              <div className="gh-labels">
                <span className="chip chip-red">bug</span>
                <span className="chip">frontend</span>
              </div>
            </div>
            <div className="term mt-3">
              <span className="t-blue">dana-oh</span> commented:{" "}
              <span className="t-warn">/sherlock investigate</span>
            </div>
          </Scene>

          {/* 1 — investigation starts */}
          <Scene on={stage === 1}>
            <div className="term">
              <div>
                <span className="t-faint">[00:00.4]</span>{" "}
                <span className="t-warn">sherlock</span> investigation queued
                · SLK-4127
              </div>
              <div>
                <span className="t-faint">[00:01.1]</span> permission check:
                dana-oh has <span className="t-green">write</span> — authorized
              </div>
              <div>
                <span className="t-faint">[00:02.8]</span> sandbox up · cloning
                repo at <span className="t-blue">main@e4f21c9</span>
              </div>
              <div>
                <span className="t-faint">[00:04.2]</span> reading issue #482 ·
                extracting reproduction plan…
              </div>
              <div>
                <span className="t-faint">[00:05.0]</span>{" "}
                <span className="t-warn">▸ investigation started</span>
              </div>
            </div>
          </Scene>

          {/* 2 — Graphify repo graph */}
          <Scene on={stage === 2}>
            <RepoGraph />
            <div
              className="mono dim text-[12px] mt-2.5 text-center"
            >
              graphify · 6 of 2,314 nodes relevant to #482
            </div>
          </Scene>

          {/* 3 — browser replay reproduces the bug */}
          <Scene on={stage === 3}>
            <div className="replay">
              <div className="replay-frame">
                <div className="rf-bar w-[60%]" />
                <div className="rf-row" />
                <div className="rf-row" />
                <div className="rf-row" />
                <div className="rf-cap">1 · mark task done</div>
              </div>
              <div className="replay-frame">
                <div className="rf-bar w-[45%]" />
                <div className="rf-row" />
                <div className="rf-row" />
                <div className="rf-cap">2 · switch to Active</div>
              </div>
              <div className="replay-frame">
                <div className="rf-bar w-[45%]" />
                <div className="rf-row hl" />
                <div className="rf-row" />
                <div className="rf-cap">3 · stale task visible</div>
              </div>
            </div>
            <div className="term mt-3">
              <span className="t-faint">playwright ·</span> assertion{" "}
              <span className="t-red">failed as expected</span> — bug{" "}
              <span className="t-warn">reproduced</span> · trace saved
            </div>
          </Scene>

          {/* 4 — patch diff */}
          <Scene on={stage === 4}>
            <div className="diff">
              <div className="diff-head">
                <span>server.js</span>
                <span>
                  <span className="text-[color:var(--verified)]">+2</span>{" "}
                  <span className="text-[color:var(--diff-red)]">−1</span>
                </span>
              </div>
              <pre>
                <span className="ln ctx">  app.patch(&quot;/tasks/:id&quot;, async (req, res) =&gt; {"{"}</span>
                <span className="ln ctx">    await tasks.update(id, {"{ done: true }"});</span>
                <span className="ln del">-   res.json({"{ ok: true }"});</span>
                <span className="ln add">+   invalidateTaskLists();</span>
                <span className="ln add">+   res.json({"{ ok: true }"});</span>
                <span className="ln ctx">  {"}"});</span>
              </pre>
            </div>
          </Scene>

          {/* 5 — verification replay passes */}
          <Scene on={stage === 5}>
            <div className="term">
              <div>
                <span className="t-faint">[04:11.6]</span> rebuilding target
                with patch · replaying saved reproduction…
              </div>
              <div>
                <span className="t-faint">[04:19.2]</span> step 1 · mark task
                done <span className="t-green">✓</span>
              </div>
              <div>
                <span className="t-faint">[04:20.0]</span> step 2 · switch to
                Active <span className="t-green">✓</span>
              </div>
              <div>
                <span className="t-faint">[04:20.7]</span> step 3 · completed
                task absent <span className="t-green">✓</span>
              </div>
            </div>
            <div className="flex gap-2.5 mt-3.5">
              <span className="chip chip-warn">reproduced</span>
              <span className="mono t-faint text-[color:var(--ink-faint)]">
                →
              </span>
              <span className="chip chip-verified">verified</span>
            </div>
          </Scene>

          {/* 6 — PR card */}
          <Scene on={stage === 6}>
            <div className="gh-card pr-card p-[18px]">
              <div className="pr-ico">
                <PrIcon />
              </div>
              <div>
                <div className="pr-title">
                  Fix active task cache invalidation
                </div>
                <div className="pr-meta">
                  #483 · sherlock wants to merge 1 commit into main
                </div>
                <div className="pr-checks">
                  <span>
                    <i>✓</i> reproduction replayed against patch — passed
                  </span>
                  <span>
                    <i>✓</i> artifacts attached: trace, log, graph context
                  </span>
                </div>
                <div className="gh-labels">
                  <span className="chip chip-verified">Verified</span>
                  <span className="chip">closes #482</span>
                </div>
              </div>
            </div>
          </Scene>

          <div className="case-progress" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function Scene({ on, children }) {
  return <div className={`case-scene ${on ? "on" : ""}`}>{children}</div>;
}

function PrIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM4 7a3 3 0 100-3 3 3 0 000 3zm0 0v6.5M4 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      <path
        d="M4 5.5v5.5M12 10.5V6a2 2 0 00-2-2H8.5M12 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

export function RepoGraph({ lit = true }) {
  // Simplified Graphify view: files + functions, hot path highlighted.
  const L = lit ? "lit" : "";
  return (
    <svg viewBox="0 0 460 200" width="100%" aria-label="Repository graph">
      {/* edges */}
      <line className="graph-edge" x1="70" y1="50" x2="180" y2="30" />
      <line className={`graph-edge ${L}`} x1="70" y1="50" x2="180" y2="90" />
      <line className="graph-edge" x1="70" y1="50" x2="150" y2="160" />
      <line className={`graph-edge ${L}`} x1="180" y1="90" x2="300" y2="70" />
      <line className={`graph-edge ${L}`} x1="180" y1="90" x2="300" y2="130" />
      <line className="graph-edge" x1="180" y1="30" x2="300" y2="70" />
      <line className={`graph-edge ${L}`} x1="300" y1="130" x2="400" y2="100" />
      <line className="graph-edge" x1="150" y1="160" x2="300" y2="130" />

      {/* nodes */}
      <Node x={70} y={50} label="app.js" lit={lit} />
      <Node x={180} y={30} label="router.js" />
      <Node x={180} y={90} label="server.js" lit={lit} />
      <Node x={150} y={160} label="db.js" />
      <Node x={300} y={70} label="tasks.update()" />
      <Node x={300} y={130} label="taskListCache" lit={lit} />
      <Node x={400} y={100} label="invalidateTaskLists()" lit={lit} />
    </svg>
  );
}

function Node({ x, y, label, lit }) {
  const w = label.length * 6.4 + 20;
  return (
    <g>
      <rect
        className={`graph-node ${lit ? "lit" : ""}`}
        x={x - w / 2}
        y={y - 12}
        width={w}
        height={24}
        rx={6}
      />
      <text
        className={`graph-label ${lit ? "lit" : ""}`}
        x={x}
        y={y + 3.5}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}
