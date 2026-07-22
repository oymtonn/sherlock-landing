"use client";

import { useEffect, useRef, useState } from "react";
import {
  CodeDiffPlaceholder,
  RepositoryGraphPlaceholder,
  VideoArtifactPlaceholder,
} from "./Placeholders";

// `fields` are the chapter's evidence labels — real labels, placeholder
// values (bars/chips), so each chapter reads as a case-file entry without
// fabricating content. `graph` mounts the repository evidence graph.
const SCENES = [
  {
    title: "Start with the bug.",
    fields: [
      { label: "observed behavior", w: 88 },
      { label: "expected behavior", w: 72 },
      { label: "affected route", w: 46 },
      { label: "reproduction", chip: { tone: "warn", text: "captured" } },
    ],
  },
  {
    title: "Follow the evidence.",
    fields: [
      { label: "relevant file path", w: 78 },
      { label: "runtime signal", w: 56 },
      { label: "current hypothesis", w: 84 },
    ],
    graph: true,
  },
  {
    title: "Make the smallest change.",
    fields: [
      { label: "root cause", w: 80 },
      { label: "patch scope", w: 38 },
      { label: "untouched code", w: 62 },
    ],
  },
  {
    title: "Prove the fix via replay. ",
    fields: [
      { label: "same path, replayed", w: 70 },
      { label: "result", chip: { tone: "verified", text: "✓ verified" } },
    ],
  },
];

const COMMAND = "/sherlock investigate";
const MORPH_END = 0.2;
const COMMAND_SCROLL_SPAN = 0.11;
const MOBILE_COMMAND_SCROLL_SPAN = 0.15;
const POINTER_APPROACH_DURATION = 600;
const POINTER_ARRIVAL_THRESHOLD = 0.98;

const sceneProgress = (index) =>
  index / Math.max(1, SCENES.length - 1);

