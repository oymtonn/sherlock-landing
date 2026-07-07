"use client";

import { useEffect, useRef, useState } from "react";

// Lightweight scroll-reveal wrapper. Fades content up once when it enters
// the viewport; respects prefers-reduced-motion via CSS.
export default function Reveal({ children, as: Tag = "div", delay = 0, ...rest }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "in" : ""} ${rest.className || ""}`}
      style={{ transitionDelay: `${delay}ms`, ...rest.style }}
    >
      {children}
    </Tag>
  );
}
