// Sherlock mark: a magnifier whose lens is a commit node — evidence under
// inspection. Drawn inline so it inherits currentColor.
export default function Logo({ className = "brand-mark" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="9" stroke="var(--brand)" strokeWidth="2.4" />
      <circle cx="14" cy="14" r="3" fill="var(--verified)" />
      <path
        d="M14 5v6M14 17v6M5 14h6M17 14h6"
        stroke="var(--brand)"
        strokeWidth="1.2"
        strokeOpacity="0.45"
      />
      <path
        d="M21 21l7 7"
        stroke="var(--brand)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
