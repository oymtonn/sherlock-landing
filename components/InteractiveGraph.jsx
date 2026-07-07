"use client";

import { useState } from "react";

// Explorable Graphify panel. Click a node to walk the graph the way an
// investigation does: connected edges light up, everything else recedes,
// and the readout explains what Sherlock learns from that hop.

const NODES = [
  { id: "app", x: 70, y: 50, label: "app.js" },
  { id: "router", x: 180, y: 30, label: "router.js" },
  { id: "server", x: 180, y: 90, label: "server.js" },
  { id: "db", x: 150, y: 160, label: "db.js" },
  { id: "update", x: 300, y: 70, label: "tasks.update()" },
  { id: "cache", x: 300, y: 130, label: "taskListCache" },
  { id: "invalidate", x: 400, y: 100, label: "invalidateTaskLists()" },
];

const EDGES = [
  { a: "app", b: "router", note: "app.js mounts the router — not on the failure path" },
  { a: "app", b: "server", note: "the Active filter reads /tasks from server.js" },
  { a: "app", b: "db", note: "no direct db access from the client — ruled out" },
  { a: "server", b: "update", note: "PATCH /tasks/:id calls tasks.update()" },
  { a: "server", b: "cache", note: "list responses are served from taskListCache" },
  { a: "router", b: "update", note: "route table entry — passthrough only" },
  { a: "cache", b: "invalidate", note: "invalidateTaskLists() is never called on completion — root cause", hot: true },
  { a: "db", b: "cache", note: "cache is hydrated from db.js on boot" },
];

const NODE_NOTES = {
  app: "symptom observed here: stale task in the Active view",
  router: "passthrough — investigation walks past it",
  server: "owns the response the bug appears in",
  db: "data is correct at the source — bug is upstream of here",
  update: "mutation succeeds; the write itself is fine",
  cache: "serves stale entries after a write — suspicious",
  invalidate: "root cause: never invoked when a task completes",
};

const DEFAULT_LIT = ["app-server", "server-update", "server-cache", "cache-invalidate"];

const key = (a, b) => `${a}-${b}`;

export default function InteractiveGraph() {
  const [active, setActive] = useState(null);
  const [note, setNote] = useState(
    "issue #482 → 6 relevant nodes → 1 patched function · click any node or edge to walk the graph"
  );

  const isLit = (e) => {
    if (active) return e.a === active || e.b === active;
    return DEFAULT_LIT.includes(key(e.a, e.b));
  };

  const isNodeLit = (id) => {
    if (active) return id === active || EDGES.some((e) => isLit(e) && (e.a === id || e.b === id));
    return ["app", "server", "cache", "invalidate", "update"].includes(id);
  };

  const clickNode = (id) => {
    if (active === id) {
      setActive(null);
      setNote("issue #482 → 6 relevant nodes → 1 patched function · click any node or edge to walk the graph");
    } else {
      setActive(id);
      setNote(`${NODES.find((n) => n.id === id).label} — ${NODE_NOTES[id]}`);
    }
  };

  const clickEdge = (e) => {
    setActive(null);
    setNote(e.note);
  };

  return (
    <div className="igraph">
      <svg viewBox="0 0 460 200" width="100%" aria-label="Interactive repository graph">
        {EDGES.map((e) => {
          const A = NODES.find((n) => n.id === e.a);
          const B = NODES.find((n) => n.id === e.b);
          const lit = isLit(e);
          return (
            <g key={key(e.a, e.b)}>
              {/* fat invisible hit area */}
              <line
                x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                stroke="transparent"
                strokeWidth="14"
                style={{ cursor: "pointer" }}
                onClick={() => clickEdge(e)}
              />
              <line
                className={`graph-edge ${lit ? "lit" : ""} ${e.hot && lit ? "hot" : ""}`}
                x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                style={{ pointerEvents: "none" }}
              />
            </g>
          );
        })}

        {NODES.map((n) => {
          const w = n.label.length * 6.4 + 20;
          const lit = isNodeLit(n.id);
          return (
            <g
              key={n.id}
              className={`igraph-node ${active === n.id ? "focus" : ""} ${lit ? "" : "dimmed"}`}
              onClick={() => clickNode(n.id)}
              style={{ cursor: "pointer" }}
            >
              <rect
                className={`graph-node ${lit ? "lit" : ""}`}
                x={n.x - w / 2} y={n.y - 12} width={w} height={24} rx={6}
              />
              <text
                className={`graph-label ${lit ? "lit" : ""}`}
                x={n.x} y={n.y + 3.5} textAnchor="middle"
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="igraph-note mono" aria-live="polite">
        {note}
      </div>
    </div>
  );
}
