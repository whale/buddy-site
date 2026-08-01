# buddy-site — Status

Updated: 2026-07-28 (end of session, PRs #3-#20 merged this day)

## Done and live at buddy.whale.fyi

- Six-slide desktop story is the index: Hey → Phew (add task) → Feeling ambitious? (fill to red) → Wanna have a done party? (check off, confetti) → Hidden when you don't → Kinda dope/Boomski signup.
- Adaptive add buttons (become "Next →" at the 6-cap, revert when a task completes), black stretch-animated Figma arrow that turns red with escalation, task mode switcher pills under the drawer (Super Noticer default, Walter White, Thunder Cats), list reseeds on every refresh, signup form returns on refresh.
- Mobile is a 4-section walkthrough: full-viewport hero (button pinned bottom, down arrow) → Phew + app-faithful DOM-clone preview (two stroked cards, app-native metrics, non-interactive) → "Looks cool. What's it do?" feature rows → "Sign up to get Buddy". Sticky icon winks+tilts on signup; confetti on signup (forced past reduce-motion) and when the feature list scrolls in.
- Squeezed-row fix (action icons flip horizontal in short rows) shipped here AND ported to the Mac app (whale/buddy PR #153, merged).

## Verified this session

- Scroll jitter: 0.0px bar movement across 181 sampled frames during real touch pans (iOS Simulator, WebKit, safaridriver).
- Submit path: focus → pin engages; valid email submit → Boomski morph + wink + 98 confetti particles; blur → pin releases clean.
- No horizontal overflow at any mobile section; no console errors.
- Status-bar ghost-text on iPhone is iOS Safari's own toolbar frost (control test: Wikipedia ghosts identically) — not fixable in page CSS; theme-color white shipped as the only lever.

## Keyboard/icon bug — RESOLVED 2026-07-29, confirmed on device

The pinned icon stays visible with the keyboard open. Fix: hold it with a composited
`transform` (`translate3d` from `visualViewport.offsetTop`) instead of animating `top`.
iOS doesn't reliably repaint layout properties mid-pan, which is why ~6 earlier attempts
measured perfect in automation and vanished on the phone. Full write-up, plus a
"do not reintroduce" list, in HANDOFF-KEYBOARD-PIN.md.

Accepted as-is: Safari centres the focused field in the space above the keyboard, leaving
whitespace below the form. Documented WebKit behaviour, no clean override (researched —
every workaround trades it for something worse). If it ever needs addressing, the answer
is content below the form, not a scroll override.

## Cleanup — done 2026-07-29

- Draft PR #8 (live-mobile-drawer prototype): closed, superseded by the walkthrough.
- `/m-live.html` and `/slides-preview.html`: deleted from production.
- `.claude/settings.json` added — read-only tool allowlist (browser/Figma reads, Simulator
  screenshots, localhost curl). Excludes node/python3, git writes, installs, `defaults write`.
- `CLAUDE.md` now mandates real-WebKit verification for mobile claims, with the full
  safaridriver + Simulator recipe. README corrected (was still describing four slides).

## Still open

- Feature-row + slide copy are agent drafts throughout — user owns voice, still to be
  rewritten in their words.
- Signup form is not wired to any email backend (deliberately deferred all along).

## Test rig (reusable)

- Local: `python3 -m http.server 4400` in repo root.
- Page hooks: `?goto=app|feat|signup` (URL-driven scroll), `?vv=1` (on-page debug HUD).
- Simulator: `safaridriver -p 4444` + WebDriver caps `{browserName:'Safari', platformName:'iOS', 'safari:useSimulator':true}`; screenshots via `xcrun simctl io booted screenshot f.png`. Soft keyboard blocked until `defaults write com.apple.iphonesimulator ConnectHardwareKeyboard -bool false` is run manually (agent-denied) + Simulator relaunch.

## Next milestone

Fix the keyboard/icon bug per HANDOFF-KEYBOARD-PIN.md, then a real-device pass over the whole mobile flow, then wire the signup form to an actual email backend (deliberately deferred all session).
