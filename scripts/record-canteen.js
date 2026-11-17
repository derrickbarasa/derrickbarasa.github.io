// Records the Canteen demo from the live site into img/canteen.mp4 and img/canteen.webp. Needs Google Chrome installed.
const { chromium } = require('playwright');
const ffmpeg = require('ffmpeg-static');
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SITE = 'https://canteen.derrickbarasa.online';
const raw = fs.mkdtempSync(path.join(os.tmpdir(), 'canteen-rec-'));

// Playwright videos have no pointer, so draw one.
const cursor = `addEventListener('DOMContentLoaded',()=>{const c=document.createElement('div');c.style.cssText='position:fixed;z-index:2147483647;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:rgba(17,17,17,.55);border:2px solid #fff;pointer-events:none;left:-40px;top:-40px;transition:transform .12s';document.body.appendChild(c);addEventListener('mousemove',e=>{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px'},true);addEventListener('mousedown',()=>c.style.transform='scale(.7)',true);addEventListener('mouseup',()=>c.style.transform='',true)})`;

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: raw, size: { width: 1280, height: 720 } } });
  await ctx.addInitScript(cursor);
  const p = await ctx.newPage();
  const t0 = Date.now(), cuts = [];
  const t = () => (Date.now() - t0) / 1000;
  // Page loads are cut from the clip.
  const load = async fn => { const s = t(); await fn(); await p.waitForLoadState('networkidle'); await p.waitForTimeout(800); cuts.push([s, t() - 0.3]); };
  const move = async loc => { const b = await loc.boundingBox(); await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 25 }); };
  const click = async (loc, wait = 900) => { await move(loc); await p.waitForTimeout(250); await loc.click(); await p.waitForTimeout(wait); };
  const addToBasket = p.getByRole('button', { name: /add to basket/i });

  await load(() => p.goto(SITE, { waitUntil: 'networkidle' }));
  await p.mouse.move(640, 300); await p.waitForTimeout(1000);
  await click(p.getByRole('button', { name: /main meals/i }), 1400);
  await move(p.getByRole('button', { name: /Classic Beef Burger/ }).first()); await p.waitForTimeout(400);
  await load(() => p.goto(`${SITE}/b/main-branch`, { waitUntil: 'networkidle' }));
  await p.waitForTimeout(900);
  await click(p.locator('aside, nav').getByText('Main Meals', { exact: true }).first(), 1200);
  await click(p.getByRole('button', { name: /^View Classic Beef Burger/ }), 1300);
  const note = p.locator('[role=dialog] textarea, .v-overlay textarea').first();
  await click(note, 200); await note.pressSequentially('No onions, extra sauce', { delay: 55 }); await p.waitForTimeout(500);
  await click(p.getByRole('button', { name: 'More' }), 700);
  await click(addToBasket, 1500);
  await click(p.getByRole('button', { name: /^View Githeri/ }), 1100);
  await click(addToBasket, 1600);
  await load(() => click(p.getByRole('link', { name: /basket/i }).first(), 0));
  await p.waitForTimeout(1500);
  await p.mouse.wheel(0, 250); await p.waitForTimeout(1800);
  const end = t();
  await ctx.close(); await browser.close();

  const video = path.join(raw, fs.readdirSync(raw).find(f => f.endsWith('.webm')));
  // The video starts a little after t0; shift the cuts by the difference.
  const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', video], { encoding: 'utf8' }).stderr;
  const [, h, m, s] = probe.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const shift = end - (+h * 3600 + +m * 60 + +s);
  const keep = [];
  cuts.forEach(([, to], i) => keep.push([to - shift, cuts[i + 1] ? cuts[i + 1][0] - shift : null]));
  const parts = keep.map(([a, b], i) => `[0:v]trim=${Math.max(0, a).toFixed(2)}${b ? ':' + b.toFixed(2) : ''},setpts=PTS-STARTPTS[p${i}]`);
  const filter = `${parts.join(';')};${keep.map((_, i) => `[p${i}]`).join('')}concat=n=${keep.length}:v=1:a=0,fps=15,scale=800:450:flags=lanczos,format=yuv420p[v]`;
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', video, '-filter_complex', filter, '-map', '[v]',
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'veryslow', '-crf', '30', '-tune', 'stillimage', '-movflags', '+faststart', '-an', 'img/canteen.mp4']);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '0.5', '-i', 'img/canteen.mp4', '-frames:v', '1', '-c:v', 'libwebp', '-quality', '72', '-compression_level', '6', 'img/canteen.webp']);
  fs.rmSync(raw, { recursive: true, force: true });
  console.log(`img/canteen.mp4 ${(fs.statSync('img/canteen.mp4').size / 1024).toFixed(0)} KB`);
})();
