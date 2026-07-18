// ---------------------------------------------------------------------------
// Sherlock placeholder system — designed stand-ins for product media that
// hasn't been produced yet. Every placeholder:
//   • states exactly what belongs in it, and the recommended aspect ratio
//   • keeps the surrounding layout stable when the real asset lands
//   • is replaced by swapping the component for a real <video> / <img> /
//     animated component — the mounting frame around it (border, background,
//     shadow) belongs to the parent, so nothing else has to move.
// Styles live in globals.css under "placeholder artifacts".
// ---------------------------------------------------------------------------

const TONE_META = {
  bug: "rec · issue reproduction",
  verified: "run · verification replay",
  brand: "demo · product walkthrough",
};

/**
 * VideoArtifactPlaceholder — a recording that doesn't exist yet, framed like
 * the real one will be: capture strip on top, playback strip on the bottom.
 * Replace with a real <video> (or animated component) at the stated ratio.
 *
 * tone:  "bug" (red capture accents) | "verified" (green) | "brand" (violet)
 * badge: optional status chip — "failed" | "passed"
 */
export function VideoArtifactPlaceholder({
  label,
  ratio = "16:10",
  tone = "brand",
  badge,
  meta,
  className = "",
}) {
  return (
    <div
      className={`m-art tone-${tone} ${className}`}
      role="img"
      aria-label={`${label} — video placeholder, ${ratio}`}
    >
      <span className="m-art-top mono" aria-hidden="true">
        <span className="m-art-rec">
          <i />
          {meta || TONE_META[tone]}
        </span>
        {badge ? <span className={`m-art-badge is-${badge}`}>{badge}</span> : null}
        <span className="m-art-ratio">{ratio}</span>
      </span>

      <span className="m-art-center" aria-hidden="true">
        <span className="m-art-play">▶</span>
        <strong>{label}</strong>
        <small className="mono">replace with real recording — {ratio}</small>
      </span>

      <span className="m-art-bottom" aria-hidden="true">
        <span className="m-art-track">
          <i className="m-art-headp" />
          {/* the run markers tell the fail → pass story on the same path */}
          {tone === "bug" ? <b className="m-art-tick is-fail" /> : null}
          {tone === "verified" ? (
            <>
              <b className="m-art-tick is-fail is-history" />
              <b className="m-art-tick is-pass" />
            </>
          ) : null}
        </span>
        <span className="m-art-time mono">--:--</span>
      </span>
    </div>
  );
}

// Skeleton diff rows shared by CodeDiffPlaceholder and PullRequestPlaceholder.
// Bars instead of code on purpose: nothing here should read as a real patch.
const DIFF_LINES = [
  { kind: "ctx", num: 41, indent: 1, width: 58 },
  { kind: "ctx", num: 42, indent: 2, width: 44 },
  { kind: "del", num: 43, indent: 2, width: 70 },
  { kind: "add", num: 43, indent: 2, width: 74 },
  { kind: "add", num: 44, indent: 2, width: 40 },
  { kind: "ctx", num: 45, indent: 2, width: 52 },
  { kind: "ctx", num: 46, indent: 1, width: 28 },
];

const DIFF_LINES_COMPACT = DIFF_LINES.slice(1, 6);

export function DiffLines({ compact = false }) {
  const lines = compact ? DIFF_LINES_COMPACT : DIFF_LINES;
  return (
    <span className="dl-lines" aria-hidden="true">
      {lines.map((line, i) => (
        <span key={i} className={`dl-row is-${line.kind}`}>
          <span className="dl-num mono">{line.num}</span>
          <span className="dl-sign mono">
            {line.kind === "add" ? "+" : line.kind === "del" ? "−" : ""}
          </span>
          <i
            className="ph-bar"
            style={{ width: `${line.width}%`, marginLeft: line.indent * 12 }}
          />
        </span>
      ))}
    </span>
  );
}

/**
 * CodeDiffPlaceholder — the "minimal root-cause code diff" artifact.
 * A handful of skeleton lines, one removal, two additions, everything
 * else visibly untouched. Swap for a real rendered diff when available.
 */
export function CodeDiffPlaceholder({
  label = "Minimal root-cause code diff",
  className = "",
}) {
  return (
    <div
      className={`diff-art ${className}`}
      role="img"
      aria-label={`${label} — placeholder`}
    >
      <span className="diff-art-head mono" aria-hidden="true">
        <span>{label}</span>
        <span className="diff-art-stat">
          <b className="s-del">−1</b>
          <b className="s-add">+2</b>
        </span>
      </span>
      <DiffLines />
      <span className="diff-art-foot mono" aria-hidden="true">
        <span>surrounding code untouched</span>
        <span>1 file</span>
      </span>
    </div>
  );
}

/**
 * RepositoryGraphPlaceholder — a compact evidence graph: the issue, two
 * candidate files, the confirmed path, and the suspected root cause being
 * traced (dashed, investigating-yellow). Replace with the real graph
 * visualization when it exists.
 */
