"use client";

import { useEffect, useRef, useState } from "react";
import SherlockAvatar, { BugDot } from "./SherlockAvatar";

// The hero centerpiece: the Sherlock avatar flies a slow oval around the
// headline, pauses at each of three bugs, and each bug flips to a green
// check. When the lap ends, the case resets and the hunt begins again.
// Clicking a bug catches it early. Reduced motion: everything holds still.
//
// Bug positions as fractions of the orbit (t in 0..1, clockwise from 3 o'clock)
const BUG_T = [0.13, 0.5, 0.82];
const LAP_MS = 14000;
const DWELL_MS = 900;
const RESET_HOLD_MS = 1600;
const RESET_STAGGER_MS = 420;

export default function HeroHunt({ children }) {
  const boxRef = useRef(null);
  const avatarRef = useRef(null);
  const [caught, setCaught] = useState([false, false, false]);
  const [reduced, setReduced] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);
  const caughtRef = useRef(caught);
  caughtRef.current = caught;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      setCaught([true, true, true]);
      setAvatarReady(true);
      return;
    }

    const initialBox = boxRef.current;
    const initialAvatar = avatarRef.current;
    if (initialBox && initialAvatar) {
      placeAvatar(initialBox, initialAvatar, 0);
      setAvatarReady(true);
    }

    let raf;
    let t = 0; // orbit progress 0..1
    let last = performance.now();
    let dwellUntil = 0; // timestamp while paused at a bug
    let resetUntil = 0;
    const resetTimers = [];
    let nextBug = 0;

    const step = (now) => {
      raf = requestAnimationFrame(step);
      const dt = now - last;
      last = now;

      const box = boxRef.current;
      const av = avatarRef.current;
      if (!box || !av) return;

      // resetting between laps
      if (resetUntil && now < resetUntil) {
        return placeAvatar(box, av, t);
      }
      if (resetUntil) {
        resetUntil = 0;
        nextBug = 0;
      }

      // dwelling at a bug
      if (now < dwellUntil) return placeAvatar(box, av, t);

      t += dt / LAP_MS;

      // arriving at the next bug?
      if (nextBug < BUG_T.length && t >= BUG_T[nextBug]) {
        t = BUG_T[nextBug];
        const i = nextBug;
        if (!caughtRef.current[i]) {
          setCaught((c) => c.map((v, j) => (j === i ? true : v)));
        }
        dwellUntil = now + DWELL_MS;
        nextBug += 1;
      }

      // lap complete → hold at the start, then reset the case
      if (t >= 1) {
        t = 0;
        resetUntil =
          now + RESET_HOLD_MS + RESET_STAGGER_MS * (BUG_T.length - 1) + 50;

        BUG_T.forEach((_, bugIndex) => {
          const timer = window.setTimeout(() => {
            setCaught((current) =>
              current.map((value, index) =>
                index === bugIndex ? false : value
              )
            );
          }, RESET_HOLD_MS + RESET_STAGGER_MS * bugIndex);
          resetTimers.push(timer);
        });

        nextBug = 0;
      }

      placeAvatar(box, av, t);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      resetTimers.forEach(window.clearTimeout);
    };
  }, []);

  const catchBug = (i) =>
    setCaught((c) => c.map((v, j) => (j === i ? true : v)));

  return (
    <div className={`hunt ${reduced ? "hunt-still" : ""}`} ref={boxRef}>
      {children}

      {BUG_T.map((_, i) => (
        <button
          key={i}
          className={`hunt-bug hunt-bug-${i} ${caught[i] ? "caught" : ""}`}
          onClick={() => catchBug(i)}
          aria-label={caught[i] ? "Bug fixed" : "Catch this bug"}
          title={caught[i] ? "verified" : "click to catch"}
        >
          <BugDot caught={caught[i]} />
        </button>
      ))}

      <div
        className={`hunt-avatar ${avatarReady ? "hunt-avatar-ready" : ""}`}
        ref={avatarRef}
      >
        <SherlockAvatar size={78} className="hunt-avatar-svg" />
      </div>
    </div>
  );
}

// Position along an ellipse around the container. t=0 is 3 o'clock,
// clockwise. The avatar leans into the direction of travel.
function placeAvatar(box, av, t) {
  const r = box.getBoundingClientRect();
  const avatarWidth = av.offsetWidth || 86;
  const avatarHeight = av.offsetHeight || 78;
  const cx = r.width / 2;
  const cy = r.height / 2;
  // keep the whole orbit inside the hunt box so the avatar never
  // clips the kicker above or the copy below
  const rx = r.width / 2 - 40;
  const ry = r.height / 2 - 8;
  const a = t * Math.PI * 2;
  const x = cx + rx * Math.cos(a);
  const y = cy + ry * Math.sin(a);
  // tangent direction → subtle lean, plus a gentle bob
  const lean = Math.cos(a) * 10;
  const bob = Math.sin(performance.now() / 420) * 3;
  av.style.transform = `translate(${x - avatarWidth / 2}px, ${y - avatarHeight / 2 + bob}px) rotate(${lean}deg)`;
}
