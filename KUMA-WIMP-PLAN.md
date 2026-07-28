# Kuma × WIMP — repositioning plan

_Drafted 2026-07-14. Owner: Matthew. Status: plan for build week of 2026-07-14._

## TL;DR

Repackage the Buddy landing/beta site as **Kuma** — the first in a series of
"funny little apps" whose real job is to get attention for **WIMP** (the decaf
brand). Same site design, WIMP-flavoured (Kuma icon + WIMP orange accent). It
lives at a `wimpdecaf.com` subdomain, fully headless: **custom site on Vercel +
Ghost for newsletter/members + Polar for app money + Shopify for coffee**. The app
is **pay-what-you-want** (min $0, default $10); pay **$23+** and you get the app
free **+ a coupon for a free bag of WIMP + free shipping** — turning an app
download into a coffee customer. Every purchase (even $0) delivers a **sync pass**.
Money source of truth: `buddy/PAYMENT-PLAN.md` (decided 2026-07-15).

---

## 1. The strategy (why this works)

- **Kuma is a WIMP acquisition tool, not a product line.** It's a cheap-to-run,
  delightful little app that pulls attention toward WIMP. The first of several.
- **The funnel is the point.** Pay-what-you-want lowers the barrier; the **$23
  threshold = the price of a bag**, so paying $23 "for the app" gets you a free
  bag of coffee + free shipping. The buyer feels like the app was free; WIMP has
  spent ~one bag's COGS to acquire a coffee customer who now tries the product.
- **The brands share DNA.** Buddy/Kuma is a deliberately *constrained, calm,
  anti-big-list-energy* focus app. WIMP is *anti-hustle, pro-calm, "reclaim wimp."*
  Same worldview. Kuma can be part of the answer to Liam's open question —
  _"you join / buy into WIMP because ___"_ — a tangible, ownable thing with the
  WIMP feeling baked in.
- **Kuma is already a WIMP character** (the iMessage sticker-pack bear, live on
  the App Store — `wimp-stickers`). So the rename extends an existing mascot
  rather than inventing something new.

---

## 2. What's already built (nothing is lost)

From the Buddy phase, all reusable:

- **The site** — a four-slide scroll story with the *real* Buddy engine in the
  right-edge drawer (add / edit / complete / undo / move-to-Future / red
  escalation / physics celebration), fluid-responsive, mobile stacked layout,
  signup→success morph. Lives in `whale/buddy-site`, deployed on Vercel.
- **Live at** `buddy.whale.fyi` (to be retired or redirected — see §8).
- **Ghost integration research** — proven Admin API access pattern (built against
  `whale.fyi`); the same approach ports to the WIMP Ghost.
- **Design fixes** — correct type scale (Figma 48/24 → tuned 36/18), OKLCH hover
  (`calc(c * 1.1)`, no pink), celebration ported 1:1 from the Mac app.

The pivot **reuses the site wholesale** and swaps: brand skin, home Ghost,
domain, and the CTA (email signup → pay-what-you-want purchase).

---

## 3. Naming

- Working name for this release: **Kuma** (likely). "Buddy" stays the Mac app's
  internal identity for now; **Kuma is the WIMP-facing product name** for this
  funnel.
- **Open decision:** is the *app itself* renamed to Kuma (window title, wordmark,
  bundle id, About), or is Kuma just the marketing wrapper around Buddy? Renaming
  the app is a bigger lift (bundle id, updater, App Store/notarization identity).
  → Recommend: **Kuma as the public/marketing name**, app internals stay "Buddy"
  for v1, revisit if it sticks.

---

## 4. Architecture (all headless)

```
                 kuma.wimpdecaf.com  (custom site, Vercel)
                        │
        ┌───────────────┼────────────────┬────────────────┐
        ▼               ▼                ▼                ▼
    POLAR           GHOST           SHOPIFY         (static app)
  (merchant       (headless)       (headless)       the download
   of record)      newsletter      coffee only:     (GitHub release
   app money:      + members       the free-bag      DMG / .app)
   pay-what-       + blog          coupon, minted
   you-want,       (WIMP + Kuma    via Admin API
   sync pass       newsletters)    on $23+ orders
   in receipt
```