const COMMENT_SCENE_INDEX = 1;

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
  const pointerProgressRef = useRef(0);
  const [active, setActive] = useState(0);
  const [commandCharacters, setCommandCharacters] = useState(0);
  const [pointerProgress, setPointerProgress] = useState(0);
  const [pointerTargetProgress, setPointerTargetProgress] = useState(0);
  const [commentSequenceStarted, setCommentSequenceStarted] = useState(false);
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
    pointerProgressRef.current = 0;
    setPointerProgress(0);
    setPointerTargetProgress(0);
    setCommentSequenceStarted(false);
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
    if (commentSequenceStarted) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      pointerProgressRef.current = pointerTargetProgress;
      setPointerProgress(pointerTargetProgress);
      if (pointerTargetProgress >= POINTER_ARRIVAL_THRESHOLD) {
        setCommentSequenceStarted(true);
      }
      return;
    }

    let frame;
    let previousTime = performance.now();

    const followScrollTarget = (time) => {
      const elapsed = Math.min(50, time - previousTime);
      previousTime = time;

      const current = pointerProgressRef.current;
      const distance = pointerTargetProgress - current;
      const maxStep = elapsed / POINTER_APPROACH_DURATION;
      const next =
        Math.abs(distance) <= maxStep
          ? pointerTargetProgress
          : current + Math.sign(distance) * maxStep;

      pointerProgressRef.current = next;
      setPointerProgress(next);

      if (
        next >= POINTER_ARRIVAL_THRESHOLD &&
        pointerTargetProgress >= POINTER_ARRIVAL_THRESHOLD
      ) {
        setCommentSequenceStarted(true);
        return;
      }

      if (next !== pointerTargetProgress) {
        frame = requestAnimationFrame(followScrollTarget);
      }
    };

    frame = requestAnimationFrame(followScrollTarget);
    return () => cancelAnimationFrame(frame);
  }, [pointerTargetProgress, commentSequenceStarted]);

  useEffect(() => {
    const story = storyRef.current;
    const sticky = stickyRef.current;
    const shell = shellRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!story || !sticky || !shell || !viewport || !track) return;

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

      const commentSceneProgress =
        sceneStops[COMMENT_SCENE_INDEX] ?? sceneProgress(COMMENT_SCENE_INDEX);
      const commentScrollProgress = timelineToScrollProgress(
        commentSceneProgress,
        mobile
      );
      const rawTimelineProgress = mobile
        ? scrollProgress
        : clamp((scrollProgress - MORPH_END) / (1 - MORPH_END));
      const timelineProgress = rawTimelineProgress;
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
      // Let the pointer approach the Comment button while the command is
      // being typed. Typing finishes first; the pointer then settles on the
      // button at the comment stop before the click sequence begins.
      const pointerStart = Math.min(commandStart, commentScrollProgress);
      const pointerSpan = commentScrollProgress - pointerStart;
      const nextPointerProgress = reduceMotion
        ? scrollProgress >= commentScrollProgress
          ? 1
          : 0
        : pointerSpan > 0.001
          ? clamp((scrollProgress - pointerStart) / pointerSpan)
          : scrollProgress >= commentScrollProgress
            ? 1
            : 0;
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

      // track.style.setProperty(
      //   "--timeline-progress",
      //   `${timelineProgress * 100}%`
      // );
      track.style.transform = `translateY(-${timelineProgress * maxOffset}px)`;

      setActive((current) =>
        current === nextActive ? current : nextActive
      );
      setCommandCharacters((current) =>
        current === nextCommandCharacters ? current : nextCommandCharacters
      );
      setPointerTargetProgress((current) =>
        current === nextPointerProgress ? current : nextPointerProgress
      );
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
  }, []);

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
          <div className={`case-morph-shell scene-${active}`} ref={shellRef}>
            {/* per-chapter ambient environment — purely decorative layers
                crossfaded by the shell's scene-N class */}
            <div className="case-shell-ambient" aria-hidden="true">
              <i className="amb amb-0" />
              <i className="amb amb-1" />
              <i className="amb amb-2" />
              <i className="amb amb-3" />
            </div>
            {/* case-file chrome: corner registration marks + chapter counter */}
            <div className="case-shell-frame" aria-hidden="true">

            </div>
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

                          <div className="case-github-composer">
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
                              <span className="case-github-button-success">
                                <b>✓</b> Posted
                              </span>
                            </span>
                          </div>

                          <span
                            className="case-github-pointer"
                            aria-hidden="true"
                            style={{
                              "--pointer-delay": `${-pointerProgress}s`,
                            }}
                          >
                            <svg viewBox="0 0 24 28" focusable="false">
                              <path d="M3 2.5v19.2l4.9-4.7 3.5 8 3.8-1.7-3.6-7.6h7L3 2.5Z" />
                            </svg>
                          </span>
                        </div>
                      ) : index === 2 ? (
                        <CodeDiffPlaceholder />
                      ) : (
                        <VideoArtifactPlaceholder
                          tone={index === 0 ? "bug" : "verified"}
                          badge={index === 0 ? "failed" : "passed"}
                          label={
                            index === 0
                              ? "Original bug reproduction recording"
                              : "Post-fix verification recording"
                          }
                          ratio="16:10"
                        />
                      )}
                    </div>

                    

                    <div className="case-story-copy">
                      <h3>{scene.title}</h3>
                      <dl
                        className="case-evidence"
                        aria-label="Case evidence fields (placeholder values)"
                      >
                        {scene.fields.map((field) => (
                          <div key={field.label}>
                            <dt>{field.label}</dt>
                            <dd>
                              {field.chip ? (
                                <span className={`chip chip-${field.chip.tone}`}>
                                  {field.chip.text}
                                </span>
                              ) : (
                                <i
                                  className="ph-bar"
                                  style={{ width: `${field.w}%` }}
                                  aria-hidden="true"
                                />
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      {scene.graph ? (
                        <RepositoryGraphPlaceholder className="case-evidence-graph" />
                      ) : null}
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
