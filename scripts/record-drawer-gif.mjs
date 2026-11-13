// Records the real Buddy drawer sliding out over assets/couch.png as lossless frames.
// Run: serve ~/Projects/buddy/dist on :4470, then `node scripts/record-drawer-gif.mjs` (TASKS='a|b|c' to change the list).
// Then encode: see the ffmpeg/gifsicle lines at the bottom of this file.
// Animations run at 1/4 speed via CDP so lossless screenshots land on every frame.
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, rmSync } from 'node:fs';
const require = createRequire('/Users/whale/Projects/ghost-side-dishes/theme-captures/pilot/node_modules/');
const { chromium } = require('playwright');

const OUT = process.env.OUT ? process.env.OUT.replace(/\/?$/, '/') : new URL('./', import.meta.url).pathname;
const FRAMES = OUT + 'frames/';
const PHOTO = new URL('../assets/couch.png', import.meta.url).pathname;
const W = 1440, H = 900, FPS = 20, RATE = 0.25, TOTAL = 6.6;
const TASKS = (process.env.TASKS || 'Reply to Jeff|Fix the fridge handle|Write the Buddy post').split('|');

const pad = n => String(n).padStart(2, '0');
const d = new Date();
const today = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const seed = { today: { date: today, morningDone: true,
    items: TASKS.map((text, i) => ({ id: `gif${i+1}`, text, state: 'neutral', src: null, doneAt: null, doneWord: null, v: 1 })) },
  history: [], deferred: [], settings: { celebrate: 100, reserveSpace: false }, pinned: false, tombstones: {}, doneTombs: {} };

rmSync(FRAMES, { recursive: true, force: true }); mkdirSync(FRAMES, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
page.on('pageerror', e => console.log('pageerror:', e.message));
await page.route('**/couch.png', r => r.fulfill({ body: readFileSync(PHOTO), contentType: 'image/png' }));
await page.addInitScript(s => { localStorage.setItem('buddy.v1', s); localStorage.removeItem('buddy.v1.bak'); }, JSON.stringify(seed));
await page.goto('http://127.0.0.1:4470/index.html?gif', { waitUntil: 'load' });
await page.addStyleTag({ content: `
  #wallpaper{ background: url(/couch.png) center / cover no-repeat !important; }
  #desktop > *{ visibility: hidden !important; }
  #devMorning, #edgeBar{ display:none !important; }
  #gifCursor{ position:fixed; left:0; top:0; z-index:99999; pointer-events:none; width:26px; height:26px;
              transform:translate(-9999px,-9999px); filter: drop-shadow(0 1px 1.5px rgba(0,0,0,.45)); }
`});
await page.evaluate(() => {
  const c = document.createElement('div'); c.id = 'gifCursor';
  c.innerHTML = `<svg viewBox="0 0 24 24" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3 L5 19 L9.2 15.2 L12 21.5 L14.6 20.4 L11.8 14.2 L17.5 14.2 Z" fill="#000" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
  document.body.appendChild(c);
  addEventListener('mousemove', e => { c.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 3}px)`; });
});
const morningUp = await page.evaluate(() => { const m = document.querySelector('#morning'); return !!m && !m.classList.contains('hidden'); });
if (morningUp) { const b = page.locator('#morning button', { hasText: /buddy|skip|start/i }).first(); if (await b.count()) { await b.click(); await page.waitForTimeout(600); } }

// Slow every CSS transition/animation on the page to 1/4 speed.
const cdp = await ctx.newCDPSession(page);
await cdp.send('Animation.enable');
await cdp.send('Animation.setPlaybackRate', { playbackRate: RATE });

// Cursor path in scene seconds. Segments: [t0, t1, from, to]; holds fill the gaps.
const ease = t => 1 - Math.pow(1 - t, 3);
const A = [760, 520], B = [W - 1, 470], C = [W - 140, 330];
const segs = [ [0.5, 1.6, A, B], [2.1, 2.6, B, C], [4.4, 5.3, C, A] ];
function pos(t) {
  let p = A;
  for (const [t0, t1, from, to] of segs) {
    if (t >= t1) p = to;
    else if (t >= t0) { const k = ease((t - t0) / (t1 - t0)); return [from[0] + (to[0]-from[0])*k, from[1] + (to[1]-from[1])*k]; }
  }
  return p;
}
await page.mouse.move(...A);
await page.waitForTimeout(800);

const N = Math.round(TOTAL * FPS), realDt = (1000 / FPS) / RATE;
const t0 = Date.now();
for (let f = 0; f < N; f++) {
  const [x, y] = pos(f / FPS);
  await page.mouse.move(x, y);
  await page.screenshot({ path: `${FRAMES}f${String(f).padStart(4,'0')}.png`, type: 'png' });
  const target = t0 + (f + 1) * realDt, wait = target - Date.now();
  if (wait > 0) await page.waitForTimeout(wait); else if (f % 10 === 0) console.log(`frame ${f} behind by ${-wait}ms`);
}
console.log(`captured ${N} frames in ${((Date.now()-t0)/1000).toFixed(1)}s real (${TOTAL}s scene)`);
await browser.close();

/* Encode (from the folder holding frames/):
ffmpeg -y -framerate 20 -i frames/f%04d.png -vf "scale=1200:-1:flags=lanczos,palettegen=max_colors=255:stats_mode=full" pal.png
ffmpeg -y -framerate 20 -i frames/f%04d.png -i pal.png -lavfi "scale=1200:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" raw.gif
gifsicle -O3 raw.gif -o buddy-drawer.gif
ffmpeg -y -framerate 20 -i frames/f%04d.png -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart buddy-drawer.mp4
*/
