# Higgsfield motion asset — prompt spec

Optional 6–10s video alternative to the coded hero animation
(`components/CaseAnimation.jsx`). Generate at 16:9, target ~8s.

## Prompt

> Premium B2B developer-tool product motion, dark neutral interface background
> (#0b0e14), crisp flat UI panels, restrained smooth camera. Sequence:
> (1) a realistic GitHub-style issue card slides in: "Bug: Completed tasks
> still show in Active filter"; (2) a small status panel activates:
> "Investigation started"; (3) a code repository graph lights up amber —
> nodes labeled app.js, server.js, taskListCache, invalidateTaskLists()
> connected by thin lines; (4) a horizontal browser-replay filmstrip shows
> three small app screenshots, the third highlighting a stale row in red;
> (5) a compact code diff panel appears, one red removed line, two green
> added lines; (6) a badge morphs from amber "Reproduced" to green
> "Verified"; (7) final frame: a GitHub-style pull-request card, "Fix active
> task cache invalidation", green Verified badge. Typography: clean grotesque
> + monospace. Accent colors: amber #e5a83c, green #3ecf8e only on verified
> states, red #f0605d only on the bug/diff. Trustworthy, precise, editorial
> motion design.

## Negative prompt

> robots, AI brain, glowing neurons, neon tunnel, sparkles, magic particles,
> cartoon mascot, human characters, sci-fi hologram, blob gradients,
> illegible fake text, lens flares

## Placement

Swap into the hero right column behind a poster frame, keep `CaseAnimation`
as the reduced-motion / fallback. Keep the video muted, looped, ≤2MB if
possible (compress with `ffmpeg -crf 28`).
