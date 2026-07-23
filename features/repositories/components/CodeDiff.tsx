"use client";

import { AlertTriangle } from "lucide-react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { parseUnifiedDiff } from "../diffParser";
import type { ParsedDiffFile, ParsedDiffLine } from "../diffParser";

export default function CodeDiff({
  summary,
  diff,
  diffTruncated,
  className = "",
}: {
  summary?: string | null;
  diff?: string | null;
  diffTruncated?: boolean;
  className?: string;
}) {
  const files = diff ? parseUnifiedDiff(diff) : [];
  const hasDiff = files.length > 0;
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const activeFile = hasDiff
    ? files[Math.min(activeFileIndex, files.length - 1)]
    : null;

  return (
    <div
      className={`flex min-h-0 min-w-0 flex-col gap-4 px-4 py-4 ${className}`}
    >
      {summary ? (
        <p className="shrink-0 text-sm leading-6 text-muted">{summary}</p>
      ) : null}

      {diffTruncated ? (
        <div className="flex shrink-0 gap-2 rounded-sm border border-amber-900/70 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            The backend truncated this diff. Some changed lines are not shown.
          </p>
        </div>
      ) : null}

      {hasDiff && activeFile ? (
        <DiffFileViewer
          files={files}
          activeFile={activeFile}
          activeFileIndex={Math.min(activeFileIndex, files.length - 1)}
          onActiveFileChange={setActiveFileIndex}
        />
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-sm border border-border bg-surface px-3 py-8 text-center text-sm text-muted">
          No diff available.
        </div>
      )}
    </div>
  );
}

