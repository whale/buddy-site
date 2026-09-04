// Send the visitor straight to the current Mac installer.
//
// The .dmg filename carries the version (Buddy_0.4.37_universal.dmg), so there
// is no fixed URL to link to. Hardcoding one goes stale the moment a release
// ships. Instead we ask GitHub which release is current and redirect to it, so
// this link is correct forever with no maintenance.
//
// The redirect is cached at the edge, so a burst of visitors is one call to
// GitHub rather than hundreds — their unauthenticated limit is 60 an hour.

const REPO = 'whale/buddy';
const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`;

export default async function handler(_req, res) {
  let target = RELEASES_PAGE;

  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'buddy-site' }
    });

    if (r.ok) {
      const release = await r.json();
      const dmg = (release.assets || []).find(a => a.name && a.name.toLowerCase().endsWith('.dmg'));
      if (dmg && dmg.browser_download_url) target = dmg.browser_download_url;
      else console.error('mac: no .dmg asset on', release.tag_name);
    } else {
      console.error('mac: GitHub returned', r.status);
    }
  } catch (err) {
    // Never a dead end. If the lookup fails the visitor still lands on the
    // releases page and can grab the file themselves.
    console.error('mac: release lookup failed', err);
  }

  // Only cache a real hit. Caching the fallback would strand everyone on the
  // releases page for the full window over one blip.
  res.setHeader(
    'Cache-Control',
    target === RELEASES_PAGE ? 'no-store' : 'public, s-maxage=600, stale-while-revalidate=3600'
  );
  res.setHeader('Location', target);
  return res.status(302).end();
}
