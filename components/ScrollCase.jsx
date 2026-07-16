"use client";

import { useEffect, useRef, useState } from "react";

// Add `waitFor` to any future scene whose animation must finish before the
// user can continue forward.
const SCENES = [
  { title: "Start with the bug." },
  { title: "Follow the evidence.", waitFor: "commentSubmission" },
  { title: "Make the smallest change." },
  { title: "Prove it before it ships." },
];

const COMMAND = "/sherlock investigate";
const MORPH_END = 0.2;
const COMMENT_SEQUENCE_FALLBACK = 2400;
const COMMAND_SCROLL_SPAN = 0.11;
const MOBILE_COMMAND_SCROLL_SPAN = 0.15;

const sceneProgress = (index) =>
  index / Math.max(1, SCENES.length - 1);

const COMMENT_SCENE_INDEX = SCENES.findIndex(
  (scene) => scene.waitFor === "commentSubmission"
);

const timelineToScrollProgress = (timelineProgress, mobile) =>
  mobile
    ? timelineProgress
    : MORPH_END + timelineProgress * (1 - MORPH_END);

const jumpTo = (top) => {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, top);
  root.style.scrollBehavior = previousScrollBehavior;
};

const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const ease = (value) => value * value * (3 - 2 * value);

export default function ScrollCase() {
  const storyRef = useRef(null);
  const stickyRef = useRef(null);
  const shellRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const rowRefs = useRef([]);
  const sceneStopsRef = useRef(SCENES.map((_, index) => sceneProgress(index)));
  const reloadHandledRef = useRef(false);
  const [active, setActive] = useState(0);
  const [commandCharacters, setCommandCharacters] = useState(0);
  const [commentSequenceStarted, setCommentSequenceStarted] = useState(false);
  const [commentSequenceComplete, setCommentSequenceComplete] = useState(false);
  const [revealed, setRevealed] = useState(() =>
    SCENES.map((_, index) => index === 0)
  );

  useEffect(() => {
    if (reloadHandledRef.current) return;
    reloadHandledRef.current = true;

    const navigation = performance.getEntriesByType("navigation")[0];
    if (navigation?.type !== "reload") return;

    const story = storyRef.current;
    if (!story) return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const restartStory = () => {
      const storyTop = window.scrollY + story.getBoundingClientRect().top;
      if (window.scrollY >= storyTop - 1) {
        jumpTo(Math.max(0, storyTop));
      }
    };

    setActive(0);
    setCommandCharacters(0);
    setCommentSequenceStarted(false);
    setCommentSequenceComplete(false);
    setRevealed(SCENES.map((_, index) => index === 0));
    restartStory();

    let secondFrame;
    const firstFrame = requestAnimationFrame(() => {
      restartStory();
      secondFrame = requestAnimationFrame(restartStory);
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    if (!commentSequenceStarted || commentSequenceComplete) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let gateY;
    let lastTouchY;
    let resizeFrame;

    const calculateGateY = () => {
      const story = storyRef.current;
      const sticky = stickyRef.current;
      if (!story || !sticky) return undefined;

      const rect = story.getBoundingClientRect();
      const viewportHeight = sticky.clientHeight || window.innerHeight;
      const travel = Math.max(1, rect.height - viewportHeight);
      const storyTop = window.scrollY + rect.top;
      const targetProgress = timelineToScrollProgress(
        sceneStopsRef.current[COMMENT_SCENE_INDEX] ??
          sceneProgress(COMMENT_SCENE_INDEX),
        window.innerWidth <= 760
      );
      return storyTop + targetProgress * travel;
    };

    gateY = calculateGateY();
    if (gateY !== undefined && window.scrollY > gateY + 1) jumpTo(gateY);

    const forwardKeys = new Set([
      "ArrowDown",
      "PageDown",
      "End",
      " ",
      "Spacebar",
    ]);
    const isAtGate = () =>
      gateY !== undefined && window.scrollY >= gateY - 2;
    const preventForwardWheel = (event) => {
      if (event.deltaY > 0 && isAtGate()) event.preventDefault();
    };
    const handleTouchStart = (event) => {
      lastTouchY =
        event.touches.length === 1 ? event.touches[0].clientY : undefined;
    };
    const preventForwardTouch = (event) => {
      if (event.touches.length !== 1) {
        lastTouchY = undefined;
        return;
      }

      const currentTouchY = event.touches[0].clientY;
      const movingForward =
        lastTouchY !== undefined && currentTouchY < lastTouchY;
      lastTouchY = currentTouchY;
      if (movingForward && isAtGate()) event.preventDefault();
    };
    const clearTouch = () => {
      lastTouchY = undefined;
    };
    const preventForwardKey = (event) => {
      if (forwardKeys.has(event.key) && isAtGate()) event.preventDefault();
    };
    const enforceGatePosition = () => {
      if (gateY !== undefined && window.scrollY > gateY + 1) {
        jumpTo(gateY);
      }
    };
    const handleGateResize = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        gateY = calculateGateY();
        enforceGatePosition();
      });
    };

    window.addEventListener("wheel", preventForwardWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", preventForwardTouch, {
      passive: false,
    });
    window.addEventListener("touchend", clearTouch, { passive: true });
    window.addEventListener("touchcancel", clearTouch, { passive: true });
    window.addEventListener("keydown", preventForwardKey);
    window.addEventListener("scroll", enforceGatePosition, { passive: true });
    window.addEventListener("resize", handleGateResize);

    const timeout = window.setTimeout(
      () => setCommentSequenceComplete(true),
      reduceMotion ? 0 : COMMENT_SEQUENCE_FALLBACK
    );

    return () => {
      window.clearTimeout(timeout);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      window.removeEventListener("wheel", preventForwardWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", preventForwardTouch);
      window.removeEventListener("touchend", clearTouch);
      window.removeEventListener("touchcancel", clearTouch);
      window.removeEventListener("keydown", preventForwardKey);
      window.removeEventListener("scroll", enforceGatePosition);
      window.removeEventListener("resize", handleGateResize);
    };
  }, [commentSequenceStarted, commentSequenceComplete]);

  useEffect(() => {
    const story = storyRef.current;
    const sticky = stickyRef.current;
    const shell = shellRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!story || !sticky || !shell || !viewport || !track) return;

    const completionByKey = {
      commentSubmission: commentSequenceComplete,
    };
    const blockingSceneIndex = SCENES.findIndex(
      (scene) => scene.waitFor && !completionByKey[scene.waitFor]
    );
    let frame;

    const update = () => {
      frame = undefined;

      const rect = story.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = sticky.clientHeight || window.innerHeight;
      const travel = Math.max(1, rect.height - viewportHeight);
      const scrollProgress = clamp(-rect.top / travel);
      const mobile = viewportWidth <= 760;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const rawMorph = clamp(scrollProgress / MORPH_END);
      const morph = mobile
        ? 1
        : reduceMotion
          ? (rawMorph > 0 ? 1 : 0)
          : ease(rawMorph);
      const gutter = mobile ? 16 : 32;
      const square = Math.min(
        viewportWidth - gutter,
        viewportHeight * (mobile ? 0.86 : 0.76),
        mobile ? 760 : 780
      );
      const endWidth = Math.min(viewportWidth - gutter, mobile ? 760 : 1400);
      const endHeight = Math.min(
        viewportHeight * (mobile ? 0.86 : 0.88),
        mobile ? 760 : 900
      );
      const width = square + (endWidth - square) * morph;
      const height = square + (endHeight - square) * morph;

      shell.style.width = `${width}px`;
      shell.style.height = `${height}px`;
      shell.style.setProperty("--morph-radius", `${26 - morph * 10}px`);

      const rows = rowRefs.current.slice(0, SCENES.length);
      let maxOffset = Math.max(0, track.scrollHeight - viewport.clientHeight);
      let sceneStops = sceneStopsRef.current;
      if (rows.length === SCENES.length && rows.every(Boolean)) {
        const firstRow = rows[0];
        const lastRow = rows[rows.length - 1];
        const topPadding = Math.max(
          24,
          (viewport.clientHeight - firstRow.offsetHeight) / 2
        );
        const bottomPadding = Math.max(
          24,
          (viewport.clientHeight - lastRow.offsetHeight) / 2
        );
        track.style.paddingTop = `${topPadding}px`;
        track.style.paddingBottom = `${bottomPadding}px`;

        maxOffset = Math.max(0, track.scrollHeight - viewport.clientHeight);
        sceneStops =
          maxOffset > 0
            ? rows.map((row) =>
                clamp(
                  (row.offsetTop +
                    row.offsetHeight / 2 -
                    viewport.clientHeight / 2) /
                    maxOffset
                )
              )
            : SCENES.map((_, index) => sceneProgress(index));
        sceneStopsRef.current = sceneStops;
      }

      const rawTimelineProgress = mobile
        ? scrollProgress
        : clamp((scrollProgress - MORPH_END) / (1 - MORPH_END));
      const blockingSceneProgress =
        blockingSceneIndex >= 0
          ? (sceneStops[blockingSceneIndex] ??
            sceneProgress(blockingSceneIndex))
          : 1;
      const timelineProgress =
        blockingSceneIndex >= 0 &&
        rawTimelineProgress >= blockingSceneProgress
          ? blockingSceneProgress
          : rawTimelineProgress;
      const commentSceneProgress =
        sceneStops[COMMENT_SCENE_INDEX] ?? sceneProgress(COMMENT_SCENE_INDEX);
      const commandTimelineStart =
        ((sceneStops[0] ?? 0) + commentSceneProgress) / 2;
      const commandStart = timelineToScrollProgress(
        commandTimelineStart,
        mobile
      );
      const commandSpan = mobile
        ? MOBILE_COMMAND_SCROLL_SPAN
        : COMMAND_SCROLL_SPAN;
      const commandProgress = clamp(
        (scrollProgress - commandStart) / commandSpan
      );
      const nextCommandCharacters = reduceMotion
        ? commandProgress > 0
          ? COMMAND.length
          : 0
        : Math.min(
            COMMAND.length,
            Math.floor(commandProgress * (COMMAND.length + 1))
          );
      let nextActive = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      sceneStops.forEach((stop, index) => {
        const distance = Math.abs(timelineProgress - stop);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nextActive = index;
        }
      });

      track.style.setProperty(
        "--timeline-progress",
        `${timelineProgress * 100}%`
      );
      track.style.transform = `translateY(-${timelineProgress * maxOffset}px)`;

      setActive((current) =>
        current === nextActive ? current : nextActive
      );
      setCommandCharacters((current) =>
        current === nextCommandCharacters ? current : nextCommandCharacters
      );
      if (rawTimelineProgress >= commentSceneProgress) {
        setCommentSequenceStarted(true);
      }
      setRevealed((current) => {
        let changed = false;
        const next = current.map((value, index) => {
          const shouldReveal = value || index <= nextActive;
          if (shouldReveal !== value) changed = true;
          return shouldReveal;
        });
        return changed ? next : current;
      });
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const handleScroll = () => requestUpdate();
    const handleResize = () => requestUpdate();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(handleResize);
    resizeObserver?.observe(viewport);
    rowRefs.current.forEach((row) => {
      if (row) resizeObserver?.observe(row);
    });

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [commentSequenceComplete]);

  return (
    <section className="scroll-case" aria-labelledby="scroll-case-title">
      <div className="wrap scroll-case-intro">
        <h2 id="scroll-case-title">Open the case. Follow every move.</h2>
        <p>
          Each chapter reveals once, stays in the case file, and makes room
          for the next piece of evidence.
        </p>
      </div>

      <div className="case-morph-story" ref={storyRef}>
        <div className="case-morph-sticky" ref={stickyRef}>
          <div className="case-morph-shell" ref={shellRef}>
            <div className="case-morph-viewport" ref={viewportRef}>
              <div className="case-story-list" ref={trackRef}>
                {SCENES.map((scene, index) => (
                  <article
                    className={`case-story-row ${
                      index % 2 ? "reverse" : ""
                    } ${index === active ? "active" : ""} ${
                      revealed[index] ? "in-view" : ""
                    }`}
                    key={scene.title}
                    ref={(node) => {
                      rowRefs.current[index] = node;
                    }}
                  >
                    <div className="case-story-media">
                      {index === 1 ? (
                        <div
                          className={`case-github-comment${
                            commentSequenceStarted ? " is-submitting" : ""
                          }`}
                          aria-label="GitHub issue comment composer"
                        >
                          <strong className="case-github-title">
                            Add a comment
                          </strong>

                          <div
                            className="case-github-composer"
                            onAnimationEnd={(event) => {
                              if (
                                event.target === event.currentTarget &&
                                event.animationName ===
                                  "case-github-composer-confirm"
                              ) {
                                setCommentSequenceComplete(true);
                              }
                            }}
                          >
                            <div
                              className="case-github-toolbar"
                              aria-hidden="true"
                            >
                              <div className="case-github-tabs">
                                <span className="active">Write</span>
                              </div>
                            </div>

                            <div className="case-github-editor">
                              <div
                                className="case-command-line mono"
                                aria-label={COMMAND}
                              >
                                <span
                                  className="case-command-text"
                                  aria-hidden="true"
                                >
                                  {COMMAND.slice(0, commandCharacters)}
                                </span>
                                <span
                                  className={`case-command-caret${
                                    commandCharacters === COMMAND.length
                                      ? " is-complete"
                                      : ""
                                  }`}
                                  aria-hidden="true"
                                />
                              </div>
                            </div>
                          </div>

                          <div
                            className="case-github-actions"
                            aria-hidden="true"
                          >
                            <span className="case-github-attach" />
                            <span className="case-github-button">
                              <span className="case-github-button-label">
                                Comment
                              </span>
                              <span className="case-github-button-loading">
                                <i /> Posting
                              </span>
                              <span className="case-github-button-success">
                                <b>✓</b> Posted
                              </span>
                            </span>
                          </div>

                          <span
                            className="case-github-pointer"
                            aria-hidden="true"
                          >
                            <svg viewBox="0 0 24 28" focusable="false">
                              <path d="M3 2.5v19.2l4.9-4.7 3.5 8 3.8-1.7-3.6-7.6h7L3 2.5Z" />
                            </svg>
                          </span>
                        </div>
                      ) : (
                        <div className="case-media-placeholder">
                          <span className="case-media-play" aria-hidden="true">
                            ▶
                          </span>
                          <span className="mono">Image or short video</span>
                          <small className="mono">16:10 recommended</small>
                        </div>
                      )}
                    </div>

                    <div className="case-story-node" aria-hidden="true" />

                    <div className="case-story-copy">
                      <h3>{scene.title}</h3>
                      <div
                        className="case-copy-placeholder"
                        aria-label="Text placeholder"
                      >
                        <i />
                        <i />
                        <i />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
