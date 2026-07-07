"use client";

import { useEffect, useState } from "react";
import CaseAnimation from "./CaseAnimation";

// Hero motion: the Higgsfield-generated asset at /hero-motion.mp4, framed
// like every other Sherlock panel. Falls back to the coded CaseAnimation
// when the video is missing, fails to load, or the user prefers reduced
// motion — so the hero always tells the story.
export default function HeroVisual() {
  const [useVideo, setUseVideo] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setUseVideo(false);
    }
  }, []);

  if (!useVideo) return <CaseAnimation />;

  return (
    <div className="panel">
      <div className="panel-bar">
        <div className="panel-dots">
          <i /> <i /> <i />
        </div>
        <span>sherlock · issue → verified PR</span>
        <span style={{ marginLeft: "auto" }} className="chip chip-warn">
          live
        </span>
      </div>
      <video
        className="hero-video"
        src="/hero-motion.mp4"
        autoPlay
        muted
        loop
        playsInline
        onError={() => setUseVideo(false)}
        aria-label="Animation of a GitHub issue becoming a verified pull request"
      />
    </div>
  );
}
