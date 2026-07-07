"use client";

import { useEffect, useRef, useState } from "react";
import SherlockAvatar, { BugDot } from "./SherlockAvatar";

// Easter egg: every so often a bug escapes the backlog and skitters across
// the bottom of the viewport. A few seconds in, Sherlock swoops down and
// squashes it under the magnifying glass — or you can click it first.
// Either way: green check + a "PR opened" toast.
const FIRST_DELAY = 4000; // after the user scrolls past the hero
const SCROLL_GATE = 0.9; // fraction of viewport height scrolled before bugs dare come out
const MIN_GAP = 22000;
const MAX_GAP = 40000;
const CROSS_MS = 12000;
const SWOOP_AFTER_MIN = 3500;
const SWOOP_AFTER_MAX = 6500;
const DIVE_MS = 700;

// where the lens center sits inside the avatar svg (viewBox 120, size 84)
const AVATAR_SIZE = 84;
const LENS_X = (59 / 120) * AVATAR_SIZE;
const LENS_Y = (50 / 120) * AVATAR_SIZE;

export default function StrayBug() {
  const [state, setState] = useState("hidden"); // hidden | walking | squashed
  const [frozen, setFrozen] = useState(false);
  const [hunter, setHunter] = useState(null); // {x, y, stage: 'ready'|'dive'|'exit'}
  const [toast, setToast] = useState(false);
  const [prNum, setPrNum] = useState(484);
  const bugRef = useRef(null);
  const timers = useRef([]);

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // bugs only come out once the hero (and its own hunt scene) is off-screen —
  // otherwise two Sherlocks are killing bugs at once
  const pastHero = () =>
    typeof window !== "undefined" &&
    window.scrollY > window.innerHeight * SCROLL_GATE;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const arm = () => {
      if (!pastHero()) return;
      window.removeEventListener("scroll", arm);
      later(startWalk, FIRST_DELAY);
    };

    if (pastHero()) {
      later(startWalk, FIRST_DELAY);
    } else {
      window.addEventListener("scroll", arm, { passive: true });
    }
    return () => {
      window.removeEventListener("scroll", arm);
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleNext = () =>
    later(startWalk, MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP));

  const startWalk = () => {
    // if the reader scrolled back up to the hero, wait them out
    if (!pastHero()) {
      later(startWalk, 5000);
      return;
    }
    setState("walking");
    setFrozen(false);
    setHunter(null);
    // Sherlock notices after a few seconds…
    later(startSwoop, SWOOP_AFTER_MIN + Math.random() * (SWOOP_AFTER_MAX - SWOOP_AFTER_MIN));
    // …but if everything fails, the bug escapes
    later(() => {
      setState("hidden");
      scheduleNext();
    }, CROSS_MS);
  };

  const startSwoop = () => {
    const bug = bugRef.current;
    if (!bug) return;
    const r = bug.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    clearAll();
    setFrozen(true); // bug senses danger and stops
    setHunter({ x, y, stage: "ready" });
    // next frame: dive (lets the transition kick in)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setHunter({ x, y, stage: "dive" }))
    );
    later(() => finish(x, y), DIVE_MS);
  };

  const finish = (x, y) => {
    setState("squashed");
    setToast(true);
    later(() => setHunter({ x, y, stage: "exit" }), 450);
    later(() => setToast(false), 3400);
    later(() => {
      setHunter(null);
      setState("hidden");
      setPrNum((n) => n + 1);
      scheduleNext();
    }, 1400);
  };

  // manual squash — you beat Sherlock to it, he still gets the paperwork
  const clickSquash = () => {
    if (state !== "walking") return;
    const bug = bugRef.current;
    const r = bug.getBoundingClientRect();
    clearAll();
    setFrozen(true);
    finish(r.left + r.width / 2, r.top + r.height / 2);
  };

  const hunterTransform = (h) => {
    if (h.stage === "ready")
      return `translate(${h.x + 70}px, -110px) rotate(24deg)`;
    if (h.stage === "dive")
      return `translate(${h.x - LENS_X}px, ${h.y - LENS_Y}px) rotate(0deg)`;
    return `translate(${h.x + 220}px, -140px) rotate(-14deg)`; // exit
  };

  return (
    <>
      {state !== "hidden" && (
        <button
          ref={bugRef}
          className={`straybug ${state} ${frozen ? "frozen" : ""}`}
          onClick={clickSquash}
          aria-label="A bug escaped — click to squash it before Sherlock does"
          title="a bug escaped the backlog…"
        >
          <BugDot caught={state === "squashed"} size={30} />
        </button>
      )}

      {hunter && (
        <div
          className={`stray-hunter ${hunter.stage}`}
          style={{ transform: hunterTransform(hunter) }}
          aria-hidden="true"
        >
          <SherlockAvatar size={AVATAR_SIZE} />
        </div>
      )}

      <div className={`straybug-toast ${toast ? "show" : ""}`} role="status">
        <span className="chip chip-verified">Verified</span>
        <span className="mono">
          bug caught · PR #{prNum} opened · closes itself
        </span>
      </div>
    </>
  );
}
