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

## Broken / unresolved

- THE open bug: Buddy icon disappears on a real iPhone while the signup keyboard is open. Four attempts documented in HANDOFF-KEYBOARD-PIN.md with root causes; the most promising untried fix (scroll headroom on focus so Safari scrolls instead of panning) is described there. User is handing this to a fresh agent.
- Form-above-keyboard gap: improved ("slightly lower"), not confirmed at the intended 24px on device.

## Cleanup candidates (user never confirmed)

- Draft PR #8 (abandoned live-mobile-drawer prototype) — close?
- /m-live.html and /slides-preview.html on production — retire?
- Feature-row + slide copy are agent drafts throughout — user owns voice, still to be rewritten in their words.

## Test rig (reusable)

- Local: `python3 -m http.server 4400` in repo root.
- Page hooks: `?goto=app|feat|signup` (URL-driven scroll), `?vv=1` (on-page debug HUD).
- Simulator: `safaridriver -p 4444` + WebDriver caps `{browserName:'Safari', platformName:'iOS', 'safari:useSimulator':true}`; screenshots via `xcrun simctl io booted screenshot f.png`. Soft keyboard blocked until `defaults write com.apple.iphonesimulator ConnectHardwareKeyboard -bool false` is run manually (agent-denied) + Simulator relaunch.

## Next milestone

Fix the keyboard/icon bug per HANDOFF-KEYBOARD-PIN.md, then a real-device pass over the whole mobile flow, then wire the signup form to an actual email backend (deliberately deferred all session).
