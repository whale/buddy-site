import { put } from '@vercel/blob';
import crypto from 'node:crypto';

// Trade an email address for the download links.
//
// One blob per signup rather than one appended file: serverless calls can
// overlap, and a read-modify-write append would silently drop rows when two
// people submit at the same moment. Separate keys can't race.
//
// The links live here, on the server, not in the page source — so they aren't
// sitting in the HTML for anyone who opens dev tools. This is a courtesy gate,
// not security: both URLs are public once handed out.

const MAC = 'https://github.com/whale/buddy/releases/latest';
const IOS = 'https://testflight.apple.com/join/kj73T4xe';

// Must start with a letter or digit. Beyond being true of real addresses, it
// keeps = + - @ out of the first character, so a stored address can never be
// read as a spreadsheet formula later. The CSV export escapes these too; this
// is the second lock on the same door.
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
    // The page deliberately replays its whole story on every refresh, so the
    // same person can submit many times. Naming the record after the address
    // (hashed, so no address appears in a filename) makes a repeat overwrite
    // itself instead of adding another row.
    const id = crypto.createHash('sha256').update(email).digest('hex').slice(0, 32);

    await put(
      `signups/${id}.json`,
      JSON.stringify({
        email,
        at: new Date().toISOString(),
        // Vercel's own geo/UA headers. Useful later, never required.
        country: req.headers['x-vercel-ip-country'] || null,
        ua: req.headers['user-agent'] || null
      }),
      {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true
      }
    );
  } catch (err) {
    // Log the real reason for us; tell the visitor something specific and true.
    console.error('signup: blob write failed', err);
    return res.status(500).json({
      ok: false,
      error: "We couldn't save that just now. Try again in a moment?"
    });
  }

  return res.status(200).json({ ok: true, mac: MAC, ios: IOS });
}
