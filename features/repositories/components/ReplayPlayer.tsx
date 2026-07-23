"use client";

import { useEffect, useRef, useState } from "react";
import type { ReplayEvidence } from "../types";

/* Generic replay player for the investigation page. Plays ordinary MP4/WebM
   URLs through a native <video> element (controls cover play/pause, seeking,
   volume and fullscreen). The source format can change later — swapping the
   URL scheme or adding a streaming backend only touches this file, not the
   investigation page. Visual treatment matches the old dashboard player:
   bordered surface frame, black stage, centered overlay messages. */

type PlaybackState = "loading" | "ready" | "error";

export default function ReplayPlayer({
  label,
  replay,
  autoPlaySignal = 0,
  mediaRevision = 0,
  onLoadError,
}: {
  label: string;
  replay: ReplayEvidence;
  autoPlaySignal?: number;
  mediaRevision?: number;
  onLoadError?: () => void;
}) {
  if (replay.status !== "available" || !replay.videoUrl) {
    return <ReplayStateBox label={label} replay={replay} />;
  }

  return (
    <ReplayVideo
      key={`${replay.videoUrl}:${mediaRevision}`}
      videoUrl={replay.videoUrl}
      posterUrl={replay.posterUrl}
      autoPlaySignal={autoPlaySignal}
      onLoadError={onLoadError}
    />
  );
}

function ReplayVideo({
  videoUrl,
  posterUrl,
  autoPlaySignal,
  onLoadError,
}: {
  videoUrl: string;
  posterUrl: string | null;
  autoPlaySignal: number;
  onLoadError?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("loading");

  useEffect(() => {
    const video = videoRef.current;

    if (!video || autoPlaySignal <= 0 || playbackState !== "ready") {
      return;
    }

    video.muted = true;
    void video.play().catch(() => {
      // The browser can still block playback; controls remain available.
    });
  }, [autoPlaySignal, playbackState]);

  return (
    <div className="flex min-h-[260px] flex-1 overflow-hidden rounded-sm border border-border bg-surface">
      <div className="relative min-h-0 flex-1 bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl ?? undefined}
          controls
          muted={autoPlaySignal > 0}
          playsInline
          preload="metadata"
          onLoadedMetadata={() => setPlaybackState("ready")}
          onError={() => {
            setPlaybackState("error");
            onLoadError?.();
          }}
          className="h-full w-full object-contain"
        />

        {playbackState !== "ready" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-4 text-center text-sm">
            <div>
              <p
                className={
                  playbackState === "error" ? "text-red-200" : "text-muted"
                }
              >
                {playbackState === "error"
                  ? "Playback failed. The replay URL may have expired."
                  : "Loading replay..."}
              </p>
              {playbackState === "error" && onLoadError ? (
                <button
                  type="button"
                  onClick={onLoadError}
                  className="mt-3 font-semibold text-foreground underline underline-offset-2"
                >
                  Retry replay
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ReplayStateBox({
  label,
  replay,
}: {
  label: string;
  replay: ReplayEvidence;
}) {
  if (replay.status === "error") {
    return (
      <div className="rounded-sm border border-red-900/70 bg-red-950/30 px-3 py-8 text-center text-red-200">
        {replay.error || `${label} unavailable`}
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-border bg-surface px-3 py-8 text-center text-muted">
      {replay.status === "loading"
        ? `${label} loading`
        : replay.status === "unavailable"
          ? `${label} not available`
          : `${label} pending`}
    </div>
  );
}
