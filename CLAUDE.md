# buddy-site — Project Rules

Marketing landing page for Buddy (pivoting to **Kuma**, a WIMP release — see
`KUMA-WIMP-PLAN.md`). Single self-contained `index.html`, no build.
Deployed static on Vercel at `buddy.whale.fyi` (moving to `kuma.wimpdecaf.com`).

**Ecosystem:** one of four related repos — `buddy/ECOSYSTEM.md` (in the app repo)
maps the lanes. Money decisions live in `buddy/PAYMENT-PLAN.md`, not here.

## What this is

A four-slide scroll story. The Buddy icon + headline stay pinned; copy swaps
horizontally (scroll / click / arrow keys all drive one shared slide state).
The right-edge drawer is the **real Buddy engine** ported from the app.

## Rules

- **No build step.** Edit `index.html` directly. The Geist font is at
  `assets/fonts/Geist-Variable.woff2`.
- **The drawer mirrors the Mac app** (`whale/buddy` → `dist/index.html`) — do not
  drift. Card radius 24, date number 62px, escalation tokens (lvl0/1/2), the
  physics celebration, OKLCH hover darken (`calc(c * 1.1)` — never `+`, which
  tints white hover pink). If the app changes, mirror it here.
- **Fluid type** is driven by a JS-set `--s` scale (CSS can't divide `100vw` by a
  unitless number). Values live in `:root` (`--h1`, `--body`, `--ref`, etc.).
  Append `?tune` to the URL for the live tuning panel; it's removed in production.
- **Mobile** (`≤1024px` or coarse pointer): the side-drawer is dropped for a
  stacked scroll. One sticky icon at top, footer winking face at the bottom.
- **Verify visually before shipping** — `python3 -m http.server 4400`, then check
  desktop + mobile, the red escalation state, and the signup → Boomski morph.

## Deploy

Push to `main` → Vercel builds and ships to `buddy.whale.fyi`.
