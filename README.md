# Sherlock Landing

Marketing site and product entry point for Sherlock — a GitHub App that turns bug reports into verified pull requests. Includes GitHub sign-in through Supabase Auth, a protected onboarding flow that starts GitHub App installation via the Sherlock backend, and a minimal protected dashboard.

## Run

```sh
npm install
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000
npm run build                # production build (server-capable — see Hosting)
npm start                    # serve the production build
```

## Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | browser-safe | Supabase project URL (same project as the backend) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser-safe | Supabase publishable key |
| `SHERLOCK_API_URL` | **server-only** | Sherlock backend origin (HTTPS in production) |

Never add a Supabase service-role key to this repository.

## Structure

- `app/` — Next.js App Router pages: home, product, security, pricing, docs, contact, plus `auth/`, `onboarding/`, `dashboard/`, `investigations/`, and `logout/`
- `components/CaseAnimation.jsx` — the hero motion: issue → investigate → map → reproduce → patch → verify → PR, built in code (crisp panels, loops, click-to-scrub, respects reduced motion)
- `components/auth/GitHubSignInButton.jsx` — the single canonical GitHub sign-in entry point (header, mobile nav, landing CTAs)
- `lib/supabase/` — browser, server and middleware Supabase clients (auth only)
- `lib/backend/` — server-only client for the Sherlock backend API
- `app/globals.css` — design tokens. Violet = brand, yellow = investigating, green = **verified states only**, red = bugs/diffs

## Auth flow

Sign-in uses Supabase Auth with the GitHub provider. The frontend callback at `/auth/callback` exchanges the one-time code for a cookie session; `/onboarding` and `/dashboard` are server-protected and talk to the Sherlock backend (`GET /api/me`, `GET /api/installations`, `POST /api/installations/start`) with the user's Supabase access token, server-side only. GitHub App installation starts from a backend-generated URL, and the installation callback is handled by the backend — never by this frontend.

## External configuration (outside this repo)

### Supabase Auth

- Enable the GitHub provider in the Supabase project (the same project the backend uses).
- Point the GitHub OAuth App's callback at the Supabase project's Auth callback URL.
- Add the frontend callback URLs to Supabase's redirect allow list:
  - Local: `http://localhost:3000/auth/callback`
  - Production (verify against the actual deployment): `https://getsherlock.dev/auth/callback`
  - Preview deployments, if used, must have their origins explicitly allowlisted too.

### Sherlock backend

- Set `SHERLOCK_API_URL` to the backend origin.
- The backend must verify Supabase JWTs and implement the protected product
  endpoints for installations, repositories, repository issues, issue
  investigation lookup, investigation detail, and exact diffs.
- The backend owns the GitHub App setup/installation callback.

### Deployment order

The finalized dashboard backend must be live before this frontend:

1. Apply and reconcile the Sherlock-V2 dashboard migrations using its rollout
   runbook. Do not apply migrations from this repository.
2. Deploy the backend API/bot and worker together from the same backend commit,
   then verify repository, investigation, diff, and private-media reads.
3. Deploy this frontend with `SHERLOCK_API_URL` pointing to that backend.

The frontend and backend do not need an atomic deployment, but deploying the
frontend first leaves the protected dashboard without its required APIs.

### Hosting

The app now requires a server-capable Next.js runtime (Route Handlers, Server Components, Middleware, cookies, redirects, Server Actions). A static-only host serving an exported `out/` directory is no longer sufficient.

## Notes

- The contact form confirms locally; wire it to a form backend before launch (see `components/ContactForm.jsx`).
- Fonts (Space Grotesk, JetBrains Mono) are fetched at build time by `next/font`.