- **Site:** the existing custom build, moved to `kuma.wimpdecaf.com` on Vercel.
  New CNAME on `wimpdecaf.com` DNS → Vercel (same pattern as `buddy.whale.fyi`).
- **Ghost (headless):** WIMP's Ghost runs the newsletter + blog. Kuma gets its
  **own newsletter** ("Kuma" / "WIMP Labs") so its emails never mix with the main
  WIMP list, plus a `kuma` label + per-release labels.
- **Polar (merchant of record):** handles the pay-what-you-want app checkout
  (true PWYW slider, min $0, default $10) and carries sales tax. Its webhook
  (a Vercel function in this repo) mints the sync pass and, on $23+ orders,
  creates the coffee coupon.
- **Shopify (headless):** coffee only. WIMP's existing store; the webhook uses
  the Admin API to mint a single-use free-bag + free-shipping discount code.
- **The app binary:** the public GitHub release (DMG / `.app.tar.gz`) — unchanged;
  the site/coupon email links to it.

**Open:** confirm the WIMP Ghost admin URL + get an Admin API key (custom
integration). I could not find WIMP Ghost credentials in `secrets.env` (only
`whale.fyi`'s). Needed before wiring email.

---

## 5. The funnel & payment (model captured; implementation in the other session)

**Model (as described):**

| You pay… | You get |
|----------|---------|
| $0+      | The app (download link) **+ a sync pass** |
| **$23+** | All of the above **+ a coupon for a free bag of WIMP + free shipping** |

- **Where the money runs:** Polar (PWYW, min $0, default $10 — merchant of
  record). On order ≥ $23, the webhook mints a **single-use Shopify discount
  code** = free bag + free shipping.
- **Delivery of the app:** post-purchase email → download link **+ the sync
  pass** (Polar receipt and/or a Ghost/transactional email). The link points at
  the public release. The pass is required for sync from day one (founder
  decision 2026-07-15) — the pass backend in `whale/buddy` ships **before** this
  site's commerce phase.
- **List capture:** the purchaser's email → WIMP Ghost, subscribed to the **Kuma
  newsletter** (for future release emails), labelled `kuma`.

**This replaces the old "free beta waitlist + manual waves" model.** Under
pay-what-you-want, access is likely **instant on purchase**, not wave-gated. A
pre-launch **waitlist** (free email capture → "we're live" email) can still front
it if you want a launch moment.

**→ The payment mechanics are DECIDED (2026-07-15) and live in
`buddy/PAYMENT-PLAN.md`** — Polar checkout, price-point voice labels ($0 "tell
one person about WIMP, we trust you" / $10 default / $23+ "you just bought
coffee"), no subscription ever, no review-gating (FTC), honor-system sharing,
and the pass-card-in-the-coffee-bag reverse loop. This plan holds the site-side
hooks: the Polar checkout URL the CTA points at, and the webhook function
(pass mint → Shopify coupon → Ghost subscribe).

---

## 6. Email / members on WIMP Ghost

Three emails, remapped to the purchase flow:

1. **"You've got Kuma"** — post-purchase: download link, and (if ≥$23) the
   free-bag coupon code + how to redeem on wimpdecaf.com. Can be the Shopify order
   email, a Ghost transactional send, or both.
2. **Release emails** — new versions / features → the **Kuma newsletter** in Ghost
   (email-only posts, no public blog post needed).
3. **(Optional) pre-launch waitlist** — free email capture before payment is live →
   "Kuma's live, here's how to get it."

**Separation:** dedicated Kuma newsletter (auto-subscribe **off** on the main WIMP
newsletter) + `kuma` label. Kuma buyers don't get the general WIMP newsletter
unless they opt in, and vice-versa — same members DB, filtered sends.

---

## 7. Design changes (icon swap + WIMP accent)

Keep the current site's structure and interactions. Change:

- **Icon:** Buddy sticker face → **Kuma** (the WIMP bear). Need the Kuma icon
  asset (SVG ideally; there's an App Store sticker version in `wimp-stickers`).
  The site's hover-wink and footer-wink states will need Kuma equivalents (base +
  wink), or drop the wink if Kuma has one expression.
- **Accent:** the page's red (`#e5484d`) accent → **WIMP orange** for the
  marketing chrome (buttons, links, nudges).
- **Keep the drawer honest:** the in-app red **escalation** (lvl1/lvl2) is the
  *actual product behaviour* — leave it as-is so the demo shows the real app. Only
  the *marketing* chrome goes orange. (Decision to confirm: does WIMP want the
  escalation recoloured to orange too? Recommend no — it's the real app.)
- **Voice:** light copy pass toward WIMP's register (direct, irreverent, warm)
  where it doesn't fight the app's own copy. Add a subtle "a WIMP thing" / WIMP
  wordmark in the footer.
- **Type/brand:** optional — WIMP leans editorial serif headlines; current site is
  Geist. Icon-swap+accent keeps Geist; a fuller WIMP restyle (later) could bring
  the serif. Not in this phase.

---

## 8. Build phases (work order for the week)

**Phase 0 — confirm inputs (blockers)**
- [ ] WIMP Ghost admin URL + create Admin API integration → key.
- [ ] Confirm subdomain (`kuma.wimpdecaf.com`?) + who manages `wimpdecaf.com` DNS.
- [ ] Get the Kuma icon asset (base + wink if animating).
- [ ] Confirm final name (Kuma) + red-vs-orange escalation decision.

**Phase 1 — rebrand the site**
- [ ] Swap icon → Kuma (hero, sticky mobile icon, footer wink, favicon).
- [ ] Accent red → WIMP orange on marketing chrome.
- [ ] Copy pass (WIMP voice) + footer "a WIMP thing".
- [ ] Rename repo/site references Buddy → Kuma where public-facing.

**Phase 2 — rehome**
- [ ] New CNAME `kuma.wimpdecaf.com` → Vercel; add domain to the Vercel project.
- [ ] Retire/redirect `buddy.whale.fyi` (301 → new URL, or leave as a dev mirror).
- [ ] Point Ghost integration at the **WIMP** Ghost; create the Kuma newsletter +
      `kuma` label.

**Phase 3 — commerce (DEPENDS ON: pass backend shipping in `whale/buddy` first)**
- [ ] Polar PWYW product (min $0, default $10) + price-point voice labels.
- [ ] Site CTA (currently email form) → Polar checkout.
- [ ] Webhook function (Vercel, this repo): mint pass → Shopify coupon (≥$23,
      Admin API) → subscribe buyer to the Kuma list in Ghost.
- [ ] Post-purchase "You've got Kuma" email (download + **pass** + coupon).

**Phase 4 — launch**
- [ ] End-to-end test purchase (<$23 and ≥$23 paths).
- [ ] Verify coupon redeems a free bag + free shipping on wimpdecaf.com.
- [ ] Verify buyer lands on the Kuma newsletter, not the general WIMP list.
- [ ] Announce.

---

## 9. Open decisions / what I need from you

1. **WIMP Ghost:** admin URL + Admin API key. (Couldn't find it — only `whale.fyi`.)
2. **Subdomain:** `kuma.wimpdecaf.com` confirmed? Who holds `wimpdecaf.com` DNS?
3. **Kuma icon asset** (SVG + wink variant if animating).
4. **Name:** Kuma final? App internals renamed, or marketing-only?
5. **Escalation colour:** keep the app's real red, or recolour to WIMP orange?
6. **Access model:** instant-on-purchase, or a pre-launch waitlist first?
7. **`buddy.whale.fyi`:** retire, redirect, or keep as a dev/demo mirror?
8. ~~Payment specifics~~ **DECIDED 2026-07-15** → `buddy/PAYMENT-PLAN.md`
   (Polar + Shopify coupon + passes from day one).

---

## 10. Cross-references

- Site code + this plan: `whale/buddy-site` (rename candidate: `wimp/kuma-site`).
- WIMP strategy + business model: `~/Projects/wimp-decaf`.
- Kuma mascot / existing character: `~/Projects/wimp-stickers` (`wimpdecaf/stickers`).
- The real app (source of truth for the drawer): `~/Projects/buddy` (`whale/buddy`).
- Prior Ghost integration research: whale.fyi Admin API (this session).
