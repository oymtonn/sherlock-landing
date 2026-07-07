export default function SherlockAvatar({ size = 72, className = "" }) {
  const width = Math.round(size * 1.1);

  return (
    <img
      className={className}
      width={width}
      height={size}
      src="/sher-logo-v2.png"
      alt=""
      aria-hidden="true"
    />
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
