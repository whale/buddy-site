# Buddy — landing page

> **Pivot in progress (2026-07-14):** this site is being repositioned as **Kuma**,
> a WIMP-branded release. See **[KUMA-WIMP-PLAN.md](KUMA-WIMP-PLAN.md)** for the
> full plan (new home on `wimpdecaf.com`, WIMP Ghost, pay-what-you-want funnel).

The marketing site for [Buddy](https://github.com/whale/buddy), the calm macOS
menu-bar focus app. One self-contained `index.html`, no build step.

## What it is

A four-slide scroll story with the real Buddy drawer living on the right edge.
Buddy and the headline stay pinned; the copy swaps horizontally as you scroll
(or click, or arrow-key — one shared state). The drawer is the **actual Buddy
engine** — add / edit / complete / undo / move-to-Future / the red escalation —
ported from the app and persisted to `localStorage`. Sign up and the "Kinda
dope" slide morphs into "Boomski" in place, icon winking.

Mobile drops the side-drawer for a plain stacked scroll.

## Run locally

```
python3 -m http.server 4400
# open http://localhost:4400
```

Add `?tune` to the URL for the live type-tuning panel (headline / body sizes,
line-heights, the fluid scale curve, mobile sizes).

## Design source of truth

The drawer mirrors the Mac build (`whale/buddy` → `dist/index.html`): 24px card
radius, 62px date, escalation tokens, the physics celebration, the OKLCH hover
darken. When the app's look changes, update it here too.

## Deploy

Static, deployed on Vercel at [buddy.whale.fyi](https://buddy.whale.fyi).
Push to `main` → Vercel builds and ships.
