# Handoff: iOS keyboard vs. the sticky Buddy icon (mobile signup)

## The problem, in one sentence

On iPhone Safari (real device), tapping the email signup field opens the keyboard and the sticky Buddy icon at the top of the page disappears from view — it must stay visible the whole time, because the signup celebration (confetti + the icon winking/tilting) happens behind it.

## Expected behavior

1. Mobile page has ONE Buddy icon in a bar pinned at the top (`#mStick` inside `#mobile`, plain `position:sticky; top:0; z-index:70; background:#fff`).
2. User taps the email field (last section, bottom of the page) → keyboard opens → the icon bar must remain visible at the top of the *visible* area, and the form should sit ~24px above the keyboard.
3. User submits → keyboard closes → confetti fires (450ms delayed, forced past reduce-motion) behind the icon (confetti z-index 60, bar 70) while the icon winks and tilts.

## UPDATE 2026-07-29 — root cause found, fix shipped, needs one human tap

**Root cause (why every previous attempt failed):** iOS Safari *freezes
compositing of `position:fixed` elements while it pans the layout viewport*.
Attempt 4's rAF loop wrote correct `top` values every frame to an element
Safari had already stopped repainting — which is exactly why it measured
perfect in automation and stayed invisible on glass. Chasing the viewport
cannot work, by construction.

**Shipped fix (PR #22):** remove the *cause* of the pan. Safari only pans when
it cannot scroll far enough to reveal the focused field. On `focusin` the page
adds `padding-bottom: 65svh` to `#mobile`, so Safari scrolls instead — the
layout viewport never moves, `visualViewport.offsetTop` stays 0, and plain CSS
sticky keeps the icon in place with **zero JavaScript**. The headroom is shed
on blur without jumping the page (only what the current scroll can spare, the
rest on a later scroll).

**Verified in the iOS Simulator:** headroom applies on focus (doc height
2626→3090) and clears on blur; the bar stays `position:sticky` with no inline
overrides; blurring while scrolled deep into the headroom does not move the
page (scrollY 1912→1913, padding 65svh→1px→none, height restored).

**NOT verified:** behavior with a real software keyboard.
`safaridriver` cannot summon the iOS keyboard — element clicks and low-level
W3C touch taps both fail to focus (programmatic `.focus()` works but summons
no keyboard). Confirmed by screenshot. This needs a human tap, either in the
Simulator or on a device.

**The 30-second check:** open `buddy.whale.fyi/?goto=signup&vv=1` on an
iPhone, tap the email field, read the HUD. `PANNED: false` and
`iconVisible: true` means solved; `gapFormToKb` reports the pixel gap above
the keyboard (target ~24).

Headroom arithmetic, for tuning: viewport 714, form bottom 674, keyboard
~340 → the form must rise ~324px; 65svh supplies 464px, a 140px margin.

## Original diagnosis (2026-07-28)

## Current state on device (user report, 2026-07-28)

- Form position after focus: close, "slightly lower" than before — acceptable-ish.
- Icon: STILL disappears when the keyboard opens. This is the unsolved part.
- Everything else on mobile is signed off: scroll has zero jitter (pure CSS sticky during scroll — measured 181 frames at 0.0px variance via simulator), submit path works (verified: pin engages on focus, releases on blur, Boomski morph + wink + 98 confetti particles).

## Where the code lives

- Repo: `whale/buddy-site`, single self-contained `index.html`, no build. Deploys to buddy.whale.fyi on merge to main.
- The pin: search for `__mPin` (defined in `buildMobile()`, wired where `s.idx===SIGNUP_SLIDE`). Current mechanism: `focusin` on the email field → capture bar rect → switch bar to `position:fixed` with inline left/width/top → rAF loop sets `top = visualViewport.offsetTop` every frame while focused → one instant `scrollBy` correction at 650ms parks the form bottom at `vv.offsetTop + vv.height - 24` → `focusout` cancels the loop and restores sticky. Also `html{scroll-padding:var(--stickH,92px) 0 24px}`.
- The bar: `#mStick` CSS in the mobile media block. `--stickH` is measured by JS.

## What was tried and why each failed

1. `position:sticky` alone — icon pans out of view when the keyboard opens, because at the bottom of the document Safari cannot scroll to reveal the field, so it PANS the layout viewport instead, and sticky elements ride the layout viewport.
2. `position:fixed` + visualViewport pinning on `resize`+`scroll` events — worked but the bar chased every event during normal scrolling and the keyboard animation: visible jitter. Reverted.
3. Keyboard detection via `vv.height < innerHeight - 80` to scope the pin — never fired on the user's phone: modern iOS shrinks `innerHeight` together with the visual viewport, so the comparison is useless. This is why several "fixes" changed nothing on device.
4. Current: focus-scoped pin (deterministic trigger, rAF-follow, described above) — verified engaging/releasing correctly in the iOS Simulator, but the icon reportedly still disappears on the real device with the keyboard up. Suspicion: iOS freezes/limits compositing of `position:fixed` elements while the keyboard pans the layout viewport, and/or `vv.offsetTop` does not reflect the keyboard pan the way the code assumes on device.

## Most promising untried approach

Do not fight the pan — remove its cause. Safari only pans the layout viewport when it cannot scroll the document far enough to reveal the focused field. On `focusin`, add scroll headroom (e.g. `#mobile { padding-bottom: 45vh }` or an inert spacer element) so Safari can SCROLL the document instead of panning; plain `position:sticky` then keeps working natively with zero JS, which is the only mechanism proven jitter-free. Remove the headroom on `focusout`. This would let the entire `__mPin` fixed/rAF machinery be deleted. Tune the headroom so the field lands ~24px above the keyboard (combine with `scroll-padding-bottom`).

## Known constraint that is NOT a bug

Ghost text behind the iPhone status bar while scrolling is iOS Safari's own minimized-toolbar frost — it mirrors the page's scroll layer over everything, on every website (verified against Wikipedia as control). No page CSS can remove it. `theme-color` meta is already set to white, which is the only available lever.

## Test infrastructure already built (use it)

- URL hooks on the page: `?goto=app|feat|signup` scrolls to a section on load (drive the Simulator by URL, no gestures); `?vv=1` renders an on-page debug HUD (green JSON, bottom of screen) with bar/viewport state — the Simulator has no console.
- Simulator automation: `safaridriver -p 4444` (background) accepts WebDriver sessions with capabilities `{browserName:'Safari', platformName:'iOS', 'safari:useSimulator':true}` against the booted iPhone 17 Pro sim. Real element clicks, touch-pan via the W3C actions API, `execute/sync` for measurements. Node scripts from the previous session are in the session scratchpad (`sim-kb-full.mjs`, `sim-scroll.mjs`).
- Simulator limitation: the soft keyboard never appears because the host pref `com.apple.iphonesimulator ConnectHardwareKeyboard` is true and writing it is permission-blocked for agents; Cmd+Shift+K only helps while a field is already focused and does not persist. Fix the pref manually (`defaults write com.apple.iphonesimulator ConnectHardwareKeyboard -bool false`, then quit and reopen Simulator) and keyboard geometry becomes fully testable from the agent side.
- Screenshots: `xcrun simctl io booted screenshot out.png`.

## Definition of done

With the software keyboard open on a real iPhone (or the Simulator after the pref fix): the Buddy icon is fully visible at the top of the visual viewport the entire time the field is focused, the form bottom sits ~24px above the keyboard, submit closes the keyboard and the confetti visibly bursts behind the still-visible icon, and normal page scrolling (keyboard closed) involves zero JavaScript and zero jitter.
