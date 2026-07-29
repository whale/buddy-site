# Buddy — landing page

> **Pivot in progress (2026-07-14):** this site is being repositioned as **Kuma**,
> a WIMP-branded release. See **[KUMA-WIMP-PLAN.md](KUMA-WIMP-PLAN.md)** for the
> full plan (new home on `wimpdecaf.com`, WIMP Ghost, pay-what-you-want funnel).

The marketing site for [Buddy](https://github.com/whale/buddy), the calm macOS
menu-bar focus app. One self-contained `index.html`, no build step.

## What it is

**Desktop** — a six-slide scroll story with the real Buddy drawer living on the
right edge. Buddy and the headline stay pinned; the copy swaps horizontally as
you scroll (or click, or arrow-key — one shared state). The drawer is the
**actual Buddy engine** — add / edit / complete / undo / move-to-Future / the
red escalation — ported from the app and persisted to `localStorage`, so each
slide is genuinely interactive: add a task, fill Buddy to the six-task cap and
watch him go red, check one off for confetti. Sign up and the last slide morphs
into "Boomski" in place, icon winking.

Grey pills under the drawer switch the demo tasks between Super Noticer
(default), Walter White, and Thunder Cats modes. The list reseeds on every
refresh so the story always starts clean.

**Mobile** — a four-section narrated walkthrough: hero → the app (one static,
non-interactive clone of the drawer) → "Looks cool. What's it do?" feature rows
→ "Sign up to get Buddy". Mobile never pretends to be live; the copy narrates
instead of inviting interaction a phone can't deliver. The sticky top icon
winks and tilts when you sign up.

## Run locally

```
python3 -m http.server 4400
# open http://localhost:4400
```

URL flags:

| Flag | What it does |
|---|---|
| `?tune` | live type-tuning panel (sizes, line-heights, fluid scale) |
| `?goto=app\|feat\|signup` | jump straight to a mobile section on load |
| `?vv=1` | on-page debug HUD — viewport, pan state, icon visibility |

`?goto` and `?vv` exist so the iOS Simulator can be driven by URL alone; the
Simulator has no console. See `CLAUDE.md` for the real-WebKit test recipe —
**mobile fixes are not "done" until verified there**, not in Chromium.

## Design source of truth

The drawer mirrors the Mac build (`whale/buddy` → `dist/index.html`): 24px card
radius, 62px date, escalation tokens, the physics celebration, the OKLCH hover
darken. When the app's look changes, update it here too.

## Deploy

Static, deployed on Vercel at [buddy.whale.fyi](https://buddy.whale.fyi).
Push to `main` → Vercel builds and ships.
