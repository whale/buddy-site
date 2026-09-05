# buddy-site — Status

Updated: 2026-09-05. Branch `main`, latest commit `ef44b57`. Tree clean, no open PRs.
Live: https://buddy.whale.fyi (Vercel, deploys on merge to `main`).

## What the site is

**Desktop** — six-slide scroll story with the real Buddy engine in a right-edge drawer:
Hey → Phew (add a task) → Feeling ambitious? (fill to the red cap) → Wanna have a done
party? (check one off, confetti) → Hidden when you don't → K. Byeee! (signup → Boomski).
Grey pills under the drawer switch demo tasks between Super Noticer (default), Walter
White, Thunder Cats. List reseeds every refresh.

**Mobile** — four-section narrated walkthrough: hero → the app (static DOM clone of the
drawer, non-interactive) → "Looks cool. What's it do?" feature rows → "Sign up to get
Buddy". Pinned Buddy icon top-left; on signup it winks, tilts, and doubles in size.

## Changed since the 2026-08-04 status (from git)

Before this session, not re-verified on 2026-09-05:
- Signup now goes through Ghost, with Whale's copy (`b439ae5`, PR #34).
- Download links are gated behind an email; the Mac link is a real download, not a
  GitHub page (`cc1f20d`, `0eb364a`).
- CSS Studio loads on localhost only; `node_modules` ignored, dependency tree pinned.

This session (2026-09-05):
- Signup copy: "Wimp Decaf" is now the orange link; line ends with the unsubscribe wink
  and the dare (PRs #35, #36).
- Share image added at `assets/og.png` (2400×1260) with `og:image`, `og:url`, `og:type`,
  `og:image:alt`, and Twitter `summary_large_image` tags (PR #37).

## Verified 2026-09-05 on the live site

- `https://buddy.whale.fyi/assets/og.png` serves at 2400×1260.
- Live homepage `<head>` carries the og:image / twitter:image tags (read back in the
  browser after deploy).
- Not verified this session: the signup slide's new copy on the live page, the Ghost
  signup end to end, the download links, and everything mobile.

## Share image — how it was made (source not committed)

Built as a 1200×630 HTML artboard, rendered at 2x with Playwright. Recreate from this:
- White canvas, Geist (`assets/fonts/Geist-Variable.woff2`).
- Left column at x=80, bottom-aligned to y=566: the face icon (the `#mark` SVG from
  `index.html`, `fill="none"` on the root) at 216px, 40px gap, "Hi, I'm Buddy." at 80px
  weight 500 letter-spacing -3px, then "A micro-do-list for distraction / prone
  super-noticers." at 32px #6c6c6c with a forced break after "distraction".
- Right: a static clone of the drawer (date card + list card, 400px wide, radius 24,
  the app's drop-shadow stack) at right:64 top:64, running off the bottom edge. Date
  "5 Saturday September"; tasks Reply to Sarah / Book the dentist / ~~Walk with Kuma~~ /
  + Add a task.
- Other directions explored and not chosen: Hero (big face + "Hey, this is Buddy."),
  Blush (full-bleed #FF4342), Wink (black + winking face).

## Open — all need Whale, none are blocked on code

1. **Ghost signup needs a live end-to-end check.** Sign up with a real address and
   confirm it lands in Ghost and on the Wimp Decaf list. Never done from this repo.
2. **A line of copy under the signup form** to fill the whitespace Safari's keyboard
   centring leaves. Needs his words.
3. **Feature-row and slide copy are still agent drafts** except the signup line, which
   is now his. He owns voice.
4. **Kuma / WIMP pivot** is planned in `KUMA-WIMP-PLAN.md` (domain move to
   `kuma.wimpdecaf.com`). Not started.

## Keyboard/icon bug — RESOLVED, confirmed on device

The pinned icon stays visible with the keyboard open. Fix: hold it with a composited
`transform` (`translate3d` from `visualViewport.offsetTop`) instead of animating `top`.
Full write-up and a **do-not-reintroduce list** in `HANDOFF-KEYBOARD-PIN.md`. Read it
before touching mobile keyboard, viewport, or pinned-element code.

Accepted deliberately: Safari centres the focused field above the keyboard, leaving
whitespace under the form. If it ever needs addressing, the answer is *content below the
form*, not a scroll override.

## Testing rig (works, reuse it)

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

## Next milestone

Live end-to-end signup test through Ghost, then Whale's copy pass (items 2–3).
