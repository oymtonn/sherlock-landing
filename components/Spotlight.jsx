"use client";

import { useRef } from "react";

// The hero is a crime scene: your cursor is the flashlight. A soft violet
// spotlight follows the pointer and the blueprint grid tilts a degree or
// two toward it. Pure CSS variables — cheap, no re-renders.
export default function Spotlight({ children, className = "" }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
    el.style.setProperty("--tiltx", `${(y - 50) / -28}deg`);
    el.style.setProperty("--tilty", `${(x - 50) / 28}deg`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "40%");
    el.style.setProperty("--tiltx", "0deg");
    el.style.setProperty("--tilty", "0deg");
  };

  return (
    <div
      ref={ref}
      className={`spotlight ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  );
}
