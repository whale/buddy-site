import { list, get } from '@vercel/blob';
import crypto from 'node:crypto';

// Read the signup list back as CSV, so it opens straight into Numbers, Excel
// or Sheets. Private blobs have no dashboard viewer, so this is the way in.
//
//   https://buddy.whale.fyi/api/signups?key=<ADMIN_KEY>
//
// This returns real people's email addresses, so it is behind a key and must
// never be cached or indexed.

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  // timingSafeEqual throws on length mismatch, so compare a digest instead:
  // equal length always, and no early-exit character comparison.
  return crypto.timingSafeEqual(
    crypto.createHash('sha256').update(ab).digest(),
    crypto.createHash('sha256').update(bb).digest()
  );
}

export default async function handler(req, res) {
  const expected = process.env.ADMIN_KEY;

  if (!expected) {
    console.error('signups: ADMIN_KEY is not set');
    return res.status(500).send('This endpoint is not configured.');
  }

  const given = (req.query && req.query.key) || '';
  if (!given || !safeEqual(given, expected)) {
    return res.status(404).send('Not found');
  }

  try {
    const rows = [];
    let cursor;

    do {
      const page = await list({ prefix: 'signups/', cursor, limit: 1000 });
      for (const blob of page.blobs) {
        const r = await get(blob.pathname, { access: 'private' });
        if (r?.statusCode !== 200) continue;
        rows.push(JSON.parse(await new Response(r.stream).text()));
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    rows.sort((a, b) => String(a.at).localeCompare(String(b.at)));

    // Signup values are typed by strangers and this file is opened in a
    // spreadsheet, so a cell starting with = + - @ (or tab/CR) would be read
    // as a FORMULA, not text. Prefix those with an apostrophe, which every
    // spreadsheet treats as "this is literally text".
    const esc = (v) => {
      let s = String(v ?? '');
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      return `"${s.replace(/"/g, '""')}"`;
    };

    const csv = ['date,email,country']
      .concat(rows.map((r) => [esc(r.at), esc(r.email), esc(r.country)].join(',')))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.setHeader('Content-Disposition', 'inline; filename="kuma-signups.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('signups: read failed', err);
    return res.status(500).send('Could not read the signup list.');
  }
}