export function RepositoryGraphPlaceholder({ className = "" }) {
  return (
    <figure
      className={`repo-graph ${className}`}
      role="img"
      aria-label="Repository evidence graph — placeholder"
    >
      <figcaption className="mono">repository evidence graph</figcaption>
      <svg viewBox="0 0 320 96" aria-hidden="true" focusable="false">
        {/* dependency edges: confirmed path lit, discarded path faint */}
        <path className="graph-edge lit" d="M54 42 C 70 42, 76 18, 92 18" fill="none" />
        <path className="graph-edge" d="M54 50 C 70 50, 76 74, 92 74" fill="none" />
        <path className="graph-edge lit" d="M138 18 C 156 18, 160 42, 176 42" fill="none" />
        <path className="graph-edge" d="M138 74 C 156 74, 160 50, 176 50" fill="none" />
        {/* active hypothesis — still being verified */}
        <path className="rg-trace" d="M222 46 L 260 46" />

        {/* investigation checkpoints */}
        <circle className="rg-check" cx="92" cy="18" r="2.2" />
        <circle className="rg-check" cx="92" cy="74" r="2.2" />
        <circle className="rg-check" cx="176" cy="46" r="2.2" />

        {/* file nodes (skeleton labels — no fabricated paths) */}
        <rect className="graph-node lit" x="8" y="36" width="46" height="20" rx="4" />
        <rect className="rg-bar" x="16" y="44" width="30" height="4" rx="2" />
        <rect className="graph-node lit" x="92" y="8" width="46" height="20" rx="4" />
        <rect className="rg-bar" x="100" y="16" width="30" height="4" rx="2" />
        <rect className="graph-node" x="92" y="64" width="46" height="20" rx="4" />
        <rect className="rg-bar" x="100" y="72" width="30" height="4" rx="2" />
        <rect className="graph-node lit" x="176" y="36" width="46" height="20" rx="4" />
        <rect className="rg-bar" x="184" y="44" width="30" height="4" rx="2" />
        <rect className="graph-node hot" x="260" y="36" width="52" height="20" rx="4" />
        <rect className="rg-bar" x="268" y="44" width="26" height="4" rx="2" />
        <circle className="rg-dot" cx="303" cy="46" r="2.5" />
      </svg>
    </figure>
  );
}

/**
 * AmbientVisualPlaceholder
 * ── Future Sherlock investigation visual or ambient animation ──
 * Reserved backdrop slot behind the hero headline: today it renders faint
 * concentric "lens" rings around the investigation orbit plus a corner tag.
 * Replace the rings with the signature visual (or delete the component and
 * its single usage in app/page.jsx) — nothing else depends on it.
 */
export function AmbientVisualPlaceholder() {
  return (
    <div className="hero-ambient" aria-hidden="true">
      <i className="hero-ambient-ring r1" />
      <i className="hero-ambient-ring r2" />
      <i className="hero-ambient-ring r3" />
      
    </div>
  );
}

/**
 * PullRequestPlaceholder — the case file's final artifact: one PR that
 * carries the summary, the root cause, the minimal patch and the proof.
 * Every region is labeled and independently replaceable with real product
 * output (screenshots, rendered markdown, live data) without moving layout.
 */
export function PullRequestPlaceholder() {
  return (
    <article
      className="pr-art"
      aria-label="Pull request placeholder — Sherlock's final output"
    >
      <header className="pr-art-head">
        <span className="pr-ico" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4.5 3.5a1.5 1.5 0 1 1 0 .01M4.5 5v6m0 0a1.5 1.5 0 1 0 0 .01M11.5 11V6.8c0-1-.5-1.8-1.8-1.8H8.5m0 0L10 3.5M8.5 5 10 6.5m1.5 4.5a1.5 1.5 0 1 0 0 .01"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="pr-art-titles">
          <i className="ph-bar" style={{ width: "56%" }} aria-hidden="true" />
          <span className="pr-art-meta mono" aria-hidden="true">
            <span className="pr-art-branch">sherlock/fix-slk-4127</span>
            <b>→</b>
            <span className="pr-art-branch">main</span>
          </span>
        </span>
        <span className="pr-art-num mono" aria-hidden="true">
          #···
        </span>
        <span className="chip chip-verified">✓ verification passed</span>
      </header>

      <div className="pr-art-body">
        <div className="pr-art-col">
          <section className="pr-region">
            <h3 className="mono">investigation summary</h3>
            <span className="pr-region-bars" aria-hidden="true">
              <i className="ph-bar" style={{ width: "92%" }} />
              <i className="ph-bar" style={{ width: "78%" }} />
              <i className="ph-bar" style={{ width: "60%" }} />
            </span>
          </section>

          <section className="pr-region">
            <h3 className="mono">root cause</h3>
            <span className="pr-region-bars" aria-hidden="true">
              <i className="ph-bar" style={{ width: "84%" }} />
              <i className="ph-bar" style={{ width: "44%" }} />
            </span>
          </section>

          <section className="pr-region">
            <h3 className="mono">verification</h3>
            <ul className="pr-art-checks mono">
              <li className="is-fail">
                <i aria-hidden="true">✕</i>
                <span>replay 01 · unpatched — failed</span>
              </li>
              <li className="is-pass">
                <i aria-hidden="true">✓</i>
                <span>replay 02 · patched — passed</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="pr-art-col">
          <section className="pr-region">
            <h3 className="mono">changed files</h3>
            <span className="pr-art-file" aria-hidden="true">
              <i className="ph-bar" style={{ width: "58%" }} />
              <span className="diff-art-stat">
                <b className="s-del">−1</b>
                <b className="s-add">+2</b>
              </span>
            </span>
          </section>

          <section className="pr-region">
            <h3 className="mono">minimal patch</h3>
            <span className="pr-art-diff">
              <DiffLines compact />
            </span>
          </section>

          <section className="pr-region">
            <h3 className="mono">reproduction evidence</h3>
            <span className="pr-art-thumbs" aria-hidden="true">
              <span className="pr-thumb is-fail mono">
                <b>✕</b>
                before
              </span>
              <span className="pr-thumb is-pass mono">
                <b>✓</b>
                after
              </span>
            </span>
          </section>
        </div>
      </div>

      <footer className="pr-art-foot mono">
        <span>pull request ready for review</span>
        <span className="pr-art-review" aria-hidden="true">
          Review changes
        </span>
      </footer>
    </article>
  );
}
