// Hand the address to Ghost, which emails a confirmation link.
//
// This is Ghost's own Portal signup, the same call its signup form makes. The
// member is NOT created here: Ghost only creates them when they click the link
// in the email. That is the whole point. A made-up address gets nothing, so the
// list cannot fill with addresses nobody reads, and we need no bot traps or
// rate limits to keep it clean.
//
// The site hands over the download links as soon as this call succeeds; the
// emailed link brings them back to the same panel (?welcome=1).

const SITE = 'https://www.whale.fyi';
const BUDDY_NEWSLETTER_ID = '6a9b7545457a8d000154d85b';

// Must start with a letter or digit, so a stored address can never be read as a
// spreadsheet formula if this list is ever exported.
const EMAIL = /^[a-z0-9][^@\s]*@[a-z0-9][^@\s]*\.[a-z]{2,}$/i;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Use POST.' });
  }

  let email = '';
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    email = String(body.email || '').trim().toLowerCase();
  } catch {
    return res.status(400).json({ ok: false, error: 'Could not read that request.' });
  }

  if (!EMAIL.test(email) || email.length > 254) {
    return res.status(400).json({ ok: false, error: "That doesn't look like an email address." });
  }

  try {
    // Ghost wants a short-lived token with the signup, to make the endpoint
    // costly to abuse. Fetch one per request; they are not reusable for long.
    const tokenRes = await fetch(`${SITE}/members/api/integrity-token/`);
    if (!tokenRes.ok) throw new Error(`integrity-token ${tokenRes.status}`);
    const integrityToken = (await tokenRes.text()).trim();

    const r = await fetch(`${SITE}/members/api/send-magic-link/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        emailType: 'signup',
        integrityToken,
        // Where the emailed link drops them: back here, on the panel that
        // shows the downloads. Ghost accepts this cross-subdomain target.
        redirect: 'https://buddy.whale.fyi/?welcome=1',
        // Explicit, because another newsletter on this site is set to
        // subscribe-on-signup. Without naming ours, Buddy testers would also
        // land on Matthew's personal list.
        newsletters: [{ id: BUDDY_NEWSLETTER_ID }],
        labels: ['buddy']
      })
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('signup: send-magic-link', r.status, detail.slice(0, 300));
      // 429 is Ghost's own rate limiter, which is a real answer, not a fault.
      if (r.status === 429) {
        return res.status(429).json({
          ok: false,
          error: "That's a lot of tries. Give it a few minutes and go again?"
        });
      }
      throw new Error(`send-magic-link ${r.status}`);
    }
  } catch (err) {
    console.error('signup: failed', err);
    return res.status(500).json({
      ok: false,
      error: "We couldn't send that just now. Try again in a moment?"
    });
  }

  return res.status(200).json({ ok: true });
}
