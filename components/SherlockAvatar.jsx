// Sherlock brand avatar — vector trace of the brand reference: a deerstalker
// in 3/4 view diving down-right (violet side panel, top button), with a big
// magnifying glass overlapping the front of the hat, handle trailing
// down-left, and two speed lines behind. Transparent background.
export default function SherlockAvatar({ size = 72, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* speed lines, upper left */}
      <path d="M20 21l18-4" stroke="#a78bfa" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
      <path d="M16 31l14-3" stroke="#a78bfa" strokeWidth="4.5" strokeLinecap="round" opacity="0.55" />

      {/* ---------------- hat ---------------- */}
      {/* front brim — pointing left */}
      <path
        d="M42 46 L23 40 q-4.5-1.2-3 3 q3.5 8.5 22 11 z"
        fill="#2e2749"
        stroke="#1c1733"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* back brim — trailing lower right */}
      <path
        d="M90 65 q11 4.5 16.5 10.5 q3 3.5-2 4 q-13 .8-24-6.5 z"
        fill="#2e2749"
        stroke="#1c1733"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* dome */}
      <path
        d="M40 52 Q41 24 66 17 Q92 11 100 36 Q104 50 98 60 Q94 67 85 68 Q62 70 48 62 Q40 58 40 52 Z"
        fill="#3b3161"
        stroke="#1c1733"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* violet side panel (right third of the dome) */}
      <path
        d="M74 15.5 Q93 13 100 36 Q104 50 98 60 Q95 65.5 88 67.5 L80 66 Q92 42 72 17 Z"
        fill="#a78bfa"
        stroke="#1c1733"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* seam between panels */}
      <path d="M66 17 Q80 40 76 66" stroke="#1c1733" strokeWidth="2.6" opacity="0.7" />
      {/* top button */}
      <ellipse
        cx="84"
        cy="14"
        rx="8.5"
        ry="5"
        transform="rotate(14 84 14)"
        fill="#2e2749"
        stroke="#1c1733"
        strokeWidth="3.5"
      />

      {/* ---------------- magnifying glass ---------------- */}
      {/* handle — dark with outline, trailing down-left */}
      <line x1="46" y1="70" x2="31" y2="93" stroke="#1c1733" strokeWidth="14" strokeLinecap="round" />
      <line x1="46" y1="70" x2="31" y2="93" stroke="#2e2749" strokeWidth="9" strokeLinecap="round" />

      {/* lens — overlapping the hat front */}
      <circle cx="59" cy="50" r="21" fill="rgba(167,139,250,0.38)" />
      {/* diagonal lens shading */}
      <path
        d="M45 65 A21 21 0 0 0 74 35 L45 65 Z"
        fill="rgba(76,61,120,0.35)"
      />
      {/* inner rim */}
      <circle cx="59" cy="50" r="21" stroke="#8f78d6" strokeWidth="3" />
      {/* outer rim */}
      <circle cx="59" cy="50" r="24" stroke="#1c1733" strokeWidth="6.5" />
      {/* glint */}
      <path
        d="M48 42 q4.5-6 12-6.5"
        stroke="#e9ddff"
        strokeWidth="3.4"
        strokeLinecap="round"
        opacity="0.95"
      />
    </svg>
  );
}

// Tiny cartoon bug marker used around the H1 — turns into a check when caught.
export function BugDot({ caught = false, size = 26 }) {
  if (caught) {
    return (
      <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <circle cx="13" cy="13" r="11" fill="rgba(62,207,142,0.15)" stroke="#3ecf8e" strokeWidth="2" />
        <path d="M8 13.2l3.4 3.4L18.5 10" stroke="#3ecf8e" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <ellipse cx="13" cy="14.5" rx="6" ry="7.5" fill="rgba(240,96,93,0.18)" stroke="#f0605d" strokeWidth="2" />
      <line x1="13" y1="7" x2="13" y2="22" stroke="#f0605d" strokeWidth="1.4" />
      <line x1="7.5" y1="12" x2="3.5" y2="9" stroke="#f0605d" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="7.5" y1="16" x2="3.5" y2="18" stroke="#f0605d" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="18.5" y1="12" x2="22.5" y2="9" stroke="#f0605d" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="18.5" y1="16" x2="22.5" y2="18" stroke="#f0605d" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 6.5L8.5 3.5M16 6.5l1.5-3" stroke="#f0605d" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
