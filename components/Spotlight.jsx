"use client";

import { useEffect, useRef } from "react";

// The page is a crime scene: your cursor is the flashlight. A soft violet
// spotlight follows the pointer across the full page, while the hero grid
// tilts a degree or two toward it. Pure CSS variables — cheap, no re-renders.
export default function Spotlight({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      const el = ref.current;
      if (!el) return;

      // These viewport coordinates drive the fixed page-background glow, so
      // it keeps following the pointer after the hero has scrolled away.
      const root = document.documentElement;
      root.style.setProperty("--spotlight-x", `${e.clientX}px`);
      root.style.setProperty("--spotlight-y", `${e.clientY}px`);

      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      const isOverHero =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;

      el.style.setProperty(
        "--tiltx",
        isOverHero ? `${(y - 50) / -28}deg` : "0deg"
      );
      el.style.setProperty(
        "--tilty",
        isOverHero ? `${(x - 50) / 28}deg` : "0deg"
      );
    };

    document.documentElement.classList.add("spotlight-on");
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.classList.remove("spotlight-on");
      document.documentElement.style.removeProperty("--spotlight-x");
      document.documentElement.style.removeProperty("--spotlight-y");
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`spotlight ${className}`}
    >
      {children}
    </div>
  );
}
