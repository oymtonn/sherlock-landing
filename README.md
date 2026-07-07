# Sherlock Landing

Marketing site for Sherlock — a GitHub App that turns bug reports into verified pull requests.

## Run

```sh
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out (deploy anywhere)
```

## Structure

- `app/` — Next.js App Router pages: home, product, security, pricing, docs, contact
- `components/CaseAnimation.jsx` — the hero motion: issue → investigate → map → reproduce → patch → verify → PR, built in code (crisp panels, loops, click-to-scrub, respects reduced motion)
- `app/globals.css` — design tokens. Violet = brand, yellow = investigating, green = **verified states only**, red = bugs/diffs

## Notes

- Static export (`output: "export"`) — no server required.
- The contact form confirms locally; wire it to a form backend before launch (see `components/ContactForm.jsx`).
- Fonts (Space Grotesk, JetBrains Mono) are fetched at build time by `next/font`.
