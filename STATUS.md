# buddy-site — Status

Updated: 2026-08-04. Branch `main`, latest commit `b2e59df`. Tree clean, no open PRs.
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

## Verified 2026-08-04 on the live site

- Desktop: all six slides, three mode pills, pointer arrow, red state at the six-task cap,
  confetti on completion.
- Mobile (390px): four sections correct, icon `position:fixed`, signup produces the wink
  face, the icon growth, and the "Boomski." morph.
- Not re-verified this session: real-device keyboard behaviour (see below — it was
  confirmed by device screenshot on 2026-07-29 and is unchanged since).

## Keyboard/icon bug — RESOLVED, confirmed on device

The pinned icon stays visible with the keyboard open. Fix: hold it with a composited
`transform` (`translate3d` from `visualViewport.offsetTop`) instead of animating `top`.
iOS doesn't reliably repaint layout properties mid-pan — which is why roughly six earlier
attempts measured perfect in automation and vanished on the phone. Full write-up and a
**do-not-reintroduce list** in `HANDOFF-KEYBOARD-PIN.md`. Read it before touching mobile
keyboard, viewport, or pinned-element code.

Accepted deliberately: Safari centres the focused field in the space above the keyboard,
leaving whitespace under the form. Documented WebKit behaviour, no clean override
(researched — every workaround trades it for something worse). If it ever needs
addressing, the answer is *content below the form*, not a scroll override.

## Open — all need Whale, none are blocked on code

1. **A line of copy under the signup form.** Would fill the whitespace Safari's centring
   leaves and make it read as intentional. Needs his words, not mine.
2. **Feature-row and slide copy are all agent drafts.** He owns voice; these should be
   rewritten in his.
3. **Signup form is not wired to any email backend.** Deferred throughout; the biggest
   remaining functional gap. Needs a provider decision first.

## Testing rig (works, reuse it)

- Local: `python3 -m http.server 4400` from the repo root (was running; stopped at
  session end).
- URL flags: `?tune` type panel · `?goto=app|feat|signup` jump to a mobile section ·
  `?vv=1` on-page debug HUD (peak-tracks pan + icon visibility) · `?pad=NN` override
  `--kbpad`.
- Real WebKit: `safaridriver -p 4444`, then WebDriver sessions with
  `{browserName:'Safari', platformName:'iOS', 'safari:useSimulator':true}` against the
  booted iPhone Simulator. Drive from a Node script with `fetch` (`curl` to non-localhost
  is permission-gated). Screenshots: `xcrun simctl io booted screenshot f.png`.
- **Known hard limit:** safaridriver cannot summon the iOS software keyboard — element
  clicks and W3C touch taps both fail to focus; only programmatic `.focus()` works and it
  raises no keyboard. Keyboard behaviour requires a human tap, on a device or in the
  Simulator. Do not burn time rediscovering this.
- `CLAUDE.md` carries the rule: Chromium emulation proves nothing about iOS Safari here.

## Next milestone

Whale's copy pass (items 1–2), then wire signup to a real email backend.
