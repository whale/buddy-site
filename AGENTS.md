# buddy-site

Marketing landing page for Buddy, pivoting to Kuma (a WIMP release). Single self-contained `index.html`, no build.

## Where things are

| What | Where |
|---|---|
| Live | <https://buddy.whale.fyi> (moving to `kuma.wimpdecaf.com`) |
| Code | github.com/whale/buddy-site |
| Hosting | Vercel project `buddy-site` (team `hi-whalefyis-projects`), deploys on merge to `main`; serverless routes in `api/` (`signup`, `signups`, `mac`) |
| Database | Vercel Blob (signups); no Supabase |
| Email | signup goes through Ghost (Wimp Decaf list); no Resend |
| Domain | whale.fyi / wimpdecaf.com — DNS at Cloudflare |
| Keys | `.env.op` → 1Password **AI Keys** (see `~/.claude/rules/keys.md`) |

## Run it

```
python3 -m http.server 4400     # open http://localhost:4400
```

With keys (for `api/` routes): `~/.claude/scripts/with-keys vercel dev`. URL flags: `?tune`, `?goto=app|feat|signup`, `?vv=1`, `?pad=NN`.

Other docs: [README.md](README.md), [STATUS.md](STATUS.md), [KUMA-WIMP-PLAN.md](KUMA-WIMP-PLAN.md), [HANDOFF-KEYBOARD-PIN.md](HANDOFF-KEYBOARD-PIN.md) (read before touching mobile keyboard/viewport/pinned elements).

Marketing landing page for Buddy (pivoting to **Kuma**, a WIMP release — see
`KUMA-WIMP-PLAN.md`). Single self-contained `index.html`, no build.

**Ecosystem:** one of four related repos — `buddy/ECOSYSTEM.md` (in the app repo)
maps the lanes. Money decisions live in `buddy/PAYMENT-PLAN.md`, not here.

## What this is

**Desktop:** a six-slide scroll story — Hey → Phew (add a task) → Feeling
ambitious? (fill to the red cap) → Wanna have a done party? (check one off) →
Hidden when you don't → K. Byeee! (signup, morphs to Boomski). The Buddy icon
+ headline stay pinned; copy swaps horizontally (scroll / click / arrow keys
all drive one shared slide state). The right-edge drawer is the **real Buddy
engine** ported from the app, so every beat is genuinely interactive.

**Mobile:** a four-section narrated walkthrough — hero → the app (one static,
non-interactive DOM clone of the drawer) → "Looks cool. What's it do?" feature
rows → "Sign up to get Buddy". Mobile never pretends to be live: the copy
narrates rather than inviting interaction the phone can't deliver.

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
- **Mobile** (`≤1024px` or coarse pointer): the side-drawer is dropped for the
  stacked walkthrough. One sticky icon at top; it winks + tilts on signup.
  There is no footer face — the sticky icon carries the celebration.
- **Verify visually before shipping** — `python3 -m http.server 4400`, then check
  desktop + mobile, the red escalation state, and the signup → Boomski morph.

### Mobile claims need device-class proof (NON-NEGOTIABLE)

Chromium emulation (Playwright at a phone viewport) shares almost none of iOS
Safari's viewport, keyboard, compositing, or chrome behavior. It is fine for
layout and copy; it proves **nothing** about anything below. Four rounds of
"fixed" that weren't (2026-07-28) came from exactly this.

Never say a mobile issue is fixed — say "implemented, not device-verified" —
until it has been checked in real WebKit when it touches: the on-screen
keyboard, `visualViewport`, sticky/fixed positioning, scroll or focus
behavior, Safari's chrome/status bar, or touch gestures.

**How to check in real WebKit, from here:**

1. `safaridriver -p 4444` in the background; the booted iPhone Simulator
   accepts WebDriver sessions with capabilities
   `{browserName:'Safari', platformName:'iOS', 'safari:useSimulator':true}`.
   Real clicks, W3C touch gestures, and `execute/sync` measurements all work.
   Drive it with `fetch` from a node script (`curl` is permission-gated).
2. Screenshots: `xcrun simctl io booted screenshot f.png`.
3. Page hooks built for this: `?goto=app|feat|signup` jumps to a section on
   load (no gestures needed), `?vv=1` paints a debug HUD — the Simulator has
   no console.
4. The soft keyboard only appears if `com.apple.iphonesimulator`
   `ConnectHardwareKeyboard` is false. Agents cannot write that pref; ask the
   user once.

Report measured numbers, and split "verified" from "needs your phone"
explicitly. If a fix fails twice, stop and instrument — do not ship a third
variant. See `HANDOFF-KEYBOARD-PIN.md` for the worked example.

## Deploy

Push to `main` → Vercel builds and ships to `buddy.whale.fyi`.


## Testing rig (from the old STATUS.md)

- Local: `python3 -m http.server 4400` from the repo root.
- URL flags: `?tune` type panel · `?goto=app|feat|signup` jump to a mobile section ·
  `?vv=1` on-page debug HUD · `?pad=NN` override `--kbpad`.
- Real WebKit: `safaridriver -p 4444`, then WebDriver sessions with
  `{browserName:'Safari', platformName:'iOS', 'safari:useSimulator':true}` against the
  booted iPhone Simulator. Drive from a Node script with `fetch`. Screenshots:
  `xcrun simctl io booted screenshot f.png`.
- `curl` to non-localhost is permission-gated for the agent; check live pages through
  the in-app browser pane instead.
- **Known hard limit:** safaridriver cannot summon the iOS software keyboard. Keyboard
  behaviour requires a human tap, on a device or in the Simulator.
- `CLAUDE.md` carries the rule: Chromium emulation proves nothing about iOS Safari here.
- Shipping flow that works here: branch → commit → push → `gh pr create` → `gh pr merge
  --merge --delete-branch` → back to `main`. Run the merge as a separate command; a
  pre-tool guard blocks any chained command that mentions checking out or pulling `main`.