function DiffFileViewer({
  files,
  activeFile,
  activeFileIndex,
  onActiveFileChange,
}: {
  files: ParsedDiffFile[];
  activeFile: ParsedDiffFile;
  activeFileIndex: number;
  onActiveFileChange: (index: number) => void;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-sm border border-border">
      <div className="native-scrollbar-hidden flex shrink-0 overflow-x-auto border-b border-border bg-surface">
        {files.map((file, index) => (
          <button
            key={`${file.displayPath}-${index}`}
            type="button"
            onClick={() => onActiveFileChange(index)}
            className={`min-w-0 shrink-0 border-r border-border px-3 py-2 text-left font-mono text-xs transition-colors ${
              index === activeFileIndex
                ? "bg-background text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span className="block max-w-52 truncate">{file.displayPath}</span>
          </button>
        ))}
      </div>

      <PersistentDiffScrollArea>
        <div className="inline-block min-w-full align-top font-mono text-xs">
          {activeFile.lines.map((line, index) => (
            <DiffLineRow key={`${line.code}-${index}`} line={line} />
          ))}
        </div>
      </PersistentDiffScrollArea>
    </div>
  );
}

type ScrollMetrics = {
  clientHeight: number;
  clientWidth: number;
  scrollHeight: number;
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
};

const INITIAL_SCROLL_METRICS: ScrollMetrics = {
  clientHeight: 0,
  clientWidth: 0,
  scrollHeight: 0,
  scrollLeft: 0,
  scrollTop: 0,
  scrollWidth: 0,
};

function PersistentDiffScrollArea({ children }: { children: ReactNode }) {
  const viewportId = useId();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    axis: "horizontal" | "vertical";
    pointerStart: number;
    scrollStart: number;
  } | null>(null);
  const [metrics, setMetrics] = useState(INITIAL_SCROLL_METRICS);

  const updateMetrics = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    setMetrics({
      clientHeight: viewport.clientHeight,
      clientWidth: viewport.clientWidth,
      scrollHeight: viewport.scrollHeight,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      scrollWidth: viewport.scrollWidth,
    });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const observer = new ResizeObserver(updateMetrics);
    observer.observe(viewport);

    if (viewport.firstElementChild) {
      observer.observe(viewport.firstElementChild);
    }

    updateMetrics();
    return () => observer.disconnect();
  }, [children, updateMetrics]);

  const verticalThumb = getScrollbarThumb(
    metrics.clientHeight,
    metrics.scrollHeight,
    metrics.scrollTop,
  );
  const horizontalThumb = getScrollbarThumb(
    metrics.clientWidth,
    metrics.scrollWidth,
    metrics.scrollLeft,
  );

  const startDrag = (
    axis: "horizontal" | "vertical",
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      axis,
      pointerStart: axis === "vertical" ? event.clientY : event.clientX,
      scrollStart:
        axis === "vertical" ? metrics.scrollTop : metrics.scrollLeft,
    };
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const drag = dragRef.current;

    if (!viewport || !drag) {
      return;
    }

    const isVertical = drag.axis === "vertical";
    const pointer = isVertical ? event.clientY : event.clientX;
    const viewportSize = isVertical
      ? metrics.clientHeight
      : metrics.clientWidth;
    const scrollSize = isVertical ? metrics.scrollHeight : metrics.scrollWidth;
    const thumbSize = isVertical ? verticalThumb.size : horizontalThumb.size;
    const thumbTravel = Math.max(viewportSize - thumbSize, 1);
    const scrollTravel = Math.max(scrollSize - viewportSize, 0);
    const nextScroll =
      drag.scrollStart +
      ((pointer - drag.pointerStart) / thumbTravel) * scrollTravel;

    if (isVertical) {
      viewport.scrollTop = nextScroll;
    } else {
      viewport.scrollLeft = nextScroll;
    }
  };

  const jumpToTrackPosition = (
    axis: "horizontal" | "vertical",
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const isVertical = axis === "vertical";
    const trackSize = isVertical ? rect.height : rect.width;
    const pointer = isVertical
      ? event.clientY - rect.top
      : event.clientX - rect.left;
    const thumb = isVertical ? verticalThumb : horizontalThumb;
    const ratio = Math.max(
      0,
      Math.min(1, (pointer - thumb.size / 2) / Math.max(trackSize - thumb.size, 1)),
    );

    if (isVertical) {
      viewport.scrollTop = ratio * (metrics.scrollHeight - metrics.clientHeight);
    } else {
      viewport.scrollLeft = ratio * (metrics.scrollWidth - metrics.clientWidth);
    }
  };

  const handleScrollbarKeyDown = (
    axis: "horizontal" | "vertical",
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const isVertical = axis === "vertical";
    const backwardKey = isVertical ? "ArrowUp" : "ArrowLeft";
    const forwardKey = isVertical ? "ArrowDown" : "ArrowRight";
    let delta = 0;

    if (event.key === backwardKey) delta = -40;
    if (event.key === forwardKey) delta = 40;
    if (event.key === "PageUp") delta = -metrics.clientHeight;
    if (event.key === "PageDown") delta = metrics.clientHeight;

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const target = event.key === "Home" ? 0 : Number.MAX_SAFE_INTEGER;
      if (isVertical) viewport.scrollTop = target;
      else viewport.scrollLeft = target;
      return;
    }

    if (delta !== 0) {
      event.preventDefault();
      if (isVertical) viewport.scrollTop += delta;
      else viewport.scrollLeft += delta;
    }
  };

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-background">
      <div
        id={viewportId}
        ref={viewportRef}
        onScroll={updateMetrics}
        className="diff-scroll-content absolute bottom-3 right-3 left-0 top-0 overflow-scroll"
      >
        {children}
      </div>

      <div
        role="scrollbar"
        aria-label="Vertical code scroll"
        aria-controls={viewportId}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={Math.max(metrics.scrollHeight - metrics.clientHeight, 0)}
        aria-valuenow={metrics.scrollTop}
        tabIndex={0}
        onKeyDown={(event) => handleScrollbarKeyDown("vertical", event)}
        onPointerDown={(event) => jumpToTrackPosition("vertical", event)}
        className="absolute bottom-3 right-0 top-0 w-3 border-l border-border bg-surface"
      >
        <div
          onPointerDown={(event) => startDrag("vertical", event)}
          onPointerMove={moveDrag}
          onPointerUp={() => {
            dragRef.current = null;
          }}
          className="absolute left-0.5 right-0.5 cursor-ns-resize rounded-sm bg-muted"
          style={{ height: verticalThumb.size, top: verticalThumb.position }}
        />
      </div>

      <div
        role="scrollbar"
        aria-label="Horizontal code scroll"
        aria-controls={viewportId}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={Math.max(metrics.scrollWidth - metrics.clientWidth, 0)}
        aria-valuenow={metrics.scrollLeft}
        tabIndex={0}
        onKeyDown={(event) => handleScrollbarKeyDown("horizontal", event)}
        onPointerDown={(event) => jumpToTrackPosition("horizontal", event)}
        className="absolute bottom-0 left-0 right-3 h-3 border-t border-border bg-surface"
      >
        <div
          onPointerDown={(event) => startDrag("horizontal", event)}
          onPointerMove={moveDrag}
          onPointerUp={() => {
            dragRef.current = null;
          }}
          className="absolute bottom-0.5 top-0.5 cursor-ew-resize rounded-sm bg-muted"
          style={{ left: horizontalThumb.position, width: horizontalThumb.size }}
        />
      </div>

      <div className="absolute bottom-0 right-0 h-3 w-3 border-l border-t border-border bg-surface" />
    </div>
  );
}

function getScrollbarThumb(
  viewportSize: number,
  scrollSize: number,
  scrollPosition: number,
) {
  if (viewportSize <= 0 || scrollSize <= viewportSize) {
    return { position: 0, size: Math.max(viewportSize, 0) };
  }

  const size = Math.max(28, (viewportSize / scrollSize) * viewportSize);
  const availableTrack = Math.max(viewportSize - size, 0);
  const availableScroll = scrollSize - viewportSize;

  return {
    position: (scrollPosition / availableScroll) * availableTrack,
    size,
  };
}

function DiffLineRow({ line }: { line: ParsedDiffLine }) {
  const isAdd = line.type === "add";
  const isDelete = line.type === "delete";
  const isMetadata = line.type === "metadata";

  return (
    <div
      className={`grid w-max min-w-full grid-cols-[40px_40px_max-content] sm:grid-cols-[52px_52px_max-content] ${
        isAdd
          ? "bg-emerald-950/40 text-emerald-200"
          : isDelete
            ? "bg-red-950/40 text-red-200"
            : isMetadata
              ? "bg-surface text-muted"
              : "text-muted"
      }`}
    >
      <span
        className={`border-r border-border px-2 py-1.5 text-right sm:px-3 ${
          isDelete ? "text-red-300" : "text-muted"
        }`}
      >
        {line.oldLine ?? ""}
      </span>
      <span
        className={`border-r border-border px-2 py-1.5 text-right sm:px-3 ${
          isAdd ? "text-emerald-300" : "text-muted"
        }`}
      >
        {line.newLine ?? ""}
      </span>
      <code className="whitespace-pre px-3 py-1.5">
        {getLinePrefix(line.type)}
        {line.code}
      </code>
    </div>
  );
}

function getLinePrefix(type: ParsedDiffLine["type"]) {
  if (type === "add") {
    return "+ ";
  }

  if (type === "delete") {
    return "- ";
  }

  return "  ";
}
